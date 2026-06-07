package com.opsmind.controller;

import com.opsmind.repository.AlertRepository;
import com.opsmind.repository.IncidentRepository;
import com.opsmind.repository.InfrastructureRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/search")
public class SearchController {

    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;
    private final InfrastructureRepository infrastructureRepository;

    public SearchController(IncidentRepository incidentRepository, 
                            AlertRepository alertRepository, 
                            InfrastructureRepository infrastructureRepository) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
        this.infrastructureRepository = infrastructureRepository;
    }

    @GetMapping("/global")
    public ResponseEntity<List<Map<String, Object>>> globalSearch(@RequestParam String q) {
        List<Map<String, Object>> results = new ArrayList<>();
        String query = q.toLowerCase();

        // Search Incidents
        incidentRepository.findAll().stream()
                .filter(i -> i.getTitle().toLowerCase().contains(query) || i.getServiceName().toLowerCase().contains(query))
                .forEach(i -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("type", "INCIDENT");
                    map.put("id", i.getId());
                    map.put("title", i.getTitle());
                    map.put("subtitle", i.getServiceName());
                    map.put("status", i.getStatus());
                    results.add(map);
                });

        // Search Alerts
        alertRepository.findAll().stream()
                .filter(a -> a.getAlertName().toLowerCase().contains(query))
                .forEach(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("type", "ALERT");
                    map.put("id", a.getId());
                    map.put("title", a.getAlertName());
                    map.put("subtitle", a.getSource());
                    map.put("status", a.getStatus());
                    results.add(map);
                });

        // Search Assets
        infrastructureRepository.findAll().stream()
                .filter(asset -> asset.getName().toLowerCase().contains(query))
                .forEach(asset -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("type", "INFRASTRUCTURE");
                    map.put("id", asset.getId());
                    map.put("title", asset.getName());
                    map.put("subtitle", asset.getType());
                    map.put("status", asset.getStatus());
                    results.add(map);
                });

        return ResponseEntity.ok(results);
    }
}
