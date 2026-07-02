package com.opsmind.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id")
    private Long organizationId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String severity; // P1, P2, P3, P4

    @Column(nullable = false)
    private String priority; // HIGHEST, HIGH, LOW, LOWEST

    @Column(nullable = false)
    private String status; // DRAFT, OPEN, INVESTIGATING, IDENTIFIED, MITIGATING, MONITORING, RESOLVED, CLOSED, ARCHIVED

    private String serviceName;
    private String environment; // PRODUCTION, STAGING, DEV
    private String cluster; // us-east-1, cluster-alpha, etc
    private String category; // INFRA, APP, SECURITY, NETWORK

    @Column(name = "owner_id")
    private String owner;
    
    private String assignedTo;
    private String assignedTeam;
    
    @Column(columnDefinition = "TEXT")
    private String impact;
    
    @Column(columnDefinition = "TEXT")
    private String rootCause;
    
    private String tags; // Comma separated tags
    
    private String resolution;
    
    private LocalDateTime detectedAt;
    private LocalDateTime estimatedResolutionTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getStatus() { return status; }
    public String getServiceName() { return serviceName; }
}
