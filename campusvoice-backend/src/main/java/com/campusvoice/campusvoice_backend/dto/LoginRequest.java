package com.campusvoice.campusvoice_backend.dto;

public record LoginRequest(
        String email,
        String password
) {}
