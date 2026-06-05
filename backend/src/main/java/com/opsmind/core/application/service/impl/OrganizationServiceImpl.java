package com.opsmind.core.application.service.impl;

import com.opsmind.core.adapter.dto.response.OrganizationResponse;
import com.opsmind.core.application.service.OrganizationService;
import com.opsmind.core.domain.entity.OrganizationEntity;
import com.opsmind.core.domain.repository.OrganizationRepository;
import com.opsmind.core.infrastructure.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Organization Service Implementation
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;

    @Override
    @Transactional(readOnly = true)
    public OrganizationResponse getOrganizationById(UUID organizationId) {
        log.info("Fetching organization: {}", organizationId);

        OrganizationEntity organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", organizationId.toString()));

        return mapToOrganizationResponse(organization);
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationResponse getOrganizationBySlug(String slug) {
        log.info("Fetching organization by slug: {}", slug);

        OrganizationEntity organization = organizationRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", slug));

        return mapToOrganizationResponse(organization);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean slugExists(String slug) {
        return organizationRepository.existsBySlug(slug);
    }

    @Override
    public String createSlugFromName(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }

    private OrganizationResponse mapToOrganizationResponse(OrganizationEntity organization) {
        return OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .slug(organization.getSlug())
                .plan(organization.getPlan())
                .description(organization.getDescription())
                .logoUrl(organization.getLogoUrl())
                .website(organization.getWebsite())
                .createdAt(organization.getCreatedAt().toString())
                .updatedAt(organization.getUpdatedAt().toString())
                .build();
    }
}
