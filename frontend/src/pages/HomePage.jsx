import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Check, Sparkles, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import Illustration3D from "../components/Illustration3D";
import { fetchAllPrices, cachePrices } from "../api";
import { useWebSocket } from "../hooks/useWebSocket";

import btcIcon from "../assets/Icons/btc.svg";
import ethIcon from "../assets/Icons/eth.svg";
import solIcon from "../assets/Icons/sol.svg";
import linkIcon from "../assets/Icons/link.svg";
import ltcIcon from "../assets/Icons/ltc.svg";
import arbIcon from "../assets/Icons/arb.svg";
import opIcon from "../assets/Icons/op.svg";
import suiIcon from "../assets/Icons/sui.svg";

const partnerLogos = [
  { name: "Aeonik", label: "Aeonik Type" },
  { name: "Geist System", label: "Geist UI" },
  { name: "Linear", label: "Linear Monolith" },
  { name: "Framer", label: "Framer 3D" },
  { name: "Vercel", label: "Vercel Edge" },
  { name: "Pitch", label: "Pitch Deck" },
];

const testimonials = [
  {
    quote: "The daylight studio language completely redefined how we view paper trading. The typography feels engraved and execution is razor sharp.",
    name: "Elena Rostova",
    role: "Lead Quantitative Analyst",
    company: "Aether Capital"
  },
  {
    quote: "Clean 32px card radii, zero visual clutter, and near-black CTA controls anchor the entire experience. It's poetry in motion.",
    name: "Marcus Vance",
    role: "Product Architect",
    company: "Studio 148"
  },
  {
    quote: "Aeonik tracking pulled tight to -0.02em makes headlines read with pure confidence. Best UI system we've built on top of.",
    name: "Sophia Lin",
    role: "Senior UX Specialist",
    company: "Daylight Systems"
  }
];

const faqData = [
  {
    q: "What makes NexTradeX unique?",
    a: "NexTradeX combines sub-millisecond paper trading execution with an ultra-clean, daylight-inspired interface, real-time WebSocket feeds, and advanced portfolio analytics."
  },
  {
    q: "Is NexTradeX completely free for paper trading?",
    a: "Yes! NexTradeX provides full simulated spot, futures, and options trading environments with real-time websocket pricing and zero financial risk."
  },
  {
    q: "How does the continuous marquee animation work?",
    a: "Marquee strips scroll endlessly using a custom organic timing curve. Content flows smoothly across the viewport on pure canvas without heavy borders or containers."
  },
  {
    q: "Can I integrate custom APIs into NexTradeX?",
    a: "Absolutely. Our platform exposes clean REST and WebSocket endpoints for strategy automation, market data streaming, and portfolio telemetry."
  }
];

