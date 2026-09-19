package com.swaranidhi.dto;

import java.math.BigDecimal;

public class ConfirmScanRequest {

    private Long scanId;
    private Long productId;
    private String productName;
    private String category;
    private Integer quantity = 1;
    private String unit = "packets";
    private String action = "ADD_STOCK"; // ADD_STOCK, REMOVE_STOCK, STOCK_ADJUSTMENT
    private BigDecimal purchasePrice = BigDecimal.ZERO;
    private BigDecimal sellingPrice = BigDecimal.ZERO;
    private String supplier;
    private String barcode;
    private String notes;

    public ConfirmScanRequest() {}

    public Long getScanId() { return scanId; }
    public void setScanId(Long scanId) { this.scanId = scanId; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }

    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
