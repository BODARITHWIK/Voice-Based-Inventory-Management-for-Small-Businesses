package com.swaranidhi.service;

import com.swaranidhi.dto.AuthResponse;
import com.swaranidhi.dto.LoginRequest;
import com.swaranidhi.dto.RegisterRequest;
import com.swaranidhi.entity.Business;
import com.swaranidhi.entity.Role;
import com.swaranidhi.entity.User;
import com.swaranidhi.exception.BadRequestException;
import com.swaranidhi.repository.BusinessRepository;
import com.swaranidhi.repository.UserRepository;
import com.swaranidhi.security.JwtTokenProvider;
import com.swaranidhi.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private AuditService auditService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, businessRepository, passwordEncoder, jwtTokenProvider, authenticationManager, auditService);
    }

    @Test
    @DisplayName("Should successfully register a new shopkeeper and business")
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest();
        req.setBusinessName("Balaji Kirana");
        req.setOwnerName("Srinivas");
        req.setEmail("srinivas@kirana.com");
        req.setPhone("9988776655");
        req.setPassword("secret123");
        req.setCity("Vijayawada");
        req.setState("Andhra Pradesh");

        when(userRepository.existsByEmail("srinivas@kirana.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashedSecret");

        Business savedBusiness = new Business("Balaji Kirana", "Srinivas", "9988776655", "srinivas@kirana.com", "Vijayawada", "Andhra Pradesh");
        savedBusiness.setId(10L);
        when(businessRepository.save(any(Business.class))).thenReturn(savedBusiness);

        User savedUser = new User(savedBusiness, "srinivas@kirana.com", "hashedSecret", "Srinivas", "9988776655", Role.OWNER);
        savedUser.setId(20L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(jwtTokenProvider.generateToken(any())).thenReturn("jwt-token-xyz");

        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertEquals("jwt-token-xyz", res.getToken());
        assertEquals("Balaji Kirana", res.getBusinessName());
        assertEquals("Srinivas", res.getFullName());
        assertEquals(Role.OWNER.name(), res.getRole());
    }

    @Test
    @DisplayName("Should reject registration if email already exists")
    void testRegisterDuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("existing@kirana.com");

        when(userRepository.existsByEmail("existing@kirana.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req));
    }

    @Test
    @DisplayName("Should successfully login shopkeeper with valid credentials")
    void testLoginSuccess() {
        LoginRequest req = new LoginRequest("owner@kirana.com", "password123");

        Business business = new Business("Demo Kirana", "Ramesh", "9876543210", "owner@kirana.com", "Hyd", "TG");
        business.setId(1L);
        User user = new User(business, "owner@kirana.com", "encodedPass", "Ramesh Kumar", "9876543210", Role.OWNER);
        user.setId(5L);

        UserPrincipal principal = UserPrincipal.create(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(jwtTokenProvider.generateToken(auth)).thenReturn("valid-jwt-token");
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));

        AuthResponse res = authService.login(req);

        assertNotNull(res);
        assertEquals("valid-jwt-token", res.getToken());
        assertEquals("Ramesh Kumar", res.getFullName());
    }
}
