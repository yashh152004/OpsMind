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
    List<Incident> findByOrganizationId(Long organizationId, org.springframework.data.domain.Pageable pageable);
    List<Incident> findByOrganizationId(Long organizationId);
    long countByStatus(String status);
    
    @org.springframework.data.jpa.repository.Query("SELECT i FROM Incident i WHERE " +
           "(LOWER(i.title) LIKE LOWER(concat('%', :query, '%')) OR " +
           "LOWER(i.serviceName) LIKE LOWER(concat('%', :query, '%')) OR " +
           "LOWER(i.cluster) LIKE LOWER(concat('%', :query, '%'))) AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:severity IS NULL OR i.severity = :severity)")
    org.springframework.data.domain.Page<Incident> advancedSearch(
            String query, String status, String severity, org.springframework.data.domain.Pageable pageable);
}
