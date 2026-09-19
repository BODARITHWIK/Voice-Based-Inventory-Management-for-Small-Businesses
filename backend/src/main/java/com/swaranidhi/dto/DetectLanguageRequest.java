package com.swaranidhi.dto;

public class DetectLanguageRequest {
    private String text;
    private String audioBase64;

    public DetectLanguageRequest() {}

    public DetectLanguageRequest(String text) {
        this.text = text;
    }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getAudioBase64() { return audioBase64; }
    public void setAudioBase64(String audioBase64) { this.audioBase64 = audioBase64; }
}
