package com.opsmind.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "services")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    private String description;
    
    private String type; // Microservice, Database, Gateway, etc.
    
    private String status; // HEALTHY, DEGRADED, DOWN
    
    private Double healthScore; // 0-100 analytics metric

    @Column(name = "organization_id")
    private Long organizationId;
}
