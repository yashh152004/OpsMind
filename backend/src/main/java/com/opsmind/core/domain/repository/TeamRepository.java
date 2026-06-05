package com.opsmind.core.domain.repository;

import com.opsmind.core.domain.entity.TeamEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Team Repository - Data access for Team entities
 */
@Repository
public interface TeamRepository extends JpaRepository<TeamEntity, UUID> {

    Optional<TeamEntity> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Page<TeamEntity> findByOrganizationId(UUID organizationId, Pageable pageable);

    boolean existsByNameAndOrganizationId(String name, UUID organizationId);

    Optional<TeamEntity> findByNameAndOrganizationId(String name, UUID organizationId);
}
