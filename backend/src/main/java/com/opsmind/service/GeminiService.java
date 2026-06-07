package com.opsmind.service;

import com.opsmind.dto.GeminiRequest;
import com.opsmind.repository.AlertRepository;
import com.opsmind.repository.IncidentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;

    public GeminiService(RestTemplate restTemplate, ObjectMapper objectMapper, 
                         IncidentRepository incidentRepository, AlertRepository alertRepository) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
    }

    private String getSystemContext() {
        try {
            String incidents = incidentRepository.findAll().stream()
                    .limit(5)
                    .map(i -> String.format("[%s] %s (Status: %s, Service: %s)", 
                            i.getSeverity(), i.getTitle(), i.getStatus(), i.getServiceName()))
                    .collect(Collectors.joining("\\n"));

            long alertCount = alertRepository.count();

            return String.format("""
                CURRENT_PLATFORM_STATE:
                - Active Incidents: 
                %s
                - Total Active Alerts: %d
                - System Health: Monitoring for demo failure simulations.
                """, incidents, alertCount);
        } catch (Exception e) {
            return "CONTEXT_UNAVAILABLE: System repositories could not be queried.";
        }
    }

    public String generateChatResponse(String message) {
        logger.info("Generating AI response for message length: {}", message.length());
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String context = getSystemContext();

            String systemInstruction = String.format("""
                IDENTITY: You are the OpsMind AI Copilot. 
                ROLE: Senior Site Reliability Engineer (SRE).
                
                %s
                
                INSTRUCTIONS:
                - Be purely technical. No fluff. No "Hello".
                - Use Markdown.
                - Link incidents by ID if relevant.
                - Provide bash/yaml for fixes.
                """, context);

            GeminiRequest requestBody = new GeminiRequest(
                    List.of(new GeminiRequest.Content(
                            List.of(new GeminiRequest.Part(systemInstruction + "\\n\\nUSER_QUERY: " + message))
                    ))
            );

            HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);
            // Ensure no duplicate query params if apiUrl already contains key (unlikely in this setup)
            String separator = apiUrl.contains("?") ? "&" : "?";
            String urlWithKey = apiUrl + separator + "key=" + apiKey;

            logger.info("Calling Gemini API at: {}", apiUrl);
            String response = restTemplate.postForObject(urlWithKey, entity, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            String aiResponse = root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
            
            logger.info("AI response generated successfully.");
            return aiResponse;

        } catch (Exception e) {
            logger.error("Gemini API Error: {}", e.getMessage());
            return "ERROR [AI_CORE_FAILURE]: The reasoning engine encountered a communication failure (404/Timeout). Ensure GEMINI_API_KEY is valid and the model 'gemini-1.5-flash-latest' is available in your region.";
        }
    }
}
