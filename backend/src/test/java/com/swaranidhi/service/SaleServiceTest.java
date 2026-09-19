package com.swaranidhi.service;

import com.swaranidhi.dto.SaleRequest;
import com.swaranidhi.entity.*;
import com.swaranidhi.exception.InsufficientStockException;
import com.swaranidhi.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SaleServiceTest {

    @Mock
    private SaleRepository saleRepository;
    @Mock
    private BusinessRepository businessRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditService auditService;

    private SaleService saleService;
    private Business business;
    private Product product;
    private Customer customer;

    @BeforeEach
    void setUp() {
        saleService = new SaleService(saleRepository, businessRepository, productRepository,
                customerRepository, inventoryTransactionRepository, notificationService, auditService);

        business = new Business("Kirana Store", "Owner", "9876543210", "owner@store.com", "City", "State");
        business.setId(1L);

        product = new Product(business, "Maggi", "Snacks", "MAGGI-01", 30, "packets", 10,
                BigDecimal.valueOf(12), BigDecimal.valueOf(15), "Supplier");
        product.setId(101L);

        customer = new Customer(business, "Ramesh", "9876543210");
        customer.setId(201L);
    }

    @Test
    @DisplayName("Should successfully record a sale and deduct inventory stock")
    void testCreateSaleDeductsStock() {
        SaleRequest req = new SaleRequest();
        req.setPaymentMethod(PaymentMethod.CASH);
        req.setPaidAmount(BigDecimal.valueOf(75));

        SaleRequest.SaleItemRequest item = new SaleRequest.SaleItemRequest(101L, "Maggi", 5, "packets", BigDecimal.valueOf(15));
        req.setItems(List.of(item));

        when(businessRepository.findById(1L)).thenReturn(Optional.of(business));
        when(productRepository.findByIdAndBusinessId(101L, 1L)).thenReturn(Optional.of(product));
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Sale sale = saleService.createSale(1L, req, "Ramesh Owner");

        assertNotNull(sale);
        assertEquals(25, product.getQuantity()); // Stock was 30, deducted 5 -> 25
        verify(inventoryTransactionRepository, times(1)).save(any(InventoryTransaction.class));
        verify(auditService, times(1)).logAction(eq(business), anyString(), eq("SALE_CREATED"), anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Should throw InsufficientStockException and rollback if stock is inadequate")
    void testInsufficientStockThrowsException() {
        SaleRequest req = new SaleRequest();
        SaleRequest.SaleItemRequest item = new SaleRequest.SaleItemRequest(101L, "Maggi", 50, "packets", BigDecimal.valueOf(15));
        req.setItems(List.of(item));

        when(businessRepository.findById(1L)).thenReturn(Optional.of(business));
        when(productRepository.findByIdAndBusinessId(101L, 1L)).thenReturn(Optional.of(product)); // Only 30 available

        assertThrows(InsufficientStockException.class, () -> saleService.createSale(1L, req, "Owner"));
        assertEquals(30, product.getQuantity()); // Stock remains unchanged
        verify(saleRepository, never()).save(any(Sale.class));
    }

    @Test
    @DisplayName("Should update Customer Khata balance on Credit sale")
    void testCreditSaleUpdatesCustomerKhata() {
        SaleRequest req = new SaleRequest();
        req.setCustomerId(201L);
        req.setPaymentMethod(PaymentMethod.CREDIT);
        req.setPaidAmount(BigDecimal.ZERO); // Entire sale on credit

        SaleRequest.SaleItemRequest item = new SaleRequest.SaleItemRequest(101L, "Maggi", 2, "packets", BigDecimal.valueOf(15));
        req.setItems(List.of(item));

        when(businessRepository.findById(1L)).thenReturn(Optional.of(business));
        when(customerRepository.findByIdAndBusinessId(201L, 1L)).thenReturn(Optional.of(customer));
        when(productRepository.findByIdAndBusinessId(101L, 1L)).thenReturn(Optional.of(product));
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertEquals(BigDecimal.ZERO, customer.getCurrentBalance());

        saleService.createSale(1L, req, "Owner");

        assertEquals(BigDecimal.valueOf(30), customer.getCurrentBalance()); // ₹30 added to Khata
        verify(customerRepository, times(1)).save(customer);
    }
}
