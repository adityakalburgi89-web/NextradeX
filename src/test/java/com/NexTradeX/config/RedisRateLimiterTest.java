package com.NexTradeX.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class RedisRateLimiterTest {

    @Autowired
    private RedisRateLimiter redisRateLimiter;

    @Test
    public void testRateLimiterAllowed() {
        boolean allowed = redisRateLimiter.isAllowed("test_client", "test_endpoint", 5, 2.0);
        System.out.println("Rate Limiter isAllowed: " + allowed);
        assertTrue(allowed);
    }
}
