package com.swaranidhi.service;

import com.swaranidhi.entity.*;
import com.swaranidhi.repository.InventoryTransactionRepository;
import com.swaranidhi.repository.ProductRepository;
import com.swaranidhi.repository.SaleItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AlertsService {

    private final ProductRepository productRepository;
    private final SaleItemRepository saleItemRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final AuditService auditService;

    public AlertsService(ProductRepository productRepository,
                         SaleItemRepository saleItemRepository,
                         InventoryTransactionRepository inventoryTransactionRepository,
                         AuditService auditService) {
        this.productRepository = productRepository;
        this.saleItemRepository = saleItemRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<Product> getLowStockAlerts(Long businessId) {
        return productRepository.findByBusinessIdAndActiveTrue(businessId).stream()
                .filter(p -> p.getQuantity() > 0 && p.getQuantity() <= (p.getMinimumStock() != null ? p.getMinimumStock() : 10))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Product> getOutOfStockAlerts(Long businessId) {
        return productRepository.findByBusinessIdAndActiveTrue(businessId).stream()
                .filter(p -> p.getQuantity() <= 0)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getExpiryAlerts(Long businessId) {
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysLater = today.plusDays(7);

        List<Product> all = productRepository.findByBusinessIdAndActiveTrue(businessId);

        List<Product> expired = all.stream()
                .filter(p -> p.getExpiryDate() != null && p.getExpiryDate().isBefore(today) && p.getQuantity() > 0)
                .collect(Collectors.toList());

        List<Product> expiringSoon = all.stream()
                .filter(p -> p.getExpiryDate() != null && !p.getExpiryDate().isBefore(today) && !p.getExpiryDate().isAfter(sevenDaysLater) && p.getQuantity() > 0)
                .collect(Collectors.toList());

        Map<String, Object> res = new HashMap<>();
        res.put("expired", expired);
        res.put("expiringSoon", expiringSoon);
        res.put("expiredCount", expired.size());
        res.put("expiringSoonCount", expiringSoon.size());
        return res;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFastMovingAlerts(Long businessId) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Object[]> velocityData = saleItemRepository.findSalesVelocityByBusiness(businessId, sevenDaysAgo);

        Map<Long, Long> velocityMap = new HashMap<>();
        for (Object[] row : velocityData) {
            if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                Long pId = ((Number) row[0]).longValue();
                Long qty = ((Number) row[1]).longValue();
                velocityMap.put(pId, qty);
            }
        }

        List<Product> allProducts = productRepository.findByBusinessIdAndActiveTrue(businessId);
        List<Map<String, Object>> results = new ArrayList<>();

        for (Product p : allProducts) {
            Long sold = velocityMap.getOrDefault(p.getId(), 0L);
            if (sold > 0) {
                Map<String, Object> item = new HashMap<>();
                item.put("productId", p.getId());
                item.put("name", p.getName());
                item.put("category", p.getCategory());
                item.put("unit", p.getUnit());
                item.put("currentStock", p.getQuantity());
                item.put("soldQuantity", sold);
                item.put("salesVelocity", sold / 7.0); // units per day
                item.put("isFastMoving", sold >= 15);
                results.add(item);
            }
        }

        results.sort((a, b) -> Long.compare((Long) b.get("soldQuantity"), (Long) a.get("soldQuantity")));
        return results;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAllSmartAlerts(Long businessId) {
        List<Product> lowStock = getLowStockAlerts(businessId);
        List<Product> outOfStock = getOutOfStockAlerts(businessId);
        Map<String, Object> expiry = getExpiryAlerts(businessId);
        List<Map<String, Object>> fastMoving = getFastMovingAlerts(businessId);

        Map<String, Object> res = new HashMap<>();
        res.put("lowStock", lowStock);
        res.put("lowStockCount", lowStock.size());
        res.put("outOfStock", outOfStock);
        res.put("outOfStockCount", outOfStock.size());
        res.put("expiry", expiry);
        res.put("fastMoving", fastMoving);
        res.put("fastMovingCount", fastMoving.size());

        int totalAlerts = lowStock.size() + outOfStock.size() +
                (Integer) expiry.get("expiredCount") +
                (Integer) expiry.get("expiringSoonCount");
        res.put("totalAlerts", totalAlerts);
        return res;
    }

    @Transactional
    public Map<String, Object> removeExpiredStock(Long businessId, Long productId, String userName) {
        LocalDate today = LocalDate.now();
        List<Product> toRemove = new ArrayList<>();

        if (productId != null) {
            productRepository.findByIdAndBusinessId(productId, businessId)
                    .filter(Product::isActive)
                    .ifPresent(p -> {
                        if (p.getExpiryDate() != null && p.getExpiryDate().isBefore(today) && p.getQuantity() > 0) {
                            toRemove.add(p);
                        }
                    });
        } else {
            // Remove all expired products
            List<Product> all = productRepository.findByBusinessIdAndActiveTrue(businessId);
            for (Product p : all) {
                if (p.getExpiryDate() != null && p.getExpiryDate().isBefore(today) && p.getQuantity() > 0) {
                    toRemove.add(p);
                }
            }
        }

        int removedCount = 0;
        int totalQuantityWrittenOff = 0;

        for (Product product : toRemove) {
            int qty = product.getQuantity();
            product.setQuantity(0);
            productRepository.save(product);

            InventoryTransaction tx = new InventoryTransaction(
                    product.getBusiness(),
                    product,
                    TransactionType.EXPIRED_REMOVAL,
                    qty,
                    qty,
                    0,
                    "EXP-WRITE-OFF-" + System.currentTimeMillis(),
                    "Expired stock written off by " + userName + " (Batch: " + (product.getBatchNumber() != null ? product.getBatchNumber() : "N/A") + ")",
                    userName
            );
            inventoryTransactionRepository.save(tx);
            auditService.logAction(product.getBusiness(), userName, "EXPIRED_STOCK_REMOVED", "Product", product.getId().toString(),
                    "Removed " + qty + " units of expired " + product.getName());

            removedCount++;
            totalQuantityWrittenOff += qty;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("removedProductsCount", removedCount);
        result.put("totalQuantityWrittenOff", totalQuantityWrittenOff);
        result.put("status", "SUCCESS");
        return result;
    }
}
