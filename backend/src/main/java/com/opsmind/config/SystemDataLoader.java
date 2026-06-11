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
        if (organizationRepository.count() == 0) {
            setupDemoEnvironment();
        }
    }

    private void setupDemoEnvironment() {
        // 1. Create Organization
        Organization org = Organization.builder()
                .name("OpsMind Corp")
                .industry("FinTech")
                .plan("ENTERPRISE")
                .build();
        organizationRepository.save(org);

        // 2. Create Demo User
        User demoUser = User.builder()
                .firstName("Demo")
                .lastName("Operator")
                .email("demo@opsmind.com")
                .password(passwordEncoder.encode("OpsMind2026!"))
                .organizationName("OpsMind Corp")
                .role("ADMIN")
                .status("ACTIVE")
                .build();
        userRepository.save(demoUser);

        // 3. Create Infrastructure
        InfrastructureAsset server1 = InfrastructureAsset.builder()
                .name("auth-api-primary")
                .type("SERVER")
                .status("HEALTHY")
                .healthScore(98.0)
                .build();
        InfrastructureAsset db1 = InfrastructureAsset.builder()
                .name("transaction-db-v2")
                .type("DATABASE")
                .status("WARNING")
                .healthScore(74.0)
                .build();
        infrastructureRepository.saveAll(Arrays.asList(server1, db1));

        // 4. Create Security Findings
        SecurityFinding find1 = SecurityFinding.builder()
                .title("Exposed SSH Port on Node #412")
                .severity("HIGH")
                .status("OPEN")
                .build();
        securityFindingRepository.save(find1);

        // 5. Create Incidents
        Incident inc1 = Incident.builder()
                .title("Degraded Performance: Checkout Gateway")
                .severity("P1")
                .status("INVESTIGATING")
                .serviceName("checkout-api")
                .description("P99 latency exceeding 5s in us-east-1 region. Traffic being redirected.")
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();
        incidentRepository.save(inc1);

        // 6. Create Alerts
        Alert alert1 = Alert.builder()
                .alertName("HIGH_LATENCY_DETECTION")
                .source("CloudWatch")
                .message("Baseline deviation > 400% on checkout endpoint.")
                .severity("CRITICAL")
                .status("TRIGGERED")
                .timestamp(LocalDateTime.now().minusHours(2))
                .build();
        alertRepository.save(alert1);
    }
}
