package com.NexTradeX.config;

/**
 * Contract for token-bucket / leaky-bucket rate limiting implementations.
 */
public interface IRateLimiter {

    /**
     * Checks if the client has enough tokens to proceed with the request.
     *
     * @param clientKey  Unique identifier of the client (User ID or IP)
     * @param endpoint   The URI/method of the request
     * @param capacity   Bucket capacity
     * @param refillRate Refill rate in tokens per second
     * @return true if request is allowed, false if rate-limited
     */
    boolean isAllowed(String clientKey, String endpoint, int capacity, double refillRate);
}
