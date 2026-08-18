package com.nextradex.modules.security.auth;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import org.springframework.data.redis.core.StringRedisTemplate;
import com.nextradex.shared.common.EmailService;
import com.nextradex.modules.user.User;
import com.nextradex.modules.user.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService implements IAuthService {

    private static final String PASSWORD_RESET_PREFIX = "password_reset:";
    private static final Duration PASSWORD_RESET_TTL = Duration.ofMinutes(15);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

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
        String cleanPassword = password != null ? password : "";

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

    public boolean processForgotPassword(String email) {
        try {
            User user = userService.findByEmail(email.trim().toLowerCase())
                    .orElse(null);

            if (user == null) {
                log.info("Forgot password request did not match an account");
                return true; // Return true to avoid email enumeration security risk
            }

            String token = newResetToken();
            redisTemplate.opsForValue().set(resetKey(token), user.getEmail(), PASSWORD_RESET_TTL);
            return emailService.sendPasswordResetEmail(user.getEmail(), token);
        } catch (Exception e) {
            log.error("Error processing forgot password request: {}", e.getMessage(), e);
            return true; // Safely return true so caller receives 200 OK
        }
    }

    @Transactional
    public boolean resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank() || token.length() > 128
                || newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("Token and new password are required");
        }
        int passwordBytes = newPassword.getBytes(StandardCharsets.UTF_8).length;
        if (passwordBytes < 8 || passwordBytes > 72) {
            throw new IllegalArgumentException("Password must be between 8 and 72 bytes");
        }

        String email = redisTemplate.opsForValue().getAndDelete(resetKey(token.trim()));

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Invalid or expired password reset link. Please request a new one.");
        }

        User updatedUser = userService.updatePassword(email, newPassword);
        jwtService.invalidateAllTokensForUser(updatedUser.getId());

        log.info("Password reset successfully completed for user ID {}", updatedUser.getId());
        return true;
    }

    private String newResetToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String resetKey(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return PASSWORD_RESET_PREFIX
                    + Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
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
