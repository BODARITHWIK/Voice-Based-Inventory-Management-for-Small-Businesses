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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository,
                       BusinessRepository businessRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("An account with this email already exists.");
        }

        // 1. Create Business
        Business business = new Business();
        business.setName(request.getBusinessName().trim());
        business.setOwnerName(request.getOwnerName().trim());
        business.setPhone(request.getPhone().trim());
        business.setAddress(request.getAddress());
        business.setCity(request.getCity());
        business.setState(request.getState());
        business.setPincode(request.getPincode());
        business.setGstin(request.getGstin());
        if (request.getCurrency() != null && !request.getCurrency().isBlank()) {
            business.setCurrency(request.getCurrency());
        }
        if (request.getDefaultLanguage() != null && !request.getDefaultLanguage().isBlank()) {
            business.setDefaultLanguage(request.getDefaultLanguage());
        }
        business = businessRepository.save(business);

        // 2. Create Owner User
        User user = new User(
                business,
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                request.getOwnerName().trim(),
                request.getPhone().trim(),
                Role.OWNER
        );
        user = userRepository.save(user);

        // 3. Authenticate and Generate JWT
        UserPrincipal principal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        auditService.logAction(business, user.getFullName(), "REGISTER", "User", user.getId().toString(), "New business and owner registered");

        return new AuthResponse(
                token,
                user.getId(),
                business.getId(),
                business.getName(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                business.getCurrency(),
                business.getDefaultLanguage()
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User account not found"));

        auditService.logAction(user.getBusiness(), user.getFullName(), "LOGIN", "User", user.getId().toString(), "User logged in successfully");

        return new AuthResponse(
                token,
                user.getId(),
                user.getBusiness().getId(),
                user.getBusiness().getName(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getBusiness().getCurrency(),
                user.getBusiness().getDefaultLanguage()
        );
    }
}
