package com.NexTradeX.auth;

import com.NexTradeX.common.ApiResponse;
import com.NexTradeX.common.RateLimit;
import com.NexTradeX.dto.AuthResponse;
import com.NexTradeX.dto.LoginRequest;
import com.NexTradeX.dto.RegisterRequest;
import com.NexTradeX.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    @RateLimit(capacity = 5, refillRate = 0.2)
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        try {
            String token = authService.registerUser(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getFirstName(),
                    request.getLastName()
            );

            User user = authService.getUserByUsername(request.getUsername());

            AuthResponse authResponse = AuthResponse.builder()
                    .token(token)
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .expiresIn(jwtService.getJwtExpiration())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(201, "User registered successfully", authResponse));
        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @RateLimit(capacity = 5, refillRate = 0.2)
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        try {
            String token = authService.loginUser(request.getUsername(), request.getPassword());
            User user = authService.getUserByUsername(request.getUsername());

            AuthResponse authResponse = AuthResponse.builder()
                    .token(token)
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .expiresIn(jwtService.getJwtExpiration())
                    .build();

            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Login successful", authResponse));
        } catch (Exception e) {
            log.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, e.getMessage(), null));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateToken(
            @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        try {
            if (bearerToken == null || !bearerToken.startsWith("Bearer ")) {
                return ResponseEntity.ok()
                        .body(new ApiResponse<>(200, "Token is invalid", false));
            }

            String token = bearerToken.substring(7);
            String username = jwtService.extractUsername(token);
            boolean isValid = jwtService.isTokenValid(token, username);

            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Token validation result", isValid));
        } catch (Exception e) {
            log.error("Token validation failed: {}", e.getMessage());
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Token is invalid", false));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            jwtService.invalidateToken(token);
        }
        return ResponseEntity.ok()
                .body(new ApiResponse<>(200, "Logout successful", null));
    }

    @RateLimit(capacity = 3, refillRate = 0.1)
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody java.util.Map<String, String> body) {
        try {
            String email = body.get("email");
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(400, "Email address is required", null));
            }
            authService.processForgotPassword(email);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "If an account exists with that email, a password reset link has been sent.", "Sent"));
        } catch (Exception e) {
            log.error("Forgot password process failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    @RateLimit(capacity = 5, refillRate = 0.2)
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody java.util.Map<String, String> body) {
        try {
            String token = body.get("token");
            String newPassword = body.get("newPassword");
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok()
                    .body(new ApiResponse<>(200, "Password has been successfully reset. You may now log in.", "Reset Successful"));
        } catch (Exception e) {
            log.error("Reset password process failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }
}