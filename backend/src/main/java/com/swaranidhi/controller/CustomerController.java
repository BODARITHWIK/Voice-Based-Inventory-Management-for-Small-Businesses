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
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Customer>>> getAllCustomers(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        List<Customer> customers = (search != null && !search.isBlank())
                ? customerService.searchCustomers(principal.getBusinessId(), search)
                : customerService.getAllCustomers(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved", customers));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<Customer>>> getCustomersPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Page<Customer> customerPage = customerService.getCustomersPaged(
                principal.getBusinessId(),
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(ApiResponse.success("Customers page retrieved", customerPage));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> getCustomerById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Customer customer = customerService.getCustomerById(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Customer found", customer));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @PostMapping
    public ResponseEntity<ApiResponse<Customer>> createCustomer(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CustomerRequest request) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Customer customer = customerService.createCustomer(
                principal.getBusinessId(),
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Customer added successfully", customer));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> updateCustomer(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Customer customer = customerService.updateCustomer(
                principal.getBusinessId(),
                id,
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Customer updated successfully", customer));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    @GetMapping("/{id}/khata")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCustomerKhata(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Map<String, Object> khata = customerService.getCustomerKhata(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Khata ledger details", khata));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @PostMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<CustomerPayment>> recordCustomerPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        CustomerPayment payment = customerService.recordPayment(
                principal.getBusinessId(),
                id,
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully", payment));
    }
}
