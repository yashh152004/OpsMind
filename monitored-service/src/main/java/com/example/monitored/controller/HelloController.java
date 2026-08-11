package com.example.monitored.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api")
public class HelloController {

    private static final Logger log = LoggerFactory.getLogger(HelloController.class);
    private final Random random = new Random();

    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> sayHello() {
        log.info("Received request on /hello endpoint");
        return ResponseEntity.ok(Map.of("message", "Hello, World! OpsMind microservice telemetry is working.", "status", "success"));
    }

    @GetMapping("/delay")
    public ResponseEntity<Map<String, Object>> getDelay(@RequestParam(defaultValue = "false") boolean randomDelay) {
        int ms = randomDelay ? 100 + random.nextInt(700) : 200;
        log.info("Processing request on /delay endpoint. Injecting delay of {} ms", ms);
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Request interrupted", e);
        }
        return ResponseEntity.ok(Map.of("message", "Processed request with delay", "delay_ms", ms, "status", "success"));
    }

    @GetMapping("/error")
    public ResponseEntity<Map<String, String>> triggerError() {
        log.error("Intentionally generating controlled database/server error on /error endpoint");
        throw new RuntimeException("Simulated check failed: unable to write transaction to payment DB.");
    }
}
