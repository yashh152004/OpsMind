package com.opsmind.controller;

import com.opsmind.model.Integration;
import com.opsmind.repository.IntegrationRepository;
import com.opsmind.service.PlatformActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/integrations")
public class IntegrationController {
    private final IntegrationRepository repository;
    private final PlatformActivityService activityService;

    public IntegrationController(IntegrationRepository repository, PlatformActivityService activityService) {
        this.repository = repository;
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<Integration>> getIntegrations() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping("/connect")
    public ResponseEntity<Integration> connect(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String type = (String) body.get("type");
        Map<String, String> config = (Map<String, String>) body.get("configuration");

        // Real validation logic placeholder
        // In a real app, we would test Slack token, PD key, etc.
        boolean isValid = testConnection(name, config);

        Integration integration = Integration.builder()
                .name(name)
                .type(type)
                .status(isValid ? "ACTIVE" : "ERROR")
                .health(isValid ? "HEALTHY" : "FAIL")
                .lastSync(LocalDateTime.now())
                .build();

        Integration saved = repository.save(integration);
        activityService.logAction("INTEGRATION_SYNCED", "INTEGRATIONS", "system", "Successfully synced with " + name);
        
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> disconnect(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private boolean testConnection(String name, Map<String, String> config) {
        // Simulation of real credential testing
        if (config == null || config.isEmpty()) return false;
        return true; 
    }
}
