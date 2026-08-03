# Design Spec: Hero Section Restructure (Reference Layout & Elements)

**Date**: 2026-08-03  
**Status**: Proposed  
**Target File**: `frontend/src/pages/HomePage.jsx`

---

## 1. Overview
Restructure the main Hero Section in `HomePage.jsx` to adopt the layout, structural hierarchy, and interactive elements of the high-converting reference UI (2-column layout with left CTA/signup stack, right-side live crypto ticker + 24h market feed widgets, and bottom ecosystem partners row), while maintaining NexTradeX's current visual theme palette (`#ebf5ff` daylight theme, `#0069e0` blue accent, dark ink text, crisp rounded cards).

---

## 2. Layout & Architectural Blueprint

```
+-----------------------------------------------------------------------------------+
|  [Left Column - 7/12]                          [Right Column - 5/12]               |
|                                                +--------------------------------+ |
|  Headline:                                     | Ticker Card Widget             | |
|  "Trusted by over 45M+ Users"                  | Tabs: [Hot] [New]  View More > | |
|                                                | ADA  $0.1904   +0.21%          | |
|  Subtitle:                                     | KOMA $0.0146   -10.41%         | |
|  "Trust First. Trade Next."                    | GIGGLE $41.64   -1.67%          | |
|                                                +--------------------------------+ |
|  Rewards Pill: 🎁 11,000 USDT welcome rewards  | 24h Feed Widget                | |
|                                                | [24h Feed]        View More >  | |
|  [ Email/Phone number       ( Sign Up Now ) ]  | • Strategy sells $1.04M BTC... | |
|                                                | • India's ED Seizes 13.1M...   | |
|  Social Logins: ( Telegram ) ( G ) ( Apple ) ( QR ) +--------------------------------+ |
+-----------------------------------------------------------------------------------+
|  Ecosystem Partners Row: [CoinMarketCap]  [CryptoQuant]  [Women's World Org] ...   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Detailed Component Breakdown

### A. Left Column (Hero Content & Auth Call-to-Action)
1. **Headline**:
   - `Trusted by over 45M+ Users`
   - Uses `45M+` highlighted in primary `#0069e0` / `#10b981` brand green accent with high typography weight.
2. **Subtitle**:
   - `Trust First. Trade Next.`
   - Clean, high-contrast subtext setting platform trust positioning.
3. **Rewards Pill**:
   - `🎁 11,000 USDT welcome rewards` (with mint green text/icon styling and subtle background pill container).
4. **Interactive Signup Bar**:
   - Unified input container with rounded pill border.
   - Text input for `Email/Phone number`.
   - Embedded pill button: `Sign Up Now` that routes to `/auth?signup=true` or initiates registration.
5. **Social Sign-In Quick Actions**:
   - Circular icon action buttons for Telegram, Google (`G`), Apple logo, and QR Code modal toggle.

### B. Right Column (Market Ticker & News Feed Stack)
1. **Hot / New Crypto Tickers Card**:
   - Card container with subtle neumorphic shadow/border.
   - Header with interactive `Hot` and `New` tab switches + `View More >` link leading to `/markets`.
   - List of 5 cryptocurrencies with logo icon, token ticker, full name, live price in USD, and 24h change % (styled green `#10b981` for gains, red `#ef4444` for losses).
   - Real-time price updates wired to the WebSocket price state (`prices`).
2. **24h Market News Feed Card**:
   - Card container with `24h Feed` header and `View More >` link.
   - 3 curated news bullet points highlighting key market events (e.g. BTC ETF/strategy updates, regulatory news, stock/crypto movers).

### C. Bottom Section (Ecosystem Partner Logos Bar)
- Horizontal strip displaying partner logos/branding: `CoinMarketCap`, `CryptoQuant`, `Women's World Organization`, etc.
- Styled with clean opacity and hover transitions matching NexTradeX theme.

---

## 4. Verification & Testing Plan

1. **Responsive Testing**: Verify grid layout stacks smoothly on mobile screen viewports (`< 768px`) and displays side-by-side on desktop viewports (`>= 1024px`).
2. **Interactive States**:
   - Test `Hot` vs `New` tab switching on the Crypto Ticker Card.
   - Test email/phone sign up input submit action.
3. **Data Connection**: Ensure WebSocket price stream correctly updates the ticker prices in real time.
