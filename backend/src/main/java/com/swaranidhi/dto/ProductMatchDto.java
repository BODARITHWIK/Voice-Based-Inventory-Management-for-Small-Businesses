package com.swaranidhi.dto;

import java.math.BigDecimal;

public class ProductMatchDto {

    private Long productId;
    private String productName;
    private String category;
    private String sku;
    private String barcode;
    private Integer currentStock = 0;
    private String unit = "packets";
    private BigDecimal sellingPrice = BigDecimal.ZERO;
    private BigDecimal purchasePrice = BigDecimal.ZERO;
    private Double matchScore = 0.0;
    private String matchType = "NONE"; // BARCODE, EXACT_NAME, FUZZY_NAME, BRAND, NONE

    public ProductMatchDto() {}

    public ProductMatchDto(Long productId, String productName, String category, String sku, String barcode,
                           Integer currentStock, String unit, BigDecimal sellingPrice, BigDecimal purchasePrice,
                           Double matchScore, String matchType) {
        this.productId = productId;
        this.productName = productName;
        this.category = category;
        this.sku = sku;
        this.barcode = barcode;
        this.currentStock = currentStock;
        this.unit = unit;
        this.sellingPrice = sellingPrice;
        this.purchasePrice = purchasePrice;
        this.matchScore = matchScore;
        this.matchType = matchType;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }

    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }

    public Double getMatchScore() { return matchScore; }
    public void setMatchScore(Double matchScore) { this.matchScore = matchScore; }

    public String getMatchType() { return matchType; }
    public void setMatchType(String matchType) { this.matchType = matchType; }
}
