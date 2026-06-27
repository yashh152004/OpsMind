package com.opsmind.controller;

import com.opsmind.model.SecurityFinding;
import com.opsmind.repository.SecurityFindingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/security")
public class SecurityController {

    private final SecurityFindingRepository securityFindingRepository;

    public SecurityController(SecurityFindingRepository securityFindingRepository) {
        this.securityFindingRepository = securityFindingRepository;
    }

    @GetMapping("/findings")
    public ResponseEntity<List<SecurityFinding>> getFindings() {
        return ResponseEntity.ok(securityFindingRepository.findAll());
    }

    @PostMapping("/scan")
    public ResponseEntity<java.util.Map<String, Object>> performScan() {
        // Mock scan results generating/updating findings
        if (securityFindingRepository.count() == 0) {
            SecurityFinding f1 = new SecurityFinding();
            f1.setTitle("Exposed SSH Port");
            f1.setSeverity("HIGH");
            f1.setCategory("NETWORK");
            f1.setResourceId("local-host");
            f1.setStatus("OPEN");
            securityFindingRepository.save(f1);

            SecurityFinding f2 = new SecurityFinding();
            f2.setTitle("Unpatched Kernel vulnerability");
            f2.setSeverity("CRITICAL");
            f2.setCategory("OS");
            f2.setResourceId("local-host");
            f2.setStatus("OPEN");
            securityFindingRepository.save(f2);
        }
        
        return ResponseEntity.ok(java.util.Map.of(
            "status", "SUCCESS",
            "findings_count", securityFindingRepository.count(),
            "timestamp", java.time.LocalDateTime.now()
        ));
    }

    @DeleteMapping("/findings/{id}")
    public ResponseEntity<Void> resolveFinding(@PathVariable Long id) {
        securityFindingRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
