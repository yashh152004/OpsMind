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

    public PlatformActivityService(AuditLogRepository auditLogRepository, 
                                   NotificationRepository notificationRepository) {
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
    }

    public void logAction(String action, String module, String user, String details) {
        auditLogRepository.save(new AuditLog(action, module, user, details));
    }

    public void notify(String title, String message, String type) {
        Notification n = new Notification();
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setRead(false);
        n.setCreatedAt(java.time.LocalDateTime.now());
        notificationRepository.save(n);
    }

    public java.util.List<AuditLog> getRecentLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
