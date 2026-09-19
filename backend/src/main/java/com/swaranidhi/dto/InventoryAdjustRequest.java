package com.swaranidhi.dto;

import com.swaranidhi.entity.TransactionType;
import jakarta.validation.constraints.NotNull;

public class InventoryAdjustRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity change is required")
    private Integer quantity;

    @NotNull(message = "Adjustment type is required")
    private TransactionType type = TransactionType.ADJUSTMENT;

    private String notes;

    public InventoryAdjustRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
