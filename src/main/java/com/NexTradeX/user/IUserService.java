package com.NexTradeX.user;

import java.util.List;
import java.util.Optional;

/**
 * Contract for User domain management.
 */
public interface IUserService {
    User createUser(String username, String email, String password, String firstName, String lastName);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findAllByEmail(String email);
    Optional<User> findById(Long id);
    User updateLastLogin(Long userId);
    User verifyEmail(Long userId);
    boolean validatePassword(String rawPassword, String encodedPassword);
    User updatePassword(String email, String newPassword);
    User updateUser(Long userId, String firstName, String lastName, String email);
    Optional<User> findByGoogleId(String googleId);
    User linkOrCreateGoogleUser(String googleId, String email, String firstName, String lastName, String profilePictureUrl);
    User createGoogleUser(String googleId, String email, String firstName, String lastName, String profilePictureUrl);
    User updateProfileSetup(Long userId, String username, String firstName, String lastName);
}
