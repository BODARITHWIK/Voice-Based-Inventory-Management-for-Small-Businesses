package com.swaranidhi.service;

import com.swaranidhi.dto.CustomerRequest;
import com.swaranidhi.dto.PaymentRequest;
import com.swaranidhi.entity.Business;
import com.swaranidhi.entity.Customer;
import com.swaranidhi.entity.CustomerPayment;
import com.swaranidhi.entity.PaymentMethod;
import com.swaranidhi.exception.BadRequestException;
import com.swaranidhi.exception.ResourceNotFoundException;
import com.swaranidhi.repository.BusinessRepository;
import com.swaranidhi.repository.CustomerPaymentRepository;
import com.swaranidhi.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerPaymentRepository customerPaymentRepository;
    private final BusinessRepository businessRepository;
    private final AuditService auditService;

    public CustomerService(CustomerRepository customerRepository,
                           CustomerPaymentRepository customerPaymentRepository,
                           BusinessRepository businessRepository,
                           AuditService auditService) {
        this.customerRepository = customerRepository;
        this.customerPaymentRepository = customerPaymentRepository;
        this.businessRepository = businessRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers(Long businessId) {
        return customerRepository.findByBusinessIdOrderByNameAsc(businessId);
    }

    @Transactional(readOnly = true)
    public Page<Customer> getCustomersPaged(Long businessId, Pageable pageable) {
        return customerRepository.findByBusinessIdOrderByNameAsc(businessId, pageable);
    }

    @Transactional(readOnly = true)
    public Customer getCustomerById(Long businessId, Long id) {
        return customerRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Customer> searchCustomers(Long businessId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllCustomers(businessId);
        }
        return customerRepository.searchCustomers(businessId, query.trim());
    }

    @Transactional
    public Customer createCustomer(Long businessId, CustomerRequest req, String userName) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        customerRepository.findByBusinessIdAndPhone(businessId, req.getPhone().trim()).ifPresent(c -> {
            throw new BadRequestException("Customer with phone " + req.getPhone() + " already exists.");
        });

        Customer customer = new Customer(
                business,
                req.getName().trim(),
                req.getPhone().trim(),
                req.getEmail() != null ? req.getEmail().trim() : null,
                req.getAddress() != null ? req.getAddress().trim() : null,
                req.getOpeningBalance()
        );

        Customer saved = customerRepository.save(customer);
        auditService.logAction(business, userName, "CUSTOMER_CREATED", "Customer", saved.getId().toString(),
                "Created customer " + saved.getName());

        return saved;
    }

    @Transactional
    public Customer updateCustomer(Long businessId, Long id, CustomerRequest req, String userName) {
        Customer customer = getCustomerById(businessId, id);

        customer.setName(req.getName().trim());
        customer.setPhone(req.getPhone().trim());
        if (req.getEmail() != null) customer.setEmail(req.getEmail().trim());
        if (req.getAddress() != null) customer.setAddress(req.getAddress().trim());

        Customer updated = customerRepository.save(customer);
        auditService.logAction(customer.getBusiness(), userName, "CUSTOMER_UPDATED", "Customer", updated.getId().toString(),
                "Updated customer " + updated.getName());

        return updated;
    }

    @Transactional
    public CustomerPayment recordPayment(Long businessId, Long customerId, PaymentRequest req, String userName) {
        Customer customer = getCustomerById(businessId, customerId);

        BigDecimal amount = req.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than 0");
        }

        PaymentMethod method = req.getPaymentMethod() != null ? req.getPaymentMethod() : PaymentMethod.CASH;
        CustomerPayment payment = new CustomerPayment(
                customer.getBusiness(),
                customer,
                amount,
                method,
                req.getNotes() != null ? req.getNotes() : "Payment recorded by " + userName
        );

        // Deduct from outstanding balance
        BigDecimal prevBalance = customer.getCurrentBalance();
        BigDecimal newBalance = prevBalance.subtract(amount);
        customer.setCurrentBalance(newBalance);
        customerRepository.save(customer);

        CustomerPayment savedPayment = customerPaymentRepository.save(payment);
        auditService.logAction(customer.getBusiness(), userName, "CUSTOMER_PAYMENT", "CustomerPayment",
                savedPayment.getId().toString(), "Recorded payment of ₹" + amount + " for " + customer.getName() +
                        ". New Khata balance: ₹" + newBalance);

        return savedPayment;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCustomerKhata(Long businessId, Long customerId) {
        Customer customer = getCustomerById(businessId, customerId);
        List<CustomerPayment> payments = customerPaymentRepository.findByCustomerIdOrderByRecordedAtDesc(customerId);

        Map<String, Object> khata = new HashMap<>();
        khata.put("customer", customer);
        khata.put("currentBalance", customer.getCurrentBalance());
        khata.put("totalPurchases", customer.getTotalPurchases());
        khata.put("payments", payments);
        return khata;
    }
}
