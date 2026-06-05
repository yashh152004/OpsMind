package com.opsmind.core.domain.repository;

import com.opsmind.core.domain.entity.OrganizationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Organization Repository - Data access for Organization entities
 */
@Repository
public interface OrganizationRepository extends JpaRepository<OrganizationEntity, UUID> {

    Optional<OrganizationEntity> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Optional<OrganizationEntity> findByName(String name);
}
