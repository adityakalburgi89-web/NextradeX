import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronRight, Zap, ShieldCheck, TrendingUp, Layers, Activity, BarChart2 } from "lucide-react";
import { fetchAllPrices, cachePrices } from "../api";
import { useWebSocket } from "../hooks/useWebSocket";

import btcIcon from "../assets/Icons/btc.svg";
import ethIcon from "../assets/Icons/eth.svg";
import solIcon from "../assets/Icons/sol.svg";
import heroBg from "../assets/images/hero-bg.png";
import coinGeckoIcon from "../assets/Icons/coingecko.svg";
import coinMarketCapIcon from "../assets/Icons/coinmarketcap.svg";

const partnerLogos = [
  { name: "CoinGecko", label: "CoinGecko", icon: coinGeckoIcon, height: "h-7 sm:h-8" },
  { name: "CoinMarketCap", label: "CoinMarketCap", icon: coinMarketCapIcon, height: "h-6 sm:h-7" },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for exploring paper trading and testing basic spot strategies.",
    features: [
      "$100,000 Virtual Capital",
      "Real-time WebSocket market feeds",
      "Basic spot & margin orders",
      "Standard telemetry dashboard",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro Engineer",
    price: "$29",
    period: "per month",
    description: "Designed for active quantitative traders needing futures & leverage analytics.",
    features: [
      "Unlimited Virtual Capital resets",
      "Sub-millisecond execution engine",
      "125x Perpetual Futures simulation",
      "Advanced Sharpe & Drawdown metrics",
      "Trixie AI Market Assistant",
    ],
    cta: "Start 14-Day Trial",
    popular: true,
  },
  {
    name: "Institution",
    price: "$99",
    period: "per month",
    description: "Multi-account telemetry, custom API keys, and dedicated strategy isolation.",
    features: [
      "Multi-sub-account workspace",
      "Full REST & WebSocket API access",
      "Historical tick export (CSV/JSON)",
      "Priority order book streaming",
      "24/7 Priority Support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqData = [
  {
    q: "What makes NexTradeX unique?",
    a: "NexTradeX combines sub-millisecond paper trading execution with an engineered white blueprint interface, real-time WebSocket feeds, and advanced telemetry analytics."
  },
  {
    q: "Is NexTradeX completely free for paper trading?",
    a: "Yes! NexTradeX provides full simulated spot, futures, and options trading environments with real-time websocket pricing and zero financial risk."
  },
  {
    q: "How does the pill-shaped interface system work?",
    a: "Our visual identity enforces 9999px border-radius pill shapes for all action controls, combined with hairline 1px Fog (#e8e8e8) borders and crisp OpenRunde typography."
  },
  {
    q: "Can I integrate custom APIs into NexTradeX?",
    a: "Streamlined REST and WebSocket endpoints allow seamless strategy automation, market data streaming, and portfolio telemetry."
  }
];

export default function HomePage({ isLoggedIn }) {
  const [prices, setPrices] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const btcPrice = prices.find((p) => p.symbol === "BTCUSDT")?.currentPrice || "63,803.33";
  const ethPrice = prices.find((p) => p.symbol === "ETHUSDT")?.currentPrice || "1,866.83";
  const solPrice = prices.find((p) => p.symbol === "SOLUSDT")?.currentPrice || "73.37";

  return (
    <div className="w-full bg-white text-carbon overflow-x-hidden font-openrunde pt-32 sm:pt-40 md:pt-44">

      {/* 1. HERO SECTION — Centered Stack on Paper White Canvas */}
      <section className="pt-8 sm:pt-12 pb-20 px-6 max-w-[1200px] mx-auto text-center space-y-10 sm:space-y-12">
        
        {/* NEW Top Pill Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-[#f0edfe] border border-[#dfd7fe] rounded-full px-3.5 py-1 text-xs font-medium text-carbon cursor-pointer hover:border-[#8574ff] transition-colors shadow-xs">
            <span className="bg-[#8574ff] text-white font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
              NEW
            </span>
            <span>Engineered Analytics v2.0 is live</span>
            <ChevronRight size={13} className="text-[#8574ff]" />
          </div>
        </div>

        {/* Display Headline */}
        <h1 className="font-openrunde text-[48px] sm:text-[60px] font-semibold text-carbon tracking-[-3px] leading-[1.1] max-w-4xl mx-auto pt-4 sm:pt-6">
          The engineered analytics platform for high-velocity trading.
        </h1>

        {/* Subtitle Body Text */}
        <p className="font-openrunde text-lg sm:text-xl text-[#666666] max-w-2xl mx-auto tracking-[-0.32px] leading-relaxed">
          Simulate spot, futures, and options strategies with sub-millisecond telemetry, flat geometric controls, and zero financial exposure.
        </p>

        {/* Dual Action Pill Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/auth"
            className="bg-[#8574ff] hover:bg-[#7462f5] text-white font-semibold px-7 py-3 rounded-full text-base tracking-[-0.32px] transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/markets"
            className="bg-[#f4f4f6] hover:bg-[#e6e6ea] text-carbon font-semibold px-6 py-3 rounded-full text-base tracking-[-0.32px] transition-colors"
          >
            See Interactive Demo
          </Link>
        </div>

        {/* Partner Logos Strip */}
        <div className="pt-10 flex flex-wrap items-center justify-center gap-10 sm:gap-16 md:gap-24 opacity-85 hover:opacity-100 transition-opacity">
          {partnerLogos.map((partner, idx) => (
            <React.Fragment key={partner.name}>
              {idx > 0 && <div className="hidden sm:block h-5 w-[1px] bg-[#e2e2e8]" />}
              {partner.icon ? (
                <img
                  src={partner.icon}
                  alt={partner.label}
                  className={`${partner.height || "h-7"} object-contain opacity-90 hover:opacity-100 transition-all hover:scale-105`}
                />
              ) : (
                <span className="font-openrunde font-semibold text-sm tracking-[-0.32px] text-ash">
                  {partner.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* 2. TELEMETRY DASHBOARD SECTION — Full-Bleed Edge-to-Edge Background */}
      <section className="w-full relative pb-28">
        
        {/* Curved Inset Floating Tab Bar */}
        <div className="flex justify-center relative z-20 -mb-5 sm:-mb-6 px-4">
          <div className="bg-white border border-fog/80 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-3.5 py-1.5 flex items-center gap-3 sm:gap-5 text-xs sm:text-sm font-medium text-graphite backdrop-blur-xl">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 sm:px-4.5 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                activeTab === "dashboard"
                  ? "bg-[#efeff4] text-carbon font-semibold shadow-xs"
                  : "text-ash hover:text-carbon"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("profiles")}
              className={`px-3.5 sm:px-4.5 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                activeTab === "profiles"
                  ? "bg-[#efeff4] text-carbon font-semibold shadow-xs"
                  : "text-ash hover:text-carbon"
              }`}
            >
              Profiles
            </button>
            <button
              onClick={() => setActiveTab("funnels")}
              className={`px-3.5 sm:px-4.5 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                activeTab === "funnels"
                  ? "bg-[#efeff4] text-carbon font-semibold shadow-xs"
                  : "text-ash hover:text-carbon"
              }`}
            >
              Funnels
            </button>
            <button
              onClick={() => setActiveTab("performance")}
              className={`px-3.5 sm:px-4.5 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                activeTab === "performance"
                  ? "bg-[#efeff4] text-carbon font-semibold shadow-xs"
                  : "text-ash hover:text-carbon"
              }`}
            >
              Performance
            </button>
            <button
              onClick={() => setActiveTab("realtime")}
              className={`px-3.5 sm:px-4.5 py-1.5 rounded-full text-xs sm:text-sm transition-all duration-200 ${
                activeTab === "realtime"
                  ? "bg-[#efeff4] text-carbon font-semibold shadow-xs"
                  : "text-ash hover:text-carbon"
              }`}
            >
              Realtime
            </button>
          </div>
        </div>

        {/* Full-Bleed Edge-to-Edge Background Banner */}
        <div 
          className="w-full pt-20 sm:pt-28 pb-20 sm:pb-32 px-4 sm:px-8 shadow-2xl relative bg-cover bg-center bg-no-repeat min-h-[580px] sm:min-h-[700px] flex items-center justify-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-white/80 p-6 md:p-10 w-full max-w-[1080px] mx-auto shadow-[0_25px_60px_rgba(0,0,0,0.18)] text-left space-y-6 relative z-10">
            
            {/* Dashboard Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-fog gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#8574ff] text-white flex items-center justify-center font-bold text-xs">
                  NX
                </div>
                <div>
                  <h3 className="font-openrunde font-semibold text-base text-carbon tracking-[-0.31px]">
                    Portfolio Telemetry Dashboard
                  </h3>
                  <p className="font-openrunde text-xs text-ash tracking-[-0.32px]">
                    Live Session ID: #8492-NX • Connected via WebSocket
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-wash text-mint text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                  Live Streaming
                </span>
                <span className="px-3 py-1 rounded-full bg-mist text-graphite text-xs font-medium border border-fog">
                  125x Perp Mode
                </span>
              </div>
            </div>

            {/* 3 Metric Callout Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="metric-card-visitors">
                <div className="flex items-center justify-between text-xs text-ash mb-1">
                  <span>Virtual Equity</span>
                  <span className="delta-positive">+14.2%</span>
                </div>
                <div className="font-openrunde font-semibold text-2xl text-carbon tracking-[-0.61px]">
                  $114,250.00
                </div>
              </div>

              <div className="metric-card-visitors">
                <div className="flex items-center justify-between text-xs text-ash mb-1">
                  <span>24h Realized PnL</span>
                  <span className="delta-positive">+$3,480.00</span>
                </div>
                <div className="font-openrunde font-semibold text-2xl text-carbon tracking-[-0.61px]">
                  +$3,480.00
                </div>
              </div>

              <div className="metric-card-visitors">
                <div className="flex items-center justify-between text-xs text-ash mb-1">
                  <span>Win Rate</span>
                  <span className="delta-positive">78.5%</span>
                </div>
                <div className="font-openrunde font-semibold text-2xl text-carbon tracking-[-0.61px]">
                  78.5%
                </div>
              </div>
            </div>

            {/* Live Tickers Mini Grid */}
            <div className="table-container-visitors overflow-hidden">
              <table className="table-visitors">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Price</th>
                    <th>24h Change</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="flex items-center gap-2">
                      <img src={btcIcon} alt="BTC" className="w-5 h-5" />
                      <span className="font-medium text-carbon">BTC / USDT</span>
                    </td>
                    <td className="font-semibold text-carbon">${btcPrice}</td>
                    <td><span className="delta-positive">+3.45%</span></td>
                    <td className="text-xs text-ash">Active Long</td>
                  </tr>
                  <tr>
                    <td className="flex items-center gap-2">
                      <img src={ethIcon} alt="ETH" className="w-5 h-5" />
                      <span className="font-medium text-carbon">ETH / USDT</span>
                    </td>
                    <td className="font-semibold text-carbon">${ethPrice}</td>
                    <td><span className="delta-positive">+1.85%</span></td>
                    <td className="text-xs text-ash">Monitoring</td>
                  </tr>
                  <tr>
                    <td className="flex items-center gap-2">
                      <img src={solIcon} alt="SOL" className="w-5 h-5" />
                      <span className="font-medium text-carbon">SOL / USDT</span>
                    </td>
                    <td className="font-semibold text-carbon">${solPrice}</td>
                    <td><span className="delta-positive">+5.12%</span></td>
                    <td className="text-xs text-ash">Active Long</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </section>

      {/* 2. THREE-COLUMN FEATURE CARDS GRID */}
      <section className="py-16 px-6 max-w-[1200px] mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="font-openrunde text-3xl md:text-4xl font-medium text-carbon tracking-[-0.61px]">
            Engineered Core Features
          </h2>
          <p className="font-openrunde text-base text-graphite tracking-[-0.32px]">
            Clean functional features mapped to distinct visual tokens without clutter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="feature-card-visitors">
            <div className="icon-circle">
              <Zap size={20} />
            </div>
            <h3 className="font-openrunde font-medium text-xl text-carbon mb-2 tracking-[-0.31px]">
              Sub-Millisecond Speed
            </h3>
            <p className="font-openrunde text-sm text-graphite leading-relaxed tracking-[-0.32px]">
              Order placement executed within 15 milliseconds, backed by reactive websocket data streams.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="feature-card-visitors">
            <div className="icon-circle">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-openrunde font-medium text-xl text-carbon mb-2 tracking-[-0.31px]">
              Zero Financial Risk
            </h3>
            <p className="font-openrunde text-sm text-graphite leading-relaxed tracking-[-0.32px]">
              Master trading strategies in a safe paper-money ecosystem with $100,000 initial Virtual Capital.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="feature-card-visitors">
            <div className="icon-circle">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-openrunde font-medium text-xl text-carbon mb-2 tracking-[-0.31px]">
              Deep Telemetry Analytics
            </h3>
            <p className="font-openrunde text-sm text-graphite leading-relaxed tracking-[-0.32px]">
              Track Sharpe ratio, drawdown, win rates, and profit curves with professional analytics graphs.
            </p>
          </div>
        </div>
      </section>

      {/* 3. PRICING TIER CARDS SECTION */}
      <section className="py-16 px-6 max-w-[1200px] mx-auto space-y-12 bg-linen rounded-[32px] border border-fog my-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="font-openrunde text-3xl md:text-4xl font-medium text-carbon tracking-[-0.61px]">
            Flexible Subscription Tiers
          </h2>
          <p className="font-openrunde text-base text-graphite tracking-[-0.32px]">
            Transparent pricing plans designed for individual paper traders and quantitative funds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`pricing-card-visitors flex flex-col justify-between ${tier.popular ? 'border-lavender ring-2 ring-lavender/30 relative' : ''}`}
            >
              <div>
                {tier.popular && (
                  <span className="inline-block px-3 py-1 rounded-full bg-lavender text-white text-xs font-medium mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="font-openrunde font-semibold text-2xl text-carbon mb-2 tracking-[-0.31px]">
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="font-openrunde font-bold text-4xl text-carbon tracking-[-0.61px]">
                    {tier.price}
                  </span>
                  <span className="text-sm text-ash">{tier.period}</span>
                </div>
                <p className="font-openrunde text-sm text-graphite mb-6 leading-relaxed">
                  {tier.description}
                </p>

                <div className="space-y-3 border-t border-fog pt-6 mb-8">
                  {tier.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5 text-sm text-graphite">
                      <div className="w-4 h-4 rounded-full bg-mint-wash text-mint flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/auth"
                className={tier.popular ? "btn-primary-lavender w-full text-center" : "btn-ghost border border-fog w-full text-center hover:bg-mist"}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FAQ ACCORDION SECTION */}
      <section className="max-w-[900px] mx-auto px-6 py-16 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="font-openrunde text-3xl md:text-4xl font-medium text-carbon tracking-[-0.61px]">
            Frequently Asked Questions
          </h2>
          <p className="font-openrunde text-base text-graphite tracking-[-0.32px]">
            Everything you need to know about the NexTradeX platform and engine.
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-fog rounded-[16px] p-5 cursor-pointer hover:border-ash transition-colors"
                onClick={() => setOpenFaq(isOpen ? -1 : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-openrunde text-base font-medium text-carbon tracking-[-0.31px]">
                    {faq.q}
                  </h3>
                  <ChevronDown size={18} className={`text-ash transition-transform duration-200 ${isOpen ? "rotate-180 text-carbon" : ""}`} />
                </div>
                {isOpen && (
                  <div className="pt-3 mt-3 border-t border-fog text-sm text-graphite leading-relaxed tracking-[-0.32px]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
