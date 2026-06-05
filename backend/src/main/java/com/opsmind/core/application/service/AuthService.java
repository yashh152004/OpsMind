package com.opsmind.core.application.service;

import com.opsmind.core.adapter.dto.request.*;
import com.opsmind.core.adapter.dto.response.AuthResponse;
import com.opsmind.core.adapter.dto.response.TokenResponse;
import com.opsmind.core.adapter.dto.response.UserResponse;

import java.util.UUID;

/**
 * Auth Service Interface - Defines authentication related business logic
 */
public interface AuthService {

    /**
     * Register a new user and create organization
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticate user and return tokens
     */
    AuthResponse login(LoginRequest request);

    /**
     * Refresh access token using refresh token
     */
    TokenResponse refreshToken(RefreshTokenRequest request);

    /**
     * Logout user (invalidate refresh tokens)
     */
    void logout(String refreshToken);

    /**
     * Verify email address
     */
    void verifyEmail(String token);

    /**
     * Get current authenticated user
     */
    UserResponse getCurrentUser(UUID userId);

    /**
     * Change user password
     */
    void changePassword(UUID userId, ChangePasswordRequest request);
}
