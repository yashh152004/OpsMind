package com.opsmind.service;

import com.opsmind.model.AuditLog;
import com.opsmind.model.Notification;
import com.opsmind.repository.AuditLogRepository;
import com.opsmind.repository.NotificationRepository;
import org.springframework.stereotype.Service;

@Service
public class PlatformActivityService {
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final com.opsmind.repository.IncidentTimelineRepository timelineRepository;

    public PlatformActivityService(AuditLogRepository auditLogRepository, 
                                   NotificationRepository notificationRepository,
                                   com.opsmind.repository.IncidentTimelineRepository timelineRepository) {
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.timelineRepository = timelineRepository;
    }

    public void logTimeline(Long incidentId, String eventType, String description, String user) {
        timelineRepository.save(new com.opsmind.model.IncidentTimeline(incidentId, eventType, description, user));
    }

    public void logAction(String action, String module, String user, String details) {
        auditLogRepository.save(new AuditLog(action, module, user, details));
    }

    public void notify(String title, String message, String severity) {
        Notification n = new Notification();
        n.setTitle(title);
        n.setMessage(message);
        n.setSeverity(severity);
        n.setRead(false);
        n.setCreatedAt(java.time.LocalDateTime.now());
        notificationRepository.save(n);
    }

    public java.util.List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
