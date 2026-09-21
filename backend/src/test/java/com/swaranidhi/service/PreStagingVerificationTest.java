package com.swaranidhi.service;

import com.swaranidhi.config.SecurityConfig;
import com.swaranidhi.dto.ProductRequest;
import com.swaranidhi.dto.SaleRequest;
import com.swaranidhi.entity.*;
import com.swaranidhi.exception.BadRequestException;
import com.swaranidhi.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class PreStagingVerificationTest {

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private SaleService saleService;

    @Autowired
    private SecurityConfig securityConfig;

    private Business businessOne;
    private Business businessTwo;

    @BeforeEach
    void setUp() {
        businessOne = businessRepository.save(new Business("Staging Shop One", "Owner One", "9111111111", "one@shop.com", "Hyderabad", "Telangana"));
        businessTwo = businessRepository.save(new Business("Staging Shop Two", "Owner Two", "9222222222", "two@shop.com", "Hyderabad", "Telangana"));
    }

    @Test
    @DisplayName("Duplicate SKU within same business must be rejected")
    void testDuplicateSkuInSameBusinessRejected() {
        String uniqueSku = "SKU-DUP-" + UUID.randomUUID().toString().substring(0, 5);

        ProductRequest req1 = new ProductRequest();
        req1.setName("Product 1");
        req1.setSku(uniqueSku);
        req1.setQuantity(10);
        req1.setSellingPrice(BigDecimal.valueOf(50));
        productService.createProduct(businessOne.getId(), req1, "Admin");

        ProductRequest req2 = new ProductRequest();
        req2.setName("Product 2");
        req2.setSku(uniqueSku);
        req2.setQuantity(15);
        req2.setSellingPrice(BigDecimal.valueOf(60));

        assertThrows(BadRequestException.class, () -> {
            productService.createProduct(businessOne.getId(), req2, "Admin");
        });
    }

    @Test
    @DisplayName("Same SKU allowed across different businesses (multi-tenant isolation)")
    void testSameSkuInDifferentBusinessesAllowed() {
        String sharedSku = ("SKU-SHARED-" + UUID.randomUUID().toString().substring(0, 5)).toUpperCase();

        ProductRequest req1 = new ProductRequest();
        req1.setName("Store 1 Product");
        req1.setSku(sharedSku);
        req1.setQuantity(10);
        req1.setSellingPrice(BigDecimal.valueOf(50));
        Product p1 = productService.createProduct(businessOne.getId(), req1, "Admin");
        assertNotNull(p1);

        ProductRequest req2 = new ProductRequest();
        req2.setName("Store 2 Product");
        req2.setSku(sharedSku);
        req2.setQuantity(20);
        req2.setSellingPrice(BigDecimal.valueOf(55));
        Product p2 = productService.createProduct(businessTwo.getId(), req2, "Admin");
        assertNotNull(p2);

        assertEquals(sharedSku, p1.getSku());
        assertEquals(sharedSku, p2.getSku());
        assertNotEquals(p1.getBusiness().getId(), p2.getBusiness().getId());
    }

    @Test
    @DisplayName("Duplicate barcode within same business must be rejected")
    void testDuplicateBarcodeInSameBusinessRejected() {
        String barcode = "BARCODE-" + UUID.randomUUID().toString().substring(0, 8);

        ProductRequest req1 = new ProductRequest();
        req1.setName("Soap 1");
        req1.setBarcode(barcode);
        req1.setQuantity(5);
        req1.setSellingPrice(BigDecimal.valueOf(30));
        productService.createProduct(businessOne.getId(), req1, "Admin");

        ProductRequest req2 = new ProductRequest();
        req2.setName("Soap 2");
        req2.setBarcode(barcode);
        req2.setQuantity(8);
        req2.setSellingPrice(BigDecimal.valueOf(35));

        assertThrows(BadRequestException.class, () -> {
            productService.createProduct(businessOne.getId(), req2, "Admin");
        });
    }

    @Test
    @DisplayName("Same barcode allowed across different businesses")
    void testSameBarcodeInDifferentBusinessesAllowed() {
        String barcode = "BARCODE-MULTI-" + UUID.randomUUID().toString().substring(0, 8);

        ProductRequest req1 = new ProductRequest();
        req1.setName("Shop 1 Soap");
        req1.setBarcode(barcode);
        req1.setQuantity(10);
        req1.setSellingPrice(BigDecimal.valueOf(30));
        Product p1 = productService.createProduct(businessOne.getId(), req1, "Admin");

        ProductRequest req2 = new ProductRequest();
        req2.setName("Shop 2 Soap");
        req2.setBarcode(barcode);
        req2.setQuantity(12);
        req2.setSellingPrice(BigDecimal.valueOf(32));
        Product p2 = productService.createProduct(businessTwo.getId(), req2, "Admin");

        assertNotNull(p1);
        assertNotNull(p2);
        assertEquals(barcode, p1.getBarcode());
        assertEquals(barcode, p2.getBarcode());
    }

    @Test
    @DisplayName("Customer optimistic locking prevents concurrent balance corruption")
    void testCustomerOptimisticLocking() {
        Customer customer = customerRepository.save(new Customer(businessOne, "Ramesh Khata", "9876543210"));
        assertNotNull(customer.getId());

        // Fetch two distinct copies representing concurrent transactions
        Customer copy1 = customerRepository.findById(customer.getId()).orElseThrow();
        Customer copy2 = customerRepository.findById(customer.getId()).orElseThrow();

        // Transaction 1 modifies balance and commits
        copy1.setCurrentBalance(BigDecimal.valueOf(500));
        customerRepository.saveAndFlush(copy1);

        // Transaction 2 tries to commit with stale version
        copy2.setCurrentBalance(BigDecimal.valueOf(700));
        assertThrows(ObjectOptimisticLockingFailureException.class, () -> {
            customerRepository.saveAndFlush(copy2);
        });
    }

    @Test
    @DisplayName("Supplier optimistic locking prevents concurrent balance corruption")
    void testSupplierOptimisticLocking() {
        Supplier supplier = supplierRepository.save(new Supplier(businessOne, "City Wholesaler", "9988776655", "w@test.com", "Market", "29ABCDE1234F1Z5", BigDecimal.ZERO));
        assertNotNull(supplier.getId());

        Supplier copy1 = supplierRepository.findById(supplier.getId()).orElseThrow();
        Supplier copy2 = supplierRepository.findById(supplier.getId()).orElseThrow();

        // Transaction 1 modifies balance and commits
        copy1.setOutstandingBalance(BigDecimal.valueOf(2500));
        supplierRepository.saveAndFlush(copy1);

        // Transaction 2 tries to commit with stale version
        copy2.setOutstandingBalance(BigDecimal.valueOf(3500));
        assertThrows(ObjectOptimisticLockingFailureException.class, () -> {
            supplierRepository.saveAndFlush(copy2);
        });
    }

    @Test
    @DisplayName("Offline queue sale replay with same idempotency key prevents duplicate stock deduction")
    void testOfflineQueueReplayIdempotency() {
        ProductRequest req = new ProductRequest();
        req.setName("Wheat Flour 10kg");
        req.setQuantity(20);
        req.setSellingPrice(BigDecimal.valueOf(400));
        Product product = productService.createProduct(businessOne.getId(), req, "Owner");

        String idempotencyKey = "OFFLINE-SALE-KEY-" + UUID.randomUUID();

        SaleRequest saleReq = new SaleRequest();
        saleReq.setIdempotencyKey(idempotencyKey);
        saleReq.setCustomerName("Walk-in");
        SaleRequest.SaleItemRequest item = new SaleRequest.SaleItemRequest(product.getId(), product.getName(), 5, "bags", BigDecimal.valueOf(400));
        saleReq.setItems(List.of(item));

        // 1. Initial execution from offline queue
        Sale firstSale = saleService.createSale(businessOne.getId(), saleReq, "Owner");
        assertNotNull(firstSale);
        Product afterFirst = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(15, afterFirst.getQuantity(), "Stock should decrease from 20 to 15");

        // 2. Replay (network retry or re-sync of same queued item)
        Sale replayedSale = saleService.createSale(businessOne.getId(), saleReq, "Owner");
        assertEquals(firstSale.getId(), replayedSale.getId(), "Replay must return exact same sale record");
        assertEquals(firstSale.getInvoiceNumber(), replayedSale.getInvoiceNumber());

        Product afterReplay = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(15, afterReplay.getQuantity(), "Stock must remain 15 without duplicate decrement");
    }

    @Test
    @DisplayName("CORS configuration source eliminates wildcard when credentials are enabled")
    void testCorsNoWildcardAllowed() {
        CorsConfigurationSource source = securityConfig.corsConfigurationSource();
        assertNotNull(source);

        org.springframework.mock.web.MockHttpServletRequest request = new org.springframework.mock.web.MockHttpServletRequest();
        request.setRequestURI("/api/products");

        CorsConfiguration config = source.getCorsConfiguration(request);
        assertNotNull(config);
        assertTrue(config.getAllowCredentials(), "AllowCredentials must be true");

        List<String> origins = config.getAllowedOrigins();
        assertNotNull(origins);
        assertFalse(origins.contains("*"), "AllowedOrigins must NOT contain wildcard '*' when allowCredentials is true");
    }
}
