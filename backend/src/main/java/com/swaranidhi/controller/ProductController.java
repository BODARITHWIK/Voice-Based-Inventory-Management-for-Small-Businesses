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
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String search) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Long businessId = principal.getBusinessId();
        List<Product> products = (search != null && !search.isBlank())
                ? productService.searchProducts(businessId, search)
                : productService.getAllProducts(businessId);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved", products));
    }

    @GetMapping("/page")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<Page<Product>>> getProductsPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "name") String sortBy) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Page<Product> productPage = productService.getProductsPaged(
                principal.getBusinessId(),
                PageRequest.of(page, size, Sort.by(sortBy).ascending())
        );
        return ResponseEntity.ok(ApiResponse.success("Products page retrieved", productPage));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Product>>> getLowStockProducts(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        List<Product> products = productService.getLowStockProducts(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Low stock products", products));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<Product>> getProductById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Product product = productService.getProductById(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Product found", product));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Product>> createProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProductRequest request) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Product product = productService.createProduct(principal.getBusinessId(), request, principal.getFullName());
        return ResponseEntity.ok(ApiResponse.success("Product added successfully", product));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Product>> updateProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Product product = productService.updateProduct(principal.getBusinessId(), id, request, principal.getFullName());
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<String>> deleteProduct(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        productService.deleteProduct(principal.getBusinessId(), id, principal.getFullName());
        return ResponseEntity.ok(ApiResponse.success("Product deactivated successfully", "Deleted id: " + id));
    }
}
