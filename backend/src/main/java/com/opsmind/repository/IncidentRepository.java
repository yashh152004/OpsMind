package com.opsmind.repository;

import com.opsmind.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStatus(String status);
    List<Incident> findBySeverity(String severity);
    List<Incident> findByCreatedAtAfter(LocalDateTime date);
    List<Incident> findByOrganizationId(Long organizationId);
    long countByStatus(String status);
}
