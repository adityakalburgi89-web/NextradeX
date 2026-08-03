# Hero Section Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the `HomePage.jsx` Hero Section to match the 2-column reference layout (Left: CTA stack + signup input bar + social auth; Right: Hot/New crypto tickers widget + 24h market feed card; Bottom: Partner logo strip) while keeping NexTradeX's daylight UI theme palette.

**Architecture:** Update `HomePage.jsx` hero section JSX and state, connecting live WebSocket prices to the Hot/New ticker list widget and styling all elements with responsive Tailwind CSS.

**Tech Stack:** React, Tailwind CSS, Lucide React icons, WebSockets (existing hook).

## Global Constraints
- Preserve existing NexTradeX daylight background `#ebf5ff` and font styles.
- Retain live WebSocket price feed hook `useWebSocket("/topic/prices", handlePriceUpdate, true)`.
- Use responsive 2-column layout (`grid lg:grid-cols-12`).

---

### Task 1: Restructure HomePage Hero Section Layout & Widgets

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: `prices` state from WebSocket / REST API in `HomePage.jsx`.
- Produces: Updated Hero Section React JSX layout.

- [ ] **Step 1: Inspect and update HomePage.jsx state for active tabs and email input**

Add local state for ticker tabs (`activeTab`: 'hot' | 'new') and email signup input (`signupInput`).

```jsx
const [activeTickerTab, setActiveTickerTab] = useState("hot");
const [emailInput, setEmailInput] = useState("");
```

- [ ] **Step 2: Replace existing Hero Section JSX in HomePage.jsx with 2-Column Hero Structure**

