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
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        
        String response;
        if (userMessage.startsWith("/rca ")) {
            try {
                Long id = Long.parseLong(userMessage.substring(5).trim());
                response = geminiService.performRCA(id);
            } catch (Exception e) {
                response = "Invalid Incident ID for RCA. Usage: /rca <id>";
            }
        } else {
            response = geminiService.generateChatResponse(userMessage);
        }
        return ResponseEntity.ok(Map.of("response", response));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(geminiService.getDetailedHealth());
    }
}
