package com.opsmind.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_timeline")
@Data
@NoArgsConstructor
public class IncidentTimeline {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_id", nullable = false)
    private Long incidentId;

    @Column(nullable = false)
    private String eventType; // DECLARED, STATUS_CHANGE, ASSIGNED, RESOLVED, COMMENT_ADDED

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public IncidentTimeline(Long incidentId, String eventType, String description, String createdBy) {
        this.incidentId = incidentId;
        this.eventType = eventType;
        this.description = description;
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
    }
}
