package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.entity.Product;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.AlertsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AlertsController {

    private final AlertsService alertsService;

    public AlertsController(AlertsService alertsService) {
        this.alertsService = alertsService;
    }

    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllAlerts(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Map<String, Object> alerts = alertsService.getAllSmartAlerts(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Smart alerts retrieved successfully", alerts));
    }

    @GetMapping("/alerts/low-stock")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Product>>> getLowStock(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        List<Product> list = alertsService.getLowStockAlerts(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Low stock items retrieved", list));
    }

    @GetMapping("/alerts/out-of-stock")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Product>>> getOutOfStock(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        List<Product> list = alertsService.getOutOfStockAlerts(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Out of stock items retrieved", list));
    }

    @GetMapping("/alerts/expiry")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExpiryAlerts(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Map<String, Object> expiry = alertsService.getExpiryAlerts(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Expiry alerts retrieved", expiry));
    }

    @GetMapping("/alerts/fast-moving")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFastMoving(
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        List<Map<String, Object>> fastMoving = alertsService.getFastMovingAlerts(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Fast moving items retrieved", fastMoving));
    }

    @PostMapping({"/inventory/remove-expired", "/alerts/remove-expired"})
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> removeExpired(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, Object> body) {
        if (principal == null || principal.getBusinessId() == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }
        Long businessId = principal.getBusinessId();
        String userName = principal.getFullName();

        Long productId = null;
        if (body != null && body.containsKey("productId") && body.get("productId") != null) {
            productId = Long.valueOf(body.get("productId").toString());
        }

        Map<String, Object> result = alertsService.removeExpiredStock(businessId, productId, userName);
        return ResponseEntity.ok(ApiResponse.success("Expired stock removal processed", result));
    }
}
