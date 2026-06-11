package com.opsmind.repository;

import com.opsmind.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByStatus(String status);
    List<Alert> findBySeverity(String severity);
    long countBySeverityAndStatusNot(String severity, String status);
}
