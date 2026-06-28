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
    private final com.opsmind.service.IncidentService service;
    private final com.opsmind.service.PlatformActivityService activityService;

    public IncidentController(IncidentRepository repository, 
                              com.opsmind.service.IncidentService service,
                              com.opsmind.service.PlatformActivityService activityService) {
        this.repository = repository;
        this.service = service;
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents(
            @RequestParam(required = false) Long organizationId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity) {
        
        List<Incident> results;
        if (organizationId != null) {
            results = repository.findByOrganizationId(organizationId);
        } else {
            results = repository.findAll();
        }

        if (status != null) {
            results = results.stream().filter(i -> i.getStatus().equalsIgnoreCase(status)).toList();
        }
        if (severity != null) {
            results = results.stream().filter(i -> i.getSeverity().equalsIgnoreCase(severity)).toList();
        }
        
        return ResponseEntity.ok(results);
    }

    @GetMapping("/search")
    public ResponseEntity<org.springframework.data.domain.Page<Incident>> search(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        
        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort sorting = sortParts[1].equalsIgnoreCase("desc") 
            ? org.springframework.data.domain.Sort.by(sortParts[0]).descending()
            : org.springframework.data.domain.Sort.by(sortParts[0]).ascending();
            
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, sorting);
        return ResponseEntity.ok(repository.advancedSearch(q, status, severity, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncident(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<com.opsmind.model.IncidentTimeline>> getTimeline(@PathVariable Long id) {
        return ResponseEntity.ok(activityService.getTimelineForIncident(id));
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<com.opsmind.model.IncidentAttachment>> getAttachments(@PathVariable Long id) {
        return ResponseEntity.ok(service.getAttachments(id));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<Void> addAttachment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        service.addAttachment(id, body.get("fileName"), body.get("fileUrl"), body.get("type"), body.getOrDefault("operator", "system"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        String operator = body.getOrDefault("operator", "system");
        String note = body.getOrDefault("note", "Status change via API");
        return ResponseEntity.ok(service.transitionStatus(id, newStatus, operator, note));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Incident> assignIncident(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String operator = body.getOrDefault("operator", "system");
        service.assignIncident(id, userId, operator);
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/bulk-resolve")
    public ResponseEntity<Void> bulkResolve(@RequestBody List<Long> ids) {
        for (Long id : ids) {
            service.transitionStatus(id, "RESOLVED", "system", "Bulk resolution triggered");
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        activityService.logAction("INCIDENT_DELETED", "INCIDENTS", "admin", "Deleted incident #" + id);
        return ResponseEntity.noContent().build();
    }
}
