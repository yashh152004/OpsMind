package com.opsmind.core.domain.repository;

import com.opsmind.core.domain.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * User Repository - Data access for User entities
 */
@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmailAndOrganizationId(String email, UUID organizationId);

    Optional<UserEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Page<UserEntity> findByOrganizationId(UUID organizationId, Pageable pageable);

    boolean existsByEmailAndOrganizationId(String email, UUID organizationId);

    long countByOrganizationId(UUID organizationId);
}
