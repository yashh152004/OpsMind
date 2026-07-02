package com.opsmind.controller;

import com.opsmind.model.Alert;
import com.opsmind.model.Incident;
import com.opsmind.repository.AlertRepository;
import com.opsmind.repository.IncidentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/simulator")
public class SimulatorController {

    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;
    private final com.opsmind.service.PlatformActivityService activityService;

    public SimulatorController(IncidentRepository incidentRepository, 
                               AlertRepository alertRepository,
                               com.opsmind.service.PlatformActivityService activityService) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
        this.activityService = activityService;
    }

    @PostMapping("/trigger")
    public ResponseEntity<Map<String, String>> triggerFailure(@RequestBody Map<String, String> body) {
        String type = body.getOrDefault("type", "generic");
        
        switch (type) {
            case "database_crash":
                createIncident("CRITICAL: Database Primary Node Unreachable", "P1", "database-core", "Connection timeout on port 3306. Pool exhaustion detected.");
                createAlert("DB_CONNECTION_FAILURE", "MySQL read/write operations failing at 98% rate.");
                activityService.logAction("DEMO_CRASH", "DATABASE", "system", "Simulated Database connection failure.");
                break;
            case "cpu_spike":
                createIncident("WARNING: CPU Utilization > 95% on auth-api", "P2", "auth-service", "Sustained high load on authentication nodes.");
                createAlert("NODE_RESOURCES_EXHAUSTED", "Pod 'auth-api-8f2k' throttling detected.");
                activityService.logAction("DEMO_SPIKE", "INFRASTRUCTURE", "system", "Simulated CPU utilization spike.");
                break;
            case "api_latency":
                createIncident("NOTICE: Checkout API P99 Latency > 2s", "P3", "checkout-service", "Anomaly detected in downstream payment gateway response times.");
                createAlert("LATENCY_THRESHOLD_EXCEEDED", "P99 latency has reached 2150ms in us-east-1.");
                activityService.logAction("DEMO_LATENCY", "SERVICES", "system", "Simulated API latency degradation.");
                break;
            case "security_threat":
                createIncident("CRITICAL: Multiple Failed Login Attempts on Root", "P1", "identity-service", "Brute force attack detected from IP 192.168.1.42. Source region: Romania.");
                createAlert("SECURITY_AUTH_FAILURE", "Authentication threshold exceeded for user 'admin'.");
                activityService.logAction("THREAT_DETECTED", "SECURITY", "system", "Brute force attack signature identified.");
                break;
            case "memory_leak":
                createIncident("WARNING: Memory Leak Pattern on orders-v2", "P2", "order-service", "Garbage collection frequency increasing. OOM imminent.");
                createAlert("NODE_MEM_EXHAUSTED", "JVM Heap utilization > 92% on shard-04.");
                activityService.logAction("PERFORMANCE_DEGRADED", "INFRASTRUCTURE", "system", "Memory leak detected in orders-v2 microservice.");
                break;
            default:
                createIncident("Demo Incident: System Heartbeat Anomaly", "P4", "system-monitor", "Triggered via demo simulator.");
                activityService.logAction("DEMO_EVENT", "SYSTEM", "system", "Manual heartbeat simulation triggered.");
        }

        return ResponseEntity.ok(Map.of("message", "Simulated failure injected into system. Check Dashboard."));
    }

    private void createIncident(String title, String severity, String service, String desc) {
        Incident incident = new Incident();
        incident.setTitle(title);
        incident.setSeverity(severity);
        
        // Map severity to priority
        String priority = switch (severity) {
            case "P1" -> "HIGHEST";
            case "P2" -> "HIGH";
            case "P3" -> "LOW";
            default -> "LOWEST";
        };
        incident.setPriority(priority);
        
        incident.setServiceName(service);
        incident.setDescription(desc);
        incident.setStatus("OPEN");
        incident.setCreatedAt(LocalDateTime.now());
        incidentRepository.save(incident);
    }

    private void createAlert(String name, String msg) {
        Alert alert = new Alert();
        alert.setAlertName(name);
        alert.setMessage(msg);
        alert.setSeverity("HIGH");
        alert.setStatus("TRIGGERED");
        alert.setSource("CloudWatch/Prometheus");
        alert.setTimestamp(LocalDateTime.now());
        alertRepository.save(alert);
    }
}
