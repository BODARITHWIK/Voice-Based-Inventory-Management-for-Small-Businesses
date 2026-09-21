package com.swaranidhi.service.vision;

import com.swaranidhi.dto.DetectedProductDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class LocalVisionProvider implements VisionProvider {

    private static final Logger log = LoggerFactory.getLogger(LocalVisionProvider.class);

    @Override
    public String getProviderName() {
        return "local";
    }

    @Override
    public boolean isConfigured() {
        // Local engine does not run an unconfigured fake OCR engine; requires external cloud vision or local OCR library
        return false;
    }

    @Override
    public VisionAnalysisResult analyzeImage(byte[] imageBytes, String filename, String mimeType) {
        VisionAnalysisResult result = new VisionAnalysisResult();
        result.setProviderName(getProviderName());

        if (imageBytes == null || imageBytes.length == 0) {
            result.setQualityStatus("UNRECOGNIZABLE");
            result.setQualityMessage("No image data provided.");
            result.setSuccessful(false);
            return result;
        }

        // 1. Inspect image properties with ImageIO for darkness & blur
        BufferedImage image = null;
        try (ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes)) {
            image = ImageIO.read(bais);
        } catch (IOException e) {
            log.warn("ImageIO parsing error: {}", e.getMessage());
        }

        if (image != null) {
            QualityMetrics metrics = calculateQuality(image);
            if (metrics.isTooDark) {
                result.setQualityStatus("DARK");
                result.setQualityMessage("The product is difficult to see. Try taking the photo in better lighting.");
                result.setConfidence(0.20);
                result.setSuccessful(true);
                return result;
            }
            if (metrics.isTooBlurry) {
                result.setQualityStatus("BLURRY");
                result.setQualityMessage("The photo is too blurry to identify the product.");
                result.setConfidence(0.25);
                result.setSuccessful(true);
                return result;
            }
        }

        // 2. Barcode pattern inspection from image streams / metadata
        String extractedText = extractTextClues(imageBytes);
        String detectedBarcode = extractBarcode(extractedText);

        if (detectedBarcode != null) {
            result.setBarcode(detectedBarcode);
            result.setQualityStatus("CLEAR");
            result.setQualityMessage("Barcode detected: " + detectedBarcode);
            result.setConfidence(0.95);
            result.setSuccessful(true);
            return result;
        }

        // 3. Truthful response: No OCR/vision engine configured, no synthetic products generated
        result.setSuccessful(false);
        result.setQualityStatus("NOT_CONFIGURED");
        result.setErrorMessage("Vision AI engine is not configured. Configure Google Cloud Vision or Azure Computer Vision for photo object recognition, or scan barcodes.");
        result.setConfidence(0.0);
        return result;
    }

    private QualityMetrics calculateQuality(BufferedImage img) {
        QualityMetrics qm = new QualityMetrics();
        int width = img.getWidth();
        int height = img.getHeight();

        int stepX = Math.max(1, width / 30);
        int stepY = Math.max(1, height / 30);

        long totalLuminance = 0;
        int count = 0;
        long totalVariance = 0;
        int prevLum = -1;

        for (int y = 0; y < height; y += stepY) {
            for (int x = 0; x < width; x += stepX) {
                int rgb = img.getRGB(x, y);
                int r = (rgb >> 16) & 0xFF;
                int g = (rgb >> 8) & 0xFF;
                int b = rgb & 0xFF;
                int luminance = (int) (0.299 * r + 0.587 * g + 0.114 * b);
                totalLuminance += luminance;
                if (prevLum != -1) {
                    totalVariance += Math.abs(luminance - prevLum);
                }
                prevLum = luminance;
                count++;
            }
        }

        if (count > 0) {
            double avgLum = (double) totalLuminance / count;
            double avgVar = (double) totalVariance / count;

            if (avgLum < 25.0) {
                qm.isTooDark = true;
            }
            if (avgVar > 0.05 && avgVar < 2.5 && avgLum > 35.0) {
                qm.isTooBlurry = true;
            }
        }

        return qm;
    }

    private String extractTextClues(byte[] bytes) {
        StringBuilder token = new StringBuilder();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < Math.min(bytes.length, 32768); i++) {
            char c = (char) (bytes[i] & 0xFF);
            if (c >= '0' && c <= '9') {
                token.append(c);
            } else {
                if (token.length() >= 8 && token.length() <= 14) {
                    sb.append(token).append(" ");
                }
                token.setLength(0);
            }
        }
        if (token.length() >= 8 && token.length() <= 14) {
            sb.append(token);
        }
        return sb.toString();
    }

    private String extractBarcode(String text) {
        Pattern pattern = Pattern.compile("\\b(890\\d{10}|\\d{12,14})\\b");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private static class QualityMetrics {
        boolean isTooDark = false;
        boolean isTooBlurry = false;
    }
}
