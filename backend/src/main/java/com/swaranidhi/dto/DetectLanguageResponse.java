package com.swaranidhi.dto;

public class DetectLanguageResponse {
    private boolean success;
    private String language;
    private String languageName;
    private String script;
    private Double confidence;
    private boolean isIndianLanguage;

    public DetectLanguageResponse() {}

    public DetectLanguageResponse(boolean success, String language, String languageName, String script, Double confidence, boolean isIndianLanguage) {
        this.success = success;
        this.language = language;
        this.languageName = languageName;
        this.script = script;
        this.confidence = confidence;
        this.isIndianLanguage = isIndianLanguage;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getLanguageName() { return languageName; }
    public void setLanguageName(String languageName) { this.languageName = languageName; }

    public String getScript() { return script; }
    public void setScript(String script) { this.script = script; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public boolean isIndianLanguage() { return isIndianLanguage; }
    public void setIndianLanguage(boolean indianLanguage) { isIndianLanguage = indianLanguage; }
}
