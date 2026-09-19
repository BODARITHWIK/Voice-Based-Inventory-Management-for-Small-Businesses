package com.swaranidhi.dto;

import java.math.BigDecimal;

public class DetectedProductDto {

    private String productId;
    private String productName;
    private String brand;
    private String category;
    private String packaging;
    private Integer quantity; // May be null if undetermined!
    private String unit = "packets";
    private String barcode;
    private Double confidence = 0.0;
    private boolean matchedExistingProduct;
    private Long existingProductId;
    private String existingProductName;
    private Integer currentStock;
    private String suggestedAction = "ADD_STOCK";
    private BigDecimal purchasePrice = BigDecimal.ZERO;
    private BigDecimal sellingPrice = BigDecimal.ZERO;
    private String supplier;
    private String ocrSnippet;

    public DetectedProductDto() {}

    public DetectedProductDto(String productName, String brand, String category, Integer quantity,
                              String unit, Double confidence) {
        this.productName = productName;
        this.brand = brand;
        this.category = category;
        this.quantity = quantity;
        this.unit = unit;
        this.confidence = confidence;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPackaging() { return packaging; }
    public void setPackaging(String packaging) { this.packaging = packaging; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public boolean isMatchedExistingProduct() { return matchedExistingProduct; }
    public void setMatchedExistingProduct(boolean matchedExistingProduct) { this.matchedExistingProduct = matchedExistingProduct; }

    public Long getExistingProductId() { return existingProductId; }
    public void setExistingProductId(Long existingProductId) { this.existingProductId = existingProductId; }

    public String getExistingProductName() { return existingProductName; }
    public void setExistingProductName(String existingProductName) { this.existingProductName = existingProductName; }

    public Integer getCurrentStock() { return currentStock; }
    public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }

    public String getSuggestedAction() { return suggestedAction; }
    public void setSuggestedAction(String suggestedAction) { this.suggestedAction = suggestedAction; }

    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }

    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getOcrSnippet() { return ocrSnippet; }
    public void setOcrSnippet(String ocrSnippet) { this.ocrSnippet = ocrSnippet; }
}
