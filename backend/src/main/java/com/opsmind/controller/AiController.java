package com.opsmind.controller;

import com.opsmind.service.SreReasoningService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * OpsMind AI Reasoning Controller
 * Re-architected to use internally developed Domain Reasoning Engine.
 * No external LLM dependencies.
 */
@RestController
@RequestMapping("/ai")
public class AiController {

    private final SreReasoningService sreReasoningService;

    public AiController(SreReasoningService sreReasoningService) {
        this.sreReasoningService = sreReasoningService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Query cannot be empty"
            ));
        }
        
        try {
            // Processing via Native Domain Reasoning Engine
            String response = sreReasoningService.investigate(userMessage);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "response", response,
                "engine", "OpsMind-Native-SRE-Reasoning-v1"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "An Internal error occurred within the Native Reasoning Engine",
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "engine", "Native-SRE-Engine",
            "intelligence_type", "Domain-Specific-Deterministic-Reasoning"
        ));
    }
}

