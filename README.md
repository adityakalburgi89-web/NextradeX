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
- **Authentication**: JWT-based login/registration with smooth transitions.
- **User Profile**: View and update profile information (name, email).
- **WebSockets**: Real-time updates for market ticks and user order/status events.
- **Candlestick Charts**: Interactive charts using Lightweight Charts library.
- **Frontend UI**: React components for dashboards, charts and trading interfaces.
- **No Live Integration**: All services are decoupled from real exchanges; everything runs in-memory or with mock datasets.

---

## For Developers
- All API endpoints and services are for demo/testing only.
- Please do not attempt to connect to real exchanges or payment systems.

---

## Getting Started

### Prerequisites
- Java 17+ and Maven installed on your PATH
- Node.js 18+ and npm (or yarn) for the frontend

### Quick Start

1. **Start the Backend:**
   ```bash
   mvn spring-boot:run
   ```
   The backend runs on `http://localhost:8080`

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`

### Test Credentials
A test user is automatically created on first run:
- **Username:** `testuser`
- **Password:** `TestPassword123`

Or register a new account through the UI.

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/validate` - Validate JWT token

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Market Data
- `GET /api/market/prices` - Get all prices
- `GET /api/market/price/{symbol}` - Get price for symbol
- `GET /api/market/candles/{symbol}` - Get candlestick data

### Trading
- `POST /api/orders/spot` - Place spot order
- `GET /api/orders/active` - Get active orders
- `GET /api/orders/history` - Get order history
- `DELETE /api/orders/{id}` - Cancel order
- `POST /api/futures/open` - Open futures position
- `GET /api/futures/positions/open` - Get open futures positions
- `POST /api/options/buy` - Buy options contract
- `GET /api/options/positions` - Get options positions

### Wallet
- `GET /api/wallets` - Get user wallets
- `GET /api/wallets/{type}` - Get wallet by type

---

## Project Structure

```
NexTradeX/
├── src/main/java/com/NexTradeX/
│   ├── auth/           # Authentication (JWT, login, register)
│   ├── user/           # User management and profile
│   ├── market/         # Market data and price feeds
│   ├── order/          # Order management
│   ├── wallet/         # Virtual wallets
│   ├── futures/        # Futures trading
│   ├── options/        # Options trading
│   ├── margin/         # Margin trading
│   ├── config/         # Spring configuration
│   └── dto/            # Data transfer objects
│
├── frontend/
│   ├── src/
│   │   ├── pages/     # Page components (Auth, Dashboard, Trading, etc.)
│   │   ├── components/# UI components
│   │   ├── api.js     # API client functions
│   │   ├── App.js     # Main app component
│   │   └── lib/       # Utilities
│   └── package.json
│
└── README.md
```

---

## Technology Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Security:** Spring Security with JWT
- **WebSocket:** Spring WebSocket with STOMP
- **Database:** In-memory H2 (demo mode)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Charts:** Lightweight Charts v5
- **Icons:** Lucide React

---

## System Design

The application follows a modular, layered architecture intended for clarity and extensibility:

1. **Presentation Layer (Frontend)**
   - React components communicate with backend REST APIs and WebSocket endpoints.
   - Vite development server proxies requests to the Spring Boot backend.

2. **API Layer (Backend Controllers)**
   - `auth` controller handles login/registration and JWT token issuance.
   - `user` controller handles profile management.
   - Market, order, wallet, and user controllers expose HTTP endpoints for client operations.

3. **Service Layer**
   - Business logic resides here, including order matching, balance calculations, and risk evaluation.
   - Services are stateless where possible; injectable via Spring IoC.

4. **Data/Domain Layer**
   - DTOs model request/response payloads, while in-memory repositories store mock records.
   - Market data generators create simulated tick streams for WebSocket broadcast.

5. **Infrastructure**
   - Security config (JWT filter, password encoder) protects API endpoints.
   - WebSocket configuration enables event broadcasting to connected clients.
   - RestTemplate config allows external calls if the project is extended later.

> The design emphasizes separation of concerns and should make it easy to swap in a real exchange adapter or persistent datastore if desired.

---

## Contributing
Please open issues or pull requests for bug fixes and improvements. Follow standard Maven/Java formatting rules and add appropriate tests.

---

## License
This project is for educational purposes. All rights reserved.
