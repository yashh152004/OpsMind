package com.opsmind.service;

import com.opsmind.model.Incident;
import com.opsmind.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentDetectionService {

    private final OtelTelemetryService otelTelemetryService;
    private final IncidentRepository incidentRepository;
    private final PlatformActivityService activityService;

    @org.springframework.beans.factory.annotation.Value("${app.incident.error-rate-threshold:0.05}")
    private double errorRateThreshold;

    @org.springframework.beans.factory.annotation.Value("${app.incident.evaluation-window-minutes:1}")
    private int evaluationWindowMinutes;

    @Scheduled(fixedDelay = 10000) // Run every 10 seconds
    public void evaluateErrorRateIncident() {
        log.debug("Evaluating telemetry metrics for Incident Detection...");

        String window = evaluationWindowMinutes + "m";

        // Query the error rate for monitored-service over the configured window
        // First get the total HTTP requests in the configured window
        double requests1m = otelTelemetryService.queryPrometheus(
                String.format("sum(increase(opsmind_http_server_request_duration_seconds_count{exported_job=\"monitored-service\"}[%s]))", window)
        );

        // Next get the HTTP 5xx errors in the configured window
        double errors1m = otelTelemetryService.queryPrometheus(
                String.format("sum(increase(opsmind_http_server_request_duration_seconds_count{exported_job=\"monitored-service\", http_response_status_code=~\"5..\"}[%s]))", window)
        );

        double errorRate = 0.0;
        if (requests1m > 0) {
            errorRate = errors1m / requests1m;
        }

        log.debug("monitored-service - Requests ({}): {}, Errors ({}): {}, Error Rate: {}%", window, requests1m, window, errors1m, errorRate * 100);

        double threshold = errorRateThreshold;
        String serviceName = "monitored-service";
        String incidentType = "HIGH_ERROR_RATE";

        Optional<Incident> activeIncidentOpt = incidentRepository.findFirstByServiceNameAndTypeAndStatusNotOrderByIdDesc(
                serviceName, incidentType, "RESOLVED"
        );

        if (errorRate > threshold) {
            if (activeIncidentOpt.isEmpty()) {
                // No active incident of this type exists for this service, trigger a new one!
                log.warn("DETECTED HIGH ERROR RATE: {}% (threshold: 5%). Triggering incident...", errorRate * 100);
                
                Incident incident = Incident.builder()
                        .title("High HTTP Error Rate on monitored-service")
                        .description(String.format("The HTTP status 5xx error rate is %.2f%% over the last %d minute(s), exceeding the threshold of %.2f%%.", errorRate * 100, evaluationWindowMinutes, threshold * 100))
                        .severity("P1")
                        .priority("HIGHEST")
                        .status("OPEN")
                        .serviceName(serviceName)
                        .type(incidentType)
                        .metricValue(errorRate * 100)
                        .threshold(threshold * 100)
                        .detectedAt(LocalDateTime.now())
                        .category("APP")
                        .environment("PRODUCTION")
                        .cluster("development")
                        .build();

                Incident saved = incidentRepository.save(incident);
                
                activityService.logAction("INCIDENT_DECLARED", "INCIDENTS", "system", "Incident automatically detected: " + saved.getTitle());
                activityService.logTimeline(saved.getId(), "DECLARATION", "High error rate detected from Prometheus metrics. Current: " + String.format("%.2f%%", errorRate * 100), "system");
                activityService.notify("Critical Incident: " + saved.getId(), saved.getTitle() + " has been declared.", saved.getSeverity());
            } else {
                // Update active incident with latest metric value
                Incident activeIncident = activeIncidentOpt.get();
                activeIncident.setMetricValue(errorRate * 100);
                incidentRepository.save(activeIncident);
            }
        } else {
            // Error rate is back to normal or there are no requests
            if (activeIncidentOpt.isPresent()) {
                Incident activeIncident = activeIncidentOpt.get();
                log.info("Recovery Case: Error rate returned to normal ({}%). Resolving Incident #{}...", errorRate * 100, activeIncident.getId());
                
                activeIncident.setStatus("RESOLVED");
                activeIncident.setResolvedAt(LocalDateTime.now());
                activeIncident.setResolution(String.format("Auto-resolved because HTTP error rate (%.2f%%) fell below the threshold of %.2f%%.", errorRate * 100, threshold * 100));
                
                incidentRepository.save(activeIncident);
                
                activityService.logTimeline(activeIncident.getId(), "STATUS_TRANSITION", "Incident auto-resolved. Error rate has normalized below threshold.", "system");
                activityService.logAction("INCIDENT_UPDATED", "INCIDENTS", "system", "Auto-resolved incident #" + activeIncident.getId());
            }
        }
    }
}
