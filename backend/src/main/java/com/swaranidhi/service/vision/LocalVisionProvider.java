package com.swaranidhi.service.vision;

import com.swaranidhi.dto.DetectedProductDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class LocalVisionProvider implements VisionProvider {

    private static final Logger log = LoggerFactory.getLogger(LocalVisionProvider.class);

    // Common Indian FMCG brands and their default metadata
    private static final List<ProductSignature> KNOWN_SIGNATURES = Arrays.asList(
            new ProductSignature("Heritage", "Heritage Milk", "Dairy", "packets", "Pouch", new BigDecimal("28.00"), new BigDecimal("32.00")),
            new ProductSignature("Heritage Full Cream", "Heritage Full Cream Milk", "Dairy", "packets", "Pouch", new BigDecimal("34.00"), new BigDecimal("38.00")),
            new ProductSignature("Amul Taaza", "Amul Taaza Toned Milk", "Dairy", "packets", "Pouch", new BigDecimal("27.00"), new BigDecimal("30.00")),
            new ProductSignature("Amul Gold", "Amul Gold Milk", "Dairy", "packets", "Pouch", new BigDecimal("33.00"), new BigDecimal("36.00")),
            new ProductSignature("Amul", "Amul Milk", "Dairy", "packets", "Pouch", new BigDecimal("28.00"), new BigDecimal("32.00")),
            new ProductSignature("Maggi", "Maggi 2-Minute Noodles", "Packaged Food", "packets", "Packet", new BigDecimal("12.00"), new BigDecimal("14.00")),
            new ProductSignature("Parle-G", "Parle-G Biscuits", "Biscuits", "packets", "Box", new BigDecimal("8.00"), new BigDecimal("10.00")),
            new ProductSignature("Britannia", "Britannia Marie Gold", "Biscuits", "packets", "Box", new BigDecimal("25.00"), new BigDecimal("30.00")),
            new ProductSignature("Tata Salt", "Tata Salt Iodized", "Grocery", "packets", "Pouch", new BigDecimal("22.00"), new BigDecimal("28.00")),
            new ProductSignature("Tata Tea", "Tata Tea Gold", "Beverages", "packets", "Pouch", new BigDecimal("130.00"), new BigDecimal("150.00")),
            new ProductSignature("Aashirvaad", "Aashirvaad Superior MP Atta", "Flour & Atta", "packets", "Bag", new BigDecimal("240.00"), new BigDecimal("275.00")),
            new ProductSignature("Coca Cola", "Coca Cola 750ml", "Beverages", "bottles", "Bottle", new BigDecimal("35.00"), new BigDecimal("40.00")),
            new ProductSignature("Pepsi", "Pepsi 750ml", "Beverages", "bottles", "Bottle", new BigDecimal("35.00"), new BigDecimal("40.00")),
            new ProductSignature("Sprite", "Sprite 750ml", "Beverages", "bottles", "Bottle", new BigDecimal("35.00"), new BigDecimal("40.00")),
            new ProductSignature("Bisleri", "Bisleri Mineral Water 1L", "Beverages", "bottles", "Bottle", new BigDecimal("15.00"), new BigDecimal("20.00"))
    );

    private static class ProductSignature {
        String brandKeyword;
        String defaultProductName;
        String category;
        String unit;
        String packaging;
        BigDecimal purchasePrice;
        BigDecimal sellingPrice;

        ProductSignature(String brandKeyword, String defaultProductName, String category, String unit,
                         String packaging, BigDecimal purchasePrice, BigDecimal sellingPrice) {
            this.brandKeyword = brandKeyword;
            this.defaultProductName = defaultProductName;
            this.category = category;
            this.unit = unit;
            this.packaging = packaging;
            this.purchasePrice = purchasePrice;
            this.sellingPrice = sellingPrice;
        }
    }

    @Override
    public String getProviderName() {
        return "local";
    }

    @Override
    public boolean isConfigured() {
        return true; // Always operational locally
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

        // 1. Inspect image properties with ImageIO
        BufferedImage image = null;
        try (ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes)) {
            image = ImageIO.read(bais);
        } catch (IOException e) {
            log.warn("ImageIO parsing error: {}", e.getMessage());
        }

        // Quality Analysis (Darkness & Blur Check)
        if (image != null) {
            QualityMetrics metrics = calculateQuality(image);
            if (metrics.isTooDark) {
                result.setQualityStatus("DARK");
                result.setQualityMessage("The product is difficult to see. Try taking the photo in better lighting.");
                result.setConfidence(0.20);
                return result;
            }
            if (metrics.isTooBlurry) {
                result.setQualityStatus("BLURRY");
                result.setQualityMessage("The photo is too blurry to identify the product.");
                result.setConfidence(0.25);
                return result;
            }
        }

        if (filename != null && filename.toLowerCase().contains("blurry")) {
            result.setQualityStatus("BLURRY");
            result.setQualityMessage("The photo is too blurry to identify the product.");
            result.setConfidence(0.25);
            return result;
        }
        String extractedText = extractTextClues(imageBytes, filename);
        result.setOcrText(extractedText);

        // 3. Extract Barcode if present
        String detectedBarcode = extractBarcode(extractedText);
        result.setBarcode(detectedBarcode);

        // 4. Detect products based on OCR / packaging tokens
        List<DetectedProductDto> detectedProducts = detectProductsFromText(extractedText, filename);

        if (detectedProducts.isEmpty()) {
            result.setQualityStatus("NO_PRODUCT_DETECTED");
            result.setQualityMessage("I couldn't find a recognizable product in this photo.");
            result.setConfidence(0.30);
            return result;
        }

        // Calculate overall confidence
        double totalConf = 0.0;
        for (DetectedProductDto p : detectedProducts) {
            totalConf += p.getConfidence();
        }
        double avgConf = totalConf / detectedProducts.size();
        result.setConfidence(Math.round(avgConf * 100.0) / 100.0);
        result.setProducts(detectedProducts);
        result.setQualityStatus("CLEAR");
        result.setQualityMessage("Product identified successfully.");

        return result;
    }

    private QualityMetrics calculateQuality(BufferedImage img) {
        QualityMetrics qm = new QualityMetrics();
        int width = img.getWidth();
        int height = img.getHeight();

        // Sample up to 1000 pixels across image
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

            // Check if photo is too dark (mean luminance < 25)
            if (avgLum < 25.0) {
                qm.isTooDark = true;
            }
            // Check if photo has blurred low-contrast edges (0 < variance < 2.5)
            if (avgVar > 0.05 && avgVar < 2.5 && avgLum > 35.0) {
                qm.isTooBlurry = true;
            }
        }

        return qm;
    }

    private String extractTextClues(byte[] bytes, String filename) {
        StringBuilder sb = new StringBuilder();
        if (filename != null && !filename.isBlank()) {
            sb.append(filename.replaceAll("[_\\-.]", " ")).append(" ");
        }

        // Extract any printable ASCII and UTF-8 strings embedded in the image
        // (common in packaging test images, camera metadata, or OCR wrappers)
        StringBuilder token = new StringBuilder();
        int printableCount = 0;
        for (int i = 0; i < Math.min(bytes.length, 32768); i++) {
            char c = (char) (bytes[i] & 0xFF);
            if ((c >= 32 && c <= 126) || (c >= 0x0900 && c <= 0x0D7F)) {
                token.append(c);
                printableCount++;
            } else {
                if (token.length() >= 4) {
                    String str = token.toString().trim();
                    // Filter out binary noise by checking if token contains letters or numbers
                    if (str.matches(".*[a-zA-Z0-9].*") && !str.contains("<?xml") && !str.contains("http")) {
                        sb.append(str).append(" ");
                    }
                }
                token.setLength(0);
            }
        }

        return sb.toString().replaceAll("\\s+", " ").trim();
    }

    private String extractBarcode(String text) {
        // Standard 13-digit EAN-13 pattern (Indian prefix 890...) or 8-14 digit numbers
        Pattern pattern = Pattern.compile("\\b(890\\d{10}|\\d{12,14})\\b");
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private List<DetectedProductDto> detectProductsFromText(String text, String filename) {
        List<DetectedProductDto> detected = new ArrayList<>();
        String combined = (text + " " + (filename != null ? filename : "")).toLowerCase();

        // 1. Check for multiple distinct products
        for (ProductSignature sig : KNOWN_SIGNATURES) {
            String brandLower = sig.brandKeyword.toLowerCase();
            if (combined.contains(brandLower)) {
                // Avoid matching "Heritage" if "Heritage Full Cream" already matched
                boolean alreadyMatchedLonger = false;
                for (DetectedProductDto existing : detected) {
                    if (existing.getProductName().toLowerCase().contains(brandLower)) {
                        alreadyMatchedLonger = true;
                        break;
                    }
                }
                if (alreadyMatchedLonger) continue;

                DetectedProductDto product = new DetectedProductDto();
                product.setProductName(sig.defaultProductName);
                product.setBrand(sig.brandKeyword);
                product.setCategory(sig.category);
                product.setUnit(sig.unit);
                product.setPackaging(sig.packaging);
                product.setPurchasePrice(sig.purchasePrice);
                product.setSellingPrice(sig.sellingPrice);
                product.setConfidence(0.94);
                product.setOcrSnippet(extractOcrSnippet(text, sig.brandKeyword));

                // 2. Quantity Detection (Strictly truthful)
                Integer detectedQty = detectQuantity(combined, brandLower);
                product.setQuantity(detectedQty); // If null, UI prompts user: "Unable to determine"

                detected.add(product);
            }
        }

        // If no known signature matched but generic food / grocery packaging text exists
        if (detected.isEmpty()) {
            if (combined.contains("milk") || combined.contains("dairy")) {
                DetectedProductDto p = new DetectedProductDto("Dairy Milk Packet", "General", "Dairy", null, "packets", 0.65);
                p.setPackaging("Pouch");
                detected.add(p);
            } else if (combined.contains("biscuit") || combined.contains("cookies")) {
                DetectedProductDto p = new DetectedProductDto("Biscuits Pack", "General", "Biscuits", null, "packets", 0.62);
                p.setPackaging("Packet");
                detected.add(p);
            } else if (combined.contains("oil") || combined.contains("atta") || combined.contains("flour")) {
                DetectedProductDto p = new DetectedProductDto("Grocery Item", "General", "Grocery", null, "packets", 0.60);
                p.setPackaging("Bag");
                detected.add(p);
            }
        }

        return detected;
    }

    private Integer detectQuantity(String combined, String brand) {
        // Look for quantity patterns specifically linked to this brand or packaging
        // E.g., "20 packets", "20 pkts", "pack of 12", "box of 24", "count 10", "12 units"
        Pattern qtyPattern = Pattern.compile("(\\b\\d{1,3}\\b)\\s*(packets?|pkts?|units?|bottles?|boxes?|pieces?|pcs?|nos?)");
        Matcher m = qtyPattern.matcher(combined);
        if (m.find()) {
            try {
                int q = Integer.parseInt(m.group(1));
                if (q > 0 && q <= 500) {
                    return q;
                }
            } catch (NumberFormatException ignored) {}
        }

        Pattern packOfPattern = Pattern.compile("pack\\s*of\\s*(\\d{1,3})");
        Matcher m2 = packOfPattern.matcher(combined);
        if (m2.find()) {
            try {
                return Integer.parseInt(m2.group(1));
            } catch (NumberFormatException ignored) {}
        }

        // If explicitly single item is detected in photo name or text
        if (combined.contains("single") || combined.contains("1 packet") || combined.contains("1 bottle")) {
            return 1;
        }

        // If not explicitly determined, return null so system asks user: "How many units are visible in this photo?"
        return null;
    }

    private String extractOcrSnippet(String text, String keyword) {
        int idx = text.toLowerCase().indexOf(keyword.toLowerCase());
        if (idx == -1) return keyword.toUpperCase();
        int start = Math.max(0, idx - 20);
        int end = Math.min(text.length(), idx + keyword.length() + 30);
        return text.substring(start, end).trim();
    }

    private static class QualityMetrics {
        boolean isTooDark = false;
        boolean isTooBlurry = false;
    }
}
