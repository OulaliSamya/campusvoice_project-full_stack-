package com.campusvoice.campusvoice_backend.controller;

import com.campusvoice.campusvoice_backend.dto.LoginRequest;
import com.campusvoice.campusvoice_backend.dto.RegisterRequest;
import com.campusvoice.campusvoice_backend.dto.UserResponse;
import com.campusvoice.campusvoice_backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        UserResponse user = authService.register(request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(@RequestBody LoginRequest request) {
        UserResponse user = authService.login(request);
        return ResponseEntity.ok(user);
    }
}
