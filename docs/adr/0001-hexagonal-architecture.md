# ADR 0001: Adoption of Hexagonal Architecture & Domain-Driven Design

- **Status**: Accepted
- **Date**: 2026-08-03
- **Deciders**: NexTradeX Engineering Team

## Context
NexTradeX handles financial order matching, risk evaluations, and multi-wallet transactions. Mixing Spring Data JPA entities and external exchange HTTP clients directly inside core service logic led to tight coupling, making unit testing difficult and risking race conditions during market volatility.

## Decision
We adopt **Hexagonal Architecture (Ports and Adapters)** coupled with **Domain-Driven Design (DDD)**:
1. Core domain models (`domain/`) must be pure Java with zero framework annotations.
2. External integrations (Binance APIs, DB persistence, Redis rate limiters) are implemented as Infrastructure Adapters (`infrastructure/`).
3. Primary entrypoints (REST, WebSockets) interact with domain services strictly via Application Use Cases (`application/`).

## Consequences
- **Positive**: Risk engine and order matching logic can be tested with 100% pure JUnit 5 tests without spinning up Spring or DB containers.
- **Positive**: Upgrading or swapping external exchange APIs (Binance -> Bybit) requires zero changes to core domain rules.
- **Negative**: Slight initial overhead for DTO-to-Domain mappers.
