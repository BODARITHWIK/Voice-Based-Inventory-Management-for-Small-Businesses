package com.swaranidhi.service;

import com.swaranidhi.dto.PurchaseRequest;
import com.swaranidhi.entity.*;
import com.swaranidhi.exception.BadRequestException;
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
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final BusinessRepository businessRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final AuditService auditService;

    public PurchaseService(PurchaseRepository purchaseRepository,
                           BusinessRepository businessRepository,
                           ProductRepository productRepository,
                           SupplierRepository supplierRepository,
                           InventoryTransactionRepository inventoryTransactionRepository,
                           AuditService auditService) {
        this.purchaseRepository = purchaseRepository;
        this.businessRepository = businessRepository;
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<Purchase> getAllPurchases(Long businessId) {
        return purchaseRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
    }

    @Transactional(readOnly = true)
    public Page<Purchase> getPurchasesPaged(Long businessId, Pageable pageable) {
        return purchaseRepository.findByBusinessIdOrderByCreatedAtDesc(businessId, pageable);
    }

    @Transactional(readOnly = true)
    public Purchase getPurchaseById(Long businessId, Long id) {
        return purchaseRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
    }

    @Transactional
    public Purchase createPurchase(Long businessId, PurchaseRequest req, String userName) {
        // 1. Idempotency protection
        if (req.getIdempotencyKey() != null && !req.getIdempotencyKey().isBlank()) {
            Optional<Purchase> existing = purchaseRepository.findByIdempotencyKeyAndBusinessId(req.getIdempotencyKey().trim(), businessId);
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new BadRequestException("Purchase must have at least one item.");
        }

        // 2. Generate unique purchase number
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String purchaseNumber = "PUR-" + datePrefix + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        // 3. Resolve Supplier
        Supplier supplier = null;
        if (req.getSupplierId() != null) {
            supplier = supplierRepository.findByIdAndBusinessId(req.getSupplierId(), businessId).orElse(null);
        } else if (req.getSupplierName() != null && !req.getSupplierName().isBlank()) {
            supplier = supplierRepository.findFirstByBusinessIdAndNameContainingIgnoreCase(businessId, req.getSupplierName().trim())
                    .orElse(null);
        }

        String supplierName = supplier != null ? supplier.getName() :
                (req.getSupplierName() != null && !req.getSupplierName().isBlank() ? req.getSupplierName().trim() : "Direct Supplier");

        // 4. Validate items and inventory increment
        BigDecimal subtotal = BigDecimal.ZERO;
        Purchase purchase = new Purchase();
        purchase.setBusiness(business);
        purchase.setPurchaseNumber(purchaseNumber);
        purchase.setSupplier(supplier);
        purchase.setSupplierName(supplierName);
        purchase.setIdempotencyKey(req.getIdempotencyKey());
        purchase.setCreatedBy(userName);

        for (PurchaseRequest.PurchaseItemRequest itemReq : req.getItems()) {
            Product product = null;
            if (itemReq.getProductId() != null) {
                product = productRepository.findByIdAndBusinessId(itemReq.getProductId(), businessId)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));
            } else if (itemReq.getProductName() != null && !itemReq.getProductName().isBlank()) {
                product = productRepository.findFirstByNameContainingIgnoreCase(businessId, itemReq.getProductName().trim())
                        .orElse(null);
            }

            // If product doesn't exist yet, create it on the fly with standard margins
            if (product == null && itemReq.getProductName() != null && !itemReq.getProductName().isBlank()) {
                BigDecimal buyPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal sellPrice = buyPrice.multiply(BigDecimal.valueOf(1.2)); // 20% default margin
                product = new Product(
                        business,
                        itemReq.getProductName().trim(),
                        "General",
                        "SKU-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(),
                        0,
                        itemReq.getUnit() != null ? itemReq.getUnit() : "packets",
                        10,
                        buyPrice,
                        sellPrice,
                        supplierName
                );
                product = productRepository.save(product);
            }

            if (product == null) {
                throw new BadRequestException("Item must specify a valid product or product name.");
            }

            int qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : 1;
            if (qty <= 0) {
                throw new BadRequestException("Quantity for " + product.getName() + " must be greater than 0.");
            }

            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getPurchasePrice();
            PurchaseItem purchaseItem = new PurchaseItem(product, product.getName(), qty, product.getUnit(), unitPrice);
            purchase.addItem(purchaseItem);

            subtotal = subtotal.add(purchaseItem.getTotalPrice());

            // Increment stock
            int prevStock = product.getQuantity();
            int newStock = prevStock + qty;
            product.setQuantity(newStock);
            if (itemReq.getUnitPrice() != null && itemReq.getUnitPrice().compareTo(BigDecimal.ZERO) > 0) {
                product.setPurchasePrice(itemReq.getUnitPrice());
            }
            productRepository.save(product);

            // Record inventory transaction
            InventoryTransaction tx = new InventoryTransaction(
                    business,
                    product,
                    TransactionType.PURCHASE,
                    qty,
                    prevStock,
                    newStock,
                    purchaseNumber,
                    "Stock inward purchase from " + supplierName,
                    userName
            );
            inventoryTransactionRepository.save(tx);
        }

        // 5. Calculate totals
        BigDecimal tax = req.getTax() != null ? req.getTax() : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(tax);

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

        purchase.setSubtotal(subtotal);
        purchase.setTax(tax);
        purchase.setTotal(total);
        purchase.setPaymentMethod(method);
        purchase.setPaidAmount(paidAmount);
        purchase.setPendingAmount(pendingAmount);

        // 6. Update Supplier balance if applicable
        if (supplier != null) {
            supplier.setTotalPurchases(supplier.getTotalPurchases().add(total));
            if (pendingAmount.compareTo(BigDecimal.ZERO) > 0) {
                supplier.setOutstandingBalance(supplier.getOutstandingBalance().add(pendingAmount));
            }
            supplierRepository.save(supplier);
        }

        Purchase savedPurchase = purchaseRepository.save(purchase);
        auditService.logAction(business, userName, "PURCHASE_CREATED", "Purchase", savedPurchase.getId().toString(),
                "Recorded purchase " + purchaseNumber + " total ₹" + total + " from " + supplierName);

        return savedPurchase;
    }
}
