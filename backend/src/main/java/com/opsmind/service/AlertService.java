package com.opsmind.service;

import com.opsmind.model.Alert;
import com.opsmind.model.Incident;
import com.opsmind.model.Notification;
import com.opsmind.repository.AlertRepository;
import com.opsmind.repository.IncidentRepository;
import com.opsmind.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final IncidentRepository incidentRepository;
    private final NotificationRepository notificationRepository;

    public void evaluateMetric(String host, String metricName, Double value, Double threshold, String severity) {
        if (value > threshold) {
            String alertName = host + "_" + metricName + "_EXCEEDED";
            String message = String.format("Metric %s on %s is %.2f, exceeding threshold of %.2f", metricName, host, value, threshold);
            
            // Check if alert already exists and is triggered to avoid spam
            // For simplicity, we just trigger a new one if it's critical
            triggerAlert(alertName, message, severity, host);
        }
    }

    public void triggerAlert(String name, String message, String severity, String source) {
        log.info("Triggering Alert: {} | Severity: {}", name, severity);
        
        Alert alert = Alert.builder()
                .alertName(name)
                .message(message)
                .severity(severity)
                .source(source)
                .status("TRIGGERED")
                .timestamp(LocalDateTime.now())
                .build();
        
        alertRepository.save(alert);
        
        // Create Notification
        Notification notification = new Notification();
        notification.setTitle("Alert Triggered: " + name);
        notification.setMessage(message);
        notification.setSeverity(severity);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        notificationRepository.save(notification);

        // Incident Automation: If severity is CRITICAL, create an incident automatically
        if ("CRITICAL".equals(severity)) {
            createIncidentFromAlert(alert);
        }
    }

    private void createIncidentFromAlert(Alert alert) {
        log.info("Auto-creating incident from critical alert: {}", alert.getAlertName());
        
        Incident incident = new Incident();
        incident.setTitle("INCIDENT: " + alert.getAlertName());
        incident.setDescription("Automatically created due to critical alert: " + alert.getMessage());
        incident.setSeverity("P1");
        incident.setStatus("OPEN");
        incident.setServiceName(alert.getSource());
        incident.setCreatedAt(LocalDateTime.now());
        
        incidentRepository.save(incident);
    }
}
