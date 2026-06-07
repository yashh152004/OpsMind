package com.opsmind.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import com.opsmind.dto.GeminiRequest;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateChatResponse(String message) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Industry-standard SRE Copilot System Prompt
            String systemPrompt = """
                You are the OpsMind AI Copilot, a specialized SRE and Observability expert. 
                Your goal is to help DevOps teams troubleshoot incidents, analyze logs, and optimize infrastructure.
                Be concise, technical, and focus on root cause analysis.
                If asked about incidents, use the context of a modern cloud-native stack (K8s, AWS, MySQL).
                
                User Message: """;

            // Structure for Gemini API using DTO
            GeminiRequest requestBody = new GeminiRequest(
                    List.of(new GeminiRequest.Content(
                            List.of(new GeminiRequest.Part(systemPrompt + message))
                    ))
            );

            String urlWithKey = apiUrl + "?key=" + apiKey;
            HttpEntity<GeminiRequest> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> responseEntity = restTemplate.postForEntity(urlWithKey, entity, String.class);
            String response = responseEntity.getBody();

            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        } catch (Exception e) {
            return "Error calling Gemini API: " + e.getMessage();
        }
    }
}
