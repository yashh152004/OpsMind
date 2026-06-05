package com.opsmind.core.adapter.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * User Response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {

    private UUID id;
    private UUID organizationId;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String status;
    private Boolean emailVerified;
    private String createdAt;
    private String updatedAt;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
