package com.swaranidhi.service.vision;

import com.swaranidhi.dto.DetectedProductDto;

import java.util.ArrayList;
import java.util.List;

public class VisionAnalysisResult {

    private String qualityStatus = "CLEAR"; // CLEAR, BLURRY, DARK, UNRECOGNIZABLE
    private String qualityMessage;
    private Double confidence = 0.0;
    private List<DetectedProductDto> products = new ArrayList<>();
    private String ocrText = "";
    private String barcode;
    private String providerName = "local";
    private boolean successful = true;
    private String errorMessage;

    public VisionAnalysisResult() {}

    public VisionAnalysisResult(String qualityStatus, String qualityMessage, Double confidence,
                                List<DetectedProductDto> products, String ocrText, String barcode,
                                String providerName) {
        this.qualityStatus = qualityStatus;
        this.qualityMessage = qualityMessage;
        this.confidence = confidence;
        this.products = products != null ? products : new ArrayList<>();
        this.ocrText = ocrText;
        this.barcode = barcode;
        this.providerName = providerName;
        this.successful = true;
    }

    public static VisionAnalysisResult error(String providerName, String errorMessage) {
        VisionAnalysisResult result = new VisionAnalysisResult();
        result.setProviderName(providerName);
        result.setSuccessful(false);
        result.setErrorMessage(errorMessage);
        result.setQualityStatus("ERROR");
        return result;
    }

    public String getQualityStatus() { return qualityStatus; }
    public void setQualityStatus(String qualityStatus) { this.qualityStatus = qualityStatus; }

    public String getQualityMessage() { return qualityMessage; }
    public void setQualityMessage(String qualityMessage) { this.qualityMessage = qualityMessage; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public List<DetectedProductDto> getProducts() { return products; }
    public void setProducts(List<DetectedProductDto> products) { this.products = products; }

    public String getOcrText() { return ocrText; }
    public void setOcrText(String ocrText) { this.ocrText = ocrText; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public boolean isSuccessful() { return successful; }
    public void setSuccessful(boolean successful) { this.successful = successful; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
