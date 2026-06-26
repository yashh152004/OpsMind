package com.opsmind.service;

import com.opsmind.dto.TelemetryRequest;
import com.opsmind.model.InfrastructureAsset;
import com.opsmind.model.SystemMetric;
import com.opsmind.repository.InfrastructureRepository;
import com.opsmind.repository.SystemMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelemetryService {

    private final SystemMetricRepository metricRepository;
    private final InfrastructureRepository infrastructureRepository;
    private final AlertService alertService;

    @Transactional
    public void processTelemetry(TelemetryRequest request) {
        log.info("Processing telemetry from host: {}", request.getHostname());

        // 1. Update Infrastructure Asset for the host
        updateHostAsset(request);

        // 2. Save System Metrics
        if (request.getSystemMetrics() != null) {
            request.getSystemMetrics().forEach((name, value) -> {
                saveMetric(name, value, request.getHostname());
                
                // 3. Simple threshold checks
                checkThresholds(request.getHostname(), name, value);
            });
        }
        
        // 4. Update Docker containers
        if (request.getContainers() != null) {
            request.getContainers().forEach(c -> {
                updateContainerAsset(c, request.getHostname());
            });
        }

        // 5. Check Service Statuses
        if (request.getServices() != null) {
            request.getServices().forEach(s -> {
                updateServiceAsset(s, request.getHostname());
            });
        }
    }

    private void updateHostAsset(TelemetryRequest request) {
        Optional<InfrastructureAsset> existing = infrastructureRepository.findByName(request.getHostname());
        InfrastructureAsset asset = existing.orElse(new InfrastructureAsset());
        
        asset.setName(request.getHostname());
        asset.setType("HOST");
        asset.setRegion("LOCAL");
        asset.setProvider("ON_PREM");
        
        // Calculate health based on CPU and memory
        Double cpu = request.getSystemMetrics() != null ? request.getSystemMetrics().getOrDefault("cpu_usage_percent", 0.0) : 0.0;
        Double mem = request.getSystemMetrics() != null ? request.getSystemMetrics().getOrDefault("memory_usage_percent", 0.0) : 0.0;
        
        double health = Math.max(0.0, 100.0 - (cpu * 0.7 + mem * 0.3));
        asset.setHealthScore(health);
        asset.setStatus(health > 80 ? "HEALTHY" : (health > 40 ? "WARNING" : "CRITICAL"));
        
        infrastructureRepository.save(asset);
    }
    
    private void updateContainerAsset(TelemetryRequest.ContainerInfo container, String host) {
        String fullName = "container:" + host + ":" + container.getName();
        Optional<InfrastructureAsset> existing = infrastructureRepository.findByName(fullName);
        InfrastructureAsset asset = existing.orElse(new InfrastructureAsset());
        
        asset.setName(fullName);
        asset.setType("CONTAINER");
        asset.setStatus("running".equalsIgnoreCase(container.getState()) ? "HEALTHY" : "CRITICAL");
        asset.setRegion("LOCAL");
        asset.setProvider("DOCKER");
        
        double health = "running".equalsIgnoreCase(container.getState()) ? 100.0 : 0.0;
        asset.setHealthScore(health);
        
        infrastructureRepository.save(asset);

        // Alert if container is down
        if (!"running".equalsIgnoreCase(container.getState())) {
            alertService.triggerAlert("CONTAINER_DOWN_" + container.getName(), 
                "Container " + container.getName() + " on " + host + " is in state: " + container.getState(), 
                "CRITICAL", host);
        }
    }

    private void updateServiceAsset(TelemetryRequest.ServiceStatus service, String host) {
        String fullName = "service:" + host + ":" + service.getName();
        Optional<InfrastructureAsset> existing = infrastructureRepository.findByName(fullName);
        InfrastructureAsset asset = existing.orElse(new InfrastructureAsset());
        
        asset.setName(fullName);
        asset.setType("SERVICE");
        asset.setStatus("active".equalsIgnoreCase(service.getStatus()) ? "HEALTHY" : "CRITICAL");
        asset.setHealthScore("active".equalsIgnoreCase(service.getStatus()) ? 100.0 : 0.0);
        
        infrastructureRepository.save(asset);
    }

    private void saveMetric(String name, Double value, String host) {
        SystemMetric metric = SystemMetric.builder()
                .metricName(name)
                .metricValue(value)
                .resourceId(host)
                .unit(getUnitForMetric(name))
                .timestamp(LocalDateTime.now())
                .build();
        metricRepository.save(metric);
    }

    private String getUnitForMetric(String name) {
        if (name.contains("percent")) return "PERCENT";
        if (name.contains("mb")) return "MB";
        if (name.contains("gb")) return "GB";
        if (name.contains("_bps")) return "BPS";
        return "COUNT";
    }

    private void checkThresholds(String host, String name, Double value) {
        if ("cpu_usage_percent".equals(name)) {
            alertService.evaluateMetric(host, "CPU", value, 90.0, "CRITICAL");
            alertService.evaluateMetric(host, "CPU", value, 70.0, "WARNING");
        } else if ("memory_usage_percent".equals(name)) {
            alertService.evaluateMetric(host, "MEMORY", value, 90.0, "CRITICAL");
            alertService.evaluateMetric(host, "MEMORY", value, 80.0, "WARNING");
        } else if ("disk_usage_percent".equals(name)) {
            alertService.evaluateMetric(host, "DISK", value, 95.0, "CRITICAL");
        }
    }
}
