package com.swaranidhi.service.vision;

public interface VisionProvider {

    /**
     * Analyzes image bytes and returns structured vision and OCR findings.
     * Must not invent information if not discernible.
     */
    VisionAnalysisResult analyzeImage(byte[] imageBytes, String filename, String mimeType);

    /**
     * The unique identifier for this provider (e.g. "google", "azure", "aws", "local")
     */
    String getProviderName();

    /**
     * Whether this provider has required credentials / configuration.
     */
    boolean isConfigured();
}
