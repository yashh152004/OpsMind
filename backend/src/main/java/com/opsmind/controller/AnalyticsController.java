package com.opsmind.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    @GetMapping("/incidents/metrics")
    public ResponseEntity<Map<String, Object>> getIncidentMetrics() {
        return ResponseEntity.ok(Map.of(
            "sla", 99.94,
            "mttr", "24m 12s",
            "prevented", 142
        ));
    }

    @GetMapping("/incidents/trends")
    public ResponseEntity<List<Map<String, Object>>> getIncidentTrends() {
        return ResponseEntity.ok(List.of(
            Map.of("month", "Jan", "time", 45),
            Map.of("month", "Feb", "time", 38),
            Map.of("month", "Mar", "time", 42),
            Map.of("month", "Apr", "time", 30),
            Map.of("month", "May", "time", 24),
            Map.of("month", "Jun", "time", 18)
        ));
    }
}
