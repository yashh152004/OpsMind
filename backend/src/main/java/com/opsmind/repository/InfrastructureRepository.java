package com.opsmind.repository;

import com.opsmind.model.InfrastructureAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InfrastructureRepository extends JpaRepository<InfrastructureAsset, Long> {
    Optional<InfrastructureAsset> findByName(String name);
    java.util.List<InfrastructureAsset> findByOrganizationId(Long organizationId);
}
