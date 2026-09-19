package com.swaranidhi.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @JsonIgnoreProperties({"business"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Integer previousStock;

    @Column(nullable = false)
    private Integer newStock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType transactionType;

    private String reference;
    private String userName;
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public InventoryTransaction() {}

    public InventoryTransaction(Business business, Product product, Integer quantity, Integer previousStock,
                                Integer newStock, TransactionType transactionType, String reference, String userName, String notes) {
        this.business = business;
        this.product = product;
        this.quantity = quantity;
        this.previousStock = previousStock;
        this.newStock = newStock;
        this.transactionType = transactionType;
        this.reference = reference;
        this.userName = userName;
        this.notes = notes;
        this.timestamp = LocalDateTime.now();
    }

    public InventoryTransaction(Business business, Product product, TransactionType transactionType,
                                Integer quantity, Integer previousStock, Integer newStock,
                                String reference, String notes, String userName) {
        this.business = business;
        this.product = product;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.previousStock = previousStock;
        this.newStock = newStock;
        this.reference = reference;
        this.notes = notes;
        this.userName = userName;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getPreviousStock() { return previousStock; }
    public void setPreviousStock(Integer previousStock) { this.previousStock = previousStock; }

    public Integer getNewStock() { return newStock; }
    public void setNewStock(Integer newStock) { this.newStock = newStock; }

    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
