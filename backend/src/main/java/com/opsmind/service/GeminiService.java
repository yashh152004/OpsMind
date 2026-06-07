package com.opsmind.service;

import com.opsmind.config.AiConfig;
import com.opsmind.dto.GeminiRequest;
import com.opsmind.repository.AlertRepository;
import com.opsmind.repository.IncidentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    private final AiConfig aiConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;

    public GeminiService(AiConfig aiConfig, RestTemplate restTemplate, ObjectMapper objectMapper, 
                         IncidentRepository incidentRepository, AlertRepository alertRepository) {
        this.aiConfig = aiConfig;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
    }

    /**
     * AI Health Check: Verifies API connectivity and model availability.
     */
    public boolean checkHealth() {
        try {
            logger.info("Executing AI Health Check on model: {}", aiConfig.getModelName());
            String response = generateChatResponse("health_check_ping");
            return response != null && !response.contains("ERROR");
        } catch (Exception e) {
            return false;
        }
    }

    private String getSystemContext() {
        try {
            String incidents = incidentRepository.findAll().stream()
                    .limit(5)
                    .map(i -> String.format("[%s] %s (Status: %s)", 
                            i.getSeverity(), i.getTitle(), i.getStatus()))
                    .collect(Collectors.joining("\\n"));

            return String.format("SYSTEM_CONTEXT: Current active incidents: %s", incidents);
        } catch (Exception e) {
            return "CONTEXT_UNAVAILABLE";
        }
    }

    public String generateChatResponse(String message) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String context = getSystemContext();
            String systemPrompt = "You are OpsMind SRE Assistant. Use this context: " + context + ". \\n\\nUser: " + message;

            GeminiRequest requestBody = new GeminiRequest(
                    List.of(new GeminiRequest.Content(
                            List.of(new GeminiRequest.Part(systemPrompt))
                    ))
            );

            HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);
            
            // Build absolute URL from config
            String fullUrl = aiConfig.getUrl() + "?key=" + aiConfig.getKey();
            
            logger.info("Calling Gemini API: {}", aiConfig.getUrl());
            String response = restTemplate.postForObject(fullUrl, entity, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            return root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (Exception e) {
            logger.error("AI Communication Failure: {}", e.getMessage());
            return "ERROR [AI_CORE_404]: Reasoning engine unreachable. Verify API URL: " + aiConfig.getUrl();
        }
    }
}
