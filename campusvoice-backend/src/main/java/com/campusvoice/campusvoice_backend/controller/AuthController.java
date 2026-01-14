// src/main/java/com/campusvoice/campusvoice_backend/controller/AuthController.java
package com.campusvoice.campusvoice_backend.controller;

import com.campusvoice.campusvoice_backend.dto.LoginRequest;
import com.campusvoice.campusvoice_backend.dto.RegisterRequest;
import com.campusvoice.campusvoice_backend.dto.UserResponse;
import com.campusvoice.campusvoice_backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        System.out.println(">>> Tentative d'inscription : " + request.email());
        System.out.println(">>> Rôle : " + request.role());
        UserResponse user = authService.register(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        String token = authService.login(request);
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("email", request.email());
        return ResponseEntity.ok(response);
    }
}