package com.opsmind.controller;

import com.opsmind.repository.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/export")
public class ExportController {
    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;
    private final InfrastructureRepository infrastructureRepository;
    private final AuditLogRepository auditLogRepository;

    public ExportController(IncidentRepository incidentRepository,
                            AlertRepository alertRepository,
                            InfrastructureRepository infrastructureRepository,
                            AuditLogRepository auditLogRepository) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
        this.infrastructureRepository = infrastructureRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/{module}")
    public ResponseEntity<byte[]> exportToCsv(@PathVariable String module) {
        StringBuilder csv = new StringBuilder();
        String filename = "opsmind_" + module + "_export.csv";

        switch (module.toLowerCase()) {
            case "incidents":
                csv.append("ID,Title,Severity,Status,CreatedAt\n");
                incidentRepository.findAll().forEach(i -> 
                    csv.append(i.getId()).append(",").append(i.getTitle()).append(",")
                       .append(i.getSeverity()).append(",").append(i.getStatus()).append(",")
                       .append(i.getCreatedAt()).append("\n")
                );
                break;
            case "alerts":
                csv.append("ID,AlertName,Severity,Status,Timestamp\n");
                alertRepository.findAll().forEach(a -> 
                    csv.append(a.getId()).append(",").append(a.getAlertName()).append(",")
                       .append(a.getSeverity()).append(",").append(a.getStatus()).append(",")
                       .append(a.getTimestamp()).append("\n")
                );
                break;
            case "infrastructure":
                csv.append("ID,Name,Type,Status,HealthScore\n");
                infrastructureRepository.findAll().forEach(a -> 
                    csv.append(a.getId()).append(",").append(a.getName()).append(",")
                       .append(a.getType()).append(",").append(a.getStatus()).append(",")
                       .append(a.getHealthScore()).append("\n")
                );
                break;
            case "audit":
                csv.append("ID,Action,Module,User,Timestamp\n");
                auditLogRepository.findAll().forEach(l -> 
                    csv.append(l.getId()).append(",").append(l.getAction()).append(",")
                       .append(l.getModule()).append(",").append(l.getUserEmail()).append(",")
                       .append(l.getTimestamp()).append("\n")
                );
                break;
            default:
                return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString().getBytes());
    }
}
