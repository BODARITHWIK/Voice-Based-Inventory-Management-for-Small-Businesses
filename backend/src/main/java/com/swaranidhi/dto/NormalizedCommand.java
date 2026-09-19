package com.swaranidhi.dto;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Universal Language-Neutral Command Model (Section 23 of Specification)
 * Every supported Indian language and English normalizes into this structure.
 */
public class NormalizedCommand {

    private String language;
    private Double languageConfidence;
    private String languageName;
    private String originalText;
    private String translatedText;

    private String intent; // ADD_STOCK, CHECK_STOCK, LOW_STOCK, SALE, CUSTOMER_PAYMENT, CUSTOMER_KHATA, TODAY_SALES, etc.
    private Double confidence;

    private Map<String, Object> entities = new HashMap<>();

    // Common normalized entities
    private String product;
    private Long productId;
    private Integer quantity;
    private String unit;
    private String customer;
    private String supplier;
    private Double amount;
    private String currency = "INR";
    private String paymentMethod;
    private String date;

    private Map<String, Object> context = new HashMap<>();

    private boolean confirmationRequired;
    private String message;
    private String response;
    private String followUpQuestion;
    private boolean requiresFollowUp;
    private String missingField;

    private String status = "READY"; // READY, EXECUTED, AWAITING_CONFIRMATION, AWAITING_INPUT, CANCELLED, UNKNOWN
    private LocalDateTime timestamp = LocalDateTime.now();

    public NormalizedCommand() {}

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Double getLanguageConfidence() { return languageConfidence; }
    public void setLanguageConfidence(Double languageConfidence) { this.languageConfidence = languageConfidence; }

    public String getLanguageName() { return languageName; }
    public void setLanguageName(String languageName) { this.languageName = languageName; }

    public String getOriginalText() { return originalText; }
    public void setOriginalText(String originalText) { this.originalText = originalText; }

    public String getTranslatedText() { return translatedText; }
    public void setTranslatedText(String translatedText) { this.translatedText = translatedText; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public Map<String, Object> getEntities() { return entities; }
    public void setEntities(Map<String, Object> entities) { this.entities = entities; }

    public String getProduct() { return product; }
    public void setProduct(String product) { this.product = product; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getCustomer() { return customer; }
    public void setCustomer(String customer) { this.customer = customer; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public Map<String, Object> getContext() { return context; }
    public void setContext(Map<String, Object> context) { this.context = context; }

    public boolean isConfirmationRequired() { return confirmationRequired; }
    public void setConfirmationRequired(boolean confirmationRequired) { this.confirmationRequired = confirmationRequired; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public String getFollowUpQuestion() { return followUpQuestion; }
    public void setFollowUpQuestion(String followUpQuestion) { this.followUpQuestion = followUpQuestion; }

    public boolean isRequiresFollowUp() { return requiresFollowUp; }
    public void setRequiresFollowUp(boolean requiresFollowUp) { this.requiresFollowUp = requiresFollowUp; }

    public String getMissingField() { return missingField; }
    public void setMissingField(String missingField) { this.missingField = missingField; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
