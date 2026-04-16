package com.NexTradeX.user;

import com.NexTradeX.auth.JwtAuthenticationToken;
import com.NexTradeX.auth.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.NexTradeX.common.ApiResponse;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(Authentication authentication) {
        // ✅ DEBUG ENDPOINT: Check Authentication object
        log.info("[DEBUG] /user/profile - Authentication type: {}", 
            authentication != null ? authentication.getClass().getSimpleName() : "null");
        log.info("[DEBUG] /user/profile - Is authenticated: {}", 
            authentication != null ? authentication.isAuthenticated() : false);
        if (authentication instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
            log.info("[DEBUG] /user/profile - JWT Principal: {}, UserId: {}", 
                jwtAuth.getPrincipal(), jwtAuth.getUserId());
        }
        
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        if (userId == null) {
            log.warn("[WARNING] /user/profile - Could not extract userId from authentication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, "Invalid authentication: userId not found", null));
        }
        
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        UserProfileResponse profile = UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .active(user.getActive())
                .emailVerified(user.getEmailVerified())
                .build();

        return ResponseEntity.ok(new ApiResponse<>(200, "Profile retrieved", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request) {
        Long userId = jwtService.extractUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, "Invalid authentication: userId not found", null));
        }
        
        User user = userService.updateUser(userId, request.getFirstName(), request.getLastName(), request.getEmail());

        UserProfileResponse profile = UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .active(user.getActive())
                .emailVerified(user.getEmailVerified())
                .build();

        return ResponseEntity.ok(new ApiResponse<>(200, "Profile updated", profile));
    }
}