package com.swaranidhi.repository;

import com.swaranidhi.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByBusinessIdOrderByCreatedAtDesc(Long businessId);
    List<Notification> findByBusinessIdAndReadFalseOrderByCreatedAtDesc(Long businessId);
    long countByBusinessIdAndReadFalse(Long businessId);
}
