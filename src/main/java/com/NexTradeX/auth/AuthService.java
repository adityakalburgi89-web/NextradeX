package com.NexTradeX.auth;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.springframework.data.redis.core.StringRedisTemplate;
import com.NexTradeX.common.EmailService;
import com.NexTradeX.user.User;
import com.NexTradeX.user.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserService userService;
    private final JwtService jwtService;
    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userService.findByUsername(username)
                .map(this::buildUserDetails)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public UserDetails loadUserByEmail(String email) throws UsernameNotFoundException {
        return userService.findByEmail(email)
                .map(this::buildUserDetails)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    @Transactional
    public String registerUser(String username, String email, String password,
            String firstName, String lastName) {
        User user = userService.createUser(username, email, password, firstName, lastName);
        log.info("User registered: {}", username);
        return jwtService.generateTokenWithUserId(user.getUsername(), user.getId());
    }

    public String loginUser(String identifier, String password) {
        String cleanIdentifier = identifier != null ? identifier.trim() : "";
        String cleanPassword = password != null ? password.trim() : "";

        // 1. Try to match by username case-insensitively first
        Optional<User> userByUsername = userService.findByUsername(cleanIdentifier);
        if (userByUsername.isPresent()) {
            User user = userByUsername.get();
            if (userService.validatePassword(cleanPassword, user.getPasswordHash())) {
                if (!user.getActive()) {
                    throw new RuntimeException("User account is inactive");
                }
                userService.updateLastLogin(user.getId());
                log.info("User logged in by username: {}", user.getUsername());
                return jwtService.generateTokenWithUserId(user.getUsername(), user.getId());
            }
        }

        // 2. Try to match by email across all matching user accounts
        java.util.List<User> usersByEmail = userService.findAllByEmail(cleanIdentifier);
        for (User user : usersByEmail) {
            if (userService.validatePassword(cleanPassword, user.getPasswordHash())) {
                if (!user.getActive()) {
                    throw new RuntimeException("User account is inactive");
                }
                userService.updateLastLogin(user.getId());
                log.info("User logged in by email: {} (username: {})", cleanIdentifier, user.getUsername());
                return jwtService.generateTokenWithUserId(user.getUsername(), user.getId());
            }
        }

        // If account exists by username or email but password check failed above
        if (userByUsername.isPresent() || !usersByEmail.isEmpty()) {
            throw new RuntimeException("Invalid password");
        }

        throw new RuntimeException("User not found");
    }

    public User getUserByUsername(String identifier) {
        String cleanIdentifier = identifier != null ? identifier.trim() : "";
        return userService.findByUsername(cleanIdentifier)
                .or(() -> userService.findByEmail(cleanIdentifier))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private final java.util.Map<String, ResetTokenInfo> inMemoryResetTokens = new java.util.concurrent.ConcurrentHashMap<>();

    private record ResetTokenInfo(String email, long expiryTimestamp) {}

    public boolean processForgotPassword(String email) {
        User user = userService.findByEmail(email.trim().toLowerCase())
                .orElse(null);

        if (user == null) {
            log.warn("Forgot password requested for non-existent email: {}", email);
            return true; // Return true to avoid email enumeration security risk
        }

        String token = UUID.randomUUID().toString();
        String redisKey = "password_reset:" + token;
        try {
            redisTemplate.opsForValue().set(redisKey, user.getEmail(), 15, TimeUnit.MINUTES);
        } catch (Exception e) {
            log.warn("Redis unavailable for password reset storage ({}). Utilizing in-memory fallback.", e.getMessage());
            inMemoryResetTokens.put(token, new ResetTokenInfo(user.getEmail(), System.currentTimeMillis() + (15 * 60 * 1000)));
        }

        log.info("Generated password reset token for email: {}", user.getEmail());
        return emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("Token and new password are required");
        }

        String redisKey = "password_reset:" + token.trim();
        String email = null;
        try {
            email = redisTemplate.opsForValue().get(redisKey);
        } catch (Exception e) {
            log.warn("Redis unavailable during password reset lookup ({}). Checking in-memory fallback.", e.getMessage());
        }

        if (email == null || email.isBlank()) {
            ResetTokenInfo info = inMemoryResetTokens.get(token.trim());
            if (info != null && System.currentTimeMillis() <= info.expiryTimestamp()) {
                email = info.email();
            }
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Invalid or expired password reset link. Please request a new one.");
        }

        userService.updatePassword(email, newPassword.trim());
        try {
            redisTemplate.delete(redisKey);
        } catch (Exception e) {
            // Ignore redis exception if offline
        }
        inMemoryResetTokens.remove(token.trim());

        log.info("Password reset successfully completed for email: {}", email);
        return true;
    }

    private UserDetails buildUserDetails(User user) {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + user.getRole().name())
                .accountLocked(!user.getActive())
                .disabled(!user.getActive())
                .build();
    }
}
