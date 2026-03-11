# NexTradeX Mock Trading Platform

**IMPORTANT:** This platform is for educational and simulation purposes only. No real money, assets, or live trading is involved. All trades, balances, and market data are simulated.

- No real deposits, withdrawals, or asset transfers are possible.
- All trading activity is virtual and has no financial value.
- Do not use this platform for real investment or trading decisions.

## Disclaimer
NexTradeX is a mock trading environment. The developers and maintainers are not responsible for any financial decisions made based on simulated results.

---

## Features
- Simulated spot, margin, futures, and options trading
- Mock market data and balances
- No real money or live exchange integration

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

## Contributing
Please open issues or pull requests for bug fixes and improvements. Follow standard Maven/Java formatting rules and add appropriate tests.

---

