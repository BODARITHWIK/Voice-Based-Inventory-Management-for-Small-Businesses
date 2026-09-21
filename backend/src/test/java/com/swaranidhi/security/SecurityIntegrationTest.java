package com.swaranidhi.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swaranidhi.dto.SaleRequest;
import com.swaranidhi.entity.Business;
import com.swaranidhi.entity.Product;
import com.swaranidhi.entity.Role;
import com.swaranidhi.repository.BusinessRepository;
import com.swaranidhi.repository.ProductRepository;
import com.swaranidhi.repository.UserRepository;
import com.swaranidhi.service.SaleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SaleService saleService;

    @Autowired
    private ObjectMapper objectMapper;

    private Business businessA;
    private Business businessB;
    private UserPrincipal ownerPrincipalA;
    private UserPrincipal managerPrincipalA;
    private UserPrincipal staffPrincipalA;
    private UserPrincipal ownerPrincipalB;

    private Product productA;
    private Product productB;

    @BeforeEach
    void setUp() {
        // Create Tenant A
        businessA = businessRepository.save(new Business("Kirana Store A", "Owner A", "9000000001", "ownerA@store.com", "City A", "State A"));

        ownerPrincipalA = createPrincipal(101L, businessA.getId(), "Kirana Store A", "ownerA@store.com", Role.OWNER);
        managerPrincipalA = createPrincipal(102L, businessA.getId(), "Kirana Store A", "managerA@store.com", Role.MANAGER);
        staffPrincipalA = createPrincipal(103L, businessA.getId(), "Kirana Store A", "staffA@store.com", Role.STAFF);

        // Create Tenant B
        businessB = businessRepository.save(new Business("Kirana Store B", "Owner B", "9000000002", "ownerB@store.com", "City B", "State B"));
        ownerPrincipalB = createPrincipal(201L, businessB.getId(), "Kirana Store B", "ownerB@store.com", Role.OWNER);

        // Create Products for each tenant
        productA = productRepository.save(new Product(businessA, "Product A Item", "Groceries", "SKU-A-" + UUID.randomUUID().toString().substring(0, 6), 50, "units", 5,
                new BigDecimal("10.00"), new BigDecimal("15.00"), "Supplier A"));

        productB = productRepository.save(new Product(businessB, "Product B Item", "Groceries", "SKU-B-" + UUID.randomUUID().toString().substring(0, 6), 50, "units", 5,
                new BigDecimal("20.00"), new BigDecimal("25.00"), "Supplier B"));
    }

    private UserPrincipal createPrincipal(Long userId, Long businessId, String businessName, String email, Role role) {
        return new UserPrincipal(
                userId,
                businessId,
                businessName,
                email,
                "passwordHash",
                role.name() + " User",
                role,
                true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()))
        );
    }

    private RequestPostProcessor asUser(UserPrincipal principal) {
        return authentication(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));
    }

    // 1. Unauthenticated endpoints return 401
    @Test
    @DisplayName("Security: Unauthenticated requests to /api/alerts must return 401")
    void testUnauthenticatedAlertsReturns401() throws Exception {
        mockMvc.perform(get("/api/alerts"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Security: Unauthenticated requests to /api/inventory/overview must return 401")
    void testUnauthenticatedInventoryReturns401() throws Exception {
        mockMvc.perform(get("/api/inventory/overview"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Security: Unauthenticated requests to /api/assistant/chat must return 401")
    void testUnauthenticatedAssistantReturns401() throws Exception {
        mockMvc.perform(post("/api/assistant/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"What is low stock?\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Security: Unauthenticated requests to /api/stock/photo/confirm must return 401")
    void testUnauthenticatedPhotoConfirmReturns401() throws Exception {
        mockMvc.perform(post("/api/stock/photo/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    // 2. Tenant Isolation
    @Test
    @DisplayName("Multi-Tenancy: Tenant A cannot access Tenant B's product")
    void testTenantIsolationGetProduct() throws Exception {
        mockMvc.perform(get("/api/products/" + productB.getId()).with(asUser(ownerPrincipalA)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Multi-Tenancy: Tenant A product list never contains Tenant B's product")
    void testTenantIsolationProductList() throws Exception {
        mockMvc.perform(get("/api/products").with(asUser(ownerPrincipalA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.id == " + productB.getId() + ")]").doesNotExist());
    }

    // 3. Role-Based Access Control (RBAC)
    @Test
    @DisplayName("RBAC: STAFF cannot delete product (OWNER only) -> 403 Forbidden")
    void testStaffCannotDeleteProduct() throws Exception {
        mockMvc.perform(delete("/api/products/" + productA.getId()).with(asUser(staffPrincipalA)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RBAC: MANAGER cannot delete product (OWNER only) -> 403 Forbidden")
    void testManagerCannotDeleteProduct() throws Exception {
        mockMvc.perform(delete("/api/products/" + productA.getId()).with(asUser(managerPrincipalA)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RBAC: STAFF cannot view profit report (OWNER only) -> 403 Forbidden")
    void testStaffCannotViewProfitReport() throws Exception {
        mockMvc.perform(get("/api/reports/profit").with(asUser(staffPrincipalA)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RBAC: OWNER can delete product and view profit report -> 200 OK")
    void testOwnerCanDeleteAndReport() throws Exception {
        // View profit report
        mockMvc.perform(get("/api/reports/profit").with(asUser(ownerPrincipalA)))
                .andExpect(status().isOk());

        // Delete product
        mockMvc.perform(delete("/api/products/" + productA.getId()).with(asUser(ownerPrincipalA)))
                .andExpect(status().isOk());
    }

    // 4. Mobile Reports API
    @Test
    @DisplayName("Mobile API: GET /api/reports/dashboard returns 200 OK")
    void testMobileDashboardReport() throws Exception {
        mockMvc.perform(get("/api/reports/dashboard").with(asUser(ownerPrincipalA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.salesReport").exists())
                .andExpect(jsonPath("$.data.stats").exists());
    }

    // 5. Stock Concurrency Protection
    @Test
    @DisplayName("Concurrency: Simultaneous sales cannot oversell stock beyond available inventory")
    void testConcurrentSalesCannotOversell() throws Exception {
        Product stockProduct = productRepository.save(new Product(
                businessA, "Limited Item", "Snacks", "SKU-LIMIT-" + UUID.randomUUID().toString().substring(0, 6),
                10, "packets", 2, new BigDecimal("10.00"), new BigDecimal("15.00"), "Supplier"
        ));

        int numberOfThreads = 10;
        int qtyPerSale = 2; // 10 threads * 2 = 20 requested, only 10 available

        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < numberOfThreads; i++) {
            final int index = i;
            futures.add(executor.submit(() -> {
                try {
                    latch.await();
                    SaleRequest request = new SaleRequest();
                    request.setItems(List.of(new SaleRequest.SaleItemRequest(
                            stockProduct.getId(), stockProduct.getName(), qtyPerSale, "packets", new BigDecimal("15.00")
                    )));
                    request.setAmount(BigDecimal.valueOf(qtyPerSale * 15));
                    request.setQuantity(qtyPerSale);
                    request.setIdempotencyKey("CONCURRENT-SALE-" + index + "-" + System.nanoTime());

                    saleService.createSale(businessA.getId(), request, "Test Runner");
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    failureCount.incrementAndGet();
                }
            }));
        }

        latch.countDown();
        for (Future<?> f : futures) {
            f.get(10, TimeUnit.SECONDS);
        }
        executor.shutdown();

        Product finalProduct = productRepository.findById(stockProduct.getId()).orElseThrow();
        int unitsSold = successCount.get() * qtyPerSale;

        assertTrue(unitsSold <= 10, "Total units sold (" + unitsSold + ") must not exceed initial stock of 10");
        assertTrue(finalProduct.getQuantity() >= 0, "Stock must never drop below 0");
        assertEquals(10 - unitsSold, finalProduct.getQuantity(), "Stock remaining + units sold must equal initial stock");
        assertTrue(successCount.get() > 0, "At least one sale must succeed");
        assertTrue(failureCount.get() > 0, "Remaining requests exceeding stock or colliding must fail safely");
    }

    // 6. Invoice Collision Resistance
    @Test
    @DisplayName("Invoice Number Generation: Concurrent sales produce strictly unique invoice numbers")
    void testConcurrentInvoiceNumberUniqueness() throws Exception {
        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(1);
        Set<String> generatedInvoices = Collections.synchronizedSet(new HashSet<>());

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            Product threadProduct = productRepository.save(new Product(
                    businessA, "Bulk Item " + index, "General", "SKU-BULK-" + index + "-" + UUID.randomUUID().toString().substring(0, 4),
                    50, "packets", 2, new BigDecimal("5.00"), new BigDecimal("10.00"), "Supplier"
            ));

            futures.add(executor.submit(() -> {
                try {
                    latch.await();
                    SaleRequest request = new SaleRequest();
                    request.setItems(List.of(new SaleRequest.SaleItemRequest(
                            threadProduct.getId(), threadProduct.getName(), 1, "packets", new BigDecimal("10.00")
                    )));
                    request.setAmount(BigDecimal.valueOf(10));
                    request.setQuantity(1);
                    request.setIdempotencyKey("INVOICE-TEST-" + index + "-" + System.nanoTime());

                    var sale = saleService.createSale(businessA.getId(), request, "Test Runner");
                    generatedInvoices.add(sale.getInvoiceNumber());
                } catch (Exception e) {
                    fail("Sale creation failed during invoice test: " + e.getMessage());
                }
            }));
        }

        latch.countDown();
        for (Future<?> f : futures) {
            f.get(10, TimeUnit.SECONDS);
        }
        executor.shutdown();

        assertEquals(threadCount, generatedInvoices.size(), "All 20 generated invoice numbers must be strictly unique");
    }
}
