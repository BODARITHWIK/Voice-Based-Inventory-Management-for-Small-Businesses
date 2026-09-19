package com.swaranidhi.security;

import com.swaranidhi.entity.Role;
import com.swaranidhi.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final Long businessId;
    private final String businessName;
    private final String email;
    private final String password;
    private final String fullName;
    private final Role role;
    private final boolean active;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, Long businessId, String businessName, String email, String password,
                         String fullName, Role role, boolean active,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.businessId = businessId;
        this.businessName = businessName;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.active = active;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        return new UserPrincipal(
                user.getId(),
                user.getBusiness() != null ? user.getBusiness().getId() : null,
                user.getBusiness() != null ? user.getBusiness().getName() : "",
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullName(),
                user.getRole(),
                user.isActive(),
                authorities
        );
    }

    public Long getId() { return id; }
    public Long getBusinessId() { return businessId; }
    public String getBusinessName() { return businessName; }
    public String getFullName() { return fullName; }
    public Role getRole() { return role; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return active; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return active; }
}
