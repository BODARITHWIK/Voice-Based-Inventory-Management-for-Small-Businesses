package com.swaranidhi.service;

import com.swaranidhi.entity.Product;
import com.swaranidhi.entity.Purchase;
import com.swaranidhi.entity.Sale;
import com.swaranidhi.entity.SaleItem;
import com.swaranidhi.repository.ProductRepository;
import com.swaranidhi.repository.PurchaseRepository;
import com.swaranidhi.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;

    public ReportService(SaleRepository saleRepository,
                         PurchaseRepository purchaseRepository,
                         ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.purchaseRepository = purchaseRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSalesReport(Long businessId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDate.now().atTime(23, 59, 59);

        List<Sale> allSales = saleRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        List<Sale> filtered = allSales.stream()
                .filter(s -> !s.getCreatedAt().isBefore(start) && !s.getCreatedAt().isAfter(end))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = filtered.stream()
                .map(Sale::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCash = filtered.stream()
                .map(Sale::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPending = filtered.stream()
                .map(Sale::getPendingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> report = new HashMap<>();
        report.put("startDate", start.toLocalDate().toString());
        report.put("endDate", end.toLocalDate().toString());
        report.put("totalSalesCount", filtered.size());
        report.put("totalRevenue", totalRevenue);
        report.put("totalCollected", totalCash);
        report.put("totalPendingKhata", totalPending);
        report.put("sales", filtered);
        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPurchasesReport(Long businessId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDate.now().atTime(23, 59, 59);

        List<Purchase> allPurchases = purchaseRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        List<Purchase> filtered = allPurchases.stream()
                .filter(p -> !p.getCreatedAt().isBefore(start) && !p.getCreatedAt().isAfter(end))
                .collect(Collectors.toList());

        BigDecimal totalCost = filtered.stream()
                .map(Purchase::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaid = filtered.stream()
                .map(Purchase::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPayable = filtered.stream()
                .map(Purchase::getPendingAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> report = new HashMap<>();
        report.put("startDate", start.toLocalDate().toString());
        report.put("endDate", end.toLocalDate().toString());
        report.put("totalPurchasesCount", filtered.size());
        report.put("totalCost", totalCost);
        report.put("totalPaid", totalPaid);
        report.put("totalOutstandingPayable", totalPayable);
        report.put("purchases", filtered);
        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getInventoryReport(Long businessId) {
        List<Product> products = productRepository.findByBusinessIdAndActiveTrue(businessId);

        BigDecimal totalStockValue = BigDecimal.ZERO;
        BigDecimal totalRetailValue = BigDecimal.ZERO;
        int totalUnits = 0;

        for (Product p : products) {
            int qty = p.getQuantity() != null ? p.getQuantity() : 0;
            totalUnits += qty;
            totalStockValue = totalStockValue.add(p.getPurchasePrice().multiply(BigDecimal.valueOf(qty)));
            totalRetailValue = totalRetailValue.add(p.getSellingPrice().multiply(BigDecimal.valueOf(qty)));
        }

        BigDecimal potentialProfit = totalRetailValue.subtract(totalStockValue);

        Map<String, Object> report = new HashMap<>();
        report.put("totalProducts", products.size());
        report.put("totalUnitsInStock", totalUnits);
        report.put("totalStockCostValue", totalStockValue);
        report.put("totalStockRetailValue", totalRetailValue);
        report.put("potentialGrossProfit", potentialProfit);
        report.put("products", products);
        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProfitReport(Long businessId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.now().minusDays(30).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDate.now().atTime(23, 59, 59);

        List<Sale> allSales = saleRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        List<Sale> filteredSales = allSales.stream()
                .filter(s -> !s.getCreatedAt().isBefore(start) && !s.getCreatedAt().isAfter(end))
                .collect(Collectors.toList());

        BigDecimal totalSalesRevenue = BigDecimal.ZERO;
        BigDecimal costOfGoodsSold = BigDecimal.ZERO;

        for (Sale sale : filteredSales) {
            totalSalesRevenue = totalSalesRevenue.add(sale.getTotal());
            for (SaleItem item : sale.getItems()) {
                BigDecimal buyPrice = item.getProduct() != null ? item.getProduct().getPurchasePrice() : BigDecimal.ZERO;
                costOfGoodsSold = costOfGoodsSold.add(buyPrice.multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }

        BigDecimal grossProfit = totalSalesRevenue.subtract(costOfGoodsSold);
        BigDecimal profitMarginPercentage = BigDecimal.ZERO;
        if (totalSalesRevenue.compareTo(BigDecimal.ZERO) > 0) {
            profitMarginPercentage = grossProfit.multiply(BigDecimal.valueOf(100))
                    .divide(totalSalesRevenue, 2, RoundingMode.HALF_UP);
        }

        Map<String, Object> report = new HashMap<>();
        report.put("startDate", start.toLocalDate().toString());
        report.put("endDate", end.toLocalDate().toString());
        report.put("totalSalesRevenue", totalSalesRevenue);
        report.put("costOfGoodsSold", costOfGoodsSold);
        report.put("grossProfit", grossProfit);
        report.put("profitMarginPercentage", profitMarginPercentage);
        return report;
    }

    public String generateSalesCsv(Long businessId) {
        List<Sale> sales = saleRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        StringBuilder sb = new StringBuilder();
        sb.append("Invoice,Date,Customer,Payment Method,Total,Paid,Pending\n");
        for (Sale s : sales) {
            sb.append("\"").append(s.getInvoiceNumber()).append("\",");
            sb.append("\"").append(s.getCreatedAt().toLocalDate()).append("\",");
            sb.append("\"").append(s.getCustomerName().replace("\"", "\"\"")).append("\",");
            sb.append("\"").append(s.getPaymentMethod()).append("\",");
            sb.append(s.getTotal()).append(",");
            sb.append(s.getPaidAmount()).append(",");
            sb.append(s.getPendingAmount()).append("\n");
        }
        return sb.toString();
    }
}
