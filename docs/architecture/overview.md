# NexTradeX Architecture Overview

## Monorepo & Low-Level Design (LLD)
NexTradeX is organized as a decoupled monorepo:
- **`backend/`**: Java 17 + Spring Boot 3.3 built using Hexagonal Architecture & Domain-Driven Design (DDD).
- **`frontend/`**: React 18 + Tailwind CSS organized into feature-driven modules.
- **`infrastructure/`**: Container definitions (`docker/`) and telemetry configurations (`monitoring/`).

## Core Architecture Bounded Contexts
1. **Trading Engine (`modules/trading`)**: Spot, Margin, Futures, Options, and Order Matching strategies.
2. **Risk Management (`modules/risk`)**: Margin requirements, position risk calculators, and liquidation engines.
3. **Market Data Stream (`modules/market`)**: Real-time ticker feeds, candle aggregations, and exchange failover APIs (Binance/Bybit/MEXC).
4. **Wallet Ledger (`modules/wallet`)**: Multi-currency virtual balance holds, deposits, and transaction histories.
5. **Identity & Security (`modules/security`)**: JWT authentication filters, OAuth2 integrations, and RBAC controllers.
