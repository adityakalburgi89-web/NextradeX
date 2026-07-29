package com.NexTradeX.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RedisRateLimiterTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Test
    void testRateLimiterAllowed() {
        when(redisTemplate.execute(
                any(RedisScript.class),
                anyList(),
                any(Object[].class)))
                .thenReturn(1L, 1L, 1L, 1L, 1L, 0L);
        IRateLimiter redisRateLimiter = new RedisRateLimiter(redisTemplate);
        String client = "test_client_" + System.currentTimeMillis();
        String endpoint = "test_endpoint";

        // Request 1-5 should be allowed (capacity is 5)
        for (int i = 0; i < 5; i++) {
            assertTrue(redisRateLimiter.isAllowed(client, endpoint, 5, 0.00001));
        }

        // Request 6 should be blocked
        assertFalse(redisRateLimiter.isAllowed(client, endpoint, 5, 0.00001));
    }
}
