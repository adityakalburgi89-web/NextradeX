# NexTradeX Mock Trading Platform

**IMPORTANT:** This platform is for educational, simulation, and demonstration purposes only. No real money, assets, or live trading is involved. All trades, balances, and market data are simulated.

- No real deposits, withdrawals, or asset transfers are possible.
- All trading activity is virtual and has no financial value.
- Do not use this platform for real investment or trading decisions.

## Disclaimer
NexTradeX is a mock trading environment. The developers and maintainers are not responsible for any financial decisions made based on simulated results.

---

## Key Features

The platform provides a range of mock trading capabilities, integrations, and developer tools for learning and testing:

*   **Diverse Trading Types**: Support for Spot, Margin, Futures, Options, and Dollar-Cost Averaging (DCA) order placement with simulated order books.
*   **External Exchange Integrations**:
    *   **Binance integration** for real-time market data.
    *   **Multi-Exchange Failover Service** failing over to **Bybit** and **MEXC** during API cooldowns or rate-limits.
*   **Token-Bucket Rate Limiting**: Redis-backed API rate limiting on controllers using atomic Lua scripts (fail-safe enabled).
*   **Prometheus & Grafana Monitoring**: Full containerized monitoring setup scraping Spring Actuator metrics.
*   **Secure Authentication**: JWT-based login/registration alongside Google OAuth2 integration with robust CORS configurations.
*   **Account & Wallet Management**: Virtual multi-currency wallets with configurable balances, transfers, deposits, and resets.
*   **Real-time Updates**: WebSocket integration using STOMP to broadcast price alerts, market ticks, and order status events.
*   **Advanced Charts**: Interactive candlestick charts using the Lightweight Charts library.
*   **Modern Frontend**: Responsive, responsive-designed UI using React 18, Tailwind CSS, and Lucide React.

---

## Technology Stack

| Layer | Technologies | Key Features |
| :--- | :--- | :--- |
| **Backend** | Spring Boot 3.3.0, Spring Security, Spring WebFlux | REST APIs, WebSocket (STOMP), IoC, SpringDoc (Swagger) |
| **Database** | In-Memory H2, PostgreSQL, Spring Data JPA | Relational data persistence (H2 for development/testing, PostgreSQL for production) |
| **Caching/Limiting** | Redis, StringRedisTemplate, Lua Scripting | Distributed rate limiting, Atomic token refilling |
| **Monitoring** | Spring Actuator, Micrometer, Prometheus, Grafana | App metrics, system health, scrapes on port 9090 & 3000 |
| **Frontend** | React 18, Vite, Tailwind CSS, Lightweight Charts | Component-based, lightning-fast HMR, modular UI |
| **Testing** | JUnit 5, Spring Security Test, Integration Tests | Mock MVC testing, RedisRateLimiter unit testing |

---

## Prerequisites & Setup

### Prerequisites
*   **Java 17+** & Maven installed on your system path.
*   **Node.js 18+** & npm (or yarn) for running the React frontend.
*   **Docker** (for monitoring and local Redis services, optional but recommended).
*   **Redis 6+** running locally (or via Docker) for rate limiting.

### Quick Start Guide

#### 1. Setup Environment
Copy the example environment file and configure variables:
```bash
cp .env.example .env
```
Ensure you update the configuration settings (such as Redis connection details, database URLs, and API keys).

#### 2. Start Redis & Monitoring Services
If you have Docker running, launch Redis and the Prometheus/Grafana stack:
```bash
# Run a quick Redis container if you don't have local Redis
docker run -d --name nextrade-redis -p 6379:6379 redis:alpine

# Start Prometheus and Grafana
docker compose -f docker-compose-monitoring.yml up -d
```

#### 3. Start Backend
Run the Spring Boot application using Maven:
```bash
mvn spring-boot:run
```
The backend server runs on `http://localhost:8080/api` (Swagger UI is available at `http://localhost:8080/api/swagger-ui.html`).

#### 4. Start Frontend
Navigate to the frontend folder, install dependencies, and run the development server:
```bash
cd frontend
npm install
npm run dev
```
The frontend web app runs on `http://localhost:3000` (or `http://localhost:5173`).

---

