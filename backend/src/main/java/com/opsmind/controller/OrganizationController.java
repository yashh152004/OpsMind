package com.opsmind.controller;

import com.opsmind.model.Organization;
import com.opsmind.model.User;
import com.opsmind.repository.OrganizationRepository;
import com.opsmind.service.AuthService;
import com.opsmind.service.PlatformActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/organizations")
public class OrganizationController {
    private final OrganizationRepository repository;
    private final AuthService authService;
    private final PlatformActivityService activityService;

    public OrganizationController(OrganizationRepository repository, AuthService authService, PlatformActivityService activityService) {
        this.repository = repository;
        this.authService = authService;
        this.activityService = activityService;
    }

    @PostMapping
    public ResponseEntity<Organization> create(@RequestBody Organization organization) {
        if (organization.getPlanType() == null) organization.setPlanType("TRIAL");
        Organization saved = repository.save(organization);
        activityService.logAction("ORG_CREATED", "SYSTEM", "system", "New organization provisioned: " + saved.getName());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/me")
    public ResponseEntity<Organization> getMe() {
        User user = authService.getCurrentUser();
        if (user.getOrganizationId() == null) {
            return ResponseEntity.notFound().build();
        }
        return repository.findById(user.getOrganizationId()).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<Organization> updateMe(@RequestBody Organization data) {
        User user = authService.getCurrentUser();
        if (user.getOrganizationId() == null) {
            return ResponseEntity.badRequest().build();
        }
        return repository.findById(user.getOrganizationId()).map(org -> {
            org.setName(data.getName());
            org.setSlug(data.getSlug());
            org.setDescription(data.getDescription());
            org.setWebsite(data.getWebsite());
            org.setLogoUrl(data.getLogoUrl());
            Organization saved = repository.save(org);
            activityService.logAction("WORKSPACE_UPDATED", "ORGANIZATION", user.getEmail(), "Organization workspace policy updated.");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Organization> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
