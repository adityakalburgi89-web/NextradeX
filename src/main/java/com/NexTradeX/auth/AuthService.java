package com.NexTradeX.auth;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
@Transactional
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

    public String registerUser(String username, String email, String password,
            String firstName, String lastName) {
        User user = userService.createUser(username, email, password, firstName, lastName);
        log.info("User registered: {}", username);
        return jwtService.generateTokenWithUserId(user.getUsername(), user.getId());
    }

    public String loginUser(String username, String password) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!userService.validatePassword(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        if (!user.getActive()) {
            throw new RuntimeException("User account is inactive");
        }

        userService.updateLastLogin(user.getId());
        log.info("User logged in: {}", username);
        return jwtService.generateTokenWithUserId(user.getUsername(), user.getId());
    }

    public User getUserByUsername(String username) {
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public boolean processForgotPassword(String email) {
        User user = userService.findByEmail(email.trim().toLowerCase())
                .orElse(null);

        if (user == null) {
            log.warn("Forgot password requested for non-existent email: {}", email);
            return true; // Return true to avoid email enumeration security risk
        }

        String token = UUID.randomUUID().toString();
        String redisKey = "password_reset:" + token;
        redisTemplate.opsForValue().set(redisKey, user.getEmail(), 15, TimeUnit.MINUTES);

        log.info("Generated password reset token for email: {}", user.getEmail());
        return emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    public boolean resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank() || newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException("Token and new password are required");
        }

        String redisKey = "password_reset:" + token.trim();
        String email = redisTemplate.opsForValue().get(redisKey);

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Invalid or expired password reset link. Please request a new one.");
        }

        userService.updatePassword(email, newPassword.trim());
        redisTemplate.delete(redisKey);
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
