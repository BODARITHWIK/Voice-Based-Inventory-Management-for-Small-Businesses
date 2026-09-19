package com.swaranidhi.service;

import com.swaranidhi.entity.AuditLog;
import com.swaranidhi.entity.Business;
import com.swaranidhi.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void logAction(Business business, String userName, String action, String entityName, String entityId, String details) {
        try {
            AuditLog log = new AuditLog(business, userName, action, entityName, entityId, details);
            auditLogRepository.save(log);
        } catch (Exception e) {
            // Audit failure should not roll back the primary business transaction
        }
    }
}
