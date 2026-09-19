package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.entity.Product;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.AlertsService;
import org.springframework.http.ResponseEntity;
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

    private Long getEffectiveBusinessId(UserPrincipal principal) {
        return (principal != null && principal.getBusinessId() != null) ? principal.getBusinessId() : 1L;
    }

    private String getEffectiveUserName(UserPrincipal principal) {
        return (principal != null && principal.getUsername() != null) ? principal.getUsername() : "Owner";
    }

    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllAlerts(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long businessId = getEffectiveBusinessId(principal);
        Map<String, Object> alerts = alertsService.getAllSmartAlerts(businessId);
        return ResponseEntity.ok(ApiResponse.success("Smart alerts retrieved successfully", alerts));
    }

    @GetMapping("/alerts/low-stock")
    public ResponseEntity<ApiResponse<List<Product>>> getLowStock(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long businessId = getEffectiveBusinessId(principal);
        List<Product> list = alertsService.getLowStockAlerts(businessId);
        return ResponseEntity.ok(ApiResponse.success("Low stock items retrieved", list));
    }

    @GetMapping("/alerts/out-of-stock")
    public ResponseEntity<ApiResponse<List<Product>>> getOutOfStock(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long businessId = getEffectiveBusinessId(principal);
        List<Product> list = alertsService.getOutOfStockAlerts(businessId);
        return ResponseEntity.ok(ApiResponse.success("Out of stock items retrieved", list));
    }

    @GetMapping("/alerts/expiry")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExpiryAlerts(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long businessId = getEffectiveBusinessId(principal);
        Map<String, Object> expiry = alertsService.getExpiryAlerts(businessId);
        return ResponseEntity.ok(ApiResponse.success("Expiry alerts retrieved", expiry));
    }

    @GetMapping("/alerts/fast-moving")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFastMoving(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long businessId = getEffectiveBusinessId(principal);
        List<Map<String, Object>> fastMoving = alertsService.getFastMovingAlerts(businessId);
        return ResponseEntity.ok(ApiResponse.success("Fast moving items retrieved", fastMoving));
    }

    @PostMapping({"/inventory/remove-expired", "/alerts/remove-expired"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> removeExpired(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) Map<String, Object> body) {
        Long businessId = getEffectiveBusinessId(principal);
        String userName = getEffectiveUserName(principal);

        Long productId = null;
        if (body != null && body.containsKey("productId") && body.get("productId") != null) {
            productId = Long.valueOf(body.get("productId").toString());
        }

        Map<String, Object> result = alertsService.removeExpiredStock(businessId, productId, userName);
        return ResponseEntity.ok(ApiResponse.success("Expired stock removal processed", result));
    }
}
