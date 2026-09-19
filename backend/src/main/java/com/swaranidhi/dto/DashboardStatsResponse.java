package com.swaranidhi.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {

    private Map<String, Object> todaySales;
    private Map<String, Object> totalProducts;
    private Map<String, Object> lowStock;
    private Map<String, Object> outOfStock;
    private BigDecimal customerCreditTotal;
    private BigDecimal supplierPayableTotal;
    private List<Map<String, Object>> salesOverview;
    private List<Map<String, Object>> inventoryStatus;
    private List<Map<String, Object>> recentTransactions;
    private List<Map<String, Object>> lowStockAlerts;

    public DashboardStatsResponse() {}

    public Map<String, Object> getTodaySales() { return todaySales; }
    public void setTodaySales(Map<String, Object> todaySales) { this.todaySales = todaySales; }

    public Map<String, Object> getTotalProducts() { return totalProducts; }
    public void setTotalProducts(Map<String, Object> totalProducts) { this.totalProducts = totalProducts; }

    public Map<String, Object> getLowStock() { return lowStock; }
    public void setLowStock(Map<String, Object> lowStock) { this.lowStock = lowStock; }

    public Map<String, Object> getOutOfStock() { return outOfStock; }
    public void setOutOfStock(Map<String, Object> outOfStock) { this.outOfStock = outOfStock; }

    public BigDecimal getCustomerCreditTotal() { return customerCreditTotal; }
    public void setCustomerCreditTotal(BigDecimal customerCreditTotal) { this.customerCreditTotal = customerCreditTotal; }

    public BigDecimal getSupplierPayableTotal() { return supplierPayableTotal; }
    public void setSupplierPayableTotal(BigDecimal supplierPayableTotal) { this.supplierPayableTotal = supplierPayableTotal; }

    public List<Map<String, Object>> getSalesOverview() { return salesOverview; }
    public void setSalesOverview(List<Map<String, Object>> salesOverview) { this.salesOverview = salesOverview; }

    public List<Map<String, Object>> getInventoryStatus() { return inventoryStatus; }
    public void setInventoryStatus(List<Map<String, Object>> inventoryStatus) { this.inventoryStatus = inventoryStatus; }

    public List<Map<String, Object>> getRecentTransactions() { return recentTransactions; }
    public void setRecentTransactions(List<Map<String, Object>> recentTransactions) { this.recentTransactions = recentTransactions; }

    public List<Map<String, Object>> getLowStockAlerts() { return lowStockAlerts; }
    public void setLowStockAlerts(List<Map<String, Object>> lowStockAlerts) { this.lowStockAlerts = lowStockAlerts; }
}
