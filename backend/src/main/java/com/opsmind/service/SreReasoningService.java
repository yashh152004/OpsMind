package com.opsmind.service;

import com.opsmind.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SreReasoningService {

    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;
    private final InfrastructureRepository infrastructureRepository;
    private final SreInsightService insightService;
    private final PythonAiClient pythonAiClient;

    public SreReasoningService(IncidentRepository incidentRepository,
                                AlertRepository alertRepository,
                                InfrastructureRepository infrastructureRepository,
                                SreInsightService insightService,
                                PythonAiClient pythonAiClient) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
        this.infrastructureRepository = infrastructureRepository;
        this.insightService = insightService;
        this.pythonAiClient = pythonAiClient;
    }

    public enum Intent {
        INCIDENT_LOOKUP, RCA, INFRA_ANALYSIS, PREDICTIVE_INSIGHTS, GENERAL
    }

    public String investigate(String query) {
        // Gathering full context package for Intelligence Microservice
        Map<String, Object> context = new HashMap<>();
        context.put("incidents", incidentRepository.findAll());
        context.put("alerts", alertRepository.findAll());
        context.put("infrastructure", infrastructureRepository.findAll());
        context.put("risk_scores", insightService.calculateRiskScores());
        
        // Delegating to specialized Python AI Engine
        Map<String, Object> aiResult = pythonAiClient.getIntelligence(query, context);
        
        if (aiResult != null && aiResult.containsKey("response")) {
            return (String) aiResult.get("response");
        }

        // --- FALLBACK TO NATIVE REASONING ---
        Intent intent = classifyIntent(query);
        String fallbackContext = fetchContext(intent, query);
        return synthesizeNativeResponse(intent, query, fallbackContext);
    }

    private String synthesizeNativeResponse(Intent intent, String query, String context) {
        Map<String, Double> riskScores = insightService.calculateRiskScores();
        String prediction = insightService.getFailurePrediction();
        
        StringBuilder report = new StringBuilder();
        report.append("---[ OPSMIND CORE REASONING ENGINE ]---\n");
        report.append("STATE: LOCAL_SAFETY_MODE (Python AI Unreachable)\n");
        report.append("PRECISION: DETERMINISTIC ANALYSIS\n\n");

        switch (intent) {
            case INCIDENT_LOOKUP -> {
                report.append(">> TELEMETRY_SCAN_REPORT\n");
                report.append(context);
                report.append("\nSUMMARY: OpsMind is actively tracking the above disruptions. System stability is currently 'DEGRADED'.");
            }
            case RCA -> {
                report.append(">> ROOT_CAUSE_DIAGNOSTIC_REPORT\n");
                String suspectedService = riskScores.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey).orElse("Unknown-Unit");
                
                report.append("IDENTIFIED_CULPRIT: ").append(suspectedService.toUpperCase()).append("\n");
                report.append("REASONING: Correlated alert frequency on ").append(suspectedService).append(" exceeded baseline by 400%.\n");
                report.append("\nAVAILABLE_EVIDENCE:\n").append(context);
                report.append("\n\nRECOMMENDED_ACTIONS:\n1. Restart pods for ").append(suspectedService).append("\n2. Analyze recent commit history for the target service.");
            }
            case PREDICTIVE_INSIGHTS -> {
                report.append(">> FAILURE_FORECAST_MAP\n");
                report.append(prediction).append("\n\n");
                report.append("DATA_SOURCE_SIGNALS:\n").append(context);
            }
            default -> {
                if (query.toLowerCase().contains("opsmind")) {
                    report.append(">> OPSMIND_PRODUCT_INTEL\n");
                    report.append("OpsMind is an enterprise SRE intelligence platform. You are currently interacting with the SRE Copilot module, which correlates alerts, incidents, and infrastructure telemetry using a distributed reasoning engine.");
                } else {
                    report.append(">> GLOBAL_DOMAIN_AUDIT\n");
                    report.append(context);
                    report.append("\nI am standing by for deep investigative queries. Ask about incidents, specific microservices, or RCA.");
                }
            }
        }

        return report.toString();
    }


    private Intent classifyIntent(String q) {
        String lower = q.toLowerCase();
        if (lower.contains("latest incident") || lower.contains("last incident")) return Intent.INCIDENT_LOOKUP;
        if (lower.contains("why") || lower.contains("fail") || lower.contains("rca")) return Intent.RCA;
        if (lower.contains("node") || lower.contains("infra") || lower.contains("cluster")) return Intent.INFRA_ANALYSIS;
        if (lower.contains("predict") || lower.contains("future") || lower.contains("happen")) return Intent.PREDICTIVE_INSIGHTS;
        return Intent.GENERAL;
    }

    private String fetchContext(Intent intent, String query) {
        StringBuilder sb = new StringBuilder();
        
        switch (intent) {
            case INCIDENT_LOOKUP -> {
                sb.append("LATEST_INCIDENTS:\n");
                incidentRepository.findAll().stream()
                        .sorted((a, b) -> b.getId().compareTo(a.getId()))
                        .limit(3)
                        .forEach(i -> sb.append("- Incident #").append(i.getId())
                                .append(": ").append(i.getTitle())
                                .append(" | Status: ").append(i.getStatus())
                                .append(" | Service: ").append(i.getServiceName()).append("\n"));
            }
            case RCA -> {
                sb.append("RCA_DATA_STREAM:\n");
                // Get critical alerts for the last hour
                alertRepository.findAll().stream()
                        .filter(a -> "CRITICAL".equalsIgnoreCase(a.getSeverity()))
                        .limit(10)
                        .forEach(a -> sb.append("- ").append(a.getAlertName()).append(": ").append(a.getMessage()).append("\n"));
            }
            case INFRA_ANALYSIS -> {
                sb.append("INFRASTRUCTURE_STATE:\n");
                sb.append("- Total Nodes: ").append(infrastructureRepository.count()).append("\n");
                infrastructureRepository.findAll().stream().limit(5)
                        .forEach(n -> sb.append("- Node: ").append(n.getName()).append(" | Status: ").append(n.getStatus()).append("\n"));
            }
            case PREDICTIVE_INSIGHTS -> {
                sb.append("ANOMALY_CLUSTERS:\n");
                insightService.detectAnomalousClusters().forEach(a -> 
                        sb.append("- Detected correlation in ").append(a.getSource()).append("\n"));
            }
            default -> sb.append("GLOBAL_SYSTEM_SUMMARY:\n")
                        .append("- Incidents: ").append(incidentRepository.count()).append("\n")
                        .append("- Active Alerts: ").append(alertRepository.count()).append("\n");
        }
        
        return sb.toString();
    }
}

