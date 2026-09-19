package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.dto.SaleRequest;
import com.swaranidhi.entity.Sale;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Sale>>> getAllSales(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<Sale> sales = saleService.getAllSales(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Sales retrieved", sales));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<Sale>>> getSalesPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Page<Sale> salesPage = saleService.getSalesPaged(
                principal.getBusinessId(),
                PageRequest.of(page, size)
        );
        return ResponseEntity.ok(ApiResponse.success("Sales page retrieved", salesPage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Sale>> getSaleById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Sale sale = saleService.getSaleById(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Sale details", sale));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Sale>> createSale(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SaleRequest request) {
        Sale sale = saleService.createSale(
                principal.getBusinessId(),
                request,
                principal.getFullName()
        );
        return ResponseEntity.ok(ApiResponse.success("Sale recorded successfully", sale));
    }
}
