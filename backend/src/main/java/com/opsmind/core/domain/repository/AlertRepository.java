package com.opsmind.core.domain.repository;

import com.opsmind.core.domain.entity.AlertEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<AlertEntity, UUID> {
    Page<AlertEntity> findByOrganizationId(UUID organizationId, Pageable pageable);
    List<AlertEntity> findByIncidentId(UUID incidentId);
    long countByOrganizationIdAndStatus(UUID organizationId, AlertEntity.AlertStatus status);
}