## Authentication & OAuth2 Setup

NexTradeX supports credentials login as well as Google OAuth2.

### Google OAuth2 Credentials Configuration
To enable "Login with Google", define the following properties in your `.env` file:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH_REDIRECT_URI=http://localhost:8080/api/login/oauth2/code/google
FRONTEND_CALLBACK_URL=http://localhost:3000/auth
```

> [!NOTE]
> For detailed instructions on OAuth2 configuration, CORS, and credential settings, refer to the [OAuth2 Fix Quick Start](file:///c:/Users/adity/OneDrive/Desktop/NexTradeX/README_OAUTH_FIX.md) and the [OAuth Fix Index Guide](file:///c:/Users/adity/OneDrive/Desktop/NexTradeX/OAUTH_FIX_INDEX.md).

---

## Architecture & Key Services

### 1. Redis-Backed Token Bucket Rate Limiter
The rate limiting mechanism protects critical controllers against abuse:
*   **Implementation**: Done using an interceptor (`RateLimitInterceptor`) that looks for `@RateLimit` annotations on methods or classes. It runs an atomic Lua script in Redis.
*   **Annotation**:
    ```java
    @RateLimit(capacity = 5, refillRate = 0.2) // Capacity of 5 tokens, refilling 0.2 tokens/second
    ```
*   **Fail-Safe**: If Redis becomes unavailable, the system logs the error and temporarily **bypasses rate limiting** (allowing requests) to guarantee uninterrupted user operations.
*   **Identity Mapping**: Matches users by JWT token user ID (`user_<id>`) and falls back to IP address (`ip_<address>`) if the request is unauthenticated.

### 2. Multi-Exchange Failover Service
To avoid interruptions in live/mock candlestick data feeds, `BinanceService` implements a failover protocol:
*   **Providers**: Binance (`https://api.binance.com`) -> Bybit (`https://api.bybit.com`) -> MEXC (`https://api.mexc.com`).
*   **Failover Conditions**: If an API request fails, hits rate-limit restrictions, or times out, the service sets a cooldown flag:
    *   **Symbol Cooldown**: 60 seconds for specific symbol requests.
    *   **Global Cooldown**: 5 minutes (300 seconds) for the entire exchange.
*   **Adaptive Interval Translation**: Automatically converts standard intervals (like `1h`, `1d`, `5m`) into formats recognized by the active provider.

### 3. Monitoring System
Prometheus metrics are collected via the Spring Actuator endpoint `/api/actuator/prometheus`.
*   **Prometheus**: Scraping the Spring Boot application every 15s (`host.docker.internal:8080`).
*   **Grafana**: View real-time graphs for CPU/memory, JVM metrics, active WebSocket sessions, database connection pools, and Redis rate limit stats.
    *   **Port**: `http://localhost:3000`
    *   **Default Login**: `admin` / `admin`

---

## Project Structure

```
NexTradeX/
├── src/main/java/com/NexTradeX/
│   ├── auth/           # Native JWT auth and controller
│   ├── binance/        # Binance service, websocket, and multi-exchange failover
│   ├── common/         # Common DTOs, API responses, health, notifications, and annotation interfaces
│   ├── config/         # Spring configs (CORS, JWT, Redis, Interceptors, WebSockets, OpenAPI)
│   ├── dto/            # Data transfer objects (Orders, DCA, Wallets, etc.)
│   ├── exception/      # Global exception handling
│   ├── futures/        # Futures trading and position controllers
│   ├── margin/         # Margin trading, leverage controls, and positions
│   ├── market/         # Live prices, candlestick charts, price alert controllers
│   ├── oauth/          # Google OAuth2 callbacks and profile completion
│   ├── options/        # Options contract purchases and settlement
│   ├── order/          # Spot order books, fill engines, and DCA schedules
│   ├── risk/           # Risk controls and leverage calculation engines
│   ├── user/           # User profile and watchlist controllers
│   └── wallet/         # Multi-wallet ledger service (Spot, Margin, Futures)
│
├── frontend/           # React application built with Vite and Tailwind
│   ├── src/
│   │   ├── pages/      # Page components (Dashboard, Spot, Margin, Futures, OAuth Auth)
│   │   ├── components/ # Reusable UI components
│   │   ├── api.js      # CORS credentials & API fetch wrapper
│   │   └── App.js      # React application router
│   └── package.json
│
├── docker-compose-monitoring.yml # Monitoring container definitions (Grafana, Prometheus)
├── prometheus.yml                # Prometheus scraping configurations
└── README.md
```

