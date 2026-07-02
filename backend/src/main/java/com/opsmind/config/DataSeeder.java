package com.opsmind.config;

import com.opsmind.model.Alert;
import com.opsmind.model.Incident;
import com.opsmind.model.InfrastructureAsset;
import com.opsmind.model.SecurityFinding;
import com.opsmind.repository.AlertRepository;
import com.opsmind.repository.IncidentRepository;
import com.opsmind.repository.InfrastructureRepository;
import com.opsmind.repository.SecurityFindingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;
    private final InfrastructureRepository infrastructureRepository;
    private final SecurityFindingRepository securityFindingRepository;

    public DataSeeder(IncidentRepository incidentRepository, 
                      AlertRepository alertRepository,
                      InfrastructureRepository infrastructureRepository,
                      SecurityFindingRepository securityFindingRepository) {
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
        this.infrastructureRepository = infrastructureRepository;
        this.securityFindingRepository = securityFindingRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (incidentRepository.count() == 0) {
            seedInitialData();
        }
        if (infrastructureRepository.count() == 0) {
            seedInfrastructure();
        }
    }

    private void seedInfrastructure() {
        infrastructureRepository.save(InfrastructureAsset.builder().name("production-db-cluster").type("DATABASE").provider("AWS").region("us-east-1").status("HEALTHY").healthScore(99.4).build());
        infrastructureRepository.save(InfrastructureAsset.builder().name("auth-service-pod-x42").type("SERVICE").provider("K8S").region("cluster-dev").status("WARNING").healthScore(62.0).build());
        infrastructureRepository.save(InfrastructureAsset.builder().name("s3-static-assets").type("STORAGE").provider("AWS").region("us-west-2").status("HEALTHY").healthScore(100.0).build());
        
        securityFindingRepository.save(SecurityFinding.builder().title("Unencrypted EBS Volume").severity("HIGH").category("COMPLIANCE").status("OPEN").resourceId("vol-0a12b").build());
    }

    private void seedInitialData() {
        // Sample Incident 1
        incidentRepository.save(Incident.builder()
                .title("System Ingress Core Health Check")
                .severity("P4")
                .priority("LOWEST")
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
                .priority("HIGHEST")
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
