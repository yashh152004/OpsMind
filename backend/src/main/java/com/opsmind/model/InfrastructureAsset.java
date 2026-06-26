package com.opsmind.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "infrastructure")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InfrastructureAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id")
    private Long organizationId;

    private String name;
    private String type; // DATABASE, CLUSTER, SERVICE, STORAGE
    private String status; // HEALTHY, WARNING, CRITICAL
    private String region;
    private String provider; // AWS, GCP, ON_PREM
    private Double healthScore;
}
