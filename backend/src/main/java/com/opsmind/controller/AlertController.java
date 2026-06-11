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

    private final AlertRepository alertRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public AlertController(AlertRepository alertRepository, SimpMessagingTemplate messagingTemplate) {
        this.alertRepository = alertRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alert> getAlert(@PathVariable Long id) {
        return alertRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<Alert> acknowledgeAlert(@PathVariable Long id) {
        return alertRepository.findById(id).map(alert -> {
            alert.setStatus("ACKNOWLEDGED");
            Alert saved = alertRepository.save(alert);
            messagingTemplate.convertAndSend("/topic/alerts", saved);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Alert> resolveAlert(@PathVariable Long id) {
        return alertRepository.findById(id).map(alert -> {
            alert.setStatus("RESOLVED");
            Alert saved = alertRepository.save(alert);
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
        Alert saved = alertRepository.save(alert);
        messagingTemplate.convertAndSend("/topic/alerts", saved);
        return ResponseEntity.ok(saved);
    }
}
