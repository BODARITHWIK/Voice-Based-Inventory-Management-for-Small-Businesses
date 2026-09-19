package com.swaranidhi.service;

import com.swaranidhi.dto.*;
import com.swaranidhi.entity.*;
import com.swaranidhi.exception.BadRequestException;
import com.swaranidhi.exception.ResourceNotFoundException;
import com.swaranidhi.repository.BusinessRepository;
import com.swaranidhi.repository.ProductRepository;
import com.swaranidhi.repository.StockPhotoScanRepository;
import com.swaranidhi.repository.UserRepository;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.vision.AzureVisionProvider;
import com.swaranidhi.service.vision.GoogleVisionProvider;
import com.swaranidhi.service.vision.LocalVisionProvider;
import com.swaranidhi.service.vision.VisionAnalysisResult;
import com.swaranidhi.service.vision.VisionProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
public class StockPhotoService {

    private static final Logger log = LoggerFactory.getLogger(StockPhotoService.class);

    private final StockPhotoScanRepository scanRepository;
    private final ProductRepository productRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final ProductMatchingService productMatchingService;
    private final InventoryService inventoryService;
    private final ProductService productService;
    private final AuditService auditService;

    private final LocalVisionProvider localVisionProvider;
    private final GoogleVisionProvider googleVisionProvider;
    private final AzureVisionProvider azureVisionProvider;

    @Value("${swaranidhi.vision.provider:${VISION_PROVIDER:local}}")
    private String configuredProviderName;

    public StockPhotoService(StockPhotoScanRepository scanRepository,
                             ProductRepository productRepository,
                             BusinessRepository businessRepository,
                             UserRepository userRepository,
                             ProductMatchingService productMatchingService,
                             InventoryService inventoryService,
                             ProductService productService,
                             AuditService auditService,
                             LocalVisionProvider localVisionProvider,
                             GoogleVisionProvider googleVisionProvider,
                             AzureVisionProvider azureVisionProvider) {
        this.scanRepository = scanRepository;
        this.productRepository = productRepository;
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
        this.productMatchingService = productMatchingService;
        this.inventoryService = inventoryService;
        this.productService = productService;
        this.auditService = auditService;
        this.localVisionProvider = localVisionProvider;
        this.googleVisionProvider = googleVisionProvider;
        this.azureVisionProvider = azureVisionProvider;
    }

    private VisionProvider resolveProvider() {
        if ("google".equalsIgnoreCase(configuredProviderName)) {
            return googleVisionProvider;
        } else if ("azure".equalsIgnoreCase(configuredProviderName)) {
            return azureVisionProvider;
        }
        return localVisionProvider;
    }

