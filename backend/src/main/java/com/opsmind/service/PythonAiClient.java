package com.opsmind.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * AI V2 Bridge - Spring Boot to Python FastAPI
 * Handlers communication with the specialized Intelligence Microservice.
 */
@Service
public class PythonAiClient {
    private static final Logger logger = LoggerFactory.getLogger(PythonAiClient.class);
    private final RestTemplate restTemplate;
    private final String pythonServiceUrl = "http://localhost:8000/analyze";

    public PythonAiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> getIntelligence(String query, Map<String, Object> context) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", query);
            requestBody.put("context", context);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(pythonServiceUrl, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return (Map<String, Object>) response.getBody();
            }
        } catch (Exception e) {
            logger.error("Failed to connect to Python AI Engine. Error: {}", e.getMessage());
            return null; // Fallback to native
        }
        return null;
    }
}
