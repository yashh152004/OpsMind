package com.opsmind.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "integrations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Integration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id")
    private Long organizationId;

    private String name; // Slack, PagerDuty, etc.
    private String type; // MESSAGING, TICKETING, MONITORING
    private String status; // ACTIVE, ERROR, INACTIVE
    
    @Column(columnDefinition = "TEXT")
    private String configuration; // JSON encrypted or masked credentials
    
    private LocalDateTime lastSync;
    private String health; // HEALTHY, DEGRADED, FAIL
    
    @PrePersist
    protected void onCreate() {
        if (status == null) status = "INACTIVE";
    }
}
