package com.NexTradeX.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest
public class RedisRateLimiterTest {

    @Autowired
    private RedisRateLimiter redisRateLimiter;

    @Test
    public void testRateLimiterAllowed() {
        String client = "test_client_" + System.currentTimeMillis();
        String endpoint = "test_endpoint";

        // Request 1-5 should be allowed (capacity is 5)
        for (int i = 0; i < 5; i++) {
            assertTrue(redisRateLimiter.isAllowed(client, endpoint, 5, 1.0));
        }

        // Request 6 should be blocked
        assertFalse(redisRateLimiter.isAllowed(client, endpoint, 5, 1.0));
    }
}
