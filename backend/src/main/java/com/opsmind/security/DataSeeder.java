package com.opsmind.security;

import com.opsmind.model.Alert;
import com.opsmind.model.Incident;
import com.opsmind.repository.AlertRepository;
import com.opsmind.repository.IncidentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initData(IncidentRepository incidentRepository, AlertRepository alertRepository) {
        return args -> {
            if (incidentRepository.count() == 0) {
                incidentRepository.save(Incident.builder()
                        .title("Database Connection Latency")
                        .description("High latency detected in us-east-1 RDS instance")
                        .severity("P1")
                        .status("INVESTIGATING")
                        .serviceName("Auth Service")
                        .build());
                
                incidentRepository.save(Incident.builder()
                        .title("High Memory Usage")
                        .description("Pod auth-backend-67f7d is consuming 90% memory")
                        .severity("P2")
                        .status("OPEN")
                        .serviceName("Inventory API")
                        .build());
            }

            if (alertRepository.count() == 0) {
                alertRepository.save(Alert.builder()
                        .alertName("CPU Spike")
                        .source("CloudWatch")
                        .message("CPU utilization > 80% on ec2-ops")
                        .status("TRIGGERED")
                        .timestamp(LocalDateTime.now())
                        .build());
            }
        };
    }
}
