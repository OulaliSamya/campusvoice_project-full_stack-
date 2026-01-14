// src/main/java/com/campusvoice/campusvoice_backend/config/SecurityConfig.java
package com.campusvoice.campusvoice_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.campusvoice.campusvoice_backend.service.CustomUserDetailsService;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, 
            CustomUserDetailsService customUserDetailsService) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .userDetailsService(customUserDetailsService) // ✅ Ici
            .authorizeHttpRequests(auth -> auth
            // ✅ 1. Routes publiques
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/uploads/**").permitAll()
            .requestMatchers("/api/documents/download/**").permitAll()

            // ✅ 2. Routes réservées aux ADMIN (les plus restrictives)
            .requestMatchers(HttpMethod.POST, "/api/courses").hasRole("ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/courses/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/courses/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/courses/*/classes").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/courses/*/classes/**").hasRole("ADMIN")
            .requestMatchers(HttpMethod.GET, "/api/courses/*/classes").hasRole("ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
            .requestMatchers("/api/admin/**").hasRole("ADMIN")

           // ✅ Autorise les étudiants à LIRE
            .requestMatchers(HttpMethod.GET, "/api/documents").hasAnyRole("STUDENT", "TEACHER", "ADMIN")
            // ✅ Autorise seulement les enseignants à ÉCRIRE
            .requestMatchers(HttpMethod.POST, "/api/documents").hasRole("TEACHER")
            .requestMatchers(HttpMethod.DELETE, "/api/documents/**").hasRole("TEACHER")

            // ✅ 4. Routes accessibles à plusieurs rôles
            .requestMatchers(HttpMethod.GET, "/api/courses").hasAnyRole("STUDENT", "TEACHER", "ADMIN")
            .requestMatchers(HttpMethod.GET, "/api/feedbacks").hasAnyRole("STUDENT", "TEACHER", "ADMIN")
            .requestMatchers(HttpMethod.POST, "/api/feedbacks").hasAnyRole("STUDENT", "TEACHER")
            .requestMatchers(HttpMethod.PUT, "/api/feedbacks/**").hasRole("STUDENT")
            .requestMatchers(HttpMethod.DELETE, "/api/feedbacks/**").authenticated()

            // ✅ 5. Tout le reste → authentifié
            .anyRequest().authenticated()
        )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ✅ Configuration CORS globale (appliquée à toutes les routes)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://127.0.0.1:4200"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}