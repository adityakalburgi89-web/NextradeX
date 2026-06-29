package com.NexTradeX.binance;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class BinanceServiceTest {

    @Autowired
    private BinanceService binanceService;

    @Test
    public void testShouldTriggerCooldown() {
        // Test 429, 418, 403, 451, 500 should trigger cooldown
        assertTrue(invokeShouldTriggerCooldown(HttpStatus.TOO_MANY_REQUESTS));
        assertTrue(invokeShouldTriggerCooldown(HttpStatus.I_AM_A_TEAPOT));
        assertTrue(invokeShouldTriggerCooldown(HttpStatus.FORBIDDEN));
        assertTrue(invokeShouldTriggerCooldown(HttpStatus.UNAVAILABLE_FOR_LEGAL_REASONS));
        assertTrue(invokeShouldTriggerCooldown(HttpStatus.INTERNAL_SERVER_ERROR));

        // Test 400 (Bad Request) should NOT trigger cooldown
        assertFalse(invokeShouldTriggerCooldown(HttpStatus.BAD_REQUEST));
        assertFalse(invokeShouldTriggerCooldown(HttpStatus.OK));
    }

    @Test
    public void testFailoverBaseUrl() {
        // Initially, the effective base URL should be Binance
        String initialUrl = binanceService.getEffectiveBaseUrl();
        assertEquals("https://api.binance.com", initialUrl);

        // Trigger cooldown on Binance
        binanceService.triggerCooldown("https://api.binance.com");

        // The URL should failover to Bybit
        String failoverUrl = binanceService.getEffectiveBaseUrl();
        assertEquals("https://api.bybit.com", failoverUrl);
    }

    private boolean invokeShouldTriggerCooldown(HttpStatusCode statusCode) {
        return (Boolean) ReflectionTestUtils.invokeMethod(
                binanceService,
                "shouldTriggerCooldown",
                statusCode
        );
    }
}
