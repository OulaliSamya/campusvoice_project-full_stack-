// src/main/java/com/campusvoice/campusvoice_backend/service/CustomUserDetailsService.java
package com.campusvoice.campusvoice_backend.service;

import com.campusvoice.campusvoice_backend.model.User;
import com.campusvoice.campusvoice_backend.model.UserRole;
import com.campusvoice.campusvoice_backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + email));

        // ✅ Convertit UserRole en "ROLE_ADMIN", "ROLE_TEACHER", etc.
        String roleString = "ROLE_" + user.getRole().name();
        var authorities = Collections.singletonList(new SimpleGrantedAuthority(roleString));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }
}