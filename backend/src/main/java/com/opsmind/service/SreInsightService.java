package com.opsmind.service;

import com.opsmind.model.*;
import com.opsmind.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * OpsMind Machine Learning & Statistical Insight Engine (AI V2)
 * Implements Step 6: Anomaly Detection, Risk Scoring, and Failure Prediction.
 */
@Service
public class SreInsightService {

    private final AlertRepository alertRepository;
    private final IncidentRepository incidentRepository;
    private final InfrastructureRepository infrastructureRepository;
    private final SystemMetricRepository metricRepository;
    private final LogRepository logRepository;

    public SreInsightService(AlertRepository alertRepository, 
                             IncidentRepository incidentRepository,
                             InfrastructureRepository infrastructureRepository,
                             SystemMetricRepository metricRepository,
                             LogRepository logRepository) {
        this.alertRepository = alertRepository;
        this.incidentRepository = incidentRepository;
        this.infrastructureRepository = infrastructureRepository;
        this.metricRepository = metricRepository;
        this.logRepository = logRepository;
    }

    /**
     * Anomaly Detection: Groups alerts that share high-frequency signatures.
     */
    public List<Alert> detectAnomalousClusters() {
        List<Alert> recentAlerts = alertRepository.findAll().stream()
                .filter(a -> a.getTimestamp() != null && a.getTimestamp().isAfter(LocalDateTime.now().minusHours(4)))
                .toList();

        Map<String, Long> groups = recentAlerts.stream()
                .collect(Collectors.groupingBy(Alert::getSource, Collectors.counting()));

        return recentAlerts.stream()
                .filter(a -> groups.getOrDefault(a.getSource(), 0L) > 3)
                .collect(Collectors.toList());
    }

    /**
     * Calculates Real-Time Risk Score (0-100) using Live Telemetry.
     */
    public Map<String, Double> calculateRiskScores() {
        Map<String, Double> scores = new HashMap<>();
        
        // 1. Analyze Core System Metrics (Local Host)
        double cpuRisk = calculateMetricDeviation("CPU_USAGE");
        double memRisk = calculateMetricDeviation("MEMORY_USAGE");
        long errorLogCount = logRepository.findByLevelOrderByTimestampDesc("ERROR").stream()
                .filter(l -> l.getTimestamp().isAfter(LocalDateTime.now().minusHours(1)))
                .count();

        double localHostScore = (cpuRisk * 0.4) + (memRisk * 0.4) + (Math.min(errorLogCount * 15, 20));
        scores.put("Local-Machine", Math.min(localHostScore, 100.0));

        // 2. Correlation with existing incidents
        incidentRepository.findAll().stream()
                .filter(i -> !"RESOLVED".equals(i.getStatus()))
                .forEach(i -> {
                    scores.put(i.getServiceName(), scores.getOrDefault(i.getServiceName(), 20.0) + 30.0);
                });
        
        return scores;
    }

    private double calculateMetricDeviation(String metricName) {
        List<SystemMetric> history = metricRepository.findTop50ByMetricNameOrderByTimestampDesc(metricName);
        if (history.size() < 5) return 0.0;
        double mean = history.stream().mapToDouble(SystemMetric::getMetricValue).average().orElse(0.0);
        double latest = history.get(0).getMetricValue();
        return Math.min(Math.abs(latest - mean) * 2, 100.0);
    }

    public String getFailurePrediction() {
        Map<String, Double> risk = calculateRiskScores();
        double maxRisk = risk.values().stream().max(Double::compare).orElse(0.0);
        
        if (maxRisk > 80.0) return "CRITICAL: High probability of service failure. Resource saturation or error clustering detected on Local-Machine.";
        if (maxRisk > 50.0) return "WARNING: System stability is degrading. Increasing trend in error logs detected.";
        return "STABLE: System operating within normal operational parameters.";
    }
}
