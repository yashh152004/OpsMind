package com.opsmind.controller;

import com.opsmind.model.Conversation;
import com.opsmind.model.User;
import com.opsmind.service.AuthService;
import com.opsmind.service.ConversationService;
import com.opsmind.service.SreReasoningService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final SreReasoningService sreReasoningService;
    private final ConversationService conversationService;
    private final AuthService authService;

    public AiController(SreReasoningService sreReasoningService,
                        ConversationService conversationService,
                        AuthService authService) {
        this.sreReasoningService = sreReasoningService;
        this.conversationService = conversationService;
        this.authService = authService;
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<Conversation>> getConversations() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(conversationService.getUserConversations(user));
    }

    @PostMapping("/conversations")
    public ResponseEntity<Conversation> createConversation(@RequestBody Map<String, String> request) {
        User user = authService.getCurrentUser();
        String title = request.getOrDefault("title", "New Investigation");
        return ResponseEntity.ok(conversationService.createConversation(user, title));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<com.opsmind.model.ChatMessage>> getMessages(@PathVariable Long id) {
        Optional<Conversation> conv = conversationService.getConversation(id);
        return conv.map(conversation -> ResponseEntity.ok(conversation.getMessages()))
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<com.opsmind.model.ChatMessage> sendMessage(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String content = request.get("content");
        Optional<Conversation> convOpt = conversationService.getConversation(id);
        if (convOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        Conversation conversation = convOpt.get();
        conversationService.saveMessage(conversation, "USER", content);
        
        String response = sreReasoningService.investigateWithContext(content, conversation.getMessages());
        com.opsmind.model.ChatMessage savedResponse = conversationService.saveMessage(conversation, "ASSISTANT", response);
        
        return ResponseEntity.ok(savedResponse);
    }

    @PostMapping(value = "/conversations/{id}/stream", produces = "text/event-stream")
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter streamMessage(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String content = request.get("content");
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(300000L);
        
        Optional<Conversation> conversationOpt = conversationService.getConversation(id);
        if (conversationOpt.isEmpty()) {
            emitter.completeWithError(new RuntimeException("Conversation not found"));
            return emitter;
        }

        Conversation conversation = conversationOpt.get();
        conversationService.saveMessage(conversation, "USER", content);

        new Thread(() -> {
            try {
                StringBuilder fullResponse = new StringBuilder();
                sreReasoningService.streamInvestigate(content, conversation.getMessages(), chunk -> {
                    try {
                        emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event().data(chunk));
                        fullResponse.append(chunk);
                    } catch (Exception e) {
                        emitter.completeWithError(e);
                    }
                });
                
                // Save full response at the end
                conversationService.saveMessage(conversation, "ASSISTANT", fullResponse.toString());
                emitter.complete();
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        }).start();

        return emitter;
    }

    @PatchMapping("/conversations/{id}/rename")
    public ResponseEntity<Void> rename(@PathVariable Long id, @RequestBody Map<String, String> request) {
        conversationService.renameConversation(id, request.get("title"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        conversationService.deleteConversation(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/conversations/{id}/pin")
    public ResponseEntity<Void> togglePin(@PathVariable Long id) {
        conversationService.togglePin(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/conversations/{id}/archive")
    public ResponseEntity<Void> archive(@PathVariable Long id) {
        conversationService.archiveConversation(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/insights")
    public ResponseEntity<List<Map<String, Object>>> getInsights() {
        return ResponseEntity.ok(sreReasoningService.getAutonomousInsights());
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
