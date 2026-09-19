package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.ReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSalesReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> report = reportService.getSalesReport(principal.getBusinessId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Sales report", report));
    }

    @GetMapping("/purchases")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPurchasesReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> report = reportService.getPurchasesReport(principal.getBusinessId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Purchases report", report));
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInventoryReport(
            @AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> report = reportService.getInventoryReport(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Inventory report", report));
    }

    @GetMapping("/profit")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfitReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> report = reportService.getProfitReport(principal.getBusinessId(), startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Profit & loss report", report));
    }

    @GetMapping("/sales/csv")
    public ResponseEntity<String> exportSalesCsv(@AuthenticationPrincipal UserPrincipal principal) {
        String csv = reportService.generateSalesCsv(principal.getBusinessId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales-report-" + LocalDate.now() + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
