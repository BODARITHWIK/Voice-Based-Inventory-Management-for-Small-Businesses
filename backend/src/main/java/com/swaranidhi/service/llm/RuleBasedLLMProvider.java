package com.swaranidhi.service.llm;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Component
public class RuleBasedLLMProvider implements LLMProvider {

    @Override
    public String getProviderName() {
        return "RuleBasedLLMProvider";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    @SuppressWarnings("unchecked")
    public String generateResponse(String systemPrompt, String userQuery, Map<String, Object> context) {
        if (userQuery == null || userQuery.isBlank()) {
            return "How can I help you with your shop today? You can ask about today's sales, low stock items, customer dues, or product availability.";
        }

        String q = userQuery.toLowerCase().trim();

        // 1. Today's sales / revenue
        if (q.contains("today") && (q.contains("sale") || q.contains("revenue") || q.contains("earn") || q.contains("total") || q.contains("business"))) {
            BigDecimal todaySales = (BigDecimal) context.getOrDefault("todaySales", BigDecimal.ZERO);
            Integer todayCount = (Integer) context.getOrDefault("todaySalesCount", 0);
            return String.format("Today's total sales amount is ₹%s across %d transaction(s).",
                    todaySales != null ? todaySales.toPlainString() : "0.00",
                    todayCount != null ? todayCount : 0);
        }

        // 2. Low stock / out of stock / inventory alert
        if (q.contains("low stock") || q.contains("out of stock") || q.contains("reorder") || q.contains("khatam") || q.contains("kam hai")) {
            List<Map<String, Object>> lowStock = (List<Map<String, Object>>) context.get("lowStockProducts");
            if (lowStock == null || lowStock.isEmpty()) {
                return "Good news! All inventory levels are healthy. There are currently no low-stock products.";
            }
            StringBuilder sb = new StringBuilder("You have ").append(lowStock.size()).append(" item(s) running low on stock:\n");
            for (int i = 0; i < Math.min(lowStock.size(), 5); i++) {
                Map<String, Object> p = lowStock.get(i);
                sb.append("• ").append(p.get("name")).append(": ").append(p.get("quantity")).append(" ").append(p.getOrDefault("unit", "units")).append(" remaining\n");
            }
            if (lowStock.size() > 5) {
                sb.append("...and ").append(lowStock.size() - 5).append(" more items.");
            }
            return sb.toString().trim();
        }

        // 3. Expiry queries
        if (q.contains("expir") || q.contains("kharab") || q.contains("date khatam")) {
            List<Map<String, Object>> expiring = (List<Map<String, Object>>) context.get("expiringProducts");
            List<Map<String, Object>> expired = (List<Map<String, Object>>) context.get("expiredProducts");
            int total = (expiring != null ? expiring.size() : 0) + (expired != null ? expired.size() : 0);
            if (total == 0) {
                return "No expired or expiring products found in your inventory.";
            }
            StringBuilder sb = new StringBuilder();
            if (expired != null && !expired.isEmpty()) {
                sb.append("⚠️ ").append(expired.size()).append(" product(s) have EXPIRED:\n");
                for (Map<String, Object> p : expired) {
                    sb.append("• ").append(p.get("name")).append(" (Batch: ").append(p.getOrDefault("batchNumber", "N/A")).append(", Qty: ").append(p.get("quantity")).append(")\n");
                }
            }
            if (expiring != null && !expiring.isEmpty()) {
                if (sb.length() > 0) sb.append("\n");
                sb.append("⏳ ").append(expiring.size()).append(" product(s) expiring within 7 days:\n");
                for (Map<String, Object> p : expiring) {
                    sb.append("• ").append(p.get("name")).append(" (Expires: ").append(p.get("expiryDate")).append(")\n");
                }
            }
            return sb.toString().trim();
        }

        // 4. Khata / Customer credit / dues
        if (q.contains("khata") || q.contains("udhari") || q.contains("due") || q.contains("owe") || q.contains("credit") || q.contains("pending")) {
            BigDecimal totalBalance = (BigDecimal) context.getOrDefault("totalCustomerDue", BigDecimal.ZERO);
            List<Map<String, Object>> topDebtors = (List<Map<String, Object>>) context.get("topCustomerDues");
            if (topDebtors == null || topDebtors.isEmpty() || totalBalance == null || totalBalance.compareTo(BigDecimal.ZERO) == 0) {
                return "All customer khata accounts are clear! There are no outstanding credit balances.";
            }
            StringBuilder sb = new StringBuilder(String.format("Total outstanding customer dues: ₹%s.\nTop pending balances:\n", totalBalance.toPlainString()));
            for (int i = 0; i < Math.min(topDebtors.size(), 5); i++) {
                Map<String, Object> c = topDebtors.get(i);
                sb.append("• ").append(c.get("name")).append(": ₹").append(c.get("balance")).append("\n");
            }
            return sb.toString().trim();
        }

        // 5. Fast moving / top selling
        if (q.contains("fast") || q.contains("best seller") || q.contains("top") || q.contains("popular")) {
            List<Map<String, Object>> fastMoving = (List<Map<String, Object>>) context.get("fastMovingProducts");
            if (fastMoving == null || fastMoving.isEmpty()) {
                return "Not enough sales data in the past 7 days to calculate fast-moving items.";
            }
            StringBuilder sb = new StringBuilder("Top selling products over the last 7 days:\n");
            for (int i = 0; i < Math.min(fastMoving.size(), 5); i++) {
                Map<String, Object> item = fastMoving.get(i);
                sb.append("• ").append(item.get("name")).append(": ").append(item.get("soldQuantity")).append(" units sold (Current Stock: ").append(item.get("currentStock")).append(")\n");
            }
            return sb.toString().trim();
        }

        // 6. Specific product inquiry
        List<Map<String, Object>> allProducts = (List<Map<String, Object>>) context.get("allProducts");
        if (allProducts != null) {
            for (Map<String, Object> p : allProducts) {
                String pName = ((String) p.getOrDefault("name", "")).toLowerCase();
                if (!pName.isBlank() && q.contains(pName)) {
                    return String.format("Product: %s | In Stock: %s %s | Selling Price: ₹%s | Status: %s",
                            p.get("name"),
                            p.get("quantity"),
                            p.getOrDefault("unit", "units"),
                            p.get("sellingPrice"),
                            p.get("status"));
                }
            }
        }

        // Default smart summary response
        BigDecimal todaySales = (BigDecimal) context.getOrDefault("todaySales", BigDecimal.ZERO);
        Integer totalProducts = (Integer) context.getOrDefault("totalProducts", 0);
        return String.format("Swaranidhi Store Summary: You have %d total products in inventory. Today's sales are ₹%s. Ask me about low stock, customer khata dues, expiring products, or any item's stock.",
                totalProducts != null ? totalProducts : 0,
                todaySales != null ? todaySales.toPlainString() : "0.00");
    }
}
