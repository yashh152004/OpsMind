package com.opsmind.service;

import com.opsmind.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Enterprise Global Search Service
 * Searches across Incidents, Alerts, and Infrastructure nodes.
 */
@Service
public class SearchService {

    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;
    private final InfrastructureRepository infrastructureRepository;

    public SearchService(IncidentRepository incidentRepository,
                         AlertRepository alertRepository,
                         InfrastructureRepository infrastructureRepository) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
        this.infrastructureRepository = infrastructureRepository;
    }

    public Map<String, List<?>> search(String query) {
        String lowerQuery = query.toLowerCase();
        Map<String, List<?>> results = new HashMap<>();

        // 1. Search Incidents
        results.put("incidents", incidentRepository.findAll().stream()
                .filter(i -> i.getTitle().toLowerCase().contains(lowerQuery) || 
                             i.getServiceName().toLowerCase().contains(lowerQuery))
                .limit(5).toList());

        // 2. Search Alerts
        results.put("alerts", alertRepository.findAll().stream()
                .filter(a -> a.getAlertName().toLowerCase().contains(lowerQuery) || 
                             a.getMessage().toLowerCase().contains(lowerQuery))
                .limit(5).toList());

        // 3. Search Infrastructure
        results.put("infrastructure", infrastructureRepository.findAll().stream()
                .filter(n -> n.getName().toLowerCase().contains(lowerQuery) || 
                             n.getType().toLowerCase().contains(lowerQuery))
                .limit(5).toList());

        return results;
    }
}
