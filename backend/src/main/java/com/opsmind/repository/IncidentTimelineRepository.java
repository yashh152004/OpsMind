package com.opsmind.repository;

import com.opsmind.model.IncidentTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IncidentTimelineRepository extends JpaRepository<IncidentTimeline, Long> {
    List<IncidentTimeline> findByIncidentIdOrderByCreatedAtDesc(Long incidentId);
}
