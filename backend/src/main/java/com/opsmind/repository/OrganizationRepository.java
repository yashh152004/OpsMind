package com.opsmind.repository;

import com.opsmind.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    java.util.Optional<Organization> findByName(String name);
}
