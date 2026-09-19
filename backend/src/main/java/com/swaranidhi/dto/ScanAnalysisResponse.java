package com.swaranidhi.dto;

import java.util.ArrayList;
import java.util.List;

public class ScanAnalysisResponse {

    private Long scanId;
    private String status = "READY"; // READY, NEEDS_CONFIRMATION, BLURRY, DARK, NO_PRODUCT_DETECTED, UNCONFIGURED
    private Double confidence = 0.0;
    private List<DetectedProductDto> products = new ArrayList<>();
    private String ocrText;
    private String barcode;
    private String analysisProvider = "local";
    private Long processingTimeMs = 0L;
    private String imageUrl;
    private String qualityStatus = "CLEAR"; // CLEAR, BLURRY, DARK
    private String message;
    private boolean requiresManualInput = false;

    public ScanAnalysisResponse() {}

    public ScanAnalysisResponse(Long scanId, String status, Double confidence, List<DetectedProductDto> products,
                                String ocrText, String barcode, String analysisProvider, Long processingTimeMs) {
        this.scanId = scanId;
        this.status = status;
        this.confidence = confidence;
        this.products = products != null ? products : new ArrayList<>();
        this.ocrText = ocrText;
        this.barcode = barcode;
        this.analysisProvider = analysisProvider;
        this.processingTimeMs = processingTimeMs;
    }

    public Long getScanId() { return scanId; }
    public void setScanId(Long scanId) { this.scanId = scanId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public List<DetectedProductDto> getProducts() { return products; }
    public void setProducts(List<DetectedProductDto> products) { this.products = products; }

    public String getOcrText() { return ocrText; }
    public void setOcrText(String ocrText) { this.ocrText = ocrText; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getAnalysisProvider() { return analysisProvider; }
    public void setAnalysisProvider(String analysisProvider) { this.analysisProvider = analysisProvider; }

    public Long getProcessingTimeMs() { return processingTimeMs; }
    public void setProcessingTimeMs(Long processingTimeMs) { this.processingTimeMs = processingTimeMs; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getQualityStatus() { return qualityStatus; }
    public void setQualityStatus(String qualityStatus) { this.qualityStatus = qualityStatus; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRequiresManualInput() { return requiresManualInput; }
    public void setRequiresManualInput(boolean requiresManualInput) { this.requiresManualInput = requiresManualInput; }
}
