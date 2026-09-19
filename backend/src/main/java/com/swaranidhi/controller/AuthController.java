package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.dto.AuthResponse;
import com.swaranidhi.dto.LoginRequest;
import com.swaranidhi.dto.RegisterRequest;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Account and business created successfully!", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Logged in successfully!", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully.", "Session terminated."));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        Map<String, Object> userDetails = Map.of(
                "userId", principal.getId(),
                "businessId", principal.getBusinessId(),
                "businessName", principal.getBusinessName(),
                "email", principal.getUsername(),
                "fullName", principal.getFullName(),
                "role", principal.getRole().name()
        );
        return ResponseEntity.ok(ApiResponse.success("User profile", userDetails));
    }
}
