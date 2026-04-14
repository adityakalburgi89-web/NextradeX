package com.NexTradeX.auth;

import com.NexTradeX.common.ApiResponse;
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

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        try {
            authService.registerUser(
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getFirstName(),
                    request.getLastName()
            );

            User user = authService.getUserByUsername(request.getUsername());
            String token = jwtService.generateTokenWithUserId(user.getUsername(), user.getId());

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

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        try {
            authService.loginUser(request.getUsername(), request.getPassword());
            User user = authService.getUserByUsername(request.getUsername());
            String token = jwtService.generateTokenWithUserId(user.getUsername(), user.getId());

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
}