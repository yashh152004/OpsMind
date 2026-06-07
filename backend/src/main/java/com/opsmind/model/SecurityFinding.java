package com.opsmind.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "security_findings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityFinding {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String severity; // HIGH, MEDIUM, LOW
    private String category; // VULNERABILITY, COMPLIANCE, IAM
    private String status; // OPEN, REMEDIATED
    private String resourceId;
    private LocalDateTime discoveredAt;

    @PrePersist
    protected void onCreate() {
        discoveredAt = LocalDateTime.now();
    }
}
