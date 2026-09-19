package com.swaranidhi.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "voice_commands")
public class VoiceCommandLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false, length = 1000)
    private String rawText;

    private String detectedLanguage;
    private String intent;
    private Double confidence;

    @Column(length = 1000)
    private String responseMessage;

    private boolean executed = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public VoiceCommandLog() {}

    public VoiceCommandLog(Business business, String rawText, String detectedLanguage, String intent, Double confidence, String responseMessage, boolean executed) {
        this.business = business;
        this.rawText = rawText;
        this.detectedLanguage = detectedLanguage;
        this.intent = intent;
        this.confidence = confidence;
        this.responseMessage = responseMessage;
        this.executed = executed;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }

    public String getRawText() { return rawText; }
    public void setRawText(String rawText) { this.rawText = rawText; }

    public String getDetectedLanguage() { return detectedLanguage; }
    public void setDetectedLanguage(String detectedLanguage) { this.detectedLanguage = detectedLanguage; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getResponseMessage() { return responseMessage; }
    public void setResponseMessage(String responseMessage) { this.responseMessage = responseMessage; }

    public boolean isExecuted() { return executed; }
    public void setExecuted(boolean executed) { this.executed = executed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
