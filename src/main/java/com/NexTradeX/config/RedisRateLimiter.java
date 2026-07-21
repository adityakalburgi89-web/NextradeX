package com.NexTradeX.config;

import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

@Component
public class RedisRateLimiter {

    private static final Logger log = LoggerFactory.getLogger(RedisRateLimiter.class);
    private final StringRedisTemplate redisTemplate;
    private final RedisScript<Long> rateLimitScript;

    // Lua script representing the Token Bucket algorithm
    private static final String LUA_SCRIPT = 
            "local key = KEYS[1]\n" +
            "local capacity = tonumber(ARGV[1])\n" +
            "local refill_rate = tonumber(ARGV[2])\n" +
            "local requested = tonumber(ARGV[3])\n" +
            "local now = tonumber(ARGV[4])\n" +
            "\n" +
            "local rate_limit = redis.call('HMGET', key, 'tokens', 'last_update')\n" +
            "local tokens = tonumber(rate_limit[1])\n" +
            "local last_update = tonumber(rate_limit[2])\n" +
            "\n" +
            "if not tokens then\n" +
            "    tokens = capacity\n" +
            "    last_update = now\n" +
            "else\n" +
            "    local time_passed = math.max(0, now - last_update) / 1000.0\n" +
            "    local refilled_tokens = time_passed * refill_rate\n" +
            "    tokens = math.min(capacity, tokens + refilled_tokens)\n" +
            "    last_update = now\n" +
            "end\n" +
            "\n" +
            "if tokens >= requested then\n" +
            "    tokens = tokens - requested\n" +
            "    redis.call('HMSET', key, 'tokens', tostring(tokens), 'last_update', tostring(last_update))\n" +
            "    redis.call('EXPIRE', key, 60)\n" +
            "    return 1\n" +
            "else\n" +
            "    redis.call('HMSET', key, 'tokens', tostring(tokens), 'last_update', tostring(last_update))\n" +
            "    redis.call('EXPIRE', key, 60)\n" +
            "    return 0\n" +
            "end";

    public RedisRateLimiter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.rateLimitScript = new DefaultRedisScript<>(LUA_SCRIPT, Long.class);
    }

    /**
     * Checks if the client has enough tokens to proceed with the request.
     *
     * @param clientKey  Unique identifier of the client (User ID or IP)
     * @param endpoint   The URI/method of the request
     * @param capacity   Bucket capacity
     * @param refillRate Refill rate in tokens per second
     * @return true if request is allowed, false if rate-limited
     */
    public boolean isAllowed(String clientKey, String endpoint, int capacity, double refillRate) {
        try {
            String redisKey = "ratelimit:" + clientKey + ":" + endpoint;
            List<String> keys = Collections.singletonList(redisKey);
            
            // Execute the Lua script atomically
            Long result = redisTemplate.execute(
                rateLimitScript,
                keys,
                String.valueOf(capacity),
                String.valueOf(refillRate),
                "1",
                String.valueOf(System.currentTimeMillis())
            );
            
            return result != null && result == 1L;
        } catch (Throwable e) {
            log.error("[RedisRateLimiter] CRITICAL: Redis execution failed for client {}. Rate limiting is temporarily BYPASSED (returning allowed=true). Reason: {}", clientKey, e.getMessage(), e);
            // Fallback: allow request in case of Redis failure so we don't block users due to Redis downtime
            return true;
        }
    }
}
