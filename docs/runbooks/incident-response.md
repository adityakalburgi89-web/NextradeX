# Incident Response Runbook

## Objective
Standardized operational procedures for responding to system anomalies in NexTradeX.

## 1. High API Latency or Redis Rate Limiter Timeout
- **Symptoms**: HTTP 429 errors or slow response times on order endpoints.
- **Diagnosis**:
  1. Inspect Actuator metrics at `http://localhost:8080/api/actuator/prometheus`.
  2. Check Redis connection pool: `docker exec -it nextrade-redis redis-cli ping`.
- **Resolution**:
  - If Redis fails, the fallback in-memory rate limiter will handle traffic automatically. Restart Redis container via `docker restart nextrade-redis`.

## 2. Market Feed Disconnection (Binance API Cooldown)
- **Symptoms**: Stale orderbook updates or candle gaps.
- **Resolution**:
  - The `MultiExchangeFailoverService` will automatically switch target feed to Bybit or MEXC endpoints. Verify failover state in logs via `CorrelationIdFilter` logs.