---

## API Endpoints

All endpoints have a `/api` context path.

### Authentication & Users
*   `POST /api/auth/register` (Rate-limited) - Register a new account
*   `POST /api/auth/login` (Rate-limited) - Login and receive JWT
*   `GET /api/auth/validate` - Validate current token validity
*   `POST /api/oauth2/complete-profile` - Complete Google login profile setup
*   `GET /api/user/profile` - Retrieve logged-in user profile details
*   `PUT /api/user/profile` - Update profile settings (name/email)

### Market Data & Alerts
*   `GET /api/market/prices` (Rate-limited) - Get mock prices for symbols
*   `GET /api/market/price/{symbol}` (Rate-limited) - Get mock price of symbol
*   `GET /api/market/candles/{symbol}` - Get mock candlestick charts data
*   `GET /api/market/binance/price/{symbol}` - Fetch live price from active exchange (Binance/Bybit/MEXC)
*   `GET /api/market/binance/prices` - Fetch live prices for all symbols from active exchange
*   `GET /api/market/binance/symbols` - Fetch supported active exchange symbols
*   `GET /api/market/binance/status` - Check exchange endpoint health and active cooldowns
*   `GET /api/market/alerts` - Get active price alerts
*   `POST /api/market/alerts` - Set a new price alert trigger
*   `DELETE /api/market/alerts/{alertId}` - Remove an existing price alert

### Wallets
*   `GET /api/wallets` - Get all wallet balances
*   `GET /api/wallets/{walletType}` - Retrieve balance by type (`SPOT`, `MARGIN`, `FUTURES`)
*   `POST /api/wallets/deposit` - Deposit mock funds (cryptocurrencies or fiat)
*   `POST /api/wallets/transfer` - Transfer funds internally between wallets
*   `POST /api/wallets/withdraw` - Withdraw mock funds from SPOT wallet
*   `POST /api/wallets/reset` - Reset all wallets to default state

### Trading Operations
*   `POST /api/orders/spot` - Place a spot market/limit order
*   `GET /api/orders/active` - View active spot orders
*   `GET /api/orders/history` - View spot order history
*   `DELETE /api/orders/{orderId}` - Cancel a pending spot order
*   `GET /api/orders/dca` - List current DCA schedules
*   `POST /api/orders/dca` - Create a new DCA recurring order schedule
*   `POST /api/orders/dca/{scheduleId}/toggle` - Pause or resume DCA schedule
*   `POST /api/margin/open` - Open a leveraged margin position
*   `POST /api/margin/close/{positionId}` - Close an active margin position
*   `GET /api/margin/positions/open` - Get open margin positions
*   `GET /api/margin/positions/all` - List margin positions history
*   `POST /api/futures/open` - Open a futures contract (with leverage / SL / TP)
*   `GET /api/futures/positions/open` - View current open futures positions
*   `POST /api/futures/close/{positionId}` - Close an open futures position
*   `POST /api/futures/update-sl-tp/{positionId}` - Adjust stop loss/take profit triggers
*   `POST /api/options/buy` - Purchase a call/put options contract
*   `POST /api/options/settle/{contractId}` - Settle an option contract
*   `GET /api/options/positions` - View active options positions
*   `GET /api/options/positions/history` - View option trade history

### System & Notifications
*   `GET /api/notifications` - Retrieve list of notifications
*   `POST /api/notifications/read-all` - Clear/Read all notification flags
*   `GET /api/health` - Simple server heart-beat check
*   `GET /api/actuator/prometheus` - Scrape metrics for system monitoring

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for bug fixes, performance updates, or new simulation engines:
1. Fork the project.
2. Create a feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add NewFeature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

Please follow standard Java/Maven formatting configurations, and add unit/integration tests for any added business logic.

---

## License

This project is open-source and intended solely for educational/simulation purposes. All rights reserved.
