package com.nextradex.modules.security.oauth;

import com.nextradex.modules.security.auth.JwtAuthenticationToken;
import com.nextradex.modules.security.auth.JwtService;
import com.nextradex.shared.common.ApiResponse;
import com.nextradex.api.dto.AuthResponse;
import com.nextradex.modules.user.User;
import com.nextradex.modules.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/oauth2")
@RequiredArgsConstructor
public class OAuthController {

    private final UserService userService;
    private final JwtService jwtService;

    /**
     * Complete OAuth profile setup after successful Google OAuth login
     * 
     * SECURITY CONTEXT:
     * - Requires valid JWT token in Authorization header
     * - Token must contain valid userId
     * - Session is STATELESS (no cookies required)
     * 
     * DEBUG: Check Authentication object in controller:
     *   if (auth instanceof JwtAuthenticationToken) {
     *       Long userId = ((JwtAuthenticationToken) auth).getUserId();
     *       String username = (String) auth.getPrincipal();
     *   }
     */
    @PostMapping("/complete-profile")
    public ResponseEntity<ApiResponse<AuthResponse>> completeProfile(
            Authentication authentication,
            @RequestBody Map<String, String> profileData) {
        try {
            // FIX #1: Use Spring Security Authentication object (JWT filter populates this)
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) {
                log.warn("complete-profile: Authentication is null, not authenticated, or anonymous");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(401, "User is not authenticated. JWT token missing or invalid.", null));
            }
            
            // FIX #2: Extract userId from JWT token stored in Authentication
            Long userId = null;
            if (authentication instanceof JwtAuthenticationToken) {
                userId = ((JwtAuthenticationToken) authentication).getUserId();
            } else {
                // Fallback: try to extract from principal
                userId = jwtService.extractUserIdFromAuthentication(authentication);
            }
            
            // Fallback #2: Extract from OAuth2AuthenticationToken principal email if session-based
            if (userId == null && authentication instanceof org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken) {
                org.springframework.security.oauth2.core.user.OAuth2User oauth2User = 
                        ((org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken) authentication).getPrincipal();
                String email = oauth2User.getAttribute("email");
                if (email != null) {
                    userId = userService.findByEmail(email).map(com.nextradex.modules.user.User::getId).orElse(null);
                    log.info("complete-profile: Extracted userId {} from OAuth2 session email: {}", userId, email);
                }
            }
            
            if (userId == null) {
                log.warn("complete-profile: Could not extract userId from authentication");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(401, "Invalid token: missing userId. JWT may be expired.", null));
            }
            
            log.info("complete-profile: Processing profile setup for userId: {}", userId);
            
            String username = (String) authentication.getPrincipal();
            String usernameVal = profileData.get("username");
            String firstName = profileData.get("firstName");
            String lastName = profileData.get("lastName");
            
            // FIX #3: Validate required fields
            if (usernameVal == null || usernameVal.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(400, "Username is required", null));
            }
            
            // FIX #4: Update user profile
            User user = userService.updateProfileSetup(
                    userId,
                    usernameVal,
                    firstName,
                    lastName
            );
            
            log.info("complete-profile: Profile setup completed for user: {}", user.getUsername());
            
            // FIX #5: Generate new token with updated username
            String newToken = jwtService.generateTokenWithUserId(user.getUsername(), user.getId());
            
            AuthResponse authResponse = AuthResponse.builder()
                    .token(newToken)
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .expiresIn(jwtService.getJwtExpiration())
                    .needsProfileSetup(false)
                    .build();
            
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Profile completed successfully", authResponse));
        } catch (Exception e) {
            log.error("Profile completion failed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, "Profile setup failed: " + e.getMessage(), null));
        }
    }
}
