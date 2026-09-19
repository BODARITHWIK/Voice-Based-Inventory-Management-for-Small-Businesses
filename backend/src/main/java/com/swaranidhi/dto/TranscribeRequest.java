package com.swaranidhi.dto;

public class TranscribeRequest {
    private String audioBase64;
    private String languageHint;
    private String format = "audio/webm";

    public TranscribeRequest() {}

    public TranscribeRequest(String audioBase64, String languageHint, String format) {
        this.audioBase64 = audioBase64;
        this.languageHint = languageHint;
        this.format = format;
    }

    public String getAudioBase64() { return audioBase64; }
    public void setAudioBase64(String audioBase64) { this.audioBase64 = audioBase64; }

    public String getLanguageHint() { return languageHint; }
    public void setLanguageHint(String languageHint) { this.languageHint = languageHint; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }
}
