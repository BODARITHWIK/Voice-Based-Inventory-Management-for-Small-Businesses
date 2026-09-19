package com.swaranidhi.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_photo_scans")
public class StockPhotoScan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 1000)
    private String imageUrl;

    @Column(nullable = false, length = 32)
    private String status = "READY"; // UPLOADED, ANALYZING, READY, NEEDS_CONFIRMATION, CONFIRMED, REJECTED, FAILED, QUEUED_OFFLINE

    private String detectedProduct;

    private Long productId;

    private Integer detectedQuantity;

    private String unit = "packets";

    private String barcode;

    @Column(length = 4000)
    private String ocrText;

    private Double confidence = 0.0;

    private String analysisProvider = "local";

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public StockPhotoScan() {}

    public StockPhotoScan(Business business, User user, String imageUrl, String status, String detectedProduct,
                          Long productId, Integer detectedQuantity, String unit, String barcode,
                          String ocrText, Double confidence, String analysisProvider) {
        this.business = business;
        this.user = user;
        this.imageUrl = imageUrl;
        this.status = status;
        this.detectedProduct = detectedProduct;
        this.productId = productId;
        this.detectedQuantity = detectedQuantity;
        this.unit = unit;
        this.barcode = barcode;
        this.ocrText = ocrText;
        this.confidence = confidence;
        this.analysisProvider = analysisProvider;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDetectedProduct() { return detectedProduct; }
    public void setDetectedProduct(String detectedProduct) { this.detectedProduct = detectedProduct; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getDetectedQuantity() { return detectedQuantity; }
    public void setDetectedQuantity(Integer detectedQuantity) { this.detectedQuantity = detectedQuantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getOcrText() { return ocrText; }
    public void setOcrText(String ocrText) { this.ocrText = ocrText; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getAnalysisProvider() { return analysisProvider; }
    public void setAnalysisProvider(String analysisProvider) { this.analysisProvider = analysisProvider; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
