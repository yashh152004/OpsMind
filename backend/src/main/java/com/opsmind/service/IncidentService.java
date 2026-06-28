package com.opsmind.service;

import com.opsmind.model.Incident;
import com.opsmind.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidentService {
    private final IncidentRepository repository;
    private final PlatformActivityService activityService;

    public IncidentService(IncidentRepository repository, PlatformActivityService activityService) {
        this.repository = repository;
        this.activityService = activityService;
    }

    @Transactional
    public Incident declareIncident(Incident incident) {
        incident.setStatus("OPEN");
        if (incident.getSeverity() == null) incident.setSeverity("P2");
        if (incident.getPriority() == null) incident.setPriority("HIGH");
        incident.setCreatedAt(LocalDateTime.now());
        
        Incident saved = repository.save(incident);
        
        activityService.logAction("INCIDENT_DECLARED", "INCIDENTS", incident.getOwner(), "Declaration: " + saved.getTitle());
        activityService.logTimeline(saved.getId(), "DECLARATION", "Initial incident declaration. Severity: " + saved.getSeverity(), incident.getOwner());
        activityService.notify("Critical Incident: " + saved.getId(), saved.getTitle() + " has been declared.", saved.getSeverity());
        
        return saved;
    }

    @Transactional
    public Incident transitionStatus(Long id, String newStatus, String operator, String commentary) {
        Incident incident = repository.findById(id).orElseThrow(() -> new RuntimeException("Incident not found"));
        
        String oldStatus = incident.getStatus();
        incident.setStatus(newStatus.toUpperCase());
        
        if ("RESOLVED".equalsIgnoreCase(newStatus)) {
            incident.setResolution(commentary);
        }
        
        Incident saved = repository.save(incident);
        
        activityService.logTimeline(id, "STATUS_TRANSITION", 
            String.format("Transitioned from %s to %s. Note: %s", oldStatus, newStatus, commentary), operator);
            
        activityService.logAction("INCIDENT_UPDATED", "INCIDENTS", operator, "Status change for #" + id);
        
        return saved;
    }

    @Transactional
    public void assignIncident(Long id, String userId, String operator) {
        Incident incident = repository.findById(id).orElseThrow(() -> new RuntimeException("Incident not found"));
        incident.setAssignedTo(userId);
        repository.save(incident);
        
        activityService.logTimeline(id, "ASSIGNMENT", "Incident assigned to " + userId, operator);
        activityService.notify("Incident Assigned", "You have been assigned to incident #" + id, "INFO");
    }

    public List<Incident> searchIncidents(String query) {
        // Simplified search for now, will expand with JPA specifications if needed
        return repository.findAll().stream()
            .filter(i -> i.getTitle().contains(query) || i.getDescription().contains(query))
            .toList();
    }
}
