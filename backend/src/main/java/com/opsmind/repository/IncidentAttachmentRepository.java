package com.opsmind.repository;

import com.opsmind.model.IncidentAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentAttachmentRepository extends JpaRepository<IncidentAttachment, Long> {
    List<IncidentAttachment> findByIncidentId(Long incidentId);
}
