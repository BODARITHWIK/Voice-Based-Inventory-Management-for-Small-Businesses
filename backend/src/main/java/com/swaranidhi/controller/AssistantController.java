package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.AssistantService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    private final AssistantService assistantService;

    public AssistantController(AssistantService assistantService) {
        this.assistantService = assistantService;
    }

    private Long getEffectiveBusinessId(UserPrincipal principal) {
        return (principal != null && principal.getBusinessId() != null) ? principal.getBusinessId() : 1L;
    }

    @PostMapping("/query")
    public ResponseEntity<ApiResponse<Map<String, Object>>> queryAssistant(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> request) {
        Long businessId = getEffectiveBusinessId(principal);
        String query = request != null ? request.get("query") : "";

        Map<String, Object> result = assistantService.query(businessId, query);
        return ResponseEntity.ok(ApiResponse.success("Assistant query resolved", result));
    }
}
