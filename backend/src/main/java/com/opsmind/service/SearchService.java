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

    public List<SearchResultDTO> search(String query) {
        String lowerQuery = query.toLowerCase();
        List<SearchResultDTO> results = new ArrayList<>();

        // 1. Search Incidents
        incidentRepository.findAll().stream()
                .filter(i -> i.getTitle().toLowerCase().contains(lowerQuery))
                .limit(3)
                .forEach(i -> results.add(new SearchResultDTO("INCIDENT", i.getTitle(), "ID: #" + i.getId() + " | " + i.getServiceName())));

        // 2. Search Alerts
        alertRepository.findAll().stream()
                .filter(a -> a.getAlertName().toLowerCase().contains(lowerQuery) || a.getMessage().toLowerCase().contains(lowerQuery))
                .limit(3)
                .forEach(a -> results.add(new SearchResultDTO("ALERT", a.getAlertName(), a.getSource())));

        // 3. Search Infrastructure
        infrastructureRepository.findAll().stream()
                .filter(n -> n.getName().toLowerCase().contains(lowerQuery))
                .limit(3)
                .forEach(n -> results.add(new SearchResultDTO("INFRASTRUCTURE", n.getName(), n.getType() + " | " + n.getStatus())));

        return results;
    }

    public static class SearchResultDTO {
        public String type;
        public String title;
        public String subtitle;

        public SearchResultDTO(String type, String title, String subtitle) {
            this.type = type;
            this.title = title;
            this.subtitle = subtitle;
        }
    }

}
