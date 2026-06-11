package com.opsmind.controller;

import com.opsmind.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Message cannot be empty"
            ));
        }
        
        String response;
        try {
            if (userMessage.startsWith("/rca ")) {
                Long id = Long.parseLong(userMessage.substring(5).trim());
                response = geminiService.performRCA(id);
            } else {
                response = geminiService.generateChatResponse(userMessage);
            }

            if (response.startsWith("GEMINI_FALLBACK_SIGNAL")) {
                 return ResponseEntity.status(503).body(Map.of(
                    "success", false,
                    "message", "AI service temporarily unavailable",
                    "details", response
                ));
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "response", response
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "An Internal error occurred while processing AI request",
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(geminiService.getDetailedHealth());
    }
}
