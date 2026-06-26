package com.opsmind.controller;

import com.opsmind.dto.TelemetryRequest;
import com.opsmind.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
public class TelemetryController {

    private final TelemetryService telemetryService;

    @PostMapping("/report")
    public ResponseEntity<Map<String, String>> reportTelemetry(@RequestBody TelemetryRequest request) {
        telemetryService.processTelemetry(request);
        return ResponseEntity.ok(Map.of("message", "Telemetry processed successfully", "status", "success"));
    }
}
