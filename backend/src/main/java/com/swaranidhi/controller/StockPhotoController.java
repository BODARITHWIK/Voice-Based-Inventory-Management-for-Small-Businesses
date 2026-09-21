package com.swaranidhi.controller;

import com.swaranidhi.dto.*;
import com.swaranidhi.entity.Product;
import com.swaranidhi.entity.StockPhotoScan;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.ProductMatchingService;
import com.swaranidhi.service.ProductService;
import com.swaranidhi.service.StockPhotoService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class StockPhotoController {

    private final StockPhotoService stockPhotoService;
    private final ProductMatchingService productMatchingService;
    private final ProductService productService;

    public StockPhotoController(StockPhotoService stockPhotoService,
                                ProductMatchingService productMatchingService,
                                ProductService productService) {
        this.stockPhotoService = stockPhotoService;
        this.productMatchingService = productMatchingService;
        this.productService = productService;
    }

    /**
     * POST /api/stock/photo/analyze
     * Analyzes uploaded photo via computer vision & OCR, matching against inventory.
     */
    @PostMapping(value = "/stock/photo/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<ScanAnalysisResponse>> analyzeStockPhoto(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("image") MultipartFile image) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Long businessId = principal.getBusinessId();
        ScanAnalysisResponse result = stockPhotoService.analyzePhoto(image, businessId, principal);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    /**
     * POST /api/stock/photo/confirm
     * Explicit confirmation of stock modification (ADD, REMOVE, ADJUST). Never auto-updates.
     */
    @PostMapping("/stock/photo/confirm")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<Product>> confirmScan(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ConfirmScanRequest request) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Long businessId = principal.getBusinessId();
        Product updatedProduct = stockPhotoService.confirmScan(request, businessId, principal);
        return ResponseEntity.ok(ApiResponse.success(
                "Stock updated: " + request.getAction() + " for " + updatedProduct.getName(),
                updatedProduct
        ));
    }

    /**
     * POST /api/stock/photo/reject
     * Rejects a scan recommendation without altering inventory.
     */
    @PostMapping("/stock/photo/reject")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<String>> rejectScan(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long scanId,
            @RequestParam(required = false) String reason) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Long businessId = principal.getBusinessId();
        stockPhotoService.rejectScan(scanId, reason, businessId, principal);
        return ResponseEntity.ok(ApiResponse.success("Scan marked as rejected", "Scan ID: " + scanId));
    }

    /**
     * GET /api/stock/photo/history
     * Returns history of photo scans for business.
     */
    @GetMapping("/stock/photo/history")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<StockPhotoScan>>> getScanHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Long businessId = principal.getBusinessId();
        List<StockPhotoScan> history = stockPhotoService.getScanHistory(businessId);
        return ResponseEntity.ok(ApiResponse.success("Scan history retrieved", history));
    }

    /**
     * GET /api/stock/photo/{id}
     * Returns specific scan details.
     */
    @GetMapping("/stock/photo/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<StockPhotoScan>> getScanById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Long businessId = principal.getBusinessId();
        StockPhotoScan scan = stockPhotoService.getScanById(id, businessId);
        return ResponseEntity.ok(ApiResponse.success("Scan details found", scan));
    }

    /**
     * GET /api/products/match
     * Searches database for product match by query name or barcode.
     */
    @GetMapping("/products/match")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<ProductMatchDto>> matchProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String barcode) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Long businessId = principal.getBusinessId();
        ProductMatchDto match = productMatchingService.findBestMatch(businessId, query, barcode);
        return ResponseEntity.ok(ApiResponse.success("Product match evaluated", match));
    }

    /**
     * POST /api/products/create-from-scan
     * Creates new product directly from a scan when not found in existing inventory.
     */
    @PostMapping("/products/create-from-scan")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Product>> createFromScan(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProductRequest request) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Long businessId = principal.getBusinessId();
        String userName = principal.getFullName();
        Product created = productService.createProduct(businessId, request, userName);
        return ResponseEntity.ok(ApiResponse.success("Product created from scan", created));
    }
}
