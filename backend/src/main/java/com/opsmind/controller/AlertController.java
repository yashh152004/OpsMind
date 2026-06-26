package com.opsmind.controller;

import com.opsmind.model.Alert;
import com.opsmind.repository.AlertRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/alerts")
public class AlertController {

    private final AlertRepository repository;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.opsmind.service.PlatformActivityService activityService;

    public AlertController(AlertRepository repository, 
                           SimpMessagingTemplate messagingTemplate,
                           com.opsmind.service.PlatformActivityService activityService) {
        this.repository = repository;
        this.messagingTemplate = messagingTemplate;
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts(@RequestParam(required = false) Long organizationId) {
        if (organizationId != null) {
            return ResponseEntity.ok(repository.findByOrganizationId(organizationId));
        }
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alert> getAlert(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<Alert> acknowledgeAlert(@PathVariable Long id) {
        return repository.findById(id).map(alert -> {
            alert.setStatus("ACKNOWLEDGED");
            Alert saved = repository.save(alert);
            
            activityService.logAction("ALERT_ACKNOWLEDGED", "ALERTS", "system", "Alert acknowledged: " + saved.getAlertName());
            messagingTemplate.convertAndSend("/topic/alerts", saved);
            
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Alert> resolveAlert(@PathVariable Long id) {
        return repository.findById(id).map(alert -> {
            alert.setStatus("RESOLVED");
            Alert saved = repository.save(alert);
            activityService.logAction("ALERT_RESOLVED", "ALERTS", "system", "Alert resolved: " + saved.getAlertName());
            messagingTemplate.convertAndSend("/topic/alerts", saved);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Alert> createAlert(@RequestBody Alert alert) {
        if (alert.getTimestamp() == null) {
            alert.setTimestamp(LocalDateTime.now());
        }
        if (alert.getStatus() == null) {
            alert.setStatus("TRIGGERED");
        }
        Alert saved = repository.save(alert);
        
        if ("CRITICAL".equals(saved.getSeverity())) {
            activityService.notify("Critical Telemetry Alert", "Active alert detected: " + saved.getAlertName(), "ERROR");
        }
        
        messagingTemplate.convertAndSend("/topic/alerts", saved);
        return ResponseEntity.ok(saved);
    }
}
