package com.swaranidhi.service;

import com.swaranidhi.dto.SaleRequest;
import com.swaranidhi.entity.*;
import com.swaranidhi.exception.BadRequestException;
import com.swaranidhi.exception.InsufficientStockException;
import com.swaranidhi.exception.ResourceNotFoundException;
import com.swaranidhi.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final BusinessRepository businessRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public SaleService(SaleRepository saleRepository,
                       BusinessRepository businessRepository,
                       ProductRepository productRepository,
                       CustomerRepository customerRepository,
                       InventoryTransactionRepository inventoryTransactionRepository,
                       NotificationService notificationService,
                       AuditService auditService) {
        this.saleRepository = saleRepository;
        this.businessRepository = businessRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<Sale> getAllSales(Long businessId) {
        return saleRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
    }

    @Transactional(readOnly = true)
    public Page<Sale> getSalesPaged(Long businessId, Pageable pageable) {
        return saleRepository.findByBusinessIdOrderByCreatedAtDesc(businessId, pageable);
    }

    @Transactional(readOnly = true)
    public Sale getSaleById(Long businessId, Long id) {
        return saleRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
    }

    @Transactional
    public Sale createSale(Long businessId, SaleRequest req, String userName) {
        // 1. Idempotency protection (crucial for offline sync replay)
        if (req.getIdempotencyKey() != null && !req.getIdempotencyKey().isBlank()) {
            Optional<Sale> existing = saleRepository.findByIdempotencyKeyAndBusinessId(req.getIdempotencyKey().trim(), businessId);
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        if (req.getItems() == null || req.getItems().isEmpty()) {
            if (req.getProducts() != null && !req.getProducts().isBlank()) {
                String cleanProductName = req.getProducts().replaceAll("\\(.*\\)", "").trim();
                Product fallbackProduct = productRepository.findFirstByNameContainingIgnoreCase(businessId, cleanProductName)
                        .orElseGet(() -> {
                            List<Product> prods = productRepository.findByBusinessIdAndActiveTrue(businessId);
                            return prods.isEmpty() ? null : prods.get(0);
                        });
                int qty = req.getQuantity() != null && req.getQuantity() > 0 ? req.getQuantity() : 1;
                BigDecimal price = (req.getAmount() != null && req.getAmount().compareTo(BigDecimal.ZERO) > 0) ?
                        req.getAmount().divide(BigDecimal.valueOf(qty), 2, java.math.RoundingMode.HALF_UP) :
                        (fallbackProduct != null ? fallbackProduct.getSellingPrice() : BigDecimal.valueOf(10));

                if (fallbackProduct == null) {
                    fallbackProduct = productRepository.save(new Product(business, cleanProductName.isBlank() ? "Retail Item" : cleanProductName,
                            "General", "SKU-" + (System.currentTimeMillis() % 10000), 100, "units", 5, price, price, "Local Store"));
                }
                SaleRequest.SaleItemRequest itemReq = new SaleRequest.SaleItemRequest(
                        fallbackProduct.getId(), fallbackProduct.getName(), qty, fallbackProduct.getUnit(), price
                );
                req.setItems(List.of(itemReq));
            } else {
                throw new BadRequestException("Sale must have at least one item.");
            }
        }

        // 2. Generate unique invoice number
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String invoiceNumber = "INV-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        // 3. Resolve Customer if any
        Customer customer = null;
        if (req.getCustomerId() != null) {
            customer = customerRepository.findByIdAndBusinessId(req.getCustomerId(), businessId).orElse(null);
        } else if (req.getCustomerName() != null && !req.getCustomerName().isBlank()) {
            customer = customerRepository.findFirstByBusinessIdAndNameContainingIgnoreCase(businessId, req.getCustomerName().trim())
                    .orElse(null);
        }

        String customerName = customer != null ? customer.getName() :
                (req.getCustomerName() != null && !req.getCustomerName().isBlank() ? req.getCustomerName().trim() : "Walk-in Customer");

        // 4. Validate items and inventory decrement
        BigDecimal subtotal = BigDecimal.ZERO;
        Sale sale = new Sale();
        sale.setBusiness(business);
        sale.setInvoiceNumber(invoiceNumber);
        sale.setCustomer(customer);
        sale.setCustomerName(customerName);
        sale.setIdempotencyKey(req.getIdempotencyKey());
        sale.setCreatedBy(userName);

        for (SaleRequest.SaleItemRequest itemReq : req.getItems()) {
            Product product = null;
            if (itemReq.getProductId() != null) {
                product = productRepository.findByIdAndBusinessId(itemReq.getProductId(), businessId)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));
            } else if (itemReq.getProductName() != null && !itemReq.getProductName().isBlank()) {
                product = productRepository.findFirstByNameContainingIgnoreCase(businessId, itemReq.getProductName().trim())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductName()));
            }

            if (product == null) {
                throw new BadRequestException("Item must specify a valid product.");
            }

            int qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : 1;
            if (qty <= 0) {
                throw new BadRequestException("Quantity for " + product.getName() + " must be greater than 0.");
            }

            if (product.getQuantity() < qty) {
                throw new InsufficientStockException("Insufficient stock for '" + product.getName() +
                        "'. Requested: " + qty + ", Available: " + product.getQuantity());
            }

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getSellingPrice();
            SaleItem saleItem = new SaleItem(product, product.getName(), qty, product.getUnit(), unitPrice);
            sale.addItem(saleItem);

            subtotal = subtotal.add(saleItem.getTotalPrice());

            // Deduct stock
            int prevStock = product.getQuantity();
            int newStock = prevStock - qty;
            product.setQuantity(newStock);
            productRepository.save(product);

            // Record inventory transaction
            InventoryTransaction tx = new InventoryTransaction(
                    business,
                    product,
                    TransactionType.SALE,
                    qty,
                    prevStock,
                    newStock,
                    invoiceNumber,
                    "Sale to " + customerName,
                    userName
            );
            inventoryTransactionRepository.save(tx);

            // Check low stock alert
            if (product.getStatus() == StockStatus.OUT_OF_STOCK) {
                notificationService.createNotification(
                        business,
                        "OUT_OF_STOCK",
                        "Out of Stock: " + product.getName(),
                        product.getName() + " was sold out with invoice " + invoiceNumber
                );
            } else if (product.getStatus() == StockStatus.LOW_STOCK) {
                notificationService.createNotification(
                        business,
                        "LOW_STOCK",
                        "Low Stock: " + product.getName(),
                        product.getName() + " has " + newStock + " " + product.getUnit() + " remaining after sale."
                );
            }
        }

        // 5. Calculate totals
        BigDecimal discount = req.getDiscount() != null ? req.getDiscount() : BigDecimal.ZERO;
        BigDecimal tax = req.getTax() != null ? req.getTax() : BigDecimal.ZERO;
        BigDecimal total = subtotal.subtract(discount).add(tax);
        if (total.compareTo(BigDecimal.ZERO) < 0) total = BigDecimal.ZERO;

        PaymentMethod method = req.getPaymentMethod() != null ? req.getPaymentMethod() : PaymentMethod.CASH;
        BigDecimal paidAmount;
        BigDecimal pendingAmount;

        if (method == PaymentMethod.CREDIT) {
            paidAmount = req.getPaidAmount() != null ? req.getPaidAmount() : BigDecimal.ZERO;
            pendingAmount = total.subtract(paidAmount);
        } else {
            paidAmount = req.getPaidAmount() != null ? req.getPaidAmount() : total;
            pendingAmount = total.subtract(paidAmount);
            if (pendingAmount.compareTo(BigDecimal.ZERO) < 0) pendingAmount = BigDecimal.ZERO;
        }

        sale.setSubtotal(subtotal);
        sale.setDiscount(discount);
        sale.setTax(tax);
        sale.setTotal(total);
        sale.setPaymentMethod(method);
        sale.setPaidAmount(paidAmount);
        sale.setPendingAmount(pendingAmount);

        // 6. Update Customer Khata/Udhaar balance if applicable
        if (customer != null) {
            customer.setTotalPurchases(customer.getTotalPurchases().add(total));
            customer.setLastPurchaseDate(LocalDateTime.now());
            if (pendingAmount.compareTo(BigDecimal.ZERO) > 0) {
                customer.setCurrentBalance(customer.getCurrentBalance().add(pendingAmount));
                notificationService.createNotification(
                        business,
                        "CUSTOMER_CREDIT",
                        "Khata Updated: " + customer.getName(),
                        "Added ₹" + pendingAmount + " credit for " + customer.getName() + ". Total Khata: ₹" + customer.getCurrentBalance()
                );
            }
            customerRepository.save(customer);
        }

        Sale savedSale = saleRepository.save(sale);
        String refId = savedSale.getId() != null ? savedSale.getId().toString() : invoiceNumber;
        auditService.logAction(business, userName, "SALE_CREATED", "Sale", refId,
                "Created sale " + invoiceNumber + " total ₹" + total + " for " + customerName);

        return savedSale;
    }
}
