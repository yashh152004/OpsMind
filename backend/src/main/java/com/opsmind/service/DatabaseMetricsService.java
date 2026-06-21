package com.opsmind.service;

import com.opsmind.model.SystemMetric;
import com.opsmind.repository.SystemMetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class DatabaseMetricsService {

    private final JdbcTemplate jdbcTemplate;
    private final SystemMetricRepository metricRepository;

    @Scheduled(fixedRate = 10000) // Poll DB every 10 seconds
    public void collectDatabaseMetrics() {
        try {
            // 1. Threads Connected
            Integer threadsConnected = jdbcTemplate.queryForObject(
                    "SHOW STATUS LIKE 'Threads_connected'", 
                    (rs, rowNum) -> Integer.parseInt(rs.getString("Value")));
            saveMetric("DB_CONNECTIONS", threadsConnected.doubleValue(), "COUNT");

            // 2. Slow Queries
            Integer slowQueries = jdbcTemplate.queryForObject(
                    "SHOW STATUS LIKE 'Slow_queries'", 
                    (rs, rowNum) -> Integer.parseInt(rs.getString("Value")));
            saveMetric("DB_SLOW_QUERIES", slowQueries.doubleValue(), "COUNT");

            log.debug("DB Telemetry - Connections: {} | Slow Queries: {}", threadsConnected, slowQueries);
        } catch (Exception e) {
            log.error("Failed to collect database metrics: {}", e.getMessage());
        }
    }

    private void saveMetric(String name, Double value, String unit) {
        SystemMetric metric = SystemMetric.builder()
                .metricName(name)
                .metricValue(value)
                .resourceId("MySQL-Core")
                .unit(unit)
                .timestamp(LocalDateTime.now())
                .build();
        metricRepository.save(metric);
    }
}
