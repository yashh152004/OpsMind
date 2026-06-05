package com.opsmind.core.application.service.impl;

import com.opsmind.core.adapter.dto.request.*;
import com.opsmind.core.adapter.dto.response.AuthResponse;
import com.opsmind.core.adapter.dto.response.TokenResponse;
import com.opsmind.core.adapter.dto.response.UserResponse;
import com.opsmind.core.application.service.AuthService;
import com.opsmind.core.domain.entity.OrganizationEntity;
import com.opsmind.core.domain.entity.UserEntity;
import com.opsmind.core.domain.repository.OrganizationRepository;
import com.opsmind.core.domain.repository.UserRepository;
import com.opsmind.core.infrastructure.exception.ApplicationException;
import com.opsmind.core.infrastructure.exception.ResourceNotFoundException;
import com.opsmind.core.infrastructure.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Auth Service Implementation
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        // Validate password confirmation
        if (!request.isPasswordConfirmed()) {
            throw new ApplicationException(
                    "INVALID_PASSWORD_CONFIRMATION",
                    HttpStatus.BAD_REQUEST,
                    "Passwords do not match");
        }

        // Create organization with slug from name
        String slug = createSlugFromName(request.getOrganizationName());
        if (organizationRepository.existsBySlug(slug)) {
            throw new ApplicationException(
                    "ORGANIZATION_SLUG_EXISTS",
                    HttpStatus.BAD_REQUEST,
                    "Organization with this name already exists");
        }

        OrganizationEntity organization = OrganizationEntity.builder()
                .name(request.getOrganizationName())
                .slug(slug)
                .plan("FREE")
                .build();

        OrganizationEntity savedOrganization = organizationRepository.save(organization);
        log.info("Organization created with ID: {}", savedOrganization.getId());

        // Create user
        if (userRepository.existsByEmailAndOrganizationId(request.getEmail(), savedOrganization.getId())) {
            throw new ApplicationException(
                    "USER_ALREADY_EXISTS",
                    HttpStatus.BAD_REQUEST,
                    "User with this email already exists in this organization");
        }

        UserEntity user = UserEntity.builder()
                .organizationId(savedOrganization.getId())
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserEntity.UserRole.ADMIN) // First user is admin
                .status(UserEntity.UserStatus.ACTIVE)
                .emailVerified(true) // Auto-verify for now
                .build();

        UserEntity savedUser = userRepository.save(user);
        log.info("User created with ID: {}", savedUser.getId());

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(savedUser.getId().toString());
        String refreshToken = tokenProvider.generateRefreshToken(savedUser.getId().toString());

        // Map to response
        UserResponse userResponse = mapToUserResponse(savedUser);
        return AuthResponse.of(userResponse, accessToken, refreshToken, 15 * 60L);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for user with email: {}", request.getEmail());

        // Find organization
        OrganizationEntity organization = organizationRepository.findBySlug(request.getOrganizationIdentifier())
                .or(() -> {
                    try {
                        UUID orgId = UUID.fromString(request.getOrganizationIdentifier());
                        return organizationRepository.findById(orgId);
                    } catch (IllegalArgumentException e) {
                        return java.util.Optional.empty();
                    }
                })
                .orElseThrow(() -> {
                    log.warn("Organization not found: {}", request.getOrganizationIdentifier());
                    return new ResourceNotFoundException("Organization", request.getOrganizationIdentifier());
                });

        // Find user
        UserEntity user = userRepository.findByEmailAndOrganizationId(request.getEmail(), organization.getId())
                .orElseThrow(() -> {
                    log.warn("User not found: {} in organization: {}", request.getEmail(), organization.getId());
                    return new ApplicationException(
                            "INVALID_CREDENTIALS",
                            HttpStatus.UNAUTHORIZED,
                            "Invalid email or password");
                });

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            log.warn("Invalid password for user: {}", request.getEmail());
            throw new ApplicationException(
                    "INVALID_CREDENTIALS",
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password");
        }

        // Update last login
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Generate tokens
        String accessToken = tokenProvider.generateAccessToken(user.getId().toString());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId().toString());

        log.info("Login successful for user: {}", request.getEmail());

        // Map to response
        UserResponse userResponse = mapToUserResponse(user);
        return AuthResponse.of(userResponse, accessToken, refreshToken, 15 * 60L);
    }

    @Override
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        log.info("Refreshing token");

        // Validate refresh token
        if (!tokenProvider.validateToken(request.getRefreshToken())) {
            throw new ApplicationException(
                    "INVALID_REFRESH_TOKEN",
                    HttpStatus.UNAUTHORIZED,
                    "Refresh token is invalid or expired");
        }

        // Extract user ID from token
        String userId = tokenProvider.getUserIdFromJWT(request.getRefreshToken());

        // Generate new access token
        String accessToken = tokenProvider.generateAccessToken(userId);
        String newRefreshToken = tokenProvider.generateRefreshToken(userId);

        return TokenResponse.of(accessToken, newRefreshToken, 15 * 60L);
    }

    @Override
    public void logout(String refreshToken) {
        log.info("User logout");
        // In a real implementation, add token to blacklist or use Redis for token
        // invalidation
    }

    @Override
    public void verifyEmail(String token) {
        log.info("Verifying email with token");
        // Implement email verification logic
    }

    @Override
    public UserResponse getCurrentUser(UUID userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
        return mapToUserResponse(user);
    }

    @Override
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        log.info("Changing password for user: {}", userId);

        // Validate new password confirmation
        if (!request.isNewPasswordConfirmed()) {
            throw new ApplicationException(
                    "INVALID_PASSWORD_CONFIRMATION",
                    HttpStatus.BAD_REQUEST,
                    "New passwords do not match");
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ApplicationException(
                    "INVALID_CURRENT_PASSWORD",
                    HttpStatus.BAD_REQUEST,
                    "Current password is incorrect");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", userId);
    }

    private UserResponse mapToUserResponse(UserEntity user) {
        return UserResponse.builder()
                .id(user.getId())
                .organizationId(user.getOrganizationId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().toString())
                .status(user.getStatus().toString())
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt().toString())
                .updatedAt(user.getUpdatedAt().toString())
                .build();
    }

    private String createSlugFromName(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
}
