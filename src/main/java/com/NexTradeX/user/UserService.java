package com.NexTradeX.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import com.NexTradeX.market.MarketService;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MarketService marketService;
    
    public User createUser(String username, String email, String password, 
                           String firstName, String lastName) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .role(UserRole.USER)
                .active(true)
                .emailVerified(false)
                .build();
        
        User savedUser = userRepository.save(user);
        log.info("User created: {}", username);
        return savedUser;
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public User updateLastLogin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setLastLogin(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        
        // Sync market prices asynchronously on login
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                log.info("[Login] Triggering async market price sync for user: {}", user.getUsername());
                marketService.syncMarketPrices();
                log.info("[Login] Async market price sync completed for user: {}", user.getUsername());
            } catch (Exception e) {
                log.error("[Login] Failed to sync market prices asynchronously: {}", e.getMessage());
            }
        });
        
        return savedUser;
    }
    
    public User verifyEmail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEmailVerified(true);
        return userRepository.save(user);
    }
    
    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public User updatePassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        log.info("Password successfully updated for user email: {}", email);
        return userRepository.save(user);
    }
    
    public User updateUser(Long userId, String firstName, String lastName, String email) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (firstName != null && !firstName.isBlank()) {
            user.setFirstName(firstName);
        }
        if (lastName != null && !lastName.isBlank()) {
            user.setLastName(lastName);
        }
        if (email != null && !email.isBlank()) {
            if (userRepository.existsByEmail(email) && !user.getEmail().equals(email)) {
                throw new IllegalArgumentException("Email already exists");
            }
            user.setEmail(email);
        }
        
        return userRepository.save(user);
    }
    
    public Optional<User> findByGoogleId(String googleId) {
        return userRepository.findByGoogleId(googleId);
    }
    
    public User linkOrCreateGoogleUser(String googleId, String email, String firstName, String lastName, String profilePictureUrl) {
        Optional<User> existingGoogleUser = userRepository.findByGoogleId(googleId);
        if (existingGoogleUser.isPresent()) {
            return existingGoogleUser.get();
        }

        Optional<User> existingEmailUser = userRepository.findByEmail(email);
        if (existingEmailUser.isPresent()) {
            User user = existingEmailUser.get();
            user.setGoogleId(googleId);
            if (profilePictureUrl != null && !profilePictureUrl.isBlank()) {
                user.setProfilePictureUrl(profilePictureUrl);
            }
            user.setEmailVerified(true);
            log.info("Linked Google ID {} to existing user email {}", googleId, email);
            return userRepository.save(user);
        }

        return createGoogleUser(googleId, email, firstName, lastName, profilePictureUrl);
    }
    
    public User createGoogleUser(String googleId, String email, String firstName, String lastName, String profilePictureUrl) {
        User user = User.builder()
                .username(generateTempUsername(email))
                .email(email)
                .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                .firstName(firstName != null ? firstName : "")
                .lastName(lastName != null ? lastName : "")
                .googleId(googleId)
                .profilePictureUrl(profilePictureUrl)
                .role(UserRole.USER)
                .active(true)
                .emailVerified(true)
                .needsProfileSetup(true)
                .build();
        
        User savedUser = userRepository.save(user);
        log.info("Google user created: {} ({})", email, googleId);
        return savedUser;
    }
    
    public User updateProfileSetup(Long userId, String username, String firstName, String lastName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (userRepository.existsByUsername(username) && !user.getUsername().equals(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        user.setUsername(username);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setNeedsProfileSetup(false);
        
        return userRepository.save(user);
    }
    
    private String generateTempUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
        String username = base;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = base + counter;
            counter++;
        }
        return username;
    }
}
