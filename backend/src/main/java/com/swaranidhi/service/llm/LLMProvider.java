package com.swaranidhi.service.llm;

import java.util.Map;

public interface LLMProvider {
    String getProviderName();
    boolean isAvailable();
    String generateResponse(String systemPrompt, String userQuery, Map<String, Object> context);
}
