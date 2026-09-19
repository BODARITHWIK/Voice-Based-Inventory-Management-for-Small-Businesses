package com.swaranidhi.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private String name;

    private String category;
    private String sku;
    private String barcode;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(nullable = false)
    private String unit = "packets";

    @Column(nullable = false)
    private Integer minimumStock = 10;

    @Column(nullable = false)
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    private String supplier;
    private String description;

    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    private String batchNumber;

    @Column(nullable = false)
    private boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockStatus status = StockStatus.IN_STOCK;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public Product() {}

    public Product(Business business, String name, String category, String sku, Integer quantity,
                   String unit, Integer minimumStock, BigDecimal purchasePrice, BigDecimal sellingPrice, String supplier) {
        this.business = business;
        this.name = name;
        this.category = category;
        this.sku = sku;
        this.quantity = quantity != null ? quantity : 0;
        this.unit = unit != null ? unit : "packets";
        this.minimumStock = minimumStock != null ? minimumStock : 10;
        this.purchasePrice = purchasePrice != null ? purchasePrice : BigDecimal.ZERO;
        this.sellingPrice = sellingPrice != null ? sellingPrice : BigDecimal.ZERO;
        this.supplier = supplier;
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        updateStatus();
    }

    public void updateStatus() {
        if (this.quantity == null || this.quantity <= 0) {
            this.status = StockStatus.OUT_OF_STOCK;
        } else if (this.quantity <= (this.minimumStock != null ? this.minimumStock : 10)) {
            this.status = StockStatus.LOW_STOCK;
        } else {
            this.status = StockStatus.IN_STOCK;
        }
    }

    @PreUpdate
    @PrePersist
    protected void onSaveOrUpdate() {
        this.updatedAt = LocalDateTime.now();
        updateStatus();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        updateStatus();
    }

    public Integer getStock() { return quantity; }
    public void setStock(Integer stock) { setQuantity(stock); }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Integer getMinimumStock() { return minimumStock; }
    public void setMinimumStock(Integer minimumStock) {
        this.minimumStock = minimumStock;
        updateStatus();
    }

    public Integer getMinStock() { return minimumStock; }
    public void setMinStock(Integer minStock) { setMinimumStock(minStock); }

    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }

    public BigDecimal getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(BigDecimal sellingPrice) { this.sellingPrice = sellingPrice; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public StockStatus getStatus() { return status; }
    public void setStatus(StockStatus status) { this.status = status; }

    public LocalDate getManufacturingDate() { return manufacturingDate; }
    public void setManufacturingDate(LocalDate manufacturingDate) { this.manufacturingDate = manufacturingDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
