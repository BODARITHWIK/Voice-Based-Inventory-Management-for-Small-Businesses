package com.swaranidhi.service;

import com.swaranidhi.dto.ConfirmScanRequest;
import com.swaranidhi.dto.DetectedProductDto;
import com.swaranidhi.dto.ScanAnalysisResponse;
import com.swaranidhi.entity.Business;
import com.swaranidhi.entity.Product;
import com.swaranidhi.entity.StockPhotoScan;
import com.swaranidhi.repository.BusinessRepository;
import com.swaranidhi.repository.ProductRepository;
import com.swaranidhi.repository.StockPhotoScanRepository;
import com.swaranidhi.repository.UserRepository;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.InventoryService;
import com.swaranidhi.service.ProductService;
import com.swaranidhi.service.AuditService;
import com.swaranidhi.service.ProductMatchingService;
import com.swaranidhi.service.vision.AzureVisionProvider;
import com.swaranidhi.service.vision.GoogleVisionProvider;
import com.swaranidhi.service.vision.LocalVisionProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Optional;

import javax.imageio.ImageIO;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockPhotoServiceTest {

    @Mock
    private StockPhotoScanRepository scanRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private InventoryService inventoryService;

    @Mock
    private ProductService productService;

    @Mock
    private AuditService auditService;

    @Mock
    private GoogleVisionProvider googleVisionProvider;

    @Mock
    private AzureVisionProvider azureVisionProvider;

    private LocalVisionProvider localVisionProvider;
    private ProductMatchingService productMatchingService;
    private StockPhotoService stockPhotoService;

    private Business testBusiness;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        localVisionProvider = new LocalVisionProvider();
        productMatchingService = new ProductMatchingService(productRepository);

        stockPhotoService = new StockPhotoService(
                scanRepository,
                productRepository,
                businessRepository,
                userRepository,
                productMatchingService,
                inventoryService,
                productService,
                auditService,
                localVisionProvider,
                googleVisionProvider,
                azureVisionProvider
        );

        testBusiness = new Business("Swaranidhi Kirana", "Rithwik", "9876543210", "owner@kirana.com", "Hyderabad", "Telangana");
        testBusiness.setId(1L);

        testProduct = new Product(testBusiness, "Heritage Milk", "Dairy", "PROD-102", 50, "packets", 10,
                new BigDecimal("28.00"), new BigDecimal("32.00"), "Heritage Foods");
        testProduct.setId(102L);

        when(businessRepository.findById(1L)).thenReturn(Optional.of(testBusiness));
    }

    private byte[] createTestImage(int width, int height, Color color, String labelText) {
        BufferedImage img = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = img.createGraphics();
        g2d.setColor(color);
        g2d.fillRect(0, 0, width, height);
        if (labelText != null) {
            g2d.setColor(Color.BLACK);
            g2d.drawString(labelText, 10, 50);
        }
        g2d.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            ImageIO.write(img, "jpg", baos);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return baos.toByteArray();
    }

    @Test
    @DisplayName("Single Product Analysis: Heritage Milk with 20 packets")
    void testAnalyzePhotoSingleProduct() {
        byte[] imageBytes = createTestImage(100, 100, Color.WHITE, "Heritage Milk 20 Packets");
        MockMultipartFile file = new MockMultipartFile("image", "heritage_milk_20_packets.jpg", "image/jpeg", imageBytes);

        when(productRepository.findFirstByNameContainingIgnoreCase(1L, "Heritage Milk"))
                .thenReturn(Optional.of(testProduct));
        when(scanRepository.save(any(StockPhotoScan.class))).thenAnswer(i -> {
            StockPhotoScan scan = i.getArgument(0);
            scan.setId(1L);
            return scan;
        });

        ScanAnalysisResponse response = stockPhotoService.analyzePhoto(file, 1L, null);

        assertNotNull(response);
        assertEquals("READY", response.getStatus());
        assertTrue(response.getConfidence() >= 0.90);
        assertFalse(response.getProducts().isEmpty());

        DetectedProductDto detected = response.getProducts().get(0);
        assertEquals("Heritage Milk", detected.getProductName());
        assertEquals("Dairy", detected.getCategory());
        assertEquals(20, detected.getQuantity());
        assertEquals("packets", detected.getUnit());
        assertTrue(detected.isMatchedExistingProduct());
        assertEquals(102L, detected.getExistingProductId());
    }

    @Test
    @DisplayName("Quantity Undetermined: System strictly does NOT invent information")
    void testQuantityUndetermined() {
        byte[] imageBytes = createTestImage(100, 100, Color.WHITE, "Heritage Milk");
        MockMultipartFile file = new MockMultipartFile("image", "heritage_milk.jpg", "image/jpeg", imageBytes);

        when(productRepository.findFirstByNameContainingIgnoreCase(1L, "Heritage Milk"))
                .thenReturn(Optional.of(testProduct));
        when(scanRepository.save(any(StockPhotoScan.class))).thenAnswer(i -> {
            StockPhotoScan scan = i.getArgument(0);
            scan.setId(2L);
            return scan;
        });

        ScanAnalysisResponse response = stockPhotoService.analyzePhoto(file, 1L, null);

        assertNotNull(response);
        DetectedProductDto detected = response.getProducts().get(0);
        // Quantity must be null because image does not specify packet count!
        assertNull(detected.getQuantity());
    }

    @Test
    @DisplayName("Dark Image Detection: Prompts user to take photo in better lighting")
    void testDarkImageDetection() {
        byte[] darkImageBytes = createTestImage(100, 100, new Color(5, 5, 5), null);
        MockMultipartFile file = new MockMultipartFile("image", "dark_sample.jpg", "image/jpeg", darkImageBytes);

        ScanAnalysisResponse response = stockPhotoService.analyzePhoto(file, 1L, null);

        assertNotNull(response);
        assertEquals("DARK", response.getStatus());
        assertTrue(response.getMessage().contains("better lighting"));
    }

    @Test
    @DisplayName("Unknown Product Detection: Does not fake match")
    void testUnknownProduct() {
        byte[] imageBytes = createTestImage(100, 100, Color.LIGHT_GRAY, "Unknown Box");
        MockMultipartFile file = new MockMultipartFile("image", "unlabeled_object.jpg", "image/jpeg", imageBytes);

        ScanAnalysisResponse response = stockPhotoService.analyzePhoto(file, 1L, null);

        assertNotNull(response);
        assertEquals("NO_PRODUCT_DETECTED", response.getStatus());
        assertTrue(response.isRequiresManualInput());
    }

    @Test
    @DisplayName("Stock Safety: Confirmation is required and creates Audit Record")
    void testConfirmScanAddStock() {
        ConfirmScanRequest req = new ConfirmScanRequest();
        req.setScanId(1L);
        req.setProductId(102L);
        req.setProductName("Heritage Milk");
        req.setQuantity(20);
        req.setUnit("packets");
        req.setAction("ADD_STOCK");

        when(productRepository.findByIdAndBusinessId(102L, 1L)).thenReturn(Optional.of(testProduct));

        StockPhotoScan existingScan = new StockPhotoScan();
        existingScan.setId(1L);
        existingScan.setStatus("READY");
        when(scanRepository.findByIdAndBusinessId(1L, 1L)).thenReturn(Optional.of(existingScan));

        Product result = stockPhotoService.confirmScan(req, 1L, null);

        assertNotNull(result);
        assertEquals("Heritage Milk", result.getName());
        verify(inventoryService, times(1)).adjustStock(eq(1L), any(), any());
        verify(auditService, times(1)).logAction(eq(testBusiness), any(), eq("ADD_STOCK"), eq("Product"), eq("102"), any());
        assertEquals("CONFIRMED", existingScan.getStatus());
    }
}
