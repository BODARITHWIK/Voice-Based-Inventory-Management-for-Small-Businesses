package com.swaranidhi.service;

import com.swaranidhi.dto.DetectedProductDto;
import com.swaranidhi.dto.ProductMatchDto;
import com.swaranidhi.entity.Product;
import com.swaranidhi.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductMatchingService {

    private static final Logger log = LoggerFactory.getLogger(ProductMatchingService.class);

    private final ProductRepository productRepository;

    public ProductMatchingService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public void matchDetectedProduct(Long businessId, DetectedProductDto detected) {
        if (businessId == null || detected == null) return;

        // 1. Priority 1: Barcode match
        if (detected.getBarcode() != null && !detected.getBarcode().isBlank()) {
            Optional<Product> byBarcode = productRepository.findByBusinessIdAndBarcode(businessId, detected.getBarcode().trim());
            if (byBarcode.isPresent()) {
                Product p = byBarcode.get();
                applyMatch(detected, p, 0.99);
                return;
            }
        }

        // 2. Priority 2: Direct name match
        String searchName = detected.getProductName();
        if (searchName != null && !searchName.isBlank()) {
            Optional<Product> direct = productRepository.findFirstByNameContainingIgnoreCase(businessId, searchName.trim());
            if (direct.isPresent()) {
                Product p = direct.get();
                applyMatch(detected, p, 0.95);
                return;
            }
        }

        // 3. Priority 3: Fuzzy / Brand match against all active products
        List<Product> products = productRepository.findByBusinessIdAndActiveTrue(businessId);
        Product bestMatch = null;
        double bestScore = 0.0;

        String brand = detected.getBrand() != null ? detected.getBrand().toLowerCase().trim() : "";
        String name = detected.getProductName() != null ? detected.getProductName().toLowerCase().trim() : "";

        for (Product p : products) {
            String existingName = p.getName().toLowerCase();
            double score = 0.0;

            if (existingName.equalsIgnoreCase(name)) {
                score = 1.0;
            } else if (!brand.isEmpty() && existingName.contains(brand)) {
                score = 0.85;
                if (existingName.contains("full cream") && name.contains("full cream")) {
                    score = 0.95;
                } else if (existingName.contains("taaza") && name.contains("taaza")) {
                    score = 0.95;
                } else if (existingName.contains("gold") && name.contains("gold")) {
                    score = 0.95;
                }
            } else if (name.contains(existingName) || existingName.contains(name)) {
                score = 0.80;
            }

            if (score > bestScore) {
                bestScore = score;
                bestMatch = p;
            }
        }

        if (bestMatch != null && bestScore >= 0.70) {
            applyMatch(detected, bestMatch, bestScore);
        } else {
            detected.setMatchedExistingProduct(false);
        }
    }

    private void applyMatch(DetectedProductDto detected, Product p, double score) {
        detected.setMatchedExistingProduct(true);
        detected.setExistingProductId(p.getId());
        detected.setExistingProductName(p.getName());
        detected.setProductId(p.getSku() != null ? p.getSku() : "PROD-" + p.getId());
        detected.setCurrentStock(p.getQuantity());
        detected.setCategory(p.getCategory());
        detected.setUnit(p.getUnit());
        if (p.getPurchasePrice() != null) detected.setPurchasePrice(p.getPurchasePrice());
        if (p.getSellingPrice() != null) detected.setSellingPrice(p.getSellingPrice());
        if (p.getSupplier() != null) detected.setSupplier(p.getSupplier());
        detected.setConfidence(Math.max(detected.getConfidence(), score));
    }

    @Transactional(readOnly = true)
    public ProductMatchDto findBestMatch(Long businessId, String query, String barcode) {
        if (barcode != null && !barcode.isBlank()) {
            Optional<Product> p = productRepository.findByBusinessIdAndBarcode(businessId, barcode.trim());
            if (p.isPresent()) {
                Product prod = p.get();
                return new ProductMatchDto(
                        prod.getId(), prod.getName(), prod.getCategory(), prod.getSku(), prod.getBarcode(),
                        prod.getQuantity(), prod.getUnit(), prod.getSellingPrice(), prod.getPurchasePrice(),
                        1.0, "BARCODE"
                );
            }
        }

        if (query != null && !query.isBlank()) {
            Optional<Product> direct = productRepository.findFirstByNameContainingIgnoreCase(businessId, query.trim());
            if (direct.isPresent()) {
                Product prod = direct.get();
                return new ProductMatchDto(
                        prod.getId(), prod.getName(), prod.getCategory(), prod.getSku(), prod.getBarcode(),
                        prod.getQuantity(), prod.getUnit(), prod.getSellingPrice(), prod.getPurchasePrice(),
                        0.95, "EXACT_NAME"
                );
            }

            List<Product> products = productRepository.findByBusinessIdAndActiveTrue(businessId);
            String q = query.toLowerCase().trim();
            for (Product prod : products) {
                if (prod.getName().toLowerCase().contains(q) || q.contains(prod.getName().toLowerCase())) {
                    return new ProductMatchDto(
                            prod.getId(), prod.getName(), prod.getCategory(), prod.getSku(), prod.getBarcode(),
                            prod.getQuantity(), prod.getUnit(), prod.getSellingPrice(), prod.getPurchasePrice(),
                            0.80, "FUZZY_NAME"
                    );
                }
            }
        }

        return new ProductMatchDto(null, null, null, null, null, 0, "packets", null, null, 0.0, "NONE");
    }
}
