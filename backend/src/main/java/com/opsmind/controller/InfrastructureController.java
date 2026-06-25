package com.opsmind.controller;

import com.opsmind.model.InfrastructureAsset;
import com.opsmind.repository.InfrastructureRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/infrastructure")
public class InfrastructureController {

    private final InfrastructureRepository infrastructureRepository;

    public InfrastructureController(InfrastructureRepository infrastructureRepository) {
        this.infrastructureRepository = infrastructureRepository;
    }

    @GetMapping("/assets")
    public ResponseEntity<List<InfrastructureAsset>> getAllAssets() {
        return ResponseEntity.ok(infrastructureRepository.findAll());
    }

    @PostMapping("/assets")
    public ResponseEntity<InfrastructureAsset> createAsset(@RequestBody InfrastructureAsset asset) {
        return ResponseEntity.ok(infrastructureRepository.save(asset));
    }

    @PostMapping("/scan")
    public ResponseEntity<java.util.Map<String, Object>> performScan() {
        // Simulate a real-time cluster scan
        return ResponseEntity.ok(java.util.Map.of(
            "status", "COMPLETED",
            "nodes_discovered", infrastructureRepository.count(),
            "anomalies_found", infrastructureRepository.findAll().stream().filter(a -> a.getHealthScore() < 80).count(),
            "timestamp", java.time.LocalDateTime.now()
        ));
    }

    @GetMapping("/topology")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getTopology() {
        // Return a mock relationship map between existing assets
        java.util.List<java.util.Map<String, Object>> relationships = new java.util.ArrayList<>();
        java.util.List<InfrastructureAsset> assets = infrastructureRepository.findAll();
        for (int i = 0; i < assets.size(); i++) {
            if (i > 0) {
                relationships.add(java.util.Map.of(
                    "source", assets.get(i-1).getName(),
                    "target", assets.get(i).getName(),
                    "type", "DEPENDS_ON"
                ));
            }
        }
        return ResponseEntity.ok(relationships);
    }
}
