package com.opsmind.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;
    private String module;
    private String userEmail;
    private String details;
    private LocalDateTime timestamp;

    public AuditLog() {}

    public AuditLog(String action, String module, String userEmail, String details) {
        this.action = action;
        this.module = module;
        this.userEmail = userEmail;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }
}
