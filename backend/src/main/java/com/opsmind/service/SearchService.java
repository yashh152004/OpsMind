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
    private final SecurityFindingRepository securityRepository;
    private final UserRepository userRepository;

    public SearchService(IncidentRepository incidentRepository,
                         AlertRepository alertRepository,
                         InfrastructureRepository infrastructureRepository,
                         SecurityFindingRepository securityRepository,
                         UserRepository userRepository) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
        this.infrastructureRepository = infrastructureRepository;
        this.securityRepository = securityRepository;
        this.userRepository = userRepository;
    }

    public List<SearchResultDTO> search(String query) {
        String q = query.toLowerCase();
        List<SearchResultDTO> results = new ArrayList<>();

        // 1. Incidents
        incidentRepository.findAll().stream()
                .filter(i -> i.getTitle().toLowerCase().contains(q) || i.getServiceName().toLowerCase().contains(q))
                .forEach(i -> results.add(new SearchResultDTO("INCIDENT", i.getTitle(), "INC-" + i.getId() + " • " + i.getStatus())));

        // 2. Alerts
        alertRepository.findAll().stream()
                .filter(a -> a.getAlertName().toLowerCase().contains(q) || a.getMessage().toLowerCase().contains(q))
                .forEach(a -> results.add(new SearchResultDTO("ALERT", a.getAlertName(), a.getSource() + " • " + a.getStatus())));

        // 3. Infrastructure
        infrastructureRepository.findAll().stream()
                .filter(n -> n.getName().toLowerCase().contains(q))
                .forEach(n -> results.add(new SearchResultDTO("INFRASTRUCTURE", n.getName(), n.getType() + " • " + n.getStatus())));

        // 4. Security
        securityRepository.findAll().stream()
                .filter(s -> s.getTitle().toLowerCase().contains(q) || s.getCategory().toLowerCase().contains(q) || s.getResourceId().toLowerCase().contains(q))
                .forEach(s -> results.add(new SearchResultDTO("SECURITY", s.getTitle(), s.getSeverity() + " • " + s.getResourceId())));

        // 5. Users
        userRepository.findAll().stream()
                .filter(u -> u.getFirstName().toLowerCase().contains(q) || u.getLastName().toLowerCase().contains(q) || u.getEmail().toLowerCase().contains(q))
                .forEach(u -> results.add(new SearchResultDTO("USER", u.getFirstName() + " " + u.getLastName(), u.getEmail() + " • " + u.getRole())));

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
