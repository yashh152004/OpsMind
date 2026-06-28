package com.opsmind.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_timeline")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentTimeline {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_id")
    private Long incidentId;

    @Column(nullable = false)
    private String eventType; // STATUS_CHANGE, COMMENT, ALERT_LINKED, RCA_GENERATED

    @Column(columnDefinition = "TEXT")
    private String content;

    private String operator; // User who triggered the event

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
