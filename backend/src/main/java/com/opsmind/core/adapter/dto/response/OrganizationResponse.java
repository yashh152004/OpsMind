package com.opsmind.core.adapter.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Organization Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrganizationResponse {

    private UUID id;
    private String name;
    private String slug;
    private String plan;
    private String description;
    private String logoUrl;
    private String website;
    private String createdAt;
    private String updatedAt;
}
