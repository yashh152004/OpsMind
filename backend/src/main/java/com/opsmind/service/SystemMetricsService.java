package com.opsmind.service;

import com.opsmind.model.Alert;
import com.opsmind.model.Incident;
import com.opsmind.model.SystemMetric;
import com.opsmind.repository.AlertRepository;
import com.opsmind.repository.IncidentRepository;
import com.opsmind.repository.SystemMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class SystemMetricsService {

    private final AlertRepository alertRepository;
    private final IncidentRepository incidentRepository;
    private final SystemInfo systemInfo = new SystemInfo();
    private final HardwareAbstractionLayer hal = systemInfo.getHardware();

    private long[] prevTicks = new long[CentralProcessor.TickType.values().length];

    private final SystemMetricRepository metricRepository;

    @Scheduled(fixedRate = 5000) 
    public void collectLocalTelemetry() {
        CentralProcessor processor = hal.getProcessor();
        GlobalMemory memory = hal.getMemory();

        double cpuLoad = processor.getSystemCpuLoadBetweenTicks(prevTicks) * 100;
        prevTicks = processor.getSystemCpuLoadTicks();

        long totalMem = memory.getTotal();
        long availableMem = memory.getAvailable();
        double memUsage = ((double) (totalMem - availableMem) / totalMem) * 100;

        // Persist for ML/Analytics
        saveMetric("CPU_USAGE", cpuLoad, "PERCENT");
        saveMetric("MEMORY_USAGE", memUsage, "PERCENT");

        log.debug("Real-Time Telemetry - CPU: {}% | RAM: {}%", String.format("%.2f", cpuLoad), String.format("%.2f", memUsage));

        checkThresholds(cpuLoad, memUsage);
    }

    private void saveMetric(String name, Double value, String unit) {
        SystemMetric metric = SystemMetric.builder()
                .metricName(name)
                .metricValue(value)
                .resourceId("Local-Host")
                .unit(unit)
                .timestamp(LocalDateTime.now())
                .build();
        metricRepository.save(metric);
    }


    private void checkThresholds(double cpu, double mem) {
        if (cpu > 90.0) {
            triggerAutonomousIncident("HIGH_CPU_LOAD", "System CPU usage exceeded 90% threshold: " + String.format("%.2f", cpu) + "%");
        }
        if (mem > 95.0) {
            triggerAutonomousIncident("CRITICAL_MEMORY_SATURATION", "System RAM usage critically high: " + String.format("%.2f", mem) + "%");
        }
    }

    private void triggerAutonomousIncident(String name, String message) {
        // Prevent duplicate incidents for the same ongoing issue
        boolean active = incidentRepository.findAll().stream()
                .anyMatch(i -> i.getTitle().contains(name) && !"RESOLVED".equals(i.getStatus()));
        
        if (!active) {
            log.warn("AUTONOMOUS_INCIDENT_TRIGGERED: {}", name);
            
            Alert alert = Alert.builder()
                    .alertName(name)
                    .source("Local-Host-Observer")
                    .message(message)
                    .severity("CRITICAL")
                    .status("TRIGGERED")
                    .timestamp(LocalDateTime.now())
                    .build();
            alertRepository.save(alert);

            Incident incident = Incident.builder()
                    .title("Autonomous Detection: " + name)
                    .severity("P1")
                    .priority("HIGHEST")
                    .status("INVESTIGATING")
                    .serviceName("Local-Machine")
                    .description(message + ". Orchestrated by OpsMind Telemetry Engine.")
                    .createdAt(LocalDateTime.now())
                    .build();
            incidentRepository.save(incident);
        }
    }
}
