package com.opsmind.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getTrends() {
        Map<String, Object> response = new HashMap<>();

        // MTTR Trend data
        List<Map<String, Object>> mttrTrend = new ArrayList<>();
        mttrTrend.add(createDatePoint("Jan", 45));
        mttrTrend.add(createDatePoint("Feb", 38));
        mttrTrend.add(createDatePoint("Mar", 42));
        mttrTrend.add(createDatePoint("Apr", 30));
        mttrTrend.add(createDatePoint("May", 24));
        response.put("mttrTrend", mttrTrend);

        // Service Health data
        List<Map<String, Object>> serviceHealth = new ArrayList<>();
        serviceHealth.add(createHealthPoint("Auth Service", 99.98));
        serviceHealth.add(createHealthPoint("Checkout API", 99.95));
        serviceHealth.add(createHealthPoint("Inventory DB", 99.82));
        serviceHealth.add(createHealthPoint("Legacy Payment", 96.40));
        response.put("serviceHealth", serviceHealth);

        // Team Performance
        List<Map<String, Object>> teamPerformance = new ArrayList<>();
        teamPerformance.add(createTeamPoint("SRE Core", 124, "18m"));
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
