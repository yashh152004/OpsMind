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
    private final IncidentRepository incidentRepository;

    public IncidentController(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents() {
        return ResponseEntity.ok(incidentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncident(@PathVariable Long id) {
        return incidentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody Incident incident) {
        return ResponseEntity.ok(incidentRepository.save(incident));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        return incidentRepository.findById(id).map(incident -> {
            incident.setStatus(newStatus);
            if (body.containsKey("resolution")) {
                incident.setResolution(body.get("resolution"));
            }
            return ResponseEntity.ok(incidentRepository.save(incident));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Incident> assignIncident(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        return incidentRepository.findById(id).map(incident -> {
            incident.setAssignedTo(userId);
            return ResponseEntity.ok(incidentRepository.save(incident));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Incident> resolveIncident(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        return incidentRepository.findById(id).map(incident -> {
            incident.setStatus("RESOLVED");
            if (body != null && body.containsKey("resolution")) {
                incident.setResolution(body.get("resolution"));
            }
            return ResponseEntity.ok(incidentRepository.save(incident));
        }).orElse(ResponseEntity.notFound().build());
    }
}
