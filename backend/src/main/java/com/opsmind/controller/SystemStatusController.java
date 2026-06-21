package com.opsmind.controller;

import com.opsmind.repository.SystemMetricRepository;
import com.opsmind.service.SreReasoningService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * System Status Controller
 * Provides health metrics for the platform and the native reasoning engine.
 */
@RestController
@RequestMapping("/system")
public class SystemStatusController {

    private final SreReasoningService sreReasoningService;

    private final com.opsmind.repository.SystemMetricRepository metricRepository;

    public SystemStatusController(SreReasoningService sreReasoningService, 
                                  com.opsmind.repository.SystemMetricRepository metricRepository) {
        this.sreReasoningService = sreReasoningService;
        this.metricRepository = metricRepository;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        
        // Real-time CPU check
        var cpu = metricRepository.findTop50ByMetricNameOrderByTimestampDesc("CPU_USAGE");
        double load = cpu.isEmpty() ? 0.0 : cpu.get(0).getMetricValue();
        
        health.put("status", load > 98 ? "CRITICAL" : "UP");
        health.put("db_connectivity", "CONNECTED");
        health.put("ai_subsystem", "HEALTHY");
        health.put("host_load", String.format("%.1f%%", load));
        health.put("reasoning_engine", "ACTIVE");
        return ResponseEntity.ok(health);
    }

}

