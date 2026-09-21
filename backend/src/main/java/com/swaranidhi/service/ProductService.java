package com.swaranidhi.service;

import com.swaranidhi.dto.ProductRequest;
import com.swaranidhi.entity.Business;
import com.swaranidhi.entity.InventoryTransaction;
import com.swaranidhi.entity.Product;
import com.swaranidhi.entity.StockStatus;
import com.swaranidhi.entity.TransactionType;
import com.swaranidhi.exception.BadRequestException;
import com.swaranidhi.exception.ResourceNotFoundException;
import com.swaranidhi.repository.BusinessRepository;
import com.swaranidhi.repository.InventoryTransactionRepository;
import com.swaranidhi.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final BusinessRepository businessRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public ProductService(ProductRepository productRepository,
                          BusinessRepository businessRepository,
                          InventoryTransactionRepository inventoryTransactionRepository,
                          NotificationService notificationService,
                          AuditService auditService) {
        this.productRepository = productRepository;
        this.businessRepository = businessRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts(Long businessId) {
        return productRepository.findByBusinessIdAndActiveTrue(businessId);
    }

    @Transactional(readOnly = true)
    public Page<Product> getProductsPaged(Long businessId, Pageable pageable) {
        return productRepository.findByBusinessIdAndActiveTrue(businessId, pageable);
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long businessId, Long id) {
        return productRepository.findByIdAndBusinessId(id, businessId)
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Product> searchProducts(Long businessId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllProducts(businessId);
        }
        return productRepository.searchProducts(businessId, query.trim());
    }

    @Transactional(readOnly = true)
    public List<Product> getLowStockProducts(Long businessId) {
        return productRepository.findByBusinessIdAndStatusAndActiveTrue(businessId, StockStatus.LOW_STOCK);
    }

    @Transactional
    public Product createProduct(Long businessId, ProductRequest req, String userName) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        String sku = (req.getSku() != null && !req.getSku().isBlank())
                ? req.getSku().trim().toUpperCase()
                : "SKU-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // Enforce business-level SKU uniqueness
        productRepository.findByBusinessIdAndSku(businessId, sku)
                .ifPresent(existing -> {
                    throw new BadRequestException("Product with SKU '" + sku + "' already exists in this business.");
                });

        String barcode = (req.getBarcode() != null && !req.getBarcode().isBlank())
                ? req.getBarcode().trim()
                : null;

        // Enforce business-level Barcode uniqueness
        if (barcode != null) {
            productRepository.findByBusinessIdAndBarcode(businessId, barcode)
                    .ifPresent(existing -> {
                        throw new BadRequestException("Product with barcode '" + barcode + "' already exists in this business.");
                    });
        }

        Product product = new Product(
                business,
                req.getName().trim(),
                req.getCategory() != null ? req.getCategory().trim() : "General",
                sku,
                req.getQuantity() != null ? req.getQuantity() : 0,
                req.getUnit() != null ? req.getUnit().trim() : "packets",
                req.getMinimumStock() != null ? req.getMinimumStock() : 10,
                req.getPurchasePrice(),
                req.getSellingPrice(),
                req.getSupplier()
        );
        product.setBarcode(barcode);
        product.setDescription(req.getDescription());
        product.setManufacturingDate(req.getManufacturingDate());
        product.setExpiryDate(req.getExpiryDate());
        product.setBatchNumber(req.getBatchNumber());

        Product saved = productRepository.save(product);

        // Record initial inventory transaction if quantity > 0
        if (saved.getQuantity() > 0) {
            InventoryTransaction tx = new InventoryTransaction(
                    business,
                    saved,
                    TransactionType.STOCK_IN,
                    saved.getQuantity(),
                    0,
                    saved.getQuantity(),
                    "INITIAL_STOCK",
                    "Initial stock upon product creation",
                    userName
            );
            inventoryTransactionRepository.save(tx);
        }

        checkAndNotifyLowStock(saved);
        auditService.logAction(business, userName, "PRODUCT_CREATED", "Product", saved.getId().toString(),
                "Created product " + saved.getName() + " with qty " + saved.getQuantity());

        return saved;
    }

    @Transactional
    public Product updateProduct(Long businessId, Long id, ProductRequest req, String userName) {
        Product product = getProductById(businessId, id);

        product.setName(req.getName().trim());
        if (req.getCategory() != null) product.setCategory(req.getCategory().trim());
        
        if (req.getSku() != null && !req.getSku().isBlank()) {
            String newSku = req.getSku().trim().toUpperCase();
            if (!newSku.equalsIgnoreCase(product.getSku())) {
                productRepository.findByBusinessIdAndSku(businessId, newSku)
                        .ifPresent(existing -> {
                            if (!existing.getId().equals(id)) {
                                throw new BadRequestException("Product with SKU '" + newSku + "' already exists in this business.");
                            }
                        });
                product.setSku(newSku);
            }
        }

        if (req.getBarcode() != null) {
            String newBarcode = req.getBarcode().isBlank() ? null : req.getBarcode().trim();
            if (newBarcode != null && !newBarcode.equals(product.getBarcode())) {
                productRepository.findByBusinessIdAndBarcode(businessId, newBarcode)
                        .ifPresent(existing -> {
                            if (!existing.getId().equals(id)) {
                                throw new BadRequestException("Product with barcode '" + newBarcode + "' already exists in this business.");
                            }
                        });
            }
            product.setBarcode(newBarcode);
        }
        if (req.getUnit() != null) product.setUnit(req.getUnit().trim());
        if (req.getMinimumStock() != null) product.setMinimumStock(req.getMinimumStock());
        if (req.getPurchasePrice() != null) product.setPurchasePrice(req.getPurchasePrice());
        if (req.getSellingPrice() != null) product.setSellingPrice(req.getSellingPrice());
        if (req.getSupplier() != null) product.setSupplier(req.getSupplier());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getManufacturingDate() != null) product.setManufacturingDate(req.getManufacturingDate());
        if (req.getExpiryDate() != null) product.setExpiryDate(req.getExpiryDate());
        if (req.getBatchNumber() != null) product.setBatchNumber(req.getBatchNumber());

        // Note: Direct quantity modifications should go through InventoryService,
        // but if specified here we check difference
        if (req.getQuantity() != null && !req.getQuantity().equals(product.getQuantity())) {
            int diff = req.getQuantity() - product.getQuantity();
            int prev = product.getQuantity();
            product.setQuantity(req.getQuantity());
            TransactionType type = diff > 0 ? TransactionType.ADJUSTMENT : TransactionType.ADJUSTMENT;
            InventoryTransaction tx = new InventoryTransaction(
                    product.getBusiness(),
                    product,
                    type,
                    Math.abs(diff),
                    prev,
                    product.getQuantity(),
                    "MANUAL_ADJUSTMENT",
                    "Adjusted during product edit",
                    userName
            );
            inventoryTransactionRepository.save(tx);
        }

        Product updated = productRepository.save(product);
        checkAndNotifyLowStock(updated);
        auditService.logAction(product.getBusiness(), userName, "PRODUCT_UPDATED", "Product", updated.getId().toString(),
                "Updated product " + updated.getName());

        return updated;
    }

    @Transactional
    public void deleteProduct(Long businessId, Long id, String userName) {
        Product product = getProductById(businessId, id);
        product.setActive(false);
        productRepository.save(product);

        auditService.logAction(product.getBusiness(), userName, "PRODUCT_DELETED", "Product", id.toString(),
                "Deactivated product " + product.getName());
    }

    private void checkAndNotifyLowStock(Product product) {
        if (product.getStatus() == StockStatus.OUT_OF_STOCK) {
            notificationService.createNotification(
                    product.getBusiness(),
                    "OUT_OF_STOCK",
                    "Out of Stock: " + product.getName(),
                    product.getName() + " is completely out of stock! Consider ordering more."
            );
        } else if (product.getStatus() == StockStatus.LOW_STOCK) {
            notificationService.createNotification(
                    product.getBusiness(),
                    "LOW_STOCK",
                    "Low Stock: " + product.getName(),
                    product.getName() + " has only " + product.getQuantity() + " " + product.getUnit() + " remaining."
            );
        }
    }
}
