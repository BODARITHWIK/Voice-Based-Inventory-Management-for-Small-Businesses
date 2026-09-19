package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.dto.CustomerRequest;
import com.swaranidhi.dto.PaymentRequest;
import com.swaranidhi.entity.Customer;
import com.swaranidhi.entity.CustomerPayment;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Customer>>> getAllCustomers(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search) {
        List<Customer> customers = (search != null && !search.isBlank())
                ? customerService.searchCustomers(principal.getBusinessId(), search)
                : customerService.getAllCustomers(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved", customers));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<Customer>>> getCustomersPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<Customer> customerPage = customerService.getCustomersPaged(
                principal.getBusinessId(),
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(ApiResponse.success("Customers page retrieved", customerPage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> getCustomerById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Customer customer = customerService.getCustomerById(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Customer found", customer));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Customer>> createCustomer(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CustomerRequest request) {
        Customer customer = customerService.createCustomer(
                principal.getBusinessId(),
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Customer added successfully", customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> updateCustomer(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        Customer customer = customerService.updateCustomer(
                principal.getBusinessId(),
                id,
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Customer updated successfully", customer));
    }

    @GetMapping("/{id}/khata")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCustomerKhata(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Map<String, Object> khata = customerService.getCustomerKhata(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Khata ledger details", khata));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<CustomerPayment>> recordCustomerPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        CustomerPayment payment = customerService.recordPayment(
                principal.getBusinessId(),
                id,
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully", payment));
    }
}
