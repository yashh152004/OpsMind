package com.opsmind.service;

import com.opsmind.config.AiConfig;
import com.opsmind.dto.GeminiRequest;
import com.opsmind.repository.AlertRepository;
import com.opsmind.repository.IncidentRepository;
import com.opsmind.repository.InfrastructureRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    private final AiConfig aiConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;

    private final InfrastructureRepository infrastructureRepository;

    public GeminiService(AiConfig aiConfig, RestTemplate restTemplate, ObjectMapper objectMapper, 
                         IncidentRepository incidentRepository, AlertRepository alertRepository,
                         InfrastructureRepository infrastructureRepository) {
        this.aiConfig = aiConfig;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
        this.infrastructureRepository = infrastructureRepository;
    }

    /**
     * AI Health Check: Verifies API connectivity and model availability with detailed metrics.
     */
    public Map<String, Object> getDetailedHealth() {
        Map<String, Object> health = new HashMap<>();
        long start = System.currentTimeMillis();
        try {
            logger.info("Executing AI Health Check on model: {}", aiConfig.getModelName());
            String response = generateChatResponse("ping");
            long latency = System.currentTimeMillis() - start;
            
            boolean isHealthy = response != null && !response.contains("FALLBACK");
            health.put("status", isHealthy ? "UP" : "DEGRADED");
            health.put("model", aiConfig.getModelName());
            health.put("latency", latency + "ms");
            health.put("apiStatus", "CONNECTED");
            health.put("availability", isHealthy ? 1.0 : 0.0);
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("error", e.getMessage());
            health.put("apiStatus", "UNREACHABLE");
            health.put("availability", 0.0);
        }
        return health;
    }

    public boolean checkHealth() {
        return "UP".equals(getDetailedHealth().get("status"));
    }

    private String getSystemContext() {
        try {
            if (incidentRepository == null || alertRepository == null) {
                return "CONTEXT_UNAVAILABLE: Repositories not initialized.";
            }

            String incidents = incidentRepository.findAll().stream()
                    .filter(i -> !"RESOLVED".equals(i.getStatus()))
                    .map(i -> String.format("[%s] %s on %s (Status: %s)", 
                            i.getSeverity(), i.getTitle(), i.getServiceName(), i.getStatus()))
                    .collect(Collectors.joining("; "));

            String alerts = alertRepository.findAll().stream()
                    .filter(a -> !"RESOLVED".equals(a.getStatus()))
                    .limit(10)
                    .map(a -> String.format("%s: %s (%s)", a.getSeverity(), a.getAlertName(), a.getSource()))
                    .collect(Collectors.joining("; "));

            String infra = "Infrastructure Assets: " + infrastructureRepository.count() + " active nodes.";

            return String.format("--- SYSTEM_TELEMETRY ---\nACTIVE_INCIDENTS: %s\nTRIGGERED_ALERTS: %s\nPLATFORM_STATE: All subsystems operational.\n-------------------------", 
                incidents.isEmpty() ? "None" : incidents,
                alerts.isEmpty() ? "None" : alerts);
        } catch (Exception e) {
            return "CONTEXT_UNAVAILABLE: Telemetry collection failed.";
        }
    }

    public String performRCA(Long incidentId) {
        Incident incident = incidentRepository.findById(incidentId).orElse(null);
        if (incident == null) return "Incident not found.";

        List<Alert> relatedAlerts = alertRepository.findAll().stream()
                .filter(a -> a.getTimestamp().isAfter(incident.getCreatedAt().minusHours(1)) &&
                             a.getTimestamp().isBefore(incident.getCreatedAt().plusHours(1)))
                .toList();

        String alertContext = relatedAlerts.stream()
                .map(a -> String.format("[%s] %s: %s", a.getTimestamp(), a.getAlertName(), a.getMessage()))
                .collect(Collectors.joining("\n"));

        String prompt = String.format(
            "Perform Root Cause Analysis (RCA) for the following incident:\n\n" +
            "INCIDENT: %s\n" +
            "DESCRIPTION: %s\n" +
            "SERVICE: %s\n\n" +
            "RELATED_ALERTS:\n%s\n\n" +
            "Provide a structured RCA report with:\n1. Execution Summary\n2. Probable Cause\n3. Evidence\n4. Recommended Action",
            incident.getTitle(), incident.getDescription(), incident.getServiceName(), 
            alertContext.isEmpty() ? "No related alerts found." : alertContext
        );

        return generateChatResponse(prompt);
    }

    public String generateChatResponse(String message) {
        String context = getSystemContext();
        String systemPrompt = 
            "You are OpsMind SRE Copilot, a senior SRE AI. Analyze telemetry and provide expert insights.\n\n" +
            context + "\n\n" +
            "USER_REQUEST: " + message;
            
        int maxRetries = 3;
        int attempt = 0;
        Exception lastException = null;

        while (attempt < maxRetries) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                GeminiRequest requestBody = new GeminiRequest(
                        List.of(new GeminiRequest.Content(
                                List.of(new GeminiRequest.Part(systemPrompt))
                        ))
                );

                HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);
                String baseUrl = aiConfig.getUrl();
                if (baseUrl.contains("{model}")) {
                    baseUrl = baseUrl.replace("{model}", aiConfig.getModelName());
                }
                
                String fullUrl = baseUrl + "?key=" + aiConfig.getKey();
                logger.debug("Calling Gemini API (Attempt {}): {}", attempt + 1, baseUrl);
                
                String response = restTemplate.postForObject(fullUrl, entity, String.class);
                if (response == null) throw new RuntimeException("Empty response");
                
                JsonNode root = objectMapper.readTree(response);
                JsonNode candidates = root.path("candidates");
                
                if (candidates.isArray() && candidates.size() > 0) {
                    return candidates.get(0)
                            .path("content")
                            .path("parts")
                            .get(0)
                            .path("text")
                            .asText();
                } else {
                    throw new RuntimeException("No candidates: " + response);
                }
            } catch (Exception e) {
                attempt++;
                lastException = e;
                logger.warn("AI Attempt {} failed: {}", attempt, e.getMessage());
                if (attempt < maxRetries) {
                    try { Thread.sleep(500 * attempt); } catch (InterruptedException ignored) {}
                }
            }
        }

        logger.error("AI Communication Exhausted: {}", lastException != null ? lastException.getMessage() : "Unknown");
        return "FALLBACK [GEMINI-OFFLINE]: Reasoning engine unreachable.\n\n" +
               "DIAGNOSTIC: " + (lastException != null ? lastException.getMessage() : "Unknown") + "\n" +
               "SYSTEM_ADVICE: Check active incidents manually.";
    }
}
