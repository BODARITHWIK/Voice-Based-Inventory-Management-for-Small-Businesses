package com.swaranidhi.service;

import com.swaranidhi.dto.InventoryAdjustRequest;
import com.swaranidhi.entity.InventoryTransaction;
import com.swaranidhi.entity.Product;
import com.swaranidhi.entity.StockStatus;
import com.swaranidhi.entity.TransactionType;
import com.swaranidhi.exception.BadRequestException;
import com.swaranidhi.exception.InsufficientStockException;
import com.swaranidhi.exception.ResourceNotFoundException;
import com.swaranidhi.repository.InventoryTransactionRepository;
import com.swaranidhi.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {

    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public InventoryService(InventoryTransactionRepository inventoryTransactionRepository,
                            ProductRepository productRepository,
                            NotificationService notificationService,
                            AuditService auditService) {
        this.inventoryTransactionRepository = inventoryTransactionRepository;
        this.productRepository = productRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<InventoryTransaction> getAllTransactions(Long businessId) {
        return inventoryTransactionRepository.findByBusinessIdOrderByTimestampDesc(businessId);
    }

    @Transactional(readOnly = true)
    public Page<InventoryTransaction> getTransactionsPaged(Long businessId, Pageable pageable) {
        return inventoryTransactionRepository.findByBusinessIdOrderByTimestampDesc(businessId, pageable);
    }

    @Transactional(readOnly = true)
    public List<InventoryTransaction> getProductTransactions(Long businessId, Long productId) {
        return inventoryTransactionRepository.findByBusinessIdAndProductIdOrderByTimestampDesc(businessId, productId);
    }

    @Transactional
    public InventoryTransaction adjustStock(Long businessId, InventoryAdjustRequest req, String userName) {
        Product product = productRepository.findByIdAndBusinessIdWithLock(req.getProductId(), businessId)
                .or(() -> productRepository.findByIdAndBusinessId(req.getProductId(), businessId))
                .filter(Product::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + req.getProductId()));

        int prevStock = product.getQuantity();
        int delta;
        TransactionType type = req.getType() != null ? req.getType() : TransactionType.ADJUSTMENT;

        switch (type) {
            case STOCK_IN:
            case PURCHASE:
            case RETURN:
                delta = Math.abs(req.getQuantity());
                break;
            case STOCK_OUT:
            case DAMAGE:
            case SALE:
            case EXPIRED_REMOVAL:
                delta = -Math.abs(req.getQuantity());
                break;
            case ADJUSTMENT:
            default:
                delta = req.getQuantity(); // Can be positive or negative
                break;
        }

        int newStock = prevStock + delta;
        if (newStock < 0) {
            throw new InsufficientStockException(
                    "Cannot deduct " + Math.abs(delta) + " " + product.getUnit() + " of '" + product.getName() +
                    "'. Only " + prevStock + " available in stock."
            );
        }

        product.setQuantity(newStock);
        productRepository.save(product);

        InventoryTransaction tx = new InventoryTransaction(
                product.getBusiness(),
                product,
                type,
                Math.abs(delta),
                prevStock,
                newStock,
                "ADJUSTMENT-" + System.currentTimeMillis(),
                req.getNotes() != null ? req.getNotes() : "Stock adjusted by " + userName,
                userName
        );
        InventoryTransaction savedTx = inventoryTransactionRepository.save(tx);

        if (product.getStatus() == StockStatus.OUT_OF_STOCK) {
            notificationService.createNotification(
                    product.getBusiness(),
                    "OUT_OF_STOCK",
                    "Out of Stock: " + product.getName(),
                    product.getName() + " is now completely out of stock!"
            );
        } else if (product.getStatus() == StockStatus.LOW_STOCK) {
            notificationService.createNotification(
                    product.getBusiness(),
                    "LOW_STOCK",
                    "Low Stock: " + product.getName(),
                    product.getName() + " is running low (" + newStock + " " + product.getUnit() + " left)."
            );
        }

        auditService.logAction(product.getBusiness(), userName, "STOCK_ADJUSTED", "InventoryTransaction",
                savedTx.getId().toString(), "Adjusted " + product.getName() + " by " + delta + " to " + newStock);

        return savedTx;
    }
}
