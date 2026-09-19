package com.swaranidhi.service.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class GeminiLLMProvider implements LLMProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiLLMProvider.class);

    @Value("${gemini.api.key:}")
    private String configuredApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    private String resolveApiKey() {
        if (configuredApiKey != null && !configuredApiKey.isBlank()) {
            return configuredApiKey.trim();
        }
        String env = System.getenv("GEMINI_API_KEY");
        return (env != null && !env.isBlank()) ? env.trim() : null;
    }

    @Override
    public String getProviderName() {
        return "GeminiLLMProvider";
    }

    @Override
    public boolean isAvailable() {
        return resolveApiKey() != null;
    }

    @Override
    public String generateResponse(String systemPrompt, String userQuery, Map<String, Object> context) {
        String apiKey = resolveApiKey();
        if (apiKey == null) {
            return null; // Signals fallback to RuleBasedLLMProvider
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

            String contextJson = objectMapper.writeValueAsString(context);
            String fullPrompt = String.format("%s\n\nShop Inventory & Financial Context:\n%s\n\nUser Question:\n%s\n\nPlease answer concisely and accurately based on the context provided above.",
                    systemPrompt != null ? systemPrompt : "You are Swaranidhi AI, an intelligent shop inventory assistant.",
                    contextJson,
                    userQuery);

            Map<String, Object> part = Map.of("text", fullPrompt);
            Map<String, Object> contentObj = Map.of("parts", List.of(part));
            Map<String, Object> requestBody = Map.of("contents", List.of(contentObj));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        return textNode.asText().trim();
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Gemini API call failed or timed out, will fallback to rule-based: {}", e.getMessage());
        }

        return null;
    }
}
