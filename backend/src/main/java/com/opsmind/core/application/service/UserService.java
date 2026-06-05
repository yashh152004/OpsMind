package com.opsmind.core.application.service;

import com.opsmind.core.adapter.dto.request.UpdateUserRequest;
import com.opsmind.core.adapter.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * User Service Interface - Defines user management business logic
 */
public interface UserService {

    /**
     * Get user by ID within an organization
     */
    UserResponse getUserById(UUID userId, UUID organizationId);

    /**
     * Get all users for an organization
     */
    Page<UserResponse> getUsers(UUID organizationId, Pageable pageable);

    /**
     * Update user information
     */
    UserResponse updateUser(UUID userId, UUID organizationId, UpdateUserRequest request);

    /**
     * Delete a user
     */
    void deleteUser(UUID userId, UUID organizationId);

    /**
     * Check if user exists
     */
    boolean userExists(UUID userId, UUID organizationId);
}
