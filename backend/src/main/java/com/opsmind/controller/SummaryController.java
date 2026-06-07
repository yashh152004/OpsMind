package com.opsmind.controller;

import com.opsmind.repository.AlertRepository;
import com.opsmind.repository.IncidentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/summary")
public class SummaryController {

    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;

    public SummaryController(IncidentRepository incidentRepository, AlertRepository alertRepository) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long activeIncidents = incidentRepository.count(); // Count all for now
        long criticalAlerts = alertRepository.count(); // Simulated
        
        stats.put("uptime", "99.98%");
        stats.put("activeIncidents", activeIncidents);
        stats.put("criticalAlerts", criticalAlerts);
        stats.put("mttr", "24m");
        stats.put("slaStatus", "HEALTHY");
        
        // Mock distribution for now - but returning from API
        stats.put("severityDistribution", List.of(
            Map.of("name", "P1", "count", 4),
            Map.of("name", "P2", "count", 12),
            Map.of("name", "P3", "count", 24)
        ));

        // Series data for sparklines
        stats.put("performanceSeries", List.of(
            Map.of("time", "00:00", "value", 45),
            Map.of("time", "04:00", "value", 52),
            Map.of("time", "08:00", "value", 38),
            Map.of("time", "12:00", "value", 65),
            Map.of("time", "16:00", "value", 48),
            Map.of("time", "20:00", "value", 58)
        ));
        
        return ResponseEntity.ok(stats);
    }
}
