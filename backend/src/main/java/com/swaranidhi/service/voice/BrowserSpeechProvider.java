package com.swaranidhi.service.voice;

import com.swaranidhi.dto.LanguageCapability;
import com.swaranidhi.dto.TranscribeResponse;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * Browser Speech Recognition Provider (Development & Fallback Engine)
 * Coordinates with frontend Web Speech API and backend normalization.
 */
@Component("browserSpeechProvider")
public class BrowserSpeechProvider implements SpeechRecognitionProvider {

    @Override
    public String getProviderName() {
        return "browser";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public TranscribeResponse transcribe(byte[] audioData, String languageHint, String contentType) {
        // In browser fallback mode, the browser conducts initial speech-to-text,
        // and sends normalized audio or recognized text to backend for validation.
        TranscribeResponse response = new TranscribeResponse();
        response.setSuccess(true);
        response.setLanguage(languageHint != null ? languageHint : "en-IN");
        response.setConfidence(0.92);
        response.setProvider(getProviderName());
        response.setText("");
        return response;
    }

    @Override
    public String detectLanguage(byte[] audioData) {
        return "auto";
    }

    @Override
    public List<LanguageCapability> getSupportedLanguages() {
        return Collections.emptyList(); // Default capabilities delegated to LanguageCapabilityService
    }
}
