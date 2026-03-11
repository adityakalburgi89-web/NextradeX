# NexTradeX Mock Trading Platform

**IMPORTANT:** This platform is for educational and simulation purposes only. No real money, assets, or live trading is involved. All trades, balances, and market data are simulated.

- No real deposits, withdrawals, or asset transfers are possible.
- All trading activity is virtual and has no financial value.
- Do not use this platform for real investment or trading decisions.

## Disclaimer
NexTradeX is a mock trading environment. The developers and maintainers are not responsible for any financial decisions made based on simulated results.

---

## Features
The platform provides a range of mock trading capabilities and utilities for learning and testing:

- **Trading Types**: Spot, margin, futures and options order placement with simulated order books.
- **Market Data**: Generated price feeds that mimic exchange behavior (candlesticks, tick data).
- **Account Management**: Virtual wallets with configurable balances across assets and currencies.
- **Order Tracking**: Creation, modification and cancellation of orders with fill simulation and response delays.
- **Risk Controls**: Simplified margin checks, leverage limits and basic order validation rules.
- **Authentication**: JWT‑based login/registration endpoints and token filtering.
- **WebSockets**: Real‑time updates for market ticks and user order/status events.
- **Frontend UI**: React components for dashboards, charts and trading interfaces.
- **No Live Integration**: All services are decoupled from real exchanges; everything runs in‑memory or with mock datasets.


## For Developers
- All API endpoints and services are for demo/testing only.
- Please do not attempt to connect to real exchanges or payment systems.

## Getting Started

### Prerequisites
- Java 17+ and Maven installed on your PATH
- Node.js 18+ and npm (or yarn) for the frontend

### Backend
```bash
# from workspace root
mvn clean install       # compile and run tests
mvn spring-boot:run     # start the Spring Boot application
```

By default the backend listens on `localhost:8080`. Configuration values can be adjusted in `src/main/resources/application.properties`.

### Frontend
```bash
cd frontend
npm install            # or yarn install
npm run dev            # start development server (Vite + React)
```

The React app will open at `http://localhost:5173` and will proxy API calls to the backend.

### Running Tests
- Backend unit tests are under `src/test/java` and run with Maven (e.g. `mvn test`).
- Frontend tests (if any) can be executed via `npm run test` in the `frontend` folder.

## Project Structure
- `src/main/java/com/NexTradeX` – Spring Boot application and modules for auth, market, order, wallet, etc.
- `frontend/` – React + Vite application implementing the UI and WebSocket clients.

## System Design
The application follows a modular, layered architecture intended for clarity and extensibility:

1. **Presentation Layer (Frontend)**
   - React components communicate with backend REST APIs and WebSocket endpoints.
   - Vite development server proxies requests to the Spring Boot backend.

2. **API Layer (Backend Controllers)**
   - `auth` controller handles login/registration and JWT token issuance.
   - Market, order, wallet, and user controllers expose HTTP endpoints for client operations.

3. **Service Layer**
   - Business logic resides here, including order matching, balance calculations, and risk evaluation.
   - Services are stateless where possible; injectable via Spring IoC.

4. **Data/Domain Layer**
   - DTOs model request/response payloads, while in‑memory repositories store mock records.
   - Market data generators create simulated tick streams for WebSocket broadcast.

5. **Infrastructure**
   - Security config (JWT filter, password encoder) protects API endpoints.
   - WebSocket configuration enables event broadcasting to connected clients.
   - RestTemplate config allows external calls if the project is extended later.

>The design emphasizes separation of concerns and should make it easy to swap in a real exchange adapter or persistent datastore if desired.  


## Contributing
Please open issues or pull requests for bug fixes and improvements. Follow standard Maven/Java formatting rules and add appropriate tests.

---