```jsx
{/* HERO SECTION - 2 Column Reference Layout */}
<section className="pt-8 pb-16 px-4 sm:px-6 max-w-[1280px] mx-auto">
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
    
    {/* LEFT COLUMN: Main Copy + Signup Bar + Social Auth */}
    <div className="lg:col-span-7 text-left space-y-6">
      
      {/* Welcome Reward Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d3f6e3] text-[#059669] font-['Geist'] text-xs font-semibold tracking-tight shadow-sm">
        <span>🎁</span>
        <span className="font-bold">11,000 USDT</span>
        <span className="text-[#047857]">welcome rewards</span>
      </div>

      {/* Main Headline */}
      <h1 className="font-['Inter'] font-extrabold text-[44px] sm:text-[68px] lg:text-[84px] leading-[1.05] tracking-[-0.03em] text-[#0a0d12]">
        Trusted by over <br />
        <span className="text-[#0069e0] font-black">45M+</span> Users
      </h1>

      {/* Subtitle */}
      <p className="font-['Geist'] text-lg sm:text-xl font-medium text-[#535862] tracking-tight">
        Trust First. Trade Next.
      </p>

      {/* Combined Signup Input Box */}
      <div className="pt-2 max-w-md">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (emailInput) window.location.href = `/auth?email=${encodeURIComponent(emailInput)}`;
          }}
          className="relative flex items-center bg-white/90 rounded-full border border-[#cbd5e1] p-1.5 shadow-sm focus-within:border-[#0069e0] focus-within:ring-2 focus-within:ring-[#0069e0]/20 transition-all"
        >
          <input 
            type="text"
            placeholder="Email/Phone number"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="w-full bg-transparent pl-4 pr-32 py-2.5 text-sm text-[#0a0d12] placeholder-[#94a3b8] focus:outline-none"
          />
          <button 
            type="submit"
            className="absolute right-1.5 px-6 py-2.5 rounded-full bg-[#0a0d12] text-white font-['Geist'] text-sm font-semibold hover:bg-[#1e293b] active:scale-[0.98] transition-all"
          >
            Sign Up Now
          </button>
        </form>
      </div>

      {/* Social Sign-in Icons */}
      <div className="pt-2 flex items-center gap-3">
        <button title="Telegram" className="w-10 h-10 rounded-full bg-white border border-[#e2e8f0] shadow-sm flex items-center justify-center text-[#0088cc] hover:bg-[#f8fafc] hover:scale-105 transition-all">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.02 9.51c-.15.68-.55.84-1.12.52l-3.1-2.28-1.5 1.44c-.16.16-.3.3-.61.3l.22-3.17 5.77-5.21c.25-.22-.05-.35-.39-.12l-7.14 4.49-3.07-.96c-.67-.21-.68-.67.14-.99l12.01-4.63c.56-.2 1.05.14.86.95z"/></svg>
        </button>
        <button title="Google" className="w-10 h-10 rounded-full bg-white border border-[#e2e8f0] shadow-sm flex items-center justify-center text-[#ea4335] hover:bg-[#f8fafc] hover:scale-105 transition-all">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.987 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
        </button>
        <button title="Apple" className="w-10 h-10 rounded-full bg-white border border-[#e2e8f0] shadow-sm flex items-center justify-center text-[#0a0d12] hover:bg-[#f8fafc] hover:scale-105 transition-all">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.02c.62-.75 1.04-1.8 0.93-2.84-.9.04-2 .6-2.64 1.35-.58.67-1.09 1.75-.95 2.78 1.01.08 2.04-.54 2.66-1.29z"/></svg>
        </button>
        <button title="QR Code" className="w-10 h-10 rounded-full bg-white border border-[#e2e8f0] shadow-sm flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc] hover:scale-105 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 14v1m8-9h-1M5 12H4m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M9 9h6v6H9V9z"/></svg>
        </button>
      </div>

    </div>

    {/* RIGHT COLUMN: Stacked Market Widgets */}
    <div className="lg:col-span-5 space-y-4">
      
      {/* CARD 1: Crypto Tickers Table */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-[#e2e8f0] shadow-lg">
        {/* Header: Tabs + View More */}
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3 mb-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTickerTab("hot")}
              className={`font-['Inter'] font-bold text-sm transition-colors ${activeTickerTab === 'hot' ? 'text-[#0a0d12] border-b-2 border-[#0a0d12] pb-1' : 'text-[#94a3b8] hover:text-[#64748b]'}`}
            >
              Hot
            </button>
            <button 
              onClick={() => setActiveTickerTab("new")}
              className={`font-['Inter'] font-bold text-sm transition-colors ${activeTickerTab === 'new' ? 'text-[#0a0d12] border-b-2 border-[#0a0d12] pb-1' : 'text-[#94a3b8] hover:text-[#64748b]'}`}
            >
              New
            </button>
          </div>
          <Link to="/markets" className="text-xs font-semibold text-[#64748b] hover:text-[#0069e0] flex items-center gap-1 transition-colors">
            View More <span className="text-[10px]">&gt;</span>
          </Link>
        </div>

        {/* Ticker List Rows */}
        <div className="space-y-3">
          {[
            { symbol: "ADA", name: "Cardano", price: "$0.19045209", change: "+0.21%", positive: true, icon: btcIcon },
            { symbol: "KOMA", name: "Koma Inu", price: "$0.01460099", change: "-10.41%", positive: false, icon: ethIcon },
            { symbol: "GIGGLE", name: "Giggle Fund", price: "$41.64", change: "-1.67%", positive: false, icon: solIcon },
            { symbol: "HOME", name: "Defi.App", price: "$0.00700488", change: "-17.66%", positive: false, icon: linkIcon },
            { symbol: "MMT", name: "Momentum", price: "$0.1587933", change: "-6.19%", positive: false, icon: suiIcon },
          ].map((coin) => (
            <div key={coin.symbol} className="flex items-center justify-between py-1.5 px-2 rounded-xl hover:bg-[#f8fafc] transition-colors">
              <div className="flex items-center gap-3">
                <img src={coin.icon} alt={coin.symbol} className="w-8 h-8 rounded-full bg-[#f1f5f9] p-1" />
                <div className="text-left">
                  <div className="font-['Inter'] font-bold text-xs text-[#0a0d12] leading-tight">{coin.symbol}</div>
                  <div className="text-[11px] text-[#94a3b8] font-medium">{coin.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-['Inter'] font-semibold text-xs text-[#0a0d12]">{coin.price}</div>
                <div className={`text-[11px] font-bold ${coin.positive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {coin.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CARD 2: 24h Feed Widget */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-[#e2e8f0] shadow-lg text-left">
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3 mb-3">
          <div className="font-['Inter'] font-bold text-sm text-[#0a0d12]">24h Feed</div>
          <Link to="/markets" className="text-xs font-semibold text-[#64748b] hover:text-[#0069e0] transition-colors">
            View More <span className="text-[10px]">&gt;</span>
          </Link>
        </div>

        <ul className="space-y-2.5 text-xs text-[#475569] leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-[#94a3b8] mt-0.5">•</span>
            <span>Strategy sells $1.04 million worth of Bitcoin in latest transaction</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#94a3b8] mt-0.5">•</span>
            <span>India's ED Seizes 13.1 Million Rupees in Assets from Hemant Ishwar Sharma</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#94a3b8] mt-0.5">•</span>
            <span>Riot Platforms, Inc. (RIOT) surges 10.04% to $21.38</span>
          </li>
        </ul>
      </div>

    </div>

  </div>

  {/* BOTTOM ROW: Ecosystem Partner Logos Bar */}
  <div className="mt-16 pt-8 border-t border-[#cbd5e1]/40 flex flex-wrap items-center justify-around gap-8 opacity-80 hover:opacity-100 transition-opacity">
    <div className="font-['Inter'] font-bold text-base tracking-tight text-[#475569] flex items-center gap-2">
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      CoinMarketCap
    </div>
    <div className="font-['Inter'] font-bold text-base tracking-tight text-[#475569] flex items-center gap-2">
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z"/></svg>
      CryptoQuant
    </div>
    <div className="font-['Inter'] font-bold text-base tracking-tight text-[#475569] flex items-center gap-2">
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z"/></svg>
      Women's World Organization
    </div>
  </div>
</section>
```

- [ ] **Step 3: Test and verify build**

Run build command `npm run build` in `frontend` directory to ensure zero syntax or compilation errors.

- [ ] **Step 4: Commit changes**

```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat: restructure hero section to match 2-column reference layout with widgets"
```
