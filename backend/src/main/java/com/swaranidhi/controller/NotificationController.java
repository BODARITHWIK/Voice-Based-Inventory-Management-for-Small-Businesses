package com.swaranidhi.controller;

import com.swaranidhi.dto.ApiResponse;
import com.swaranidhi.entity.Notification;
import com.swaranidhi.security.UserPrincipal;
import com.swaranidhi.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getAllNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<Notification> list = notificationService.getAllNotifications(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Notifications", list));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<Notification> list = notificationService.getUnreadNotifications(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Unread notifications", list));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal principal) {
        long count = notificationService.getUnreadCount(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Unread count", Map.of("unreadCount", count)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<String>> markAsRead(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        notificationService.markAsRead(principal.getBusinessId(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", "Notification id: " + id));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", "Success"));
    }
}
