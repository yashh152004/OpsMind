package com.opsmind.config;

import com.opsmind.model.*;
import com.opsmind.repository.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
public class SystemDataLoader implements ApplicationRunner {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final AlertRepository alertRepository;
    private final InfrastructureRepository infrastructureRepository;
    private final SecurityFindingRepository securityFindingRepository;
    private final PasswordEncoder passwordEncoder;

    public SystemDataLoader(OrganizationRepository organizationRepository,
                            UserRepository userRepository,
                            IncidentRepository incidentRepository,
                            AlertRepository alertRepository,
                            InfrastructureRepository infrastructureRepository,
                            SecurityFindingRepository securityFindingRepository,
                            PasswordEncoder passwordEncoder) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
        this.alertRepository = alertRepository;
        this.infrastructureRepository = infrastructureRepository;
        this.securityFindingRepository = securityFindingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Force-refreshing the estate for the Enterprise Transformation
        organizationRepository.deleteAll();
        userRepository.deleteAll();
        incidentRepository.deleteAll();
        alertRepository.deleteAll();
        infrastructureRepository.deleteAll();
        securityFindingRepository.deleteAll();
        
        setupDemoEnvironment();
    }


    private void setupDemoEnvironment() {
        // 1. Create Organization
        Organization org = Organization.builder()
                .name("Global Finance Systems")
                .industry("SRE Architecture")
                .planType("ENTERPRISE")
                .build();
        organizationRepository.save(org);

        // 2. Create User
        User demoUser = User.builder()
                .firstName("Principal")
                .lastName("Engineer")
                .email("admin@opsmind.io")
                .password(passwordEncoder.encode("OpsMind2026!"))
                .organizationName("Global Finance Systems")
                .role("ADMIN")
                .status("ACTIVE")
                .build();
        userRepository.save(demoUser);

        // 3. Complex Infrastructure (K8s Cluster)
        infrastructureRepository.saveAll(Arrays.asList(
                InfrastructureAsset.builder().name("k8s-master-01").type("CLUSTER").status("HEALTHY").healthScore(99.0).build(),
                InfrastructureAsset.builder().name("k8s-node-01 (us-east-1a)").type("NODE").status("WARNING").healthScore(62.0).build(),
                InfrastructureAsset.builder().name("k8s-node-02 (us-east-1b)").type("NODE").status("CRITICAL").healthScore(14.0).build(),
                InfrastructureAsset.builder().name("redis-cache-cluster").type("CACHE").status("HEALTHY").healthScore(94.0).build(),
                InfrastructureAsset.builder().name("payment-gateway-v4").type("API_SERVICE").status("DEGRADED").healthScore(44.0).build(),
                InfrastructureAsset.builder().name("auth-idp-connector").type("IDENTITY").status("HEALTHY").healthScore(98.0).build()
        ));


        // 4. Incident Cascades
        incidentRepository.saveAll(Arrays.asList(
                Incident.builder()
                        .title("High Failure Rate: Payment Gateway")
                        .severity("P0")
                        .priority("HIGHEST")
                        .status("INVESTIGATING")
                        .serviceName("payment-service")
                        .description("Critical fallout in checkout flow. 40% transaction failure rate reported.")
                        .createdAt(LocalDateTime.now().minusHours(4))
                        .build(),
                Incident.builder()
                        .title("Slow Auth Token Refresh")
                        .severity("P2")
                        .priority("HIGH")
                        .status("IDENTIFIED")
                        .serviceName("auth-service")
                        .description("Increased latency in OIDC token exchange.")
                        .createdAt(LocalDateTime.now().minusHours(12))
                        .build(),
                Incident.builder()
                        .title("Redis Cluster Partitioning")
                        .severity("P1")
                        .priority("HIGHEST")
                        .status("RESOLVED")
                        .serviceName("redis-main")
                        .description("Split-brain scenario in us-west-2.")
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build()
        ));


        // 5. Alert Correlation Stream (RCA Evidence)
        alertRepository.saveAll(Arrays.asList(
                Alert.builder().alertName("MEM_SPIKE_DETECTED").source("Prometheus").message("Memory usage > 95% on payment-gateway pods.").severity("CRITICAL").status("TRIGGERED").timestamp(LocalDateTime.now().minusHours(1)).build(),
                Alert.builder().alertName("DB_CONN_TIMEOUT").source("CloudWatch").message("Connection pool exhausted on transaction-db-01.").severity("CRITICAL").status("TRIGGERED").timestamp(LocalDateTime.now().minusHours(1)).build(),
                Alert.builder().alertName("LATENCY_THRESHOLD_BREACHED").source("Datadog").message("P99 > 5000ms on /v1/checkout.").severity("WARNING").status("TRIGGERED").timestamp(LocalDateTime.now().minusHours(1)).build(),
                Alert.builder().alertName("CONTAINER_OOM_KILLED").source("Kubernetes").message("Payment-gateway container killed by OOM killer.").severity("CRITICAL").status("TRIGGERED").timestamp(LocalDateTime.now().minusMinutes(45)).build()
        ));

        // 6. Security Posture
        securityFindingRepository.saveAll(Arrays.asList(
                SecurityFinding.builder().title("CRITICAL: CVE-2024-XXXX (Log4j variation)").severity("CRITICAL").category("VULNERABILITY").status("OPEN").resourceId("payment-api-01").discoveredAt(LocalDateTime.now().minusDays(2)).build(),
                SecurityFinding.builder().title("HIGH: Insecure S3 Bucket Permissions").severity("HIGH").category("COMPLIANCE").status("OPEN").resourceId("billing-reports-s3").discoveredAt(LocalDateTime.now().minusDays(5)).build(),
                SecurityFinding.builder().title("MEDIUM: Outdated TLS version used by gateway").severity("MEDIUM").category("SECURITY").status("REMEDIATED").resourceId("opsmind-gateway").discoveredAt(LocalDateTime.now().minusDays(10)).build()
        ));

    }

}
