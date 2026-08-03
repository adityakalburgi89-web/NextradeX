package com.nextradex.modules.security.auth;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService implements IJwtService {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    private final java.util.Set<String> blacklistedTokens = java.util.concurrent.ConcurrentHashMap.newKeySet();
    
    public void invalidateToken(String token) {
        if (token != null && !token.isBlank()) {
            blacklistedTokens.add(token.trim());
            log.info("JWT Token invalidated/blacklisted successfully.");
        }
    }
    
    public boolean isTokenBlacklisted(String token) {
        return token != null && blacklistedTokens.contains(token.trim());
    }
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }
    
    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }
    
    public String generateTokenWithClaims(String username, Map<String, Object> claims) {
        return createToken(claims, username);
    }
    
    public String generateTokenWithUserId(String username, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        return createToken(claims, username);
    }
    
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    public String extractUsername(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        try {
            Claims claims = extractClaims(token);
            return claims != null ? claims.getSubject() : null;
        } catch (Exception e) {
            log.warn("Failed to extract username from token: {}", e.getMessage());
            return null;
        }
    }
    
    public Long extractUserId(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        try {
            Claims claims = extractClaims(token);
            if (claims == null) {
                return null;
            }
            Object userId = claims.get("userId");
            if (userId == null) {
                return null;
            }
            if (userId instanceof Integer) {
                return ((Integer) userId).longValue();
            }
            if (userId instanceof Number) {
                return ((Number) userId).longValue();
            }
            return Long.parseLong(userId.toString());
        } catch (Exception e) {
            log.warn("Failed to parse userId: {}", e.getMessage());
            return null;
        }
    }
    
    public boolean isTokenValid(String token, UserDetails userDetails) {
        if (isTokenBlacklisted(token)) {
            return false;
        }
        final String username = extractUsername(token);
        return username != null 
                && username.equals(userDetails.getUsername()) 
                && !isTokenExpired(token)
                && userDetails.isEnabled() 
                && userDetails.isAccountNonLocked();
    }
    
    public boolean isTokenValid(String token, String username) {
        if (isTokenBlacklisted(token)) {
            return false;
        }
        final String tokenUsername = extractUsername(token);
        return tokenUsername != null && tokenUsername.equals(username) && !isTokenExpired(token);
    }
    
    private boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);
        return expiration != null && expiration.before(new Date());
    }
    
    private Date extractExpiration(String token) {
        Claims claims = extractClaims(token);
        return claims != null ? claims.getExpiration() : null;
    }
    
    private Claims extractClaims(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.warn("Failed to parse signed claims: {}", e.getMessage());
            return null;
        }
    }
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    
    public long getJwtExpiration() {
        return jwtExpiration;
    }
    
    public Long extractUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null) {
            return null;
        }
        if (authentication instanceof JwtAuthenticationToken) {
            return ((JwtAuthenticationToken) authentication).getUserId();
        }
        Object credentials = authentication.getCredentials();
        if (credentials instanceof String && !((String) credentials).isBlank()) {
            return extractUserId((String) credentials);
        }
        return null;
    }
    
    public Long extractUserIdFromRequest(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return extractUserId(token);
        }
        return null;
    }
}
