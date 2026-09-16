# Architecture & Key Services

This document details the core architectural components and critical services running inside the NexTradeX platform.

## 1. Redis-Backed Token Bucket Rate Limiter
The rate limiting mechanism protects critical controllers against abuse:
*   **Implementation**: Done using an interceptor (`RateLimitInterceptor`) that looks for `@RateLimit` annotations on methods or classes. It runs an atomic Lua script in Redis.
*   **Annotation**:
    ```java
    @RateLimit(capacity = 5, refillRate = 0.2) // Capacity of 5 tokens, refilling 0.2 tokens/second
    ```
*   **Fail-Safe**: If Redis becomes unavailable, the system logs the error and temporarily **bypasses rate limiting** (allowing requests) to guarantee uninterrupted user operations.
*   **Identity Mapping**: Matches users by JWT token user ID (`user_<id>`) and falls back to IP address (`ip_<address>`) if the request is unauthenticated.

## 2. Multi-Exchange Failover Service
To avoid interruptions in live/mock candlestick data feeds, `BinanceService` implements a failover protocol:
*   **Providers**: Binance (`https://api.binance.com`) -> Bybit (`https://api.bybit.com`) -> MEXC (`https://api.mexc.com`).
*   **Failover Conditions**: If an API request fails, hits rate-limit restrictions, or times out, the service sets a cooldown flag:
    *   **Symbol Cooldown**: 60 seconds for specific symbol requests.
    *   **Global Cooldown**: 5 minutes (300 seconds) for the entire exchange.
*   **Adaptive Interval Translation**: Automatically converts standard intervals (like `1h`, `1d`, `5m`) into formats recognized by the active provider.

## 3. Monitoring System
Prometheus metrics are collected via the Spring Actuator endpoint `/api/actuator/prometheus`.
*   **Prometheus**: Scraping the Spring Boot application every 15s (`host.docker.internal:8080`).
*   **Grafana**: View real-time graphs for CPU/memory, JVM metrics, active WebSocket sessions, database connection pools, and Redis rate limit stats.
    *   **Port**: `http://localhost:3000`
    *   **Default Login**: `admin` / `admin`
