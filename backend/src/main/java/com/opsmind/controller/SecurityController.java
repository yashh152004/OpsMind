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
}
