package com.opsmind.controller;

import com.opsmind.model.Organization;
import com.opsmind.repository.OrganizationRepository;
import com.opsmind.service.PlatformActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/organizations")
public class OrganizationController {
    private final OrganizationRepository repository;
    private final PlatformActivityService activityService;

    public OrganizationController(OrganizationRepository repository, PlatformActivityService activityService) {
        this.repository = repository;
        this.activityService = activityService;
    }

    @PostMapping
    public ResponseEntity<Organization> create(@RequestBody Organization organization) {
        if (organization.getPlanType() == null) organization.setPlanType("TRIAL");
        Organization saved = repository.save(organization);
        activityService.logAction("ORG_CREATED", "SYSTEM", "system", "New organization provisioned: " + saved.getName());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Organization> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
