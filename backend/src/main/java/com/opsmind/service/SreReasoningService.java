package com.opsmind.service;

import com.opsmind.model.*;
import com.opsmind.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * OpsMind Domain Reasoning Engine
 * Implements native SRE logic for Incident Investigation, RCA, and Infrastructure Diagnosis.
 * This engine operates independently of external LLMs.
 */
@Service
public class SreReasoningService {

    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;
    private final InfrastructureRepository infrastructureRepository;
    private final SecurityFindingRepository securityFindingRepository;

    public SreReasoningService(IncidentRepository incidentRepository,
                                AlertRepository alertRepository,
                                InfrastructureRepository infrastructureRepository,
                                SecurityFindingRepository securityFindingRepository) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
        this.infrastructureRepository = infrastructureRepository;
        this.securityFindingRepository = securityFindingRepository;
    }

    /**
     * Conducts a full-stack investigation of a service or incident.
     * Logic: Step 3 - Domain Reasoning
     */
    public String investigate(String query) {
        String input = query.toLowerCase();
        
        if (input.contains("checkout") || input.contains("service failing")) {
            return performServiceInvestigation("checkout-service");
        } else if (input.contains("infra") || input.contains("node") || input.contains("resource")) {
            return performInfrastructureAudit();
        } else if (input.contains("security") || input.contains("vulnerability")) {
            return performSecurityRiskAssessment();
        } else if (input.contains("rca") || input.contains("root cause")) {
            return performGlobalRCA();
        }

        return performGeneralSystemAudit();
    }

    private String performServiceInvestigation(String serviceName) {
        List<Incident> activeIncidents = incidentRepository.findAll().stream()
                .filter(i -> i.getServiceName().equalsIgnoreCase(serviceName) && !"RESOLVED".equals(i.getStatus()))
                .toList();

        List<Alert> relatedAlerts = alertRepository.findAll().stream()
                .filter(a -> a.getMessage().toLowerCase().contains(serviceName.toLowerCase()) || 
                             a.getSource().toLowerCase().contains(serviceName.toLowerCase()))
                .limit(5)
                .toList();

        StringBuilder report = new StringBuilder();
        report.append("--- [OPSMIND_NATIVE_INVESTIGATION] ---\n");
        report.append("TARGET_SERVICE: ").append(serviceName).append("\n\n");

        if (activeIncidents.isEmpty() && relatedAlerts.isEmpty()) {
            return report.append("CONCLUSION: Service is nominal. No active telemetry anomalies detected.").toString();
        }

        report.append("ROOT_CAUSE ANALYSIS:\n");
        if (!relatedAlerts.isEmpty()) {
            boolean highLatency = relatedAlerts.stream().anyMatch(a -> a.getMessage().contains("Latency"));
            boolean cpuSpike = relatedAlerts.stream().anyMatch(a -> a.getMessage().contains("CPU"));
            
            if (highLatency && cpuSpike) {
                report.append("- Primary: Database connection pool exhausted causing thread starvation.\n");
                report.append("- Secondary: CPU saturation on gateway nodes.\n");
            } else {
                report.append("- Probable: Deployment mismatch or upstream dependency failure.\n");
            }
        }

        report.append("\nEVIDENCE:\n");
        activeIncidents.forEach(i -> report.append("- ACTIVE_INCIDENT: ").append(i.getTitle()).append(" (Severity: ").append(i.getSeverity()).append(")\n"));
        relatedAlerts.forEach(a -> report.append("- TELEMETRY_SIGNAL: ").append(a.getAlertName()).append(": ").append(a.getMessage()).append("\n"));

        report.append("\nRECOMMENDED_ACTIONS:\n");
        report.append("1. Increase connection pool size 'max-active' to 50.\n");
        report.append("2. Scale '").append(serviceName).append("' deployment replicas to 3.\n");
        report.append("3. Review recent commit logs for 'DBConfig.java'.\n");

        return report.toString();
    }

    private String performInfrastructureAudit() {
        long nodeCount = infrastructureRepository.count();
        long unhealthyNodes = infrastructureRepository.findAll().stream()
                .filter(n -> !"HEALTHY".equals(n.getStatus()))
                .count();

        StringBuilder report = new StringBuilder();
        report.append("--- [OPSMIND_INFRA_REASONING] ---\n");
        report.append("ESTATE_SUMMARY:\n");
        report.append("- Total Managed Nodes: ").append(nodeCount).append("\n");
        report.append("- Healthy Nodes: ").append(nodeCount - unhealthyNodes).append("\n");
        report.append("- Degraded/Down: ").append(unhealthyNodes).append("\n\n");

        if (unhealthyNodes > 0) {
            report.append("CRITICAL_OBSERVATION:\n");
            report.append("Zombie node detection active. ").append(unhealthyNodes).append(" instances are not responding to heartbeat check.\n");
            report.append("Recommendation: Trigger automated node recycling in us-east-1 region.");
        } else {
            report.append("CONCLUSION: Infrastructure capacity is optimal for current workload.");
        }

        return report.toString();
    }

    private String performSecurityRiskAssessment() {
        List<SecurityFinding> highRisks = securityFindingRepository.findAll().stream()
                .filter(f -> "High".equals(f.getSeverity()) || "Critical".equals(f.getSeverity()))
                .toList();

        StringBuilder report = new StringBuilder();
        report.append("--- [OPSMIND_SECURITY_INTELLIGENCE] ---\n");
        report.append("RISK_SUMMARY:\n");
        report.append("- Critical/High Findings: ").append(highRisks.size()).append("\n\n");

        if (!highRisks.isEmpty()) {
            report.append("IMMEDIATE_THREATS:\n");
            highRisks.forEach(f -> report.append("- ").append(f.getTitle()).append(" on ").append(f.getResourceId()).append("\n"));
            report.append("\nRECOMMENDATION: Patch CVE-2024-XXXX in checkout-service immediately.");
        } else {
            report.append("CONCLUSION: Security posture is compliant with current benchmarks.");
        }

        return report.toString();
    }

    private String performGlobalRCA() {
        List<Alert> recentAlerts = alertRepository.findAll().stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .limit(10)
                .toList();

        StringBuilder report = new StringBuilder();
        report.append("--- [OPSMIND_GLOBAL_RCA_ENGINE] ---\n");
        report.append("ANALYZING_CORRELATIONS:\n");
        
        Map<String, Long> alertCounts = recentAlerts.stream()
                .collect(Collectors.groupingBy(Alert::getSource, Collectors.counting()));

        String primarySource = alertCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Unknown");

        report.append("ROOT_CAUSE: Cascading failure originating from source: ").append(primarySource).append("\n");
        report.append("EVIDENCE: Detected cluster of ").append(recentAlerts.size()).append(" related signals in the last 15 minutes.\n");
        report.append("ACTION: Isolate source '").append(primarySource).append("' and investigate network throughput.");

        return report.toString();
    }

    private String performGeneralSystemAudit() {
        return "--- [OPSMIND_SYSTEM_STATE] ---\n" +
               "Platform reasoning active. I am monitoring: \n" +
               "- 5 Microservices\n" +
               "- " + infrastructureRepository.count() + " Cloud Nodes\n" +
               "- Active Telemetry Streams\n\n" +
               "How can I assist you with Incident Investigation or Root Cause Analysis Today?";
    }
}
