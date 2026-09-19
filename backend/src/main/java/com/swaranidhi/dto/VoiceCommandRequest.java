package com.swaranidhi.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.util.Map;

public class VoiceCommandRequest {

    @JsonAlias({"command", "query", "transcript"})
    private String text;
    private String language = "auto";
    private Map<String, Object> context;

    public VoiceCommandRequest() {}

    public VoiceCommandRequest(String text) {
        this.text = text;
        this.language = "auto";
    }

    public VoiceCommandRequest(String text, String language) {
        this.text = text;
        this.language = language;
    }

    public VoiceCommandRequest(String text, String language, Map<String, Object> context) {
        this.text = text;
        this.language = language;
        this.context = context;
    }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Map<String, Object> getContext() { return context; }
    public void setContext(Map<String, Object> context) { this.context = context; }
}
