package com.opsmind.core.application.service;

import com.opsmind.core.adapter.dto.response.OrganizationResponse;

import java.util.UUID;

/**
 * Organization Service Interface - Defines organization management business
 * logic
 */
public interface OrganizationService {

    /**
     * Get organization by ID
     */
    OrganizationResponse getOrganizationById(UUID organizationId);

    /**
     * Get organization by slug
     */
    OrganizationResponse getOrganizationBySlug(String slug);

    /**
     * Check if organization slug exists
     */
    boolean slugExists(String slug);

    /**
     * Create default organization slug from name
     */
    String createSlugFromName(String name);
}
