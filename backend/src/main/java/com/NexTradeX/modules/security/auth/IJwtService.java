package com.nextradex.modules.security.auth;

import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Interface contract for JWT token management and claims extraction.
 */
public interface IJwtService {
    void invalidateToken(String token);
    boolean isTokenBlacklisted(String token);
    String generateToken(UserDetails userDetails);
    String generateToken(String username);
    String generateTokenWithClaims(String username, Map<String, Object> claims);
    String generateTokenWithUserId(String username, Long userId);
    String extractUsername(String token);
    Long extractUserId(String token);
    boolean isTokenValid(String token, UserDetails userDetails);
    boolean isTokenValid(String token, String username);
    long getJwtExpiration();
    Long extractUserIdFromAuthentication(Authentication authentication);
    Long extractUserIdFromRequest(String authHeader);
}
