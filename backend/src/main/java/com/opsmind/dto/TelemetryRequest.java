package com.opsmind.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelemetryRequest {
    private String hostname;
    private String ipAddress;
    private String os;
    private String architecture;
    private Long uptime;
    private Integer cpuCount;
    private Double totalMemoryMb;
    private Double totalDiskMb;
    
    private Map<String, Double> systemMetrics;
    private List<ProcessInfo> processes;
    private List<ContainerInfo> containers;
    private List<ServiceStatus> services;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessInfo {
        private String name;
        private Integer pid;
        private Double cpuPercent;
        private Double memoryMb;
        private String username;
        private String command;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContainerInfo {
        private String containerId;
        private String name;
        private String image;
        private String state; // running, exited
        private String status;
        private Double cpuPercent;
        private Double memoryMb;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceStatus {
        private String name;
        private String status; // active, inactive
        private String description;
    }
}
