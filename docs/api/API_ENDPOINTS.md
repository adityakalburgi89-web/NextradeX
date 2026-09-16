# API Endpoints

All endpoints have a `/api` context path.

## Authentication & Users
*   `POST /api/auth/register` (Rate-limited) - Register a new account
*   `POST /api/auth/login` (Rate-limited) - Login and receive JWT
*   `GET /api/auth/validate` - Validate current token validity
*   `POST /api/oauth2/complete-profile` - Complete Google login profile setup
*   `GET /api/user/profile` - Retrieve logged-in user profile details
*   `PUT /api/user/profile` - Update profile settings (name/email)

## Market Data & Alerts
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

## Wallets
*   `GET /api/wallets` - Get all wallet balances
*   `GET /api/wallets/{walletType}` - Retrieve balance by type (`SPOT`, `MARGIN`, `FUTURES`)
*   `POST /api/wallets/deposit` - Deposit mock funds (cryptocurrencies or fiat)
*   `POST /api/wallets/transfer` - Transfer funds internally between wallets
*   `POST /api/wallets/withdraw` - Withdraw mock funds from SPOT wallet
*   `POST /api/wallets/reset` - Reset all wallets to default state

## Trading Operations
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

## System & Notifications
*   `GET /api/notifications` - Retrieve list of notifications
*   `POST /api/notifications/read-all` - Clear/Read all notification flags
*   `GET /api/health` - Simple server heart-beat check
*   `GET /api/actuator/prometheus` - Scrape metrics for system monitoring
