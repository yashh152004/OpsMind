package com.opsmind.service;

import com.opsmind.dto.GeminiRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public String generateChatResponse(String message) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Enterprise SRE System Instruction
            String systemInstruction = """
                CORE IDENTITY: You are OpsMind SRE Copilot, an advanced AI integrated into a high-scale observability platform. 
                CAPABILITIES: You analyze telemetry, logs, and infrastructure metrics.
                CONSTRAINTS: 
                - Be concise and purely technical. 
                - Use Markdown for code/metrics. 
                - If diagnosing, provide: 1. Probable Cause, 2. Severity, 3. Immediate Remediation steps.
                - NEVER use fluffy language. 
                - Frame responses as a senior site reliability engineer would.
                """;

            GeminiRequest requestBody = new GeminiRequest(
                    List.of(new GeminiRequest.Content(
                            List.of(new GeminiRequest.Part(systemInstruction + "\\n\\nUser Query: " + message))
                    ))
            );

            HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);
            String urlWithKey = apiUrl + "?key=" + apiKey;

            String response = restTemplate.postForObject(urlWithKey, entity, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            return root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

        } catch (Exception e) {
            return "ERROR [AI_SUBSYSTEM_FAILURE]: Unable to process query. Internal reasoning timeout or API rate limit reached. " + e.getMessage();
        }
    }
}
