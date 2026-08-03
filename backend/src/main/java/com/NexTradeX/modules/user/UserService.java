package com.nextradex.modules.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService implements IUserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
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
        if (username == null || username.isBlank()) return Optional.empty();
        return userRepository.findByUsernameIgnoreCase(username.trim());
    }
    
    public Optional<User> findByEmail(String email) {
        if (email == null || email.isBlank()) return Optional.empty();
        return userRepository.findByEmailIgnoreCase(email.trim());
    }

    public java.util.List<User> findAllByEmail(String email) {
        if (email == null || email.isBlank()) return java.util.Collections.emptyList();
        return userRepository.findAllByEmailIgnoreCase(email.trim());
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public User updateLastLogin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setLastLogin(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        
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
        String cleanEmail = email != null ? email.trim() : "";
        java.util.List<User> users = userRepository.findAllByEmailIgnoreCase(cleanEmail);
        if (users.isEmpty()) {
            throw new RuntimeException("User not found: " + email);
        }
        String newHash = passwordEncoder.encode(newPassword.trim());
        User primaryUser = users.get(0);
        for (User u : users) {
            u.setPasswordHash(newHash);
            userRepository.save(u);
            log.info("Password updated for user ID {} ({})", u.getId(), u.getUsername());
        }
        return primaryUser;
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
