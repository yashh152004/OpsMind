package com.opsmind.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getAnalyticalTrends() {
        return ResponseEntity.ok(Map.of(
            "mttrTrend", List.of(
                Map.of("month", "Jan", "time", 45),
                Map.of("month", "Feb", "time", 38),
                Map.of("month", "Mar", "time", 42),
                Map.of("month", "Apr", "time", 30),
                Map.of("month", "May", "time", 24),
                Map.of("month", "Jun", "time", 18)
            ),
            "serviceHealth", List.of(
                Map.of("name", "Auth Service", "value", 99.98),
                Map.of("name", "Payments API", "value", 99.95),
                Map.of("name", "Gateway", "value", 100.00),
                Map.of("name", "Search Index", "value", 98.42)
            ),
            "teamPerformance", List.of(
                Map.of("team", "Platform Ops", "resolved", 42, "avgTime", "12m"),
                Map.of("team", "Engineering", "resolved", 28, "avgTime", "45m"),
                Map.of("team", "Security", "resolved", 31, "avgTime", "24m")
            )
        ));
    }
}
