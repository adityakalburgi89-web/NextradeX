package com.nextradex.modules.security.oauth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class OAuthLoginCodeService {

    private static final String KEY_PREFIX = "oauth_login_code:";
    private static final Duration CODE_TTL = Duration.ofMinutes(2);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final StringRedisTemplate redisTemplate;

    public String issueCode(Long userId) {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        String code = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        try {
            redisTemplate.opsForValue().set(key(code), userId.toString(), CODE_TTL);
            return code;
        } catch (RuntimeException ex) {
            log.error("Unable to persist one-time OAuth login code", ex);
            throw new IllegalStateException("OAuth login is temporarily unavailable");
        }
    }

    public Long consumeCode(String code) {
        if (code == null || code.isBlank() || code.length() > 128) {
            throw new IllegalArgumentException("Invalid or expired OAuth login code");
        }

        try {
            String userId = redisTemplate.opsForValue().getAndDelete(key(code));
            if (userId == null) {
                throw new IllegalArgumentException("Invalid or expired OAuth login code");
            }
            return Long.valueOf(userId);
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (RuntimeException ex) {
            log.error("Unable to consume one-time OAuth login code", ex);
            throw new IllegalStateException("OAuth login is temporarily unavailable");
        }
    }

    private String key(String code) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(code.getBytes(StandardCharsets.UTF_8));
            return KEY_PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }
}
