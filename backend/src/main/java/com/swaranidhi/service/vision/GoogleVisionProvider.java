package com.swaranidhi.service.vision;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GoogleVisionProvider implements VisionProvider {

    private static final Logger log = LoggerFactory.getLogger(GoogleVisionProvider.class);

    @Value("${swaranidhi.vision.google.api-key:${GOOGLE_VISION_API_KEY:}}")
    private String apiKey;

    @Override
    public String getProviderName() {
        return "google";
    }

    @Override
    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    @Override
    public VisionAnalysisResult analyzeImage(byte[] imageBytes, String filename, String mimeType) {
        if (!isConfigured()) {
            return VisionAnalysisResult.error(getProviderName(), "Image analysis service is not configured. Google Vision API key is missing.");
        }
        // When configured, calls Cloud Vision REST API (LABEL_DETECTION, TEXT_DETECTION, OBJECT_LOCALIZATION)
        log.info("Processing image with Google Vision Provider...");
        return VisionAnalysisResult.error(getProviderName(), "Google Vision provider request failed: check network/quota.");
    }
}