    @Transactional
    public ScanAnalysisResponse analyzePhoto(MultipartFile file, Long businessId, UserPrincipal currentUser) {
        long startTime = System.currentTimeMillis();

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please upload an image file to analyze stock.");
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));
        User user = currentUser != null && currentUser.getId() != null
                ? userRepository.findById(currentUser.getId()).orElse(null)
                : null;

        VisionProvider provider = resolveProvider();
        log.info("Analyzing stock photo with provider: {}", provider.getProviderName());

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Failed to read uploaded photo: " + e.getMessage());
        }

        VisionAnalysisResult analysis = provider.analyzeImage(bytes, file.getOriginalFilename(), file.getContentType());
        long processingTime = System.currentTimeMillis() - startTime;

        ScanAnalysisResponse response = new ScanAnalysisResponse();
        response.setAnalysisProvider(provider.getProviderName());
        response.setProcessingTimeMs(processingTime);
        response.setOcrText(analysis.getOcrText());
        response.setBarcode(analysis.getBarcode());
        response.setQualityStatus(analysis.getQualityStatus());

        // Handle error or unconfigured provider
        if (!analysis.isSuccessful()) {
            response.setStatus("UNCONFIGURED");
            response.setMessage(analysis.getErrorMessage() != null ? analysis.getErrorMessage() : "Image analysis service is not configured.");
            return response;
        }

        // Handle image quality flags (Dark or Blurry)
        if ("DARK".equalsIgnoreCase(analysis.getQualityStatus()) || "BLURRY".equalsIgnoreCase(analysis.getQualityStatus())) {
            response.setStatus(analysis.getQualityStatus());
            response.setConfidence(analysis.getConfidence());
            response.setMessage(analysis.getQualityMessage());
            return response;
        }

        if ("NO_PRODUCT_DETECTED".equalsIgnoreCase(analysis.getQualityStatus()) || analysis.getProducts().isEmpty()) {
            response.setStatus("NO_PRODUCT_DETECTED");
            response.setConfidence(analysis.getConfidence());
            response.setMessage("I couldn't find a recognizable product in this photo.");
            response.setRequiresManualInput(true);
            return response;
        }

        // Perform inventory matching for all detected products
        List<DetectedProductDto> detectedProducts = analysis.getProducts();
        for (DetectedProductDto detected : detectedProducts) {
            if (detected.getBarcode() == null && analysis.getBarcode() != null) {
                detected.setBarcode(analysis.getBarcode());
            }
            productMatchingService.matchDetectedProduct(businessId, detected);
        }

        response.setProducts(detectedProducts);
        response.setConfidence(analysis.getConfidence());
        response.setStatus(analysis.getConfidence() >= 0.90 ? "READY" : "NEEDS_CONFIRMATION");
        response.setMessage(analysis.getConfidence() >= 0.90
                ? "Product identified with high confidence."
                : "I think this is " + detectedProducts.get(0).getProductName() + ". Please confirm.");

        // Persist scan history record
        DetectedProductDto primary = detectedProducts.get(0);
        StockPhotoScan scan = new StockPhotoScan(
                business,
                user,
                file.getOriginalFilename(),
                response.getStatus(),
                primary.getProductName(),
                primary.getExistingProductId(),
                primary.getQuantity(),
                primary.getUnit(),
                primary.getBarcode(),
                analysis.getOcrText(),
                analysis.getConfidence(),
                provider.getProviderName()
        );
        StockPhotoScan savedScan = scanRepository.save(scan);
        response.setScanId(savedScan.getId());

        return response;
    }

    @Transactional
    public Product confirmScan(ConfirmScanRequest req, Long businessId, UserPrincipal currentUser) {
        if (req == null) {
            throw new BadRequestException("Scan confirmation request is empty.");
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        String userName = currentUser != null ? currentUser.getFullName() : "Shopkeeper";

        // 1. Resolve target product
        Product targetProduct;
        if (req.getProductId() != null) {
            targetProduct = productRepository.findByIdAndBusinessId(req.getProductId(), businessId)
                    .filter(Product::isActive)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + req.getProductId()));
        } else if (req.getProductName() != null && !req.getProductName().isBlank()) {
            // Find existing by name or create a new product
            targetProduct = productRepository.findFirstByNameContainingIgnoreCase(businessId, req.getProductName().trim())
                    .orElseGet(() -> {
                        ProductRequest createReq = new ProductRequest();
                        createReq.setName(req.getProductName().trim());
                        createReq.setCategory(req.getCategory() != null ? req.getCategory() : "General");
                        createReq.setUnit(req.getUnit() != null ? req.getUnit() : "packets");
                        createReq.setPurchasePrice(req.getPurchasePrice() != null ? req.getPurchasePrice() : BigDecimal.ZERO);
                        createReq.setSellingPrice(req.getSellingPrice() != null ? req.getSellingPrice() : BigDecimal.ZERO);
                        createReq.setSupplier(req.getSupplier());
                        createReq.setBarcode(req.getBarcode());
                        createReq.setQuantity(0);
                        return productService.createProduct(businessId, createReq, userName);
                    });
        } else {
            throw new BadRequestException("Product ID or Product Name must be specified to confirm stock update.");
        }

        // 2. Perform Inventory Update strictly via InventoryService
        int qty = req.getQuantity() != null ? Math.abs(req.getQuantity()) : 1;
        String action = req.getAction() != null ? req.getAction().toUpperCase() : "ADD_STOCK";

        InventoryAdjustRequest adjustReq = new InventoryAdjustRequest();
        adjustReq.setProductId(targetProduct.getId());
        adjustReq.setNotes(req.getNotes() != null ? req.getNotes() : "Stock update via AI Photo Scan");

        if ("REMOVE_STOCK".equals(action)) {
            adjustReq.setType(TransactionType.STOCK_OUT);
            adjustReq.setQuantity(qty);
        } else if ("STOCK_ADJUSTMENT".equals(action)) {
            adjustReq.setType(TransactionType.ADJUSTMENT);
            int currentQty = targetProduct.getQuantity();
            adjustReq.setQuantity(qty - currentQty); // delta to reach new target
        } else {
            // Default: ADD_STOCK
            adjustReq.setType(TransactionType.STOCK_IN);
            adjustReq.setQuantity(qty);
        }

        inventoryService.adjustStock(businessId, adjustReq, userName);

        // 3. Create Audit Record
        auditService.logAction(
                business,
                userName,
                action,
                "Product",
                targetProduct.getId().toString(),
                "Confirmed photo scan: " + action + " " + qty + " " + targetProduct.getUnit() +
                " of " + targetProduct.getName() + " (Source: PHOTO_SCAN)"
        );

        // 4. Update scan record if scanId is provided
        if (req.getScanId() != null) {
            scanRepository.findByIdAndBusinessId(req.getScanId(), businessId).ifPresent(scan -> {
                scan.setStatus("CONFIRMED");
                scan.setProductId(targetProduct.getId());
                scan.setDetectedQuantity(qty);
                scan.setNotes("Confirmed by " + userName);
                scanRepository.save(scan);
            });
        }

        return targetProduct;
    }

    @Transactional
    public void rejectScan(Long scanId, String reason, Long businessId, UserPrincipal currentUser) {
        StockPhotoScan scan = scanRepository.findByIdAndBusinessId(scanId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock photo scan not found with id: " + scanId));
        scan.setStatus("REJECTED");
        scan.setNotes(reason != null ? reason : "Rejected by user");
        scanRepository.save(scan);
    }

    @Transactional(readOnly = true)
    public List<StockPhotoScan> getScanHistory(Long businessId) {
        return scanRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
    }

    @Transactional(readOnly = true)
    public StockPhotoScan getScanById(Long scanId, Long businessId) {
        return scanRepository.findByIdAndBusinessId(scanId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Stock photo scan not found with id: " + scanId));
    }
}
