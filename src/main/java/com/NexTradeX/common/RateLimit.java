package com.NexTradeX.common;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to enforce rate limiting on controller methods or classes.
 * Uses a Redis-backed Token Bucket algorithm.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    
    /**
     * The maximum number of tokens the bucket can hold.
     * Denotes the maximum burst of requests allowed.
     */
    int capacity() default 10;
    
    /**
     * The number of tokens refilled per second.
     */
    double refillRate() default 2.0;
}
