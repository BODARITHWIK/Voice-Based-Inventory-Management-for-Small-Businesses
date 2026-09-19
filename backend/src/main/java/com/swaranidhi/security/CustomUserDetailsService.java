package com.swaranidhi.security;

import com.swaranidhi.entity.User;
import com.swaranidhi.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String clean = username != null ? username.trim() : "";
        User user = userRepository.findByEmail(clean.toLowerCase())
                .or(() -> userRepository.findByPhone(clean))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or phone: " + username));
        return UserPrincipal.create(user);
    }
}
