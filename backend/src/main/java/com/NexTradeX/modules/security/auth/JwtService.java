package com.nextradex.modules.security.auth;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Base64;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.StringRedisTemplate;
import jakarta.annotation.PostConstruct;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
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

    @Value("${jwt.issuer}")
    private String jwtIssuer;

    @Value("${jwt.audience}")
    private String jwtAudience;

    private static final String REVOKED_TOKEN_PREFIX = "jwt_revoked:";
    private static final String USER_REVOKED_AFTER_PREFIX = "jwt_user_revoked_after:";

    private final StringRedisTemplate redisTemplate;

    @PostConstruct
    void validateConfiguration() {
        if (jwtSecret == null || jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must contain at least 32 bytes");
        }
    }
    
    public void invalidateToken(String token) {
        if (token != null && !token.isBlank()) {
            Date expiration = extractExpiration(token);
            long ttlMillis = expiration == null ? 0 : expiration.getTime() - System.currentTimeMillis();
            if (ttlMillis > 0) {
                redisTemplate.opsForValue().set(
                        REVOKED_TOKEN_PREFIX + tokenDigest(token.trim()),
                        "1",
                        Duration.ofMillis(ttlMillis));
            }
            log.info("JWT token invalidated successfully");
        }
    }

    public void invalidateAllTokensForUser(Long userId) {
        redisTemplate.opsForValue().set(
                USER_REVOKED_AFTER_PREFIX + userId,
                Long.toString(System.currentTimeMillis()),
                Duration.ofMillis(jwtExpiration));
    }

    public boolean isTokenBlacklisted(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            Boolean revoked = redisTemplate.hasKey(REVOKED_TOKEN_PREFIX + tokenDigest(token.trim()));
            if (Boolean.TRUE.equals(revoked)) {
                return true;
            }

            Long userId = extractUserId(token);
            Claims claims = extractClaims(token);
            if (userId == null || claims == null || claims.getIssuedAt() == null) {
                return true;
            }
            String revokedAfter = redisTemplate.opsForValue().get(USER_REVOKED_AFTER_PREFIX + userId);
            return revokedAfter != null
                    && claims.getIssuedAt().getTime() <= Long.parseLong(revokedAfter);
        } catch (RuntimeException ex) {
            log.error("Unable to verify JWT revocation state; rejecting token", ex);
            return true;
        }
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
                .issuer(jwtIssuer)
                .audience().add(jwtAudience).and()
                .id(UUID.randomUUID().toString())
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
                    .requireIssuer(jwtIssuer)
                    .requireAudience(jwtAudience)
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.debug("JWT token expired: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.warn("Failed to parse signed claims: {}", e.getMessage());
            return null;
        }
    }
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    private String tokenDigest(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
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
