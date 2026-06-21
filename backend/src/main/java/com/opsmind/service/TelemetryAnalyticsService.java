package com.opsmind.service;

import com.opsmind.model.SystemMetric;
import com.opsmind.repository.LogRepository;
import com.opsmind.repository.SystemMetricRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TelemetryAnalyticsService {

    private final SystemMetricRepository metricRepository;
    private final LogRepository logRepository;

    public Map<String, Double> calculateRiskScores() {
        Map<String, Double> scores = new HashMap<>();
        
        // Calculate for Local-Host
        double cpuRisk = calculateAnomalousDeviation("CPU_USAGE");
        double memRisk = calculateAnomalousDeviation("MEMORY_USAGE");
        long errorCount = logRepository.findByLevelOrderByTimestampDesc("ERROR").size();
        
        // Complex Weighted Scoring (Enterprise Logic)
        double totalRisk = (cpuRisk * 0.3) + (memRisk * 0.4) + (Math.min(errorCount * 10, 30));
        scores.put("Local-Machine", Math.min(totalRisk, 100.0));
        
        return scores;
    }

    private double calculateAnomalousDeviation(String metricName) {
        List<SystemMetric> history = metricRepository.findTop50ByMetricNameOrderByTimestampDesc(metricName);
        if (history.size() < 10) return 0.0;

        double mean = history.stream().mapToDouble(SystemMetric::getMetricValue).average().orElse(0.0);
        double latest = history.get(0).getMetricValue();
        
        // Simple Z-score like deviation detection
        double deviation = Math.abs(latest - mean);
        return Math.min(deviation * 2, 100.0);
    }

    public String getFailurePrediction() {
        Map<String, Double> risk = calculateRiskScores();
        double localRisk = risk.getOrDefault("Local-Machine", 0.0);
        
        if (localRisk > 75.0) return "CRITICAL: High probability of service failure within 2 hours. Resource saturation detected.";
        if (localRisk > 40.0) return "WARNING: Stability degradation detected. Monitor connection pools.";
        return "STABLE: System operating within nominal operational baselines.";
    }
}
