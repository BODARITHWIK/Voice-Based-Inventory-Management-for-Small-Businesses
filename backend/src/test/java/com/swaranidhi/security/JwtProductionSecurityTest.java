package com.swaranidhi.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtProductionSecurityTest {

    @Test
    @DisplayName("Should throw IllegalStateException in prod profile if SWARANIDHI_JWT_SECRET is missing")
    void shouldFailStartupInProdProfileWhenSecretMissing() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        // Do not set SWARANIDHI_JWT_SECRET or JWT_SECRET

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            new JwtTokenProvider("dev-only-local-insecure-jwt-secret-do-not-use-in-production-min-256-bits!", 86400000L, env);
        });

        assertTrue(ex.getMessage().contains("SWARANIDHI_JWT_SECRET"));
    }

    @Test
    @DisplayName("Should throw IllegalStateException in prod profile if fallback dev secret is supplied")
    void shouldFailStartupInProdProfileWhenDevFallbackSupplied() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        env.setProperty("SWARANIDHI_JWT_SECRET", "dev-only-local-insecure-jwt-secret-do-not-use-in-production-min-256-bits!");

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            new JwtTokenProvider("dev-only-local-insecure-jwt-secret-do-not-use-in-production-min-256-bits!", 86400000L, env);
        });

        assertTrue(ex.getMessage().contains("SWARANIDHI_JWT_SECRET"));
    }

    @Test
    @DisplayName("Should succeed in prod profile when valid secret is explicitly configured")
    void shouldSucceedInProdProfileWithValidSecret() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        String secureSecret = "c3dhcmFuaWRoaS1wcm9kdWN0aW9uLXNlY3VyZS1yYW5kb20ta2V5LWZvci1zdGFnaW5nLTI1Ng==";
        env.setProperty("SWARANIDHI_JWT_SECRET", secureSecret);

        JwtTokenProvider provider = new JwtTokenProvider(secureSecret, 86400000L, env);
        assertNotNull(provider);

        UserPrincipal principal = new UserPrincipal(
                10L, 100L, "Test Store", "owner@store.com", "pass", "Store Owner",
                com.swaranidhi.entity.Role.OWNER, true, Collections.emptyList()
        );
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        String token = provider.generateToken(auth);

        assertNotNull(token);
        assertTrue(provider.validateToken(token));
        assertEquals("owner@store.com", provider.getUsernameFromJwt(token));
        assertEquals(100L, provider.getBusinessIdFromJwt(token));
    }

    @Test
    @DisplayName("Should succeed in dev/default profile with zero-config local fallback")
    void shouldSucceedInDevProfileWithLocalFallback() {
        MockEnvironment env = new MockEnvironment();
        // Default profile (no active profiles)
        String devSecret = "dev-only-local-insecure-jwt-secret-do-not-use-in-production-min-256-bits!";

        JwtTokenProvider provider = new JwtTokenProvider(devSecret, 86400000L, env);
        assertNotNull(provider);
    }
}
