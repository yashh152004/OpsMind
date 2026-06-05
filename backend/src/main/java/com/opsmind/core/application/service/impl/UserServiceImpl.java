package com.opsmind.core.application.service.impl;

import com.opsmind.core.adapter.dto.request.UpdateUserRequest;
import com.opsmind.core.adapter.dto.response.UserResponse;
import com.opsmind.core.application.service.UserService;
import com.opsmind.core.domain.entity.UserEntity;
import com.opsmind.core.domain.repository.UserRepository;
import com.opsmind.core.infrastructure.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * User Service Implementation
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID userId, UUID organizationId) {
        log.info("Fetching user: {} from organization: {}", userId, organizationId);

        UserEntity user = userRepository.findByIdAndOrganizationId(userId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        return mapToUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(UUID organizationId, Pageable pageable) {
        log.info("Fetching users for organization: {}", organizationId);

        return userRepository.findByOrganizationId(organizationId, pageable)
                .map(this::mapToUserResponse);
    }

    @Override
    public UserResponse updateUser(UUID userId, UUID organizationId, UpdateUserRequest request) {
        log.info("Updating user: {} in organization: {}", userId, organizationId);

        UserEntity user = userRepository.findByIdAndOrganizationId(userId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            user.setEmail(request.getEmail());
        }

        UserEntity updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", userId);

        return mapToUserResponse(updatedUser);
    }

    @Override
    public void deleteUser(UUID userId, UUID organizationId) {
        log.info("Deleting user: {} from organization: {}", userId, organizationId);

        UserEntity user = userRepository.findByIdAndOrganizationId(userId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        userRepository.delete(user);
        log.info("User deleted successfully: {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean userExists(UUID userId, UUID organizationId) {
        return userRepository.findByIdAndOrganizationId(userId, organizationId).isPresent();
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
}
