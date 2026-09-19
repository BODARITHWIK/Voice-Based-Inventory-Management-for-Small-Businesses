package com.swaranidhi.dto;

import com.swaranidhi.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class PurchaseRequest {

    private Long supplierId;
    private String supplierName;

    @NotNull(message = "Purchase items cannot be null")
    private List<PurchaseItemRequest> items = new ArrayList<>();

    private BigDecimal tax = BigDecimal.ZERO;
    private PaymentMethod paymentMethod = PaymentMethod.CASH;
    private BigDecimal paidAmount;
    private String idempotencyKey;

    public PurchaseRequest() {}

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public List<PurchaseItemRequest> getItems() { return items; }
    public void setItems(List<PurchaseItemRequest> items) { this.items = items; }

    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public static class PurchaseItemRequest {
        private Long productId;
        private String productName;
        private Integer quantity;
        private String unit = "packets";
        private BigDecimal unitPrice;

        public PurchaseItemRequest() {}

        public PurchaseItemRequest(Long productId, String productName, Integer quantity, String unit, BigDecimal unitPrice) {
            this.productId = productId;
            this.productName = productName;
            this.quantity = quantity;
            this.unit = unit;
            this.unitPrice = unitPrice;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    }
}
