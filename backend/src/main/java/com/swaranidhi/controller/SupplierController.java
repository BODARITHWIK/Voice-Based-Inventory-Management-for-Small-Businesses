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

    @GetMapping
    public ResponseEntity<ApiResponse<List<Supplier>>> getAllSuppliers(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search) {
        List<Supplier> suppliers = (search != null && !search.isBlank())
                ? supplierService.searchSuppliers(principal.getBusinessId(), search)
                : supplierService.getAllSuppliers(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Suppliers retrieved", suppliers));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<Supplier>>> getSuppliersPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<Supplier> supplierPage = supplierService.getSuppliersPaged(
                principal.getBusinessId(),
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(ApiResponse.success("Suppliers page retrieved", supplierPage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Supplier>> getSupplierById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Supplier supplier = supplierService.getSupplierById(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Supplier found", supplier));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Supplier>> createSupplier(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SupplierRequest request) {
        Supplier supplier = supplierService.createSupplier(
                principal.getBusinessId(),
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Supplier added successfully", supplier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Supplier>> updateSupplier(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request) {
        Supplier supplier = supplierService.updateSupplier(
                principal.getBusinessId(),
                id,
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Supplier updated successfully", supplier));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSupplierDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Map<String, Object> details = supplierService.getSupplierDetails(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Supplier details and ledger", details));
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<SupplierPayment>> recordSupplierPayment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody PaymentRequest request) {
        SupplierPayment payment = supplierService.recordPayment(
                principal.getBusinessId(),
                id,
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Supplier payment recorded successfully", payment));
    }
}
