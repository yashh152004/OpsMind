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
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public PlatformActivityService(AuditLogRepository auditLogRepository, 
                                   NotificationRepository notificationRepository,
                                   com.opsmind.repository.IncidentTimelineRepository timelineRepository,
                                   org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate) {
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.timelineRepository = timelineRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public void logTimeline(Long incidentId, String eventType, String content, String operator) {
        timelineRepository.save(com.opsmind.model.IncidentTimeline.builder()
                .incidentId(incidentId)
                .eventType(eventType)
                .content(content)
                .operator(operator)
                .build());
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
        Notification saved = notificationRepository.save(n);
        
        // Push real-time notification to all connected clients
        messagingTemplate.convertAndSend("/topic/notifications", saved);
        
        // If it's a high-severity event, push to alerts topic as well
        if ("CRITICAL".equalsIgnoreCase(severity) || "P1".equalsIgnoreCase(severity)) {
            messagingTemplate.convertAndSend("/topic/alerts", saved);
        }
    }

    public java.util.List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }

    public java.util.List<com.opsmind.model.IncidentTimeline> getTimelineForIncident(Long incidentId) {
        return timelineRepository.findByIncidentIdOrderByTimestampDesc(incidentId);
    }
}
