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

    private Long getEffectiveBusinessId(UserPrincipal principal) {
        return (principal != null && principal.getBusinessId() != null) ? principal.getBusinessId() : 1L;
    }

    /**
     * POST /api/stock/photo/analyze
     * Analyzes uploaded photo via computer vision & OCR, matching against inventory.
     */
    @PostMapping(value = "/stock/photo/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ScanAnalysisResponse>> analyzeStockPhoto(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("image") MultipartFile image) {

        Long businessId = getEffectiveBusinessId(principal);
        ScanAnalysisResponse result = stockPhotoService.analyzePhoto(image, businessId, principal);
        return ResponseEntity.ok(ApiResponse.success(result.getMessage(), result));
    }

    /**
     * POST /api/stock/photo/confirm
     * Explicit confirmation of stock modification (ADD, REMOVE, ADJUST). Never auto-updates.
     */
    @PostMapping("/stock/photo/confirm")
    public ResponseEntity<ApiResponse<Product>> confirmScan(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ConfirmScanRequest request) {

        Long businessId = getEffectiveBusinessId(principal);
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
    public ResponseEntity<ApiResponse<String>> rejectScan(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long scanId,
            @RequestParam(required = false) String reason) {

        Long businessId = getEffectiveBusinessId(principal);
        stockPhotoService.rejectScan(scanId, reason, businessId, principal);
        return ResponseEntity.ok(ApiResponse.success("Scan marked as rejected", "Scan ID: " + scanId));
    }

    /**
     * GET /api/stock/photo/history
     * Returns history of photo scans for business.
     */
    @GetMapping("/stock/photo/history")
    public ResponseEntity<ApiResponse<List<StockPhotoScan>>> getScanHistory(
            @AuthenticationPrincipal UserPrincipal principal) {

        Long businessId = getEffectiveBusinessId(principal);
        List<StockPhotoScan> history = stockPhotoService.getScanHistory(businessId);
        return ResponseEntity.ok(ApiResponse.success("Scan history retrieved", history));
    }

    /**
     * GET /api/stock/photo/{id}
     * Returns specific scan details.
     */
    @GetMapping("/stock/photo/{id}")
    public ResponseEntity<ApiResponse<StockPhotoScan>> getScanById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {

        Long businessId = getEffectiveBusinessId(principal);
        StockPhotoScan scan = stockPhotoService.getScanById(id, businessId);
        return ResponseEntity.ok(ApiResponse.success("Scan details found", scan));
    }

    /**
     * GET /api/products/match
     * Searches database for product match by query name or barcode.
     */
    @GetMapping("/products/match")
    public ResponseEntity<ApiResponse<ProductMatchDto>> matchProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String barcode) {

        Long businessId = getEffectiveBusinessId(principal);
        ProductMatchDto match = productMatchingService.findBestMatch(businessId, query, barcode);
        return ResponseEntity.ok(ApiResponse.success("Product match evaluated", match));
    }

    /**
     * POST /api/products/create-from-scan
     * Creates new product directly from a scan when not found in existing inventory.
     */
    @PostMapping("/products/create-from-scan")
    public ResponseEntity<ApiResponse<Product>> createFromScan(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProductRequest request) {

        Long businessId = getEffectiveBusinessId(principal);
        String userName = (principal != null) ? principal.getFullName() : "Shopkeeper";
        Product created = productService.createProduct(businessId, request, userName);
        return ResponseEntity.ok(ApiResponse.success("Product created from scan", created));
    }
}
