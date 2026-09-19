package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.dto.DashboardStatsResponse;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal principal) {
        DashboardStatsResponse stats = dashboardService.getDashboardStats(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics", stats));
    }
}
