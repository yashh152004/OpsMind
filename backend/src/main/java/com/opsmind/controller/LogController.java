package com.opsmind.controller;

import com.opsmind.model.LogEntry;
import com.opsmind.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogRepository logRepository;

    @GetMapping
    public ResponseEntity<List<LogEntry>> getLogs(@RequestParam(required = false) String level) {
        if (level != null) {
            return ResponseEntity.ok(logRepository.findByLevelOrderByTimestampDesc(level));
        }
        return ResponseEntity.ok(logRepository.findTop100ByOrderByTimestampDesc());
    }

    @PostMapping("/ingest")
    public ResponseEntity<LogEntry> ingestLog(@RequestBody LogEntry logEntry) {
        return ResponseEntity.ok(logRepository.save(logEntry));
    }
}
