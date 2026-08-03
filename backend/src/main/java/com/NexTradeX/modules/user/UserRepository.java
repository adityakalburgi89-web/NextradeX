package com.nextradex.modules.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameIgnoreCase(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    java.util.List<User> findAllByEmailIgnoreCase(String email);
    Optional<User> findByGoogleId(String googleId);
    Boolean existsByUsername(String username);
    Boolean existsByUsernameIgnoreCase(String username);
    Boolean existsByEmail(String email);
    Boolean existsByEmailIgnoreCase(String email);
}
