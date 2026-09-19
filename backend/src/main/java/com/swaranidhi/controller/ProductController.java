package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.dto.ProductRequest;
import com.swaranidhi.entity.Product;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search) {
        Long businessId = principal.getBusinessId();
        List<Product> products = (search != null && !search.isBlank())
                ? productService.searchProducts(businessId, search)
                : productService.getAllProducts(businessId);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved", products));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<Product>>> getProductsPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "name") String sortBy) {
        Page<Product> productPage = productService.getProductsPaged(
                principal.getBusinessId(),
                PageRequest.of(page, size, Sort.by(sortBy).ascending())
        );
        return ResponseEntity.ok(ApiResponse.success("Products page retrieved", productPage));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<Product>>> getLowStockProducts(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<Product> products = productService.getLowStockProducts(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Low stock products", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        Product product = productService.getProductById(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Product found", product));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProductRequest request) {
        Product product = productService.createProduct(principal.getBusinessId(), request, principal.getFullName());
        return ResponseEntity.ok(ApiResponse.success("Product added successfully", product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        Product product = productService.updateProduct(principal.getBusinessId(), id, request, principal.getFullName());
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        productService.deleteProduct(principal.getBusinessId(), id, principal.getFullName());
        return ResponseEntity.ok(ApiResponse.success("Product deactivated successfully", "Deleted id: " + id));
    }
}
