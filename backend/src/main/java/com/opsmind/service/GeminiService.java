package com.opsmind.service;

import com.opsmind.config.AiConfig;
import com.opsmind.dto.GeminiRequest;
import com.opsmind.model.Alert;
import com.opsmind.model.Incident;
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
            String model = aiConfig.getModelName();
            boolean hasKey = aiConfig.getKey() != null && !aiConfig.getKey().trim().isEmpty() && !aiConfig.getKey().contains("YourRealKey");
            
            health.put("provider", "Gemini");
            health.put("model", model);
            health.put("apiKeyLoaded", hasKey);

            if (!hasKey) {
                health.put("status", "DOWN");
                health.put("message", "API Key missing or invalid");
                return health;
            }

            // Perform shallow ping
            String response = generateChatResponse("ping");
            long latency = System.currentTimeMillis() - start;
            
            boolean isHealthy = response != null && !response.contains("GEMINI_FALLBACK_SIGNAL");
            health.put("status", isHealthy ? "UP" : "DEGRADED");
            health.put("latency", latency + "ms");
            health.put("message", isHealthy ? "AI Subsystem operational" : "AI Service in fallback mode");
            
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("error", e.getMessage());
            health.put("message", "AI subsystem communication failure");
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
            "CRITICAL: Always return your response in plain text for the user, but be extremely technical and precise.\n\n" +
            context + "\n\n" +
            "USER_REQUEST: " + message;
            
        int maxRetries = 2;
        int attempt = 0;
        Exception lastException = null;

        while (attempt <= maxRetries) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                GeminiRequest requestBody = new GeminiRequest(
                        List.of(new GeminiRequest.Content(
                                List.of(new GeminiRequest.Part(systemPrompt))
                        ))
                );

                HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);
                
                // Construct URL correctly
                String model = aiConfig.getModelName();
                if (model == null || model.isEmpty()) model = "gemini-1.5-flash";
                
                // Use stable v1 endpoint instead of v1beta unless specified
                String urlTemplate = aiConfig.getUrl();
                if (urlTemplate == null || urlTemplate.isEmpty()) {
                    urlTemplate = "https://generativelanguage.googleapis.com/v1/models/{model}:generateContent";
                }
                
                String baseUrl = urlTemplate.replace("{model}", model);
                String fullUrl = baseUrl + "?key=" + aiConfig.getKey();
                
                logger.info("Executing AI Request [Attempt {}] to model: {} | URL: {}", attempt + 1, model, baseUrl);
                
                String response = restTemplate.postForObject(fullUrl, entity, String.class);
                
                if (response == null) {
                    throw new RuntimeException("API returned empty response");
                }
                
                JsonNode root = objectMapper.readTree(response);
                JsonNode candidates = root.path("candidates");
                
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode firstCandidate = candidates.get(0);
                    JsonNode textNode = firstCandidate.path("content").path("parts").get(0).path("text");
                    
                    if (textNode.isMissingNode()) {
                        String finishReason = firstCandidate.path("finishReason").asText();
                        throw new RuntimeException("AI stopped unexpectedly. Reason: " + finishReason);
                    }
                    
                    return textNode.asText();
                } else {
                    JsonNode errorNode = root.path("error");
                    if (!errorNode.isMissingNode()) {
                        String errorMsg = errorNode.path("message").asText();
                        int errorCode = errorNode.path("code").asInt();
                        throw new RuntimeException("Gemini API Error [" + errorCode + "]: " + errorMsg);
                    }
                    throw new RuntimeException("No candidates found in AI response. Payload: " + response);
                }
            } catch (Exception e) {
                attempt++;
                lastException = e;
                logger.error("AI SUBSYSTEM FAILURE [Attempt {}]: {}", attempt, e.getMessage());
                
                // Specific handling for common errors
                if (e.getMessage().contains("404")) {
                    logger.error("CRITICAL: Gemini Model Not Found. Model used: {}", aiConfig.getModelName());
                    break; // Don't retry on 404
                }
                if (e.getMessage().contains("401") || e.getMessage().contains("403")) {
                    logger.error("CRITICAL: Gemini Authentication Failed. Check API Key.");
                    break; // Don't retry on Auth failure
                }
                
                if (attempt <= maxRetries) {
                    try { Thread.sleep(1000 * attempt); } catch (InterruptedException ignored) {}
                }
            }
        }

        // Final Fallback
        String diagnostic = lastException != null ? lastException.getMessage() : "Unknown Connectivity Error";
        logger.error("GEMINI-API-CONNECT FAILURE: Exhausted all retries. Diagnostic: {}", diagnostic);
        
        return "GEMINI_FALLBACK_SIGNAL\n" +
               "Error: Service Temporarily Unavailable\n" +
               "Subsystem: GEMINI-API-CONNECT\n" +
               "Diagnostic: " + diagnostic + "\n\n" +
               "The AI engine is currently unreachable. Please verify your Gemini API key and internet connectivity.";
    }
}
