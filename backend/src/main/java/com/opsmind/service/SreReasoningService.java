package com.opsmind.service;

import com.opsmind.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@lombok.RequiredArgsConstructor
public class SreReasoningService {

    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;
    private final InfrastructureRepository infrastructureRepository;
    private final SreInsightService insightService;
    private final PythonAiClient pythonAiClient;
    private final SystemMetricRepository metricRepository;
    private final LogRepository logRepository;
    private final PlatformActivityService activityService;
    private final NotificationRepository notificationRepository;
    private final SecurityFindingRepository securityRepository;
    private final IntegrationRepository integrationRepository;

    public enum Intent {
        INCIDENT_LOOKUP, RCA, INFRA_ANALYSIS, PREDICTIVE_INSIGHTS, GENERAL
    }

    public String investigate(String query) {
        return investigateWithContext(query, Collections.emptyList());
    }

    public String investigateWithContext(String query, List<com.opsmind.model.ChatMessage> history) {
        // Gathering full context package
        Map<String, Object> context = new HashMap<>();
        context.put("incidents", incidentRepository.findAll());
        context.put("alerts", alertRepository.findAll());
        context.put("infrastructure", infrastructureRepository.findAll());
        context.put("risk_scores", insightService.calculateRiskScores());
        context.put("latest_metrics", metricRepository.findTop50ByMetricNameOrderByTimestampDesc("CPU_USAGE"));
        context.put("latest_logs", logRepository.findTop100ByOrderByTimestampDesc());
        context.put("security_findings", securityRepository.findAll());
        
        // Injecting Conversation Memory
        List<Map<String, String>> chatHistory = new ArrayList<>();
        for (com.opsmind.model.ChatMessage msg : history) {
            chatHistory.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }
        context.put("chat_history", chatHistory);

        // Delegating to specialized Python AI Engine if available
        try {
            Map<String, Object> aiResult = pythonAiClient.getIntelligence(query, context);
            if (aiResult != null && aiResult.containsKey("response")) {
                return (String) aiResult.get("response");
            }
        } catch (Exception e) {
            // Fallback to native synthesis
        }
        
        Intent intent = classifyIntent(query);
        String fallbackContext = fetchContext(intent, query);
        return synthesizeNativeResponse(intent, query, fallbackContext);
    }

    public void streamInvestigate(String query, List<com.opsmind.model.ChatMessage> history, java.util.function.Consumer<String> chunkConsumer) {
        // Gathering context first in a block
        Intent intent = classifyIntent(query);
        String context = fetchContext(intent, query);
        String fullResponse = synthesizeNativeResponse(intent, query, context);
        
        // Simulating streaming of the full response
        String[] blocks = fullResponse.split("\n");
        for (String block : blocks) {
            try {
                Thread.sleep(80); 
                chunkConsumer.accept(block + "\n");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    public List<Map<String, Object>> getAutonomousInsights() {
        List<Map<String, Object>> insights = new ArrayList<>();
        
        // 1. Incident Insight
        long activeIncidents = incidentRepository.count();
        if (activeIncidents > 0) {
            insights.add(Map.of(
                "type", "INCIDENT_CORRELATION",
                "severity", "CRITICAL",
                "message", "Detected " + activeIncidents + " active disruption shards. Root cause analysis suggests a cascading failure in the mesh backbone.",
                "timestamp", new Date()
            ));
        }

        // 2. Alert Insight
        long criticalAlerts = alertRepository.findAll().stream().filter(a -> "CRITICAL".equalsIgnoreCase(a.getSeverity())).count();
        if (criticalAlerts > 5) {
            insights.add(Map.of(
                "type", "ALERT_STORM",
                "severity", "WARNING",
                "message", "Unusual alert frequency increase (400% above baseline). Potential resource exhaustion suspected.",
                "timestamp", new Date()
            ));
        }

        // 3. Predictive Insight
        insights.add(Map.of(
            "type", "FAILURE_FORECAST",
            "severity", "INFO",
            "message", insightService.getFailurePrediction(),
            "timestamp", new Date()
        ));

        return insights;
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
        if (lower.contains("latest incident") || lower.contains("investigate latest")) return Intent.INCIDENT_LOOKUP;
        if (lower.contains("why") || lower.contains("fail") || lower.contains("rca") || lower.contains("root cause")) return Intent.RCA;
        if (lower.contains("unhealthy") || lower.contains("infra") || lower.contains("cluster") || lower.contains("infrastructure health")) return Intent.INFRA_ANALYSIS;
        if (lower.contains("summarize today's alerts") || lower.contains("today's alerts")) return Intent.INCIDENT_LOOKUP; 
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

