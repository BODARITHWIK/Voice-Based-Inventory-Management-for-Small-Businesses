package com.swaranidhi.dto;

public class TranscribeResponse {
    private boolean success;
    private String text;
    private String language;
    private Double confidence;
    private String provider;

    public TranscribeResponse() {}

    public TranscribeResponse(boolean success, String text, String language, Double confidence, String provider) {
        this.success = success;
        this.text = text;
        this.language = language;
        this.confidence = confidence;
        this.provider = provider;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
}
