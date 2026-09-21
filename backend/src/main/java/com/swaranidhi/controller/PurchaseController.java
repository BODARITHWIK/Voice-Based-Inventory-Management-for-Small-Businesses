package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.dto.PurchaseRequest;
import com.swaranidhi.entity.Purchase;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Purchase>>> getAllPurchases(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        List<Purchase> purchases = purchaseService.getAllPurchases(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Purchases retrieved", purchases));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<Purchase>>> getPurchasesPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Page<Purchase> purchasePage = purchaseService.getPurchasesPaged(
                principal.getBusinessId(),
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(ApiResponse.success("Purchases page retrieved", purchasePage));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Purchase>> getPurchaseById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Purchase purchase = purchaseService.getPurchaseById(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Purchase details", purchase));
    }

    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    @PostMapping
    public ResponseEntity<ApiResponse<Purchase>> createPurchase(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PurchaseRequest request) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Purchase purchase = purchaseService.createPurchase(
                principal.getBusinessId(),
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Purchase recorded successfully", purchase));
    }
}
