package com.swaranidhi.controller;

import com.swaranidhi.dto.*;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.VoiceService;
import com.swaranidhi.service.voice.LanguageCapabilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Production Voice & Multilingual Intelligence API Controller (Section 40)
 */
@RestController
@RequestMapping("/api/voice")
public class VoiceController {

    private final VoiceService voiceService;
    private final LanguageCapabilityService languageCapabilityService;

    public VoiceController(VoiceService voiceService, LanguageCapabilityService languageCapabilityService) {
        this.voiceService = voiceService;
        this.languageCapabilityService = languageCapabilityService;
    }

    /**
     * 1. Transcribe audio to text via configured provider (Section 40, 41)
     */
    @PostMapping("/transcribe")
    public ResponseEntity<ApiResponse<TranscribeResponse>> transcribeAudio(
            @RequestBody TranscribeRequest request) {
        TranscribeResponse response = voiceService.transcribe(request);
        return ResponseEntity.ok(ApiResponse.success("Audio transcribed successfully", response));
    }

    /**
     * 2. Detect language and script of text/speech (Section 40, 31)
     */
    @PostMapping("/detect-language")
    public ResponseEntity<ApiResponse<DetectLanguageResponse>> detectLanguage(
            @RequestBody DetectLanguageRequest request) {
        DetectLanguageResponse response = voiceService.detectLanguage(request);
        return ResponseEntity.ok(ApiResponse.success("Language detected", response));
    }

    /**
     * 3. Understand voice/text command into NormalizedCommand (Section 40, 42)
     */
    @PostMapping("/understand")
    public ResponseEntity<ApiResponse<NormalizedCommand>> understandCommand(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody VoiceCommandRequest request) {
        Long businessId = principal != null ? principal.getBusinessId() : 1L;
        NormalizedCommand cmd = voiceService.understand(businessId, request);
        return ResponseEntity.ok(ApiResponse.success("Command understood", cmd));
    }

    /**
     * 4. Execute voice command (Section 40)
     */
    @PostMapping({"/command", "/process"})
    public ResponseEntity<ApiResponse<VoiceCommandResponse>> processVoiceCommand(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody VoiceCommandRequest request) {
        Long businessId = principal != null ? principal.getBusinessId() : 1L;
        VoiceCommandResponse response = voiceService.processCommand(businessId, request);
        return ResponseEntity.ok(ApiResponse.success("Voice command processed", response));
    }

    /**
     * 5. Get all supported Indian languages (Section 40)
     */
    @GetMapping("/languages")
    public ResponseEntity<ApiResponse<List<LanguageCapability>>> getSupportedLanguages() {
        List<LanguageCapability> list = languageCapabilityService.getAllLanguages();
        return ResponseEntity.ok(ApiResponse.success("Supported Indian languages retrieved", list));
    }

    /**
     * 6. Get capability for specific language code (Section 40, 32)
     */
    @GetMapping("/languages/{code}/capabilities")
    public ResponseEntity<ApiResponse<LanguageCapability>> getLanguageCapabilities(
            @PathVariable("code") String code) {
        LanguageCapability cap = languageCapabilityService.getCapability(code);
        return ResponseEntity.ok(ApiResponse.success("Language capability retrieved", cap));
    }
}
