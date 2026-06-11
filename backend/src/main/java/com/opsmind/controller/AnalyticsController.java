package com.opsmind.controller;

import com.opsmind.repository.AlertRepository;
import com.opsmind.repository.IncidentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;

    public AnalyticsController(IncidentRepository incidentRepository, AlertRepository alertRepository) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
    }

    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getTrends() {
        Map<String, Object> response = new HashMap<>();

        // Incident counts by month (Simulated trend based on current DB count)
        long count = incidentRepository.count();
        List<Map<String, Object>> mttrTrend = new ArrayList<>();
        mttrTrend.add(createDatePoint("Jan", 45));
        mttrTrend.add(createDatePoint("Feb", 38));
        mttrTrend.add(createDatePoint("Mar", (int)(count + 40)));
        mttrTrend.add(createDatePoint("Apr", (int)(count + 20)));
        mttrTrend.add(createDatePoint("May", 24));
        response.put("mttrTrend", mttrTrend);

        // Service Health based on current alerts
        long alertCount = alertRepository.count();
        double baseHealth = 99.9;
        double currentHealth = Math.max(95.0, baseHealth - (alertCount * 0.1));

        List<Map<String, Object>> serviceHealth = new ArrayList<>();
        serviceHealth.add(createHealthPoint("Auth Service", 99.98));
        serviceHealth.add(createHealthPoint("Checkout API", currentHealth));
        serviceHealth.add(createHealthPoint("Inventory DB", 99.82));
        serviceHealth.add(createHealthPoint("Legacy Payment", 96.40));
        response.put("serviceHealth", serviceHealth);

        // Team Performance
        List<Map<String, Object>> teamPerformance = new ArrayList<>();
        teamPerformance.add(createTeamPoint("SRE Core", (int)(count + 120), "18m"));
        teamPerformance.add(createTeamPoint("DevOps North", 98, "24m"));
        teamPerformance.add(createTeamPoint("Platform Unit", 76, "12m"));
        response.put("teamPerformance", teamPerformance);

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> createDatePoint(String month, int time) {
        Map<String, Object> point = new HashMap<>();
        point.put("month", month);
        point.put("time", time);
        return point;
    }

    private Map<String, Object> createHealthPoint(String name, double val) {
        Map<String, Object> point = new HashMap<>();
        point.put("name", name);
        point.put("value", val);
        return point;
    }

    private Map<String, Object> createTeamPoint(String name, int resolved, String avg) {
        Map<String, Object> point = new HashMap<>();
        point.put("team", name);
        point.put("resolved", resolved);
        point.put("avgTime", avg);
        return point;
    }
}
