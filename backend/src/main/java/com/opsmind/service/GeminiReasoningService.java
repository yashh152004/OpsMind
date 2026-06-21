package com.opsmind.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * AI V2 - Reasoning Layer
 * Uses Gemini for reasoning over structured OpsMind data.
 */
@Service
public class GeminiReasoningService {
    private static final Logger logger = LoggerFactory.getLogger(GeminiReasoningService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:YOUR_GEMINI_API_KEY}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent}")
    private String apiUrl;

    @Value("${gemini.api.model-name:gemini-1.5-flash}")
    private String modelName;

    public GeminiReasoningService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Synthesis of platform data using AI reasoning.
     */
    public String reason(String userQuery, String platformContext) {
        if (apiKey == null || apiKey.equals("YOUR_GEMINI_API_KEY") || apiKey.trim().isEmpty()) {
            return " [FALLBACK_NOTICE] External Reasoning Engine Unavailable. Using OpsMind Local Insight Engine.\n\n" + platformContext;
        }

        try {
            String url = apiUrl.replace("{model}", modelName);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", apiKey);

            String systemPrompt = "You are the OpsMind Enterprise SRE Core. You do NOT answer from generic knowledge.\n" +
                    "Use the provided PLATFORM_CONTEXT to answer the USER_QUERY.\n" +
                    "If the data is missing, say 'I cannot find that in the local telemetry'.\n\n" +
                    "PLATFORM_CONTEXT:\n" + platformContext + "\n\n" +
                    "USER_QUERY: " + userQuery;

            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", systemPrompt);
            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", Collections.singletonList(part));
            contents.add(contentMap);
            requestBody.put("contents", contents);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                var root = objectMapper.readTree(response.getBody());
                return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            }
        } catch (Exception e) {
            logger.error("AI Reasoning Failure: {}", e.getMessage());
        }
        return platformContext;
    }
}
