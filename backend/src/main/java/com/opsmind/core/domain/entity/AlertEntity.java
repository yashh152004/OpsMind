package com.opsmind.core.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Alert Entity - Represents a monitoring alert
 */
@Entity
@Table(name = "alerts", indexes = {
        @Index(columnList = "organization_id"),
        @Index(columnList = "status"),
        @Index(columnList = "severity"),
        @Index(columnList = "incident_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "incident_id")
    private UUID incidentId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AlertSeverity severity;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AlertStatus status = AlertStatus.TRIGGERED;

    @Column(name = "source", length = 100)
    private String source; // e.g., Prometheus, CloudWatch, Datadog

    @Column(name = "external_id", length = 255)
    private String externalId; // ID in the source system

    @Column(columnDefinition = "jsonb", name = "labels")
    @Builder.Default
    private String labels = "{}";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    public enum AlertSeverity {
        CRITICAL,
        ERROR,
        WARNING,
        INFO
    }

    public enum AlertStatus {
        TRIGGERED,
        ACKNOWLEDGED,
        RESOLVED,
        SUPPRESSED
    }
}
