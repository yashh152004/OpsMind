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
}
