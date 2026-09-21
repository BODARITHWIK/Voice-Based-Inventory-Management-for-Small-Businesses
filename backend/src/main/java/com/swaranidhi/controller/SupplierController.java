package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.dto.PaymentRequest;
import com.swaranidhi.dto.SupplierRequest;
import com.swaranidhi.entity.Supplier;
import com.swaranidhi.entity.SupplierPayment;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.SupplierService;
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
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Supplier>>> getAllSuppliers(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        List<Supplier> suppliers = (search != null && !search.isBlank())
                ? supplierService.searchSuppliers(principal.getBusinessId(), search)
                : supplierService.getAllSuppliers(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Suppliers retrieved", suppliers));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<Supplier>>> getSuppliersPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Page<Supplier> supplierPage = supplierService.getSuppliersPaged(
                principal.getBusinessId(),
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(ApiResponse.success("Suppliers page retrieved", supplierPage));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Supplier>> getSupplierById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Supplier supplier = supplierService.getSupplierById(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Supplier found", supplier));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @PostMapping
    public ResponseEntity<ApiResponse<Supplier>> createSupplier(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SupplierRequest request) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Supplier supplier = supplierService.createSupplier(
                principal.getBusinessId(),
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Supplier added successfully", supplier));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Supplier>> updateSupplier(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Supplier supplier = supplierService.updateSupplier(
                principal.getBusinessId(),
                id,
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Supplier updated successfully", supplier));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSupplierDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Map<String, Object> details = supplierService.getSupplierDetails(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Supplier details and ledger", details));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @PostMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<SupplierPayment>> recordSupplierPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        SupplierPayment payment = supplierService.recordPayment(
                principal.getBusinessId(),
                id,
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Supplier payment recorded successfully", payment));
    }
}
