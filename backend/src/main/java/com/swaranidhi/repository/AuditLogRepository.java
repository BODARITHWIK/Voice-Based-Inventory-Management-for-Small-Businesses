package com.swaranidhi.repository;

import com.swaranidhi.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByBusinessIdOrderByTimestampDesc(Long businessId);
    Page<AuditLog> findByBusinessIdOrderByTimestampDesc(Long businessId, Pageable pageable);
}
