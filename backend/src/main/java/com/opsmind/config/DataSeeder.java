package com.opsmind.config;

import com.opsmind.model.Alert;
import com.opsmind.model.Incident;
import com.opsmind.repository.AlertRepository;
import com.opsmind.repository.IncidentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;

    public DataSeeder(IncidentRepository incidentRepository, AlertRepository alertRepository) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (incidentRepository.count() == 0) {
            seedInitialData();
        }
    }

    private void seedInitialData() {
        // Sample Incident 1
        incidentRepository.save(Incident.builder()
                .title("System Ingress Core Health Check")
                .severity("P4")
                .serviceName("platform-core")
                .description("Baseline monitoring established for all us-east-1 ingress nodes.")
                .status("RESOLVED")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build());

        // Sample Incident 2
        incidentRepository.save(Incident.builder()
                .title("Database Connection Latency")
                .description("High latency detected in us-east-1 RDS instance")
                .severity("P1")
                .status("INVESTIGATING")
                .serviceName("Auth Service")
                .createdAt(LocalDateTime.now().minusHours(5))
                .build());

        // Sample Alert 1
        alertRepository.save(Alert.builder()
                .alertName("HEARTBEAT_STABLE")
                .message("Node k8s-master-01 reporting nominal health.")
                .severity("LOW")
                .status("RESOLVED")
                .source("Prometheus")
                .timestamp(LocalDateTime.now().minusHours(2))
                .build());

        // Sample Alert 2
        alertRepository.save(Alert.builder()
                .alertName("CPU Spike")
                .source("CloudWatch")
                .message("CPU utilization > 80% on ec2-ops")
                .severity("HIGH")
                .status("TRIGGERED")
                .timestamp(LocalDateTime.now())
                .build());
    }
}
