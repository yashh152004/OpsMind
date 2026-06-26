package com.opsmind.repository;

import com.opsmind.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByIsReadFalseOrderByCreatedAtDesc();
    List<Notification> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
}
