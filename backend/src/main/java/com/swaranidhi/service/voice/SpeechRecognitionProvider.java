package com.swaranidhi.service.voice;

import com.swaranidhi.dto.LanguageCapability;
import com.swaranidhi.dto.TranscribeResponse;

import java.util.List;

/**
 * Speech Recognition Provider Abstraction (Section 5 & 6)
 * Supports browser fallback, cloud speech, and Indian language speech providers.
 */
public interface SpeechRecognitionProvider {

    /**
     * Provider identification name (e.g. "browser", "cloud", "bhashini", "azure")
     */
    String getProviderName();

    /**
     * Check if provider is configured and available
     */
    boolean isAvailable();

    /**
     * Transcribe audio byte stream to text in the target Indian language
     */
    TranscribeResponse transcribe(byte[] audioData, String languageHint, String contentType);

    /**
     * Auto-detect spoken language from audio
     */
    String detectLanguage(byte[] audioData);

    /**
     * List capabilities supported by this provider
     */
    List<LanguageCapability> getSupportedLanguages();
}
