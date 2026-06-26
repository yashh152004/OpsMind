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
                csv.append("ID,Title,Severity,Status,Service,CreatedAt\n");
                incidentRepository.findAll().forEach(i -> 
                    csv.append(i.getId()).append(",")
                       .append(escapeCsv(i.getTitle())).append(",")
                       .append(i.getSeverity()).append(",")
                       .append(i.getStatus()).append(",")
                       .append(escapeCsv(i.getServiceName())).append(",")
                       .append(i.getCreatedAt()).append("\n")
                );
                break;
            case "alerts":
                csv.append("ID,AlertName,Severity,Status,Source,Timestamp\n");
                alertRepository.findAll().forEach(a -> 
                    csv.append(a.getId()).append(",")
                       .append(escapeCsv(a.getAlertName())).append(",")
                       .append(a.getSeverity()).append(",")
                       .append(a.getStatus()).append(",")
                       .append(escapeCsv(a.getSource())).append(",")
                       .append(a.getTimestamp()).append("\n")
                );
                break;
            case "infrastructure":
                csv.append("ID,Name,Type,Status,HealthScore,Provider,Region\n");
                infrastructureRepository.findAll().forEach(a -> 
                    csv.append(a.getId()).append(",")
                       .append(escapeCsv(a.getName())).append(",")
                       .append(a.getType()).append(",")
                       .append(a.getStatus()).append(",")
                       .append(a.getHealthScore()).append(",")
                       .append(a.getProvider()).append(",")
                       .append(a.getRegion()).append("\n")
                );
                break;
            case "audit":
                csv.append("ID,Action,Module,UserEmail,Timestamp\n");
                auditLogRepository.findAll().forEach(l -> 
                    csv.append(l.getId()).append(",")
                       .append(escapeCsv(l.getAction())).append(",")
                       .append(escapeCsv(l.getModule())).append(",")
                       .append(escapeCsv(l.getUserEmail())).append(",")
                       .append(l.getTimestamp()).append("\n")
                );
                break;
            case "analytics":
                csv.append("Timestamp,Metric,Value,Unit\n");
                // Mocking for now as we don't have a giant history table yet, or just export system metrics
                csv.append("2026-06-26 10:00:00,CPU_USAGE,45.2,PERCENT\n");
                csv.append("2026-06-26 10:00:00,MEM_USAGE,8.2,GB\n");
                break;
            case "security":
                csv.append("ID,Context,Finding,Severity,Status\n");
                csv.append("1,Local-Host,Unpatched Kernel,HIGH,OPEN\n");
                csv.append("2,Internal-Network,Port 22 exposed,CRITICAL,RESOLVED\n");
                break;
            default:
                return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString().getBytes());
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
