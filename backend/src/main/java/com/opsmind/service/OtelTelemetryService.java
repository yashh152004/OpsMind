package com.opsmind.service;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class OtelTelemetryService {

    private final RestTemplate restTemplate;

    @Value("${telemetry.prometheus-url}")
    private String prometheusUrl;

    @Value("${telemetry.jaeger-url}")
    private String jaegerUrl;

    @Value("${telemetry.loki-url}")
    private String lokiUrl;

    public OtelTelemetryService() {
        this.restTemplate = new RestTemplate();
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TraceDto {
        private String id;
        private String operation;
        private double durationMs;
        private String timestamp;
        private boolean error;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LogDto {
        private String timestamp;
        private String message;
        private String level;
    }

    @Data
    @Builder
    public static class TelemetryResponse {
        private String serviceName;
        private String status;
        private long requestCount;
        private long errorCount;
        private double requestRate;
        private double latencyMs;
        private List<TraceDto> recentTraces;
        private List<LogDto> recentLogs;
    }

    public TelemetryResponse getMonitoredServiceTelemetry() {
        String status = checkServiceStatus();
        
        // 1. Query Prometheus Metrics
        double totalRequests = queryPrometheus("sum(opsmind_http_server_request_duration_seconds_count{exported_job=\"monitored-service\"})");
        double totalErrors = queryPrometheus("sum(opsmind_http_server_request_duration_seconds_count{exported_job=\"monitored-service\", http_response_status_code=~\"5..\"})");
        double requestRate = queryPrometheus("sum(rate(opsmind_http_server_request_duration_seconds_count{exported_job=\"monitored-service\"}[1m]))");
        
        double increaseSum = queryPrometheus("sum(increase(opsmind_http_server_request_duration_seconds_sum{exported_job=\"monitored-service\"}[1m]))");
        double increaseCount = queryPrometheus("sum(increase(opsmind_http_server_request_duration_seconds_count{exported_job=\"monitored-service\"}[1m]))");
        double latencyMs = 0.0;
        if (increaseCount > 0) {
            latencyMs = (increaseSum / increaseCount) * 1000.0;
        } else {
            double totalSum = queryPrometheus("sum(opsmind_http_server_request_duration_seconds_sum{exported_job=\"monitored-service\"})");
            if (totalRequests > 0) {
                latencyMs = (totalSum / totalRequests) * 1000.0;
            }
        }

        // 2. Query Jaeger Traces
        List<TraceDto> traces = getRecentTraces();

        // 3. Query Loki Logs
        List<LogDto> logs = getRecentLogs();

        return TelemetryResponse.builder()
                .serviceName("monitored-service")
                .status(status)
                .requestCount((long) totalRequests)
                .errorCount((long) totalErrors)
                .requestRate(requestRate)
                .latencyMs(latencyMs)
                .recentTraces(traces)
                .recentLogs(logs)
                .build();
    }

    private String checkServiceStatus() {
        try {
            // Ping port 8081
            String helloUrl = "http://localhost:8081/api/hello";
            restTemplate.getForObject(helloUrl, String.class);
            return "UP";
        } catch (Exception e) {
            // Fallback: check if we have any traces or metrics in Prometheus
            double totalRequests = queryPrometheus("sum(opsmind_http_server_request_duration_seconds_count{exported_job=\"monitored-service\"})");
            return totalRequests > 0 ? "UP" : "DOWN";
        }
    }

    public double queryPrometheus(String promQuery) {
        try {
            java.net.URI uri = UriComponentsBuilder.fromHttpUrl(prometheusUrl)
                    .path("/api/v1/query")
                    .queryParam("query", promQuery)
                    .build()
                    .toUri();
            
            JsonNode response = restTemplate.getForObject(uri, JsonNode.class);
            if (response != null && "success".equals(response.path("status").asText())) {
                JsonNode result = response.path("data").path("result");
                if (result.isArray() && result.size() > 0) {
                    String valStr = result.get(0).path("value").get(1).asText();
                    return Double.parseDouble(valStr);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to query Prometheus with query {}: {}", promQuery, e.getMessage());
        }
        return 0.0;
    }

    public List<TraceDto> getRecentTraces() {
        List<TraceDto> list = new ArrayList<>();
        try {
            String url = jaegerUrl + "/api/traces?service=monitored-service&limit=15";
            JsonNode response = restTemplate.getForObject(url, JsonNode.class);
            if (response != null && response.has("data")) {
                JsonNode data = response.get("data");
                if (data.isArray()) {
                    for (JsonNode trace : data) {
                        String traceId = trace.path("traceID").asText();
                        JsonNode spans = trace.path("spans");
                        if (spans.isArray() && spans.size() > 0) {
                            JsonNode rootSpan = spans.get(0);
                            String operationName = rootSpan.path("operationName").asText();
                            double durationUs = rootSpan.path("duration").asDouble();
                            long startTimeUs = rootSpan.path("startTime").asLong();
                            
                            // Check if error tag is true
                            boolean hasError = false;
                            JsonNode tags = rootSpan.path("tags");
                            if (tags.isArray()) {
                                for (JsonNode tag : tags) {
                                    if ("error".equals(tag.path("key").asText()) && tag.path("value").asBoolean()) {
                                        hasError = true;
                                        break;
                                    }
                                }
                            }
                            
                            LocalDateTime time = LocalDateTime.ofInstant(
                                    java.time.Instant.ofEpochMilli(startTimeUs / 1000), 
                                    java.time.ZoneId.systemDefault()
                            );
                            
                            list.add(new TraceDto(
                                    traceId,
                                    operationName,
                                    durationUs / 1000.0,
                                    time.toString(),
                                    hasError
                            ));
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to query Jaeger traces: {}", e.getMessage());
        }
        return list;
    }

    public List<LogDto> getRecentLogs() {
        List<LogDto> list = new ArrayList<>();
        try {
            String query = "{service_name=\"monitored-service\"}";
            java.net.URI uri = UriComponentsBuilder.fromHttpUrl(lokiUrl)
                    .path("/loki/api/v1/query_range")
                    .queryParam("query", query)
                    .queryParam("limit", 25)
                    .build()
                    .toUri();
            
            JsonNode response = restTemplate.getForObject(uri, JsonNode.class);
            if (response != null && "success".equals(response.path("status").asText())) {
                JsonNode streams = response.path("data").path("result");
                if (streams.isArray()) {
                    for (JsonNode streamWrapper : streams) {
                        JsonNode stream = streamWrapper.path("stream");
                        String streamLevel = stream.path("level").asText(stream.path("severity").asText(""));
                        
                        JsonNode values = streamWrapper.path("values");
                        if (values.isArray()) {
                            for (JsonNode val : values) {
                                if (val.size() >= 2) {
                                    long ns = val.get(0).asLong();
                                    String msg = val.get(1).asText();
                                    
                                    String level = streamLevel;
                                    if (level.isEmpty()) {
                                        if (msg.contains("ERROR") || msg.contains("RuntimeException") || msg.contains("Exception")) {
                                            level = "ERROR";
                                        } else if (msg.contains("WARN")) {
                                            level = "WARN";
                                        } else {
                                            level = "INFO";
                                        }
                                    }
                                    
                                    LocalDateTime time = LocalDateTime.ofInstant(
                                            java.time.Instant.ofEpochMilli(ns / 1_000_000), 
                                            java.time.ZoneId.systemDefault()
                                    );
                                    
                                    list.add(new LogDto(time.toString(), msg, level));
                                }
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to query Loki logs: {}", e.getMessage());
        }
        
        list.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return list;
    }
}
