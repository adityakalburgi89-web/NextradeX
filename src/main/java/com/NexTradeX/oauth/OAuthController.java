package com.NexTradeX.oauth;

import com.NexTradeX.auth.JwtService;
import com.NexTradeX.common.ApiResponse;
import com.NexTradeX.dto.AuthResponse;
import com.NexTradeX.user.User;
import com.NexTradeX.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/oauth2")
@RequiredArgsConstructor
public class OAuthController {

    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/complete-profile")
    public ResponseEntity<ApiResponse<AuthResponse>> completeProfile(
            @RequestHeader(value = "Authorization", required = false) String bearerToken,
            @RequestBody Map<String, String> profileData) {
        try {
            if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(401, "Missing or invalid Authorization header", null));
            }
            String token = bearerToken.substring(7);
            String username = jwtService.extractUsername(token);
            Long userId = jwtService.extractUserId(token);
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(401, "Invalid token: missing userId", null));
            }
            
            String usernameVal = profileData.get("username");
            String firstName = profileData.get("firstName");
            String lastName = profileData.get("lastName");
            
            if (usernameVal == null || usernameVal.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(400, "Username is required", null));
            }
            
            User user = userService.updateProfileSetup(
                    userId,
                    usernameVal,
                    firstName,
                    lastName
            );
            
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
            log.error("Profile completion failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
}
