package com.swaranidhi.dto;

import java.util.Map;

public class VoiceCommandResponse {

    private boolean success = true;
    private String language;
    private String intent;
    private Double confidence;
    private Map<String, Object> entities;
    private String action;
    private String message;
    private String response;
    private boolean requiresConfirmation = true;
    private boolean requiresFollowUp = false;
    private String followUpQuestion;

    public VoiceCommandResponse() {}

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getIntent() { return intent; }
    public void setIntent(String intent) { this.intent = intent; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public Map<String, Object> getEntities() { return entities; }
    public void setEntities(Map<String, Object> entities) { this.entities = entities; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public boolean isRequiresConfirmation() { return requiresConfirmation; }
    public void setRequiresConfirmation(boolean requiresConfirmation) { this.requiresConfirmation = requiresConfirmation; }

    public boolean isRequiresFollowUp() { return requiresFollowUp; }
    public void setRequiresFollowUp(boolean requiresFollowUp) { this.requiresFollowUp = requiresFollowUp; }

    public String getFollowUpQuestion() { return followUpQuestion; }
    public void setFollowUpQuestion(String followUpQuestion) { this.followUpQuestion = followUpQuestion; }
}
