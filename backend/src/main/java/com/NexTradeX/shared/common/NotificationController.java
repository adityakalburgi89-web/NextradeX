package com.nextradex.shared.common;

import com.nextradex.modules.security.auth.JwtService;
import com.nextradex.modules.user.User;
import com.nextradex.modules.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Notification> list = notificationRepository.findAllByUserOrderByCreatedAtDesc(user);
            return ResponseEntity.ok(new ApiResponse<>(200, "Notifications retrieved", list));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        try {
            Long userId = jwtService.extractUserIdFromAuthentication(authentication);
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Notification> unread = notificationRepository.findByUserAndIsRead(user, false);
            for (Notification n : unread) {
                n.setRead(true);
            }
            notificationRepository.saveAll(unread);
            return ResponseEntity.ok(new ApiResponse<>(200, "All marked as read", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
}
