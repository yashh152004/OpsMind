package com.opsmind.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AiInsightController {

    @GetMapping("/insights")
    public ResponseEntity<List<Map<String, Object>>> getAiInsights() {
        return ResponseEntity.ok(List.of(
            Map.of(
                "type", "Critical",
                "title", "Predictive Capacity Exhaustion",
                "desc", "Storage volume 'prod-data-01' projected to reach 95% threshold in 4.2 hours.",
                "impact", "Potential write failure for transaction-service.",
                "recommendation", "Provision 500GB additional EBS or execute log-purge script #42.",
                "status", "ACTIVE",
                "color", "text-red-500",
                "bg", "bg-red-500/10"
            ),
            Map.of(
                "type", "Warning",
                "title", "Anomalous GC Behavior",
                "desc", "Garbage collection cycles in auth-backend increased by 400% in the last 15 mins.",
                "impact", "Minor latency degradation (p99 +20ms).",
                "recommendation", "Review heap allocation or check for newly introduced memory leak in PR-214.",
                "status", "ANALYZING",
                "color", "text-orange-500",
                "bg", "bg-orange-500/10"
            ),
            Map.of(
                "type", "Optimization",
                "title", "Zombie Node Detection",
                "desc", "3 instances in cluster-alpha have had 0 requests for 72 consecutive hours.",
                "impact", "Financial inefficiency: ~$140/mo wasted spend.",
                "recommendation", "Scale down cluster-alpha by 3 nodes.",
                "status", "PENDING",
                "color", "text-blue-500",
                "bg", "bg-blue-500/10"
            )
        ));
    }
}
