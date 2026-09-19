package com.swaranidhi.dto;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private Long businessId;
    private String businessName;
    private String email;
    private String fullName;
    private String role;
    private String currency;
    private String defaultLanguage;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, Long businessId, String businessName,
                        String email, String fullName, String role, String currency, String defaultLanguage) {
        this.token = token;
        this.tokenType = "Bearer";
        this.userId = userId;
        this.businessId = businessId;
        this.businessName = businessName;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.currency = currency;
        this.defaultLanguage = defaultLanguage;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getBusinessId() { return businessId; }
    public void setBusinessId(Long businessId) { this.businessId = businessId; }

    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getDefaultLanguage() { return defaultLanguage; }
    public void setDefaultLanguage(String defaultLanguage) { this.defaultLanguage = defaultLanguage; }
}
