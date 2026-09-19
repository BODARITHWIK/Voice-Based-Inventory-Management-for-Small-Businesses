package com.swaranidhi.service;

import com.swaranidhi.entity.Business;
import com.swaranidhi.entity.Notification;
import com.swaranidhi.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification createNotification(Business business, String type, String title, String message) {
        Notification notification = new Notification(business, type, title, message);
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<Notification> getAllNotifications(Long businessId) {
        return notificationRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(Long businessId) {
        return notificationRepository.findByBusinessIdAndReadFalseOrderByCreatedAtDesc(businessId);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long businessId) {
        return notificationRepository.countByBusinessIdAndReadFalse(businessId);
    }

    @Transactional
    public void markAsRead(Long businessId, Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getBusiness().getId().equals(businessId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllAsRead(Long businessId) {
        List<Notification> unread = notificationRepository.findByBusinessIdAndReadFalseOrderByCreatedAtDesc(businessId);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
