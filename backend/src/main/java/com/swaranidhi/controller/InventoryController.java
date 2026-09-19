package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.dto.InventoryAdjustRequest;
import com.swaranidhi.entity.InventoryTransaction;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<ApiResponse<List<InventoryTransaction>>> getInventoryHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<InventoryTransaction> transactions = inventoryService.getAllTransactions(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Inventory transactions", transactions));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<InventoryTransaction>>> getInventoryPage(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<InventoryTransaction> txPage = inventoryService.getTransactionsPaged(
                principal.getBusinessId(),
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(ApiResponse.success("Inventory transactions page", txPage));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<InventoryTransaction>>> getProductInventoryHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId) {
        List<InventoryTransaction> transactions = inventoryService.getProductTransactions(principal.getBusinessId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Product inventory history", transactions));
    }

    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<InventoryTransaction>> adjustStock(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InventoryAdjustRequest request) {
        InventoryTransaction tx = inventoryService.adjustStock(
                principal.getBusinessId(),
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted successfully", tx));
    }
}
