package com.swaranidhi.service;

import com.swaranidhi.dto.PaymentRequest;
import com.swaranidhi.dto.SupplierRequest;
import com.swaranidhi.entity.Business;
import com.swaranidhi.entity.PaymentMethod;
import com.swaranidhi.entity.Supplier;
import com.swaranidhi.entity.SupplierPayment;
import com.swaranidhi.exception.BadRequestException;
import com.swaranidhi.exception.ResourceNotFoundException;
import com.swaranidhi.repository.BusinessRepository;
import com.swaranidhi.repository.SupplierPaymentRepository;
import com.swaranidhi.repository.SupplierRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierPaymentRepository supplierPaymentRepository;
    private final BusinessRepository businessRepository;
    private final AuditService auditService;

    public SupplierService(SupplierRepository supplierRepository,
                           SupplierPaymentRepository supplierPaymentRepository,
                           BusinessRepository businessRepository,
                           AuditService auditService) {
        this.supplierRepository = supplierRepository;
        this.supplierPaymentRepository = supplierPaymentRepository;
        this.businessRepository = businessRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<Supplier> getAllSuppliers(Long businessId) {
        return supplierRepository.findByBusinessIdOrderByNameAsc(businessId);
    }

    @Transactional(readOnly = true)
    public Page<Supplier> getSuppliersPaged(Long businessId, Pageable pageable) {
        return supplierRepository.findByBusinessIdOrderByNameAsc(businessId, pageable);
    }

    @Transactional(readOnly = true)
    public Supplier getSupplierById(Long businessId, Long id) {
        return supplierRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Supplier> searchSuppliers(Long businessId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllSuppliers(businessId);
        }
        return supplierRepository.searchSuppliers(businessId, query.trim());
    }

    @Transactional
    public Supplier createSupplier(Long businessId, SupplierRequest req, String userName) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        Supplier supplier = new Supplier(
                business,
                req.getName().trim(),
                req.getPhone().trim(),
                req.getEmail() != null ? req.getEmail().trim() : null,
                req.getAddress() != null ? req.getAddress().trim() : null,
                req.getGstin() != null ? req.getGstin().trim() : null,
                req.getOpeningBalance()
        );

        Supplier saved = supplierRepository.save(supplier);
        auditService.logAction(business, userName, "SUPPLIER_CREATED", "Supplier", saved.getId().toString(),
                "Created supplier " + saved.getName());

        return saved;
    }

    @Transactional
    public Supplier updateSupplier(Long businessId, Long id, SupplierRequest req, String userName) {
        Supplier supplier = getSupplierById(businessId, id);

        supplier.setName(req.getName().trim());
        supplier.setPhone(req.getPhone().trim());
        if (req.getEmail() != null) supplier.setEmail(req.getEmail().trim());
        if (req.getAddress() != null) supplier.setAddress(req.getAddress().trim());
        if (req.getGstin() != null) supplier.setGstin(req.getGstin().trim());

        Supplier updated = supplierRepository.save(supplier);
        auditService.logAction(supplier.getBusiness(), userName, "SUPPLIER_UPDATED", "Supplier", updated.getId().toString(),
                "Updated supplier " + updated.getName());

        return updated;
    }

    @Transactional
    public SupplierPayment recordPayment(Long businessId, Long supplierId, PaymentRequest req, String userName) {
        Supplier supplier = getSupplierById(businessId, supplierId);

        BigDecimal amount = req.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than 0");
        }

        PaymentMethod method = req.getPaymentMethod() != null ? req.getPaymentMethod() : PaymentMethod.CASH;
        SupplierPayment payment = new SupplierPayment(
                supplier.getBusiness(),
                supplier,
                amount,
                method,
                req.getNotes() != null ? req.getNotes() : "Payment to supplier recorded by " + userName
        );

        // Deduct from outstanding balance
        BigDecimal prevBalance = supplier.getOutstandingBalance();
        BigDecimal newBalance = prevBalance.subtract(amount);
        supplier.setOutstandingBalance(newBalance);
        supplierRepository.save(supplier);

        SupplierPayment savedPayment = supplierPaymentRepository.save(payment);
        auditService.logAction(supplier.getBusiness(), userName, "SUPPLIER_PAYMENT", "SupplierPayment",
                savedPayment.getId().toString(), "Recorded supplier payment of ₹" + amount + " to " + supplier.getName() +
                        ". New outstanding balance: ₹" + newBalance);

        return savedPayment;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSupplierDetails(Long businessId, Long supplierId) {
        Supplier supplier = getSupplierById(businessId, supplierId);
        List<SupplierPayment> payments = supplierPaymentRepository.findBySupplierIdOrderByRecordedAtDesc(supplierId);

        Map<String, Object> details = new HashMap<>();
        details.put("supplier", supplier);
        details.put("outstandingBalance", supplier.getOutstandingBalance());
        details.put("totalPurchases", supplier.getTotalPurchases());
        details.put("payments", payments);
        return details;
    }
}
