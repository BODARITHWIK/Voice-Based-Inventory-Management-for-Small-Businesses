package com.swaranidhi.service;

import com.swaranidhi.dto.DashboardStatsResponse;
import com.swaranidhi.entity.Product;
import com.swaranidhi.entity.Sale;
import com.swaranidhi.entity.StockStatus;
import com.swaranidhi.repository.CustomerRepository;
import com.swaranidhi.repository.ProductRepository;
import com.swaranidhi.repository.SaleRepository;
import com.swaranidhi.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;

    public DashboardService(ProductRepository productRepository,
                            SaleRepository saleRepository,
                            CustomerRepository customerRepository,
                            SupplierRepository supplierRepository) {
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(Long businessId) {
        DashboardStatsResponse response = new DashboardStatsResponse();

        // 1. Today's Sales
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

        BigDecimal todaySalesTotal = saleRepository.sumTotalByBusinessIdAndDateRange(businessId, startOfDay, endOfDay);
        long todaySalesCount = saleRepository.countSalesByBusinessIdAndDateRange(businessId, startOfDay, endOfDay);

        Map<String, Object> todaySalesMap = new HashMap<>();
        todaySalesMap.put("value", todaySalesTotal != null ? todaySalesTotal : BigDecimal.ZERO);
        todaySalesMap.put("count", todaySalesCount);
        todaySalesMap.put("change", "+8.4%");
        response.setTodaySales(todaySalesMap);

        // 2. Product Counts
        long totalProductsCount = productRepository.countByBusinessIdAndActiveTrue(businessId);
        long lowStockCount = productRepository.countByBusinessIdAndStatusAndActiveTrue(businessId, StockStatus.LOW_STOCK);
        long outOfStockCount = productRepository.countByBusinessIdAndStatusAndActiveTrue(businessId, StockStatus.OUT_OF_STOCK);
        long inStockCount = productRepository.countByBusinessIdAndStatusAndActiveTrue(businessId, StockStatus.IN_STOCK);

        Map<String, Object> totalProductsMap = new HashMap<>();
        totalProductsMap.put("value", totalProductsCount);
        totalProductsMap.put("change", "Active");
        response.setTotalProducts(totalProductsMap);

        Map<String, Object> lowStockMap = new HashMap<>();
        lowStockMap.put("value", lowStockCount);
        lowStockMap.put("change", lowStockCount > 0 ? "Action needed" : "Healthy");
        response.setLowStock(lowStockMap);

        Map<String, Object> outOfStockMap = new HashMap<>();
        outOfStockMap.put("value", outOfStockCount);
        outOfStockMap.put("change", outOfStockCount > 0 ? "Urgent" : "Good");
        response.setOutOfStock(outOfStockMap);

        // 3. Outstanding Khata and Payables
        BigDecimal totalKhata = customerRepository.sumTotalOutstandingKhata(businessId);
        BigDecimal totalPayables = supplierRepository.sumTotalOutstandingPayables(businessId);
        response.setCustomerCreditTotal(totalKhata != null ? totalKhata : BigDecimal.ZERO);
        response.setSupplierPayableTotal(totalPayables != null ? totalPayables : BigDecimal.ZERO);

        // 4. Sales Overview (Last 7 days)
        List<Map<String, Object>> salesOverview = new ArrayList<>();
        DateTimeFormatter dayFormatter = DateTimeFormatter.ofPattern("EEE");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.atTime(23, 59, 59);

            BigDecimal dayTotal = saleRepository.sumTotalByBusinessIdAndDateRange(businessId, dayStart, dayEnd);
            long dayOrders = saleRepository.countSalesByBusinessIdAndDateRange(businessId, dayStart, dayEnd);

            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("day", date.format(dayFormatter));
            dayMap.put("date", date.toString());
            dayMap.put("sales", dayTotal != null ? dayTotal : BigDecimal.ZERO);
            dayMap.put("orders", dayOrders);
            salesOverview.add(dayMap);
        }
        response.setSalesOverview(salesOverview);

        // 5. Inventory Status Pie
        List<Map<String, Object>> inventoryStatus = new ArrayList<>();
        inventoryStatus.add(Map.of("name", "In Stock", "value", inStockCount, "color", "#10b981"));
        inventoryStatus.add(Map.of("name", "Low Stock", "value", lowStockCount, "color", "#f59e0b"));
        inventoryStatus.add(Map.of("name", "Out of Stock", "value", outOfStockCount, "color", "#ef4444"));
        response.setInventoryStatus(inventoryStatus);

        // 6. Recent Transactions (latest 5 sales)
        List<Sale> recentSales = saleRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        List<Map<String, Object>> recentTx = new ArrayList<>();
        for (int i = 0; i < Math.min(recentSales.size(), 5); i++) {
            Sale s = recentSales.get(i);
            Map<String, Object> tx = new HashMap<>();
            tx.put("id", s.getId());
            tx.put("invoiceNumber", s.getInvoiceNumber());
            tx.put("customerName", s.getCustomerName());
            tx.put("total", s.getTotal());
            tx.put("paymentMethod", s.getPaymentMethod().name());
            tx.put("paidAmount", s.getPaidAmount());
            tx.put("pendingAmount", s.getPendingAmount());
            tx.put("createdAt", s.getCreatedAt().toString());
            recentTx.add(tx);
        }
        response.setRecentTransactions(recentTx);

        // 7. Low Stock Alerts
        List<Product> lowStockProducts = productRepository.findByBusinessIdAndStatusAndActiveTrue(businessId, StockStatus.LOW_STOCK);
        List<Map<String, Object>> alerts = new ArrayList<>();
        for (Product p : lowStockProducts) {
            Map<String, Object> a = new HashMap<>();
            a.put("id", p.getId());
            a.put("name", p.getName());
            a.put("quantity", p.getQuantity());
            a.put("unit", p.getUnit());
            a.put("minimumStock", p.getMinimumStock());
            a.put("status", p.getStatus().name());
            alerts.add(a);
        }
        response.setLowStockAlerts(alerts);

        return response;
    }
}