export default function HomePage({ isLoggedIn }) {
  const [prices, setPrices] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTickerTab, setActiveTickerTab] = useState("hot");
  const [emailInput, setEmailInput] = useState("");

  const handlePriceUpdate = (payload) => {
    if (Array.isArray(payload)) {
      setPrices(payload);
      cachePrices(payload);
    }
  };

  useWebSocket("/topic/prices", handlePriceUpdate, true);

  useEffect(() => {
    fetchAllPrices().then((res) => {
      if (res?.data) {
        setPrices(res.data);
      }
    }).catch(() => {});
  }, []);

  const btcPrice = prices.find((p) => p.symbol === "BTCUSDT")?.currentPrice || "96,482.50";
  const ethPrice = prices.find((p) => p.symbol === "ETHUSDT")?.currentPrice || "3,584.20";
  const solPrice = prices.find((p) => p.symbol === "SOLUSDT")?.currentPrice || "184.65";

  return (
    <div className="w-full bg-[#ebf5ff] text-[#0a0d12] overflow-x-hidden">

      {/* 1. HERO SECTION — Reference Layout (2-Column CTA + Market Feed Stack) */}
      <section className="pt-10 pb-16 px-4 sm:px-6 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Main Headline + Signup Bar + Social Auth */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Welcome Reward Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d3f6e3] text-[#059669] font-['Geist'] text-xs font-semibold tracking-tight shadow-xs">
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
                  className="w-full bg-transparent pl-4 pr-36 py-2.5 text-sm text-[#0a0d12] placeholder-[#94a3b8] focus:outline-none"
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
              <button title="Telegram" className="w-10 h-10 rounded-full bg-white border border-[#e2e8f0] shadow-xs flex items-center justify-center text-[#0088cc] hover:bg-[#f8fafc] hover:scale-105 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.16l-2.02 9.51c-.15.68-.55.84-1.12.52l-3.1-2.28-1.5 1.44c-.16.16-.3.3-.61.3l.22-3.17 5.77-5.21c.25-.22-.05-.35-.39-.12l-7.14 4.49-3.07-.96c-.67-.21-.68-.67.14-.99l12.01-4.63c.56-.2 1.05.14.86.95z"/></svg>
              </button>
              <button title="Google" className="w-10 h-10 rounded-full bg-white border border-[#e2e8f0] shadow-xs flex items-center justify-center text-[#ea4335] hover:bg-[#f8fafc] hover:scale-105 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 15.987 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
              </button>
              <button title="Apple" className="w-10 h-10 rounded-full bg-white border border-[#e2e8f0] shadow-xs flex items-center justify-center text-[#0a0d12] hover:bg-[#f8fafc] hover:scale-105 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.02c.62-.75 1.04-1.8 0.93-2.84-.9.04-2 .6-2.64 1.35-.58.67-1.09 1.75-.95 2.78 1.01.08 2.04-.54 2.66-1.29z"/></svg>
              </button>
              <button title="QR Code" className="w-10 h-10 rounded-full bg-white border border-[#e2e8f0] shadow-xs flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc] hover:scale-105 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 14v1m8-9h-1M5 12H4m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M9 9h6v6H9V9z"/></svg>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Stacked Market Widgets */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* CARD 1: Crypto Tickers Table */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-[#e2e8f0] shadow-md">
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
                {(activeTickerTab === 'hot' ? [
                  { symbol: "ADA", name: "Cardano", price: "$0.19045209", change: "+0.21%", positive: true, icon: btcIcon },
                  { symbol: "KOMA", name: "Koma Inu", price: "$0.01460099", change: "-10.41%", positive: false, icon: ethIcon },
                  { symbol: "GIGGLE", name: "Giggle Fund", price: "$41.64", change: "-1.67%", positive: false, icon: solIcon },
                  { symbol: "HOME", name: "Defi.App", price: "$0.00700488", change: "-17.66%", positive: false, icon: linkIcon },
                  { symbol: "MMT", name: "Momentum", price: "$0.1587933", change: "-6.19%", positive: false, icon: suiIcon },
                ] : [
                  { symbol: "BTC", name: "Bitcoin", price: typeof btcPrice === 'number' ? `$${btcPrice.toLocaleString()}` : `$${btcPrice}`, change: "+3.45%", positive: true, icon: btcIcon },
                  { symbol: "ETH", name: "Ethereum", price: typeof ethPrice === 'number' ? `$${ethPrice.toLocaleString()}` : `$${ethPrice}`, change: "+2.18%", positive: true, icon: ethIcon },
                  { symbol: "SOL", name: "Solana", price: typeof solPrice === 'number' ? `$${solPrice.toLocaleString()}` : `$${solPrice}`, change: "+5.64%", positive: true, icon: solIcon },
                  { symbol: "ARB", name: "Arbitrum", price: "$1.12", change: "-0.85%", positive: false, icon: arbIcon },
                  { symbol: "OP", name: "Optimism", price: "$2.45", change: "+4.12%", positive: true, icon: opIcon },
                ]).map((coin) => (
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
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 border border-[#e2e8f0] shadow-md text-left">
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
            <svg className="w-5 h-5 fill-current text-[#475569]" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            CoinMarketCap
          </div>
          <div className="font-['Inter'] font-bold text-base tracking-tight text-[#475569] flex items-center gap-2">
            <svg className="w-5 h-5 fill-current text-[#475569]" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z"/></svg>
            CryptoQuant
          </div>
          <div className="font-['Inter'] font-bold text-base tracking-tight text-[#475569] flex items-center gap-2">
            <svg className="w-5 h-5 fill-current text-[#475569]" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z"/></svg>
            Women's World Organization
          </div>
        </div>
      </section>

      {/* 3. PASTEL CATEGORY TILES GRID — Lavender, Mint, Powder Blue, Peach */}
      <section className="max-w-[1200px] mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="font-['Inter'] text-4xl sm:text-5xl font-medium text-[#0a0d12] tracking-tight">
            Curated Pastel Washes
          </h2>
          <p className="font-['Geist'] text-base text-[#535862]">
            Flat pastel tile surfaces provide subtle category demarcation without visual noise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Lavender Wash Tile */}
          <div className="tile-pastel bg-[#f1e6ff] flex flex-col justify-between h-[320px] relative overflow-hidden">
            <div className="space-y-2">
              <span className="font-['Geist'] text-xs font-semibold text-[#0069e0]">01 / FEATURES</span>
              <h3 className="font-['Inter'] text-2xl font-medium text-[#0a0d12]">Spot Engine</h3>
            </div>
            <Illustration3D type="envelope-star" size={100} className="self-end" />
            <p className="font-['Geist'] text-sm text-[#535862]">Sub-millisecond simulated execution with zero risk.</p>
          </div>

          {/* Mint Wash Tile */}
          <div className="tile-pastel bg-[#d3f6e3] flex flex-col justify-between h-[320px] relative overflow-hidden">
            <div className="space-y-2">
              <span className="font-['Geist'] text-xs font-semibold text-[#0069e0]">02 / DERIVATIVES</span>
              <h3 className="font-['Inter'] text-2xl font-medium text-[#0a0d12]">Perp Futures</h3>
            </div>
            <Illustration3D type="flower-smile" size={100} className="self-end" />
            <p className="font-['Geist'] text-sm text-[#535862]">Up to 125x leverage testing with real market depth.</p>
          </div>

          {/* Powder Blue Tile */}
          <div className="tile-pastel bg-[#cce7ff] flex flex-col justify-between h-[320px] relative overflow-hidden">
            <div className="space-y-2">
              <span className="font-['Geist'] text-xs font-semibold text-[#0069e0]">03 / TELEMETRY</span>
              <h3 className="font-['Inter'] text-2xl font-medium text-[#0a0d12]">Live Stream</h3>
            </div>
            <Illustration3D type="crayon-smile" size={100} className="self-end" />
            <p className="font-['Geist'] text-sm text-[#535862]">WebSocket price feeds with instant tick data.</p>
          </div>

          {/* Peach Wash Tile */}
          <div className="tile-pastel bg-[#ffd1b8] flex flex-col justify-between h-[320px] relative overflow-hidden">
            <div className="space-y-2">
              <span className="font-['Geist'] text-xs font-semibold text-[#0069e0]">04 / ASSISTANT</span>
              <h3 className="font-['Inter'] text-2xl font-medium text-[#0a0d12]">Trixie AI</h3>
            </div>
            <Illustration3D type="hero-cloud" size={100} className="self-end" />
            <p className="font-['Geist'] text-sm text-[#535862]">Conversational market intelligence at your side.</p>
          </div>
        </div>
      </section>

      {/* 4. REAL-TIME MARKETS OVERVIEW (Paper White & Bone White cards) */}
      <section className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="card-genie space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="font-['Inter'] text-3xl font-medium text-[#0a0d12]">Live Market Tickers</h2>
              <p className="font-['Geist'] text-sm text-[#535862] mt-1">Real-time paper trading prices updated continuously.</p>
            </div>
            <Link to="/markets" className="btn-secondary-genie">
              View All Markets
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[24px] bg-[#ffffff] border border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={btcIcon} alt="BTC" className="w-10 h-10" />
                <div>
                  <h4 className="font-['Inter'] text-lg font-medium text-[#0a0d12]">BTC / USDT</h4>
                  <span className="font-['Geist'] text-xs text-[#93979f]">Bitcoin</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-['Inter'] text-lg font-medium text-[#0a0d12]">${btcPrice}</p>
                <span className="font-['Geist'] text-xs text-[#13a978] font-medium">+3.45%</span>
              </div>
            </div>

            <div className="p-6 rounded-[24px] bg-[#ffffff] border border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={ethIcon} alt="ETH" className="w-10 h-10" />
                <div>
                  <h4 className="font-['Inter'] text-lg font-medium text-[#0a0d12]">ETH / USDT</h4>
                  <span className="font-['Geist'] text-xs text-[#93979f]">Ethereum</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-['Inter'] text-lg font-medium text-[#0a0d12]">${ethPrice}</p>
                <span className="font-['Geist'] text-xs text-[#13a978] font-medium">+1.85%</span>
              </div>
            </div>

            <div className="p-6 rounded-[24px] bg-[#ffffff] border border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={solIcon} alt="SOL" className="w-10 h-10" />
                <div>
                  <h4 className="font-['Inter'] text-lg font-medium text-[#0a0d12]">SOL / USDT</h4>
                  <span className="font-['Geist'] text-xs text-[#93979f]">Solana</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-['Inter'] text-lg font-medium text-[#0a0d12]">${solPrice}</p>
                <span className="font-['Geist'] text-xs text-[#13a978] font-medium">+5.12%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURE CARDS GRID (32px radius #fafdff bone white) */}
      <section className="max-w-[1200px] mx-auto px-6 py-20 space-y-12">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <h2 className="font-['Inter'] text-4xl md:text-5xl font-medium text-[#0a0d12] tracking-tight">
            Architectural Restraint
          </h2>
          <p className="font-['Geist'] text-base text-[#535862]">
            Pure card surfaces relying strictly on color shift from canvas (#ebf5ff) to surface (#fafdff).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card-genie space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#cce7ff] text-[#0069e0] flex items-center justify-center">
              <Zap size={22} />
            </div>
            <h3 className="font-['Inter'] text-3xl font-medium text-[#0a0d12]">Lightning Speed</h3>
            <p className="font-['Geist'] text-lg text-[#535862] leading-relaxed">
              Order placement executed within 15 milliseconds, backed by reactive websocket data streams.
            </p>
          </div>

          <div className="card-genie space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#f1e6ff] text-[#0069e0] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <h3 className="font-['Inter'] text-3xl font-medium text-[#0a0d12]">Zero Financial Risk</h3>
            <p className="font-['Geist'] text-lg text-[#535862] leading-relaxed">
              Master trading strategies in a safe paper-money ecosystem with $100,000 initial Virtual Capital.
            </p>
          </div>

          <div className="card-genie space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#d3f6e3] text-[#0069e0] flex items-center justify-center">
              <TrendingUp size={22} />
            </div>
            <h3 className="font-['Inter'] text-3xl font-medium text-[#0a0d12]">Deep Analytics</h3>
            <p className="font-['Geist'] text-lg text-[#535862] leading-relaxed">
              Track Sharpe ratio, drawdown, win rates, and profit curves with professional analytics graphs.
            </p>
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIAL CARDS MARQUEE */}
      <section className="w-full py-20 bg-[#ebf5ff] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 mb-12 text-center">
          <h2 className="font-['Inter'] text-4xl font-medium text-[#0a0d12]">What Leaders Say</h2>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="animate-marquee flex gap-8 whitespace-normal py-4">
            {testimonials.concat(testimonials).map((item, idx) => (
              <div key={idx} className="card-genie min-w-[380px] max-w-[420px] space-y-6 flex-shrink-0">
                <p className="font-['Geist'] text-lg text-[#535862] leading-relaxed">
                  "{item.quote}"
                </p>
                <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                  <div>
                    <h4 className="font-['Geist'] text-base font-medium text-[#0a0d12]">{item.name}</h4>
                    <span className="font-['Geist'] text-xs text-[#93979f]">{item.role}</span>
                  </div>
                  <span className="font-['Inter'] font-medium text-xs text-[#0069e0]">{item.company}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION SECTION — grid-template-rows 0.65s transition */}
      <section className="max-w-[1000px] mx-auto px-6 py-20 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="font-['Inter'] text-4xl md:text-5xl font-medium text-[#0a0d12]">Frequently Asked</h2>
          <p className="font-['Geist'] text-base text-[#535862]">Everything you need to know about the NexTradeX platform.</p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="faq-accordion-item cursor-pointer" onClick={() => setOpenFaq(isOpen ? -1 : idx)}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-['Geist'] text-lg md:text-xl font-medium text-[#0a0d12]">
                    {faq.q}
                  </h3>
                  <ChevronDown size={20} className={`text-[#93979f] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </div>
                <div className={`faq-content-grid ${isOpen ? "open" : ""}`}>
                  <div className="faq-content-inner pt-4">
                    <p className="font-['Geist'] text-base text-[#93979f] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
