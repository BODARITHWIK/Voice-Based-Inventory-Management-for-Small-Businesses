package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.dto.InventoryAdjustRequest;
import com.swaranidhi.entity.InventoryTransaction;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<InventoryTransaction>>> getInventoryHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        List<InventoryTransaction> transactions = inventoryService.getAllTransactions(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Inventory transactions", transactions));
    }

    @GetMapping("/page")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<Page<InventoryTransaction>>> getInventoryPage(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        Page<InventoryTransaction> txPage = inventoryService.getTransactionsPaged(
                principal.getBusinessId(),
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(ApiResponse.success("Inventory transactions page", txPage));
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<InventoryTransaction>>> getProductInventoryHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        List<InventoryTransaction> transactions = inventoryService.getProductTransactions(principal.getBusinessId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Product inventory history", transactions));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<InventoryTransaction>> adjustStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InventoryAdjustRequest request) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        InventoryTransaction tx = inventoryService.adjustStock(
                principal.getBusinessId(),
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted successfully", tx));
    }
}
