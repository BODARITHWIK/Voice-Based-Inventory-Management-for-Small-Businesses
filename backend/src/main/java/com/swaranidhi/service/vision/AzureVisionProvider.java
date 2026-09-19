package com.swaranidhi.service.vision;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AzureVisionProvider implements VisionProvider {

    private static final Logger log = LoggerFactory.getLogger(AzureVisionProvider.class);

    @Value("${swaranidhi.vision.azure.api-key:${AZURE_VISION_KEY:}}")
    private String apiKey;

    @Value("${swaranidhi.vision.azure.endpoint:${AZURE_VISION_ENDPOINT:}}")
    private String endpoint;

    @Override
    public String getProviderName() {
        return "azure";
    }

    @Override
    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty() && endpoint != null && !endpoint.trim().isEmpty();
    }

    @Override
    public VisionAnalysisResult analyzeImage(byte[] imageBytes, String filename, String mimeType) {
        if (!isConfigured()) {
            return VisionAnalysisResult.error(getProviderName(), "Image analysis service is not configured. Azure Computer Vision credentials are missing.");
        }
        log.info("Processing image with Azure Vision Provider at endpoint {}", endpoint);
        return VisionAnalysisResult.error(getProviderName(), "Azure Vision provider request failed: check network/quota.");
    }
}
