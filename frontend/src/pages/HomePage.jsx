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

      {/* 1. HERO SECTION — Neumorphic Daylight Concept (Redesigned per reference images) */}
      <section className="min-h-[90vh] pt-12 pb-24 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-[1280px] mx-auto relative overflow-hidden">
        
        {/* Category Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#cce7ff] text-[#0069e0] font-['Geist'] text-xs font-semibold tracking-tight mb-6 shadow-sm">
          <Sparkles size={14} /> Next-Gen Derivatives Platform — NexTradeX 1.0
        </div>

        {/* Display Headline */}
        <h1 className="font-['Inter'] font-bold text-[48px] sm:text-[80px] lg:text-[110px] xl:text-[128px] leading-[1.02] tracking-[-0.03em] text-[#0a0d12] max-w-[1100px] mx-auto select-none">
          NexTrade<span className="text-[#0069e0]">X</span>
        </h1>

        <p className="font-['Geist'] text-base sm:text-xl text-[#535862] max-w-2xl mx-auto mt-4 mb-10 leading-relaxed">
          An ultra-responsive daylight trading platform featuring simulated spot, perpetual futures, options desk, and real-time execution telemetry.
        </p>

        {/* --- NEUMORPHIC HERO GRAPHIC & FLOATING CARDS CONTAINER --- */}
        <div className="relative my-6 w-full max-w-[700px] h-[360px] sm:h-[420px] flex items-center justify-center select-none">
          
          {/* Background Concentric Neumorphic Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[300px] sm:w-[540px] h-[300px] sm:h-[540px] rounded-full border border-white/60 shadow-[inset_0_0_40px_rgba(166,180,200,0.18)]" />
            <div className="absolute w-[220px] sm:w-[400px] h-[220px] sm:h-[400px] rounded-full border border-white/50 shadow-[inset_0_0_30px_rgba(166,180,200,0.15)]" />
            <div className="absolute w-[140px] sm:w-[260px] h-[140px] sm:h-[260px] rounded-full border border-white/40 shadow-[inset_0_0_20px_rgba(166,180,200,0.12)]" />
            <div className="absolute w-[80px] sm:w-[130px] h-[80px] sm:h-[130px] rounded-full border border-white/30" />
          </div>

          {/* Center Floating Bitcoin Neumorphic Target */}
          <div className="absolute z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#e8f0fe] shadow-neumorphic-btn flex items-center justify-center border border-white/80 animate-pulse">
            <img src={btcIcon} alt="BTC" className="w-7 h-7 sm:w-9 sm:h-9" />
          </div>

          {/* Main Hero Pill Artwork Container (Image 2 Concept) */}
          <div className="relative z-0 w-[280px] sm:w-[480px] h-[150px] sm:h-[210px] rounded-[48px] border-[2.5px] border-[#3b82f6] bg-[#eef6ff]/95 shadow-[0_16px_40px_rgba(59,130,246,0.18)] flex items-center justify-center p-4 backdrop-blur-md">
            <Illustration3D type="hero-cloud" size={160} />
          </div>

          {/* Floating Card 1 (Top-Left): Live BTC Price & Sparkline (Image 1 Concept) */}
          <div className="absolute -top-4 -left-2 sm:top-2 sm:left-2 z-20 bg-[#eaf1fb] p-4 sm:p-5 rounded-[28px] shadow-neumorphic border border-white/70 w-[230px] sm:w-[270px] text-left transition-all duration-300 hover:scale-105">
            {/* Header: BTC / USDT */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#f7931a] p-1.5 shadow-sm flex items-center justify-center">
                <img src={btcIcon} alt="BTC" className="w-full h-full" />
              </div>
              <div>
                <div className="font-['Inter'] font-bold text-sm sm:text-base text-[#1e293b] leading-tight">BTC / USDT</div>
                <div className="text-xs text-[#64748b] font-medium">Bitcoin</div>
              </div>
            </div>

            {/* Live Price Inset Well */}
            <div className="bg-[#deebf8] p-3 rounded-2xl shadow-neumorphic-inset mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#64748b] font-medium uppercase tracking-wide">Live Price</div>
                <div className="font-['Inter'] font-bold text-base sm:text-lg text-[#4f46e5] tracking-tight">
                  ${typeof btcPrice === 'number' ? btcPrice.toLocaleString() : btcPrice}
                </div>
              </div>
              <span className="bg-[#dcfce7] text-[#15803d] text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                +3.45%
              </span>
            </div>

            {/* Purple Sparkline Inset Well */}
            <div className="bg-[#deebf8] p-2.5 rounded-2xl shadow-neumorphic-inset h-12 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 40" fill="none">
                <path
                  d="M0 30 Q 30 15, 60 28 T 120 10 T 170 32 T 200 8"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          {/* Floating Card 2 (Bottom-Right): Matching Engine (Image 1 Concept) */}
          <div className="absolute -bottom-4 -right-2 sm:bottom-2 sm:right-2 z-20 bg-[#eaf1fb] p-4 sm:p-5 rounded-[28px] shadow-neumorphic border border-white/70 w-[230px] sm:w-[270px] text-left transition-all duration-300 hover:scale-105">
            <div className="text-[11px] font-bold text-[#64748b] tracking-wider uppercase mb-3">
              MATCHING ENGINE
            </div>

            {/* BID Row */}
            <div className="flex items-center justify-between py-1.5 border-b border-black/5 text-xs sm:text-sm">
              <span className="font-bold text-[#10b981] bg-[#d1fae5] px-2 py-0.5 rounded-md text-[11px]">BID</span>
              <span className="font-['Inter'] font-bold text-[#1e293b]">96,482.00</span>
              <span className="text-[#64748b] font-medium text-xs">0.450 BTC</span>
            </div>

            {/* ASK Row */}
            <div className="flex items-center justify-between pt-2 text-xs sm:text-sm">
              <span className="font-bold text-[#ef4444] bg-[#fee2e2] px-2 py-0.5 rounded-md text-[11px]">ASK</span>
              <span className="font-['Inter'] font-bold text-[#1e293b]">96,483.50</span>
              <span className="text-[#64748b] font-medium text-xs">1.124 BTC</span>
            </div>
          </div>

        </div>

        {/* Primary CTA Buttons (Image 2 Concept) */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-5">
          <Link
            to={isLoggedIn ? "/dashboard" : "/auth"}
            className="rounded-full bg-[#0f172a] hover:bg-[#020617] text-white px-8 py-3.5 font-medium text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            {isLoggedIn ? "Open Dashboard" : "Start Paper Trading"} <ArrowRight size={18} />
          </Link>
          <Link
            to="/markets"
            className="text-[#0f172a] hover:text-[#2563eb] font-semibold text-base px-5 py-3 transition-colors flex items-center gap-1"
          >
            Explore Markets →
          </Link>
        </div>

      </section>

      {/* 2. MARQUEE LOGO STRIP — Continuous horizontal scroll without card wrapper */}
      <section className="w-full py-12 border-y border-black/5 overflow-hidden bg-[#ebf5ff]">
        <div className="max-w-[1200px] mx-auto px-6 mb-4 text-center">
          <span className="font-['Geist'] text-xs uppercase tracking-widest text-[#93979f]">
            Trusted by modern product teams & traders
          </span>
        </div>
        <div className="relative w-full overflow-hidden flex items-center">
          <div className="animate-marquee flex items-center gap-16 whitespace-nowrap py-4">
            {partnerLogos.concat(partnerLogos).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 font-['Inter'] font-medium text-xl text-[#535862] opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-3 h-3 rounded-full bg-[#0069e0]" />
                <span>{item.name}</span>
              </div>
            ))}
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
