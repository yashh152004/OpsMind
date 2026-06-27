package com.opsmind.controller;

import com.opsmind.model.Incident;
import com.opsmind.repository.IncidentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/incidents")
public class IncidentController {
    private final IncidentRepository repository;
    private final com.opsmind.service.PlatformActivityService activityService;

    public IncidentController(IncidentRepository repository, com.opsmind.service.PlatformActivityService activityService) {
        this.repository = repository;
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents(@RequestParam(required = false) Long organizationId) {
        if (organizationId != null) {
            return ResponseEntity.ok(repository.findByOrganizationId(organizationId));
        }
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncident(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Incident> create(@RequestBody Incident incident) {
        incident.setCreatedAt(java.time.LocalDateTime.now());
        if (incident.getStatus() == null) incident.setStatus("OPEN");
        Incident saved = repository.save(incident);
        
        activityService.logAction("INCIDENT_DECLARED", "INCIDENTS", "system", "New incident declared: " + saved.getTitle());
        activityService.notify("Critical Incident", "New " + saved.getSeverity() + " incident reported: " + saved.getTitle(), saved.getSeverity());
        activityService.logTimeline(saved.getId(), "DECLARED", "Incident initialized with severity " + saved.getSeverity(), "system");
        
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        return repository.findById(id).map(incident -> {
            incident.setStatus(newStatus);
            if (body.containsKey("resolution")) {
                incident.setResolution(body.get("resolution"));
            }
            Incident saved = repository.save(incident);
            activityService.logTimeline(saved.getId(), "STATUS_CHANGE", "Incident status transitioned to " + newStatus, "system");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Incident> assignIncident(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        return repository.findById(id).map(incident -> {
            incident.setAssignedTo(userId);
            return ResponseEntity.ok(repository.save(incident));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Incident> resolveIncident(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        return repository.findById(id).map(incident -> {
            incident.setStatus("RESOLVED");
            if (body != null && body.containsKey("resolution")) {
                incident.setResolution(body.get("resolution"));
            }
            Incident saved = repository.save(incident);
            activityService.logAction("INCIDENT_RESOLVED", "INCIDENTS", "system", "Incident resolved: " + saved.getTitle());
            activityService.logTimeline(saved.getId(), "RESOLVED", "Resolution confirmed: " + saved.getResolution(), "system");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
