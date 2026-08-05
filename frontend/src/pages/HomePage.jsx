import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, ChevronRight, Zap, ShieldCheck, TrendingUp, Sparkles, Check } from "lucide-react";
import { fetchAllPrices, cachePrices } from "../api";
import { useWebSocket } from "../hooks/useWebSocket";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon, Shield01Icon, AnalyticsUpIcon } from "@hugeicons/core-free-icons";

import btcIcon from "../assets/Icons/btc.svg";
import ethIcon from "../assets/Icons/eth.svg";
import solIcon from "../assets/Icons/sol.svg";
import heroBg from "../assets/images/hero-bg.png";
import coinGeckoIcon from "../assets/Icons/coingecko.svg";
import coinMarketCapIcon from "../assets/Icons/coinmarketcap.svg";
import cryptoWalletImg from "../assets/images/crypto-wallet.png";
import footerBg from "../assets/images/footer-bg.png";

const partnerLogos = [
  { name: "CoinGecko", label: "CoinGecko Data", icon: coinGeckoIcon, height: "h-9 sm:h-11" },
  { name: "CoinMarketCap", label: "CoinMarketCap Feeds", icon: coinMarketCapIcon, height: "h-5 sm:h-6" },
];



const faqData = [
  {
    q: "What is NexTradeX and how does paper trading work?",
    a: "NexTradeX is a free practice trading platform (also known as paper trading) that lets you practice buying and selling cryptocurrencies using virtual money. You experience real market price movements and practice trading strategies with zero financial risk—so you never lose real money."
  },
  {
    q: "Do I need real money, a credit card, or bank details?",
    a: "No! NexTradeX is 100% free to use. You do not need to deposit real money, enter credit card details, or provide complex personal verification. The moment you sign up, your account is credited with $100,000 in free virtual funds to start practice trading immediately."
  },
  {
    q: "What happens if I lose my virtual money? Can I reset my balance?",
    a: "Don't worry at all—that's the whole point of paper trading! If your trades don't go as planned, you can instantly refill or reset your virtual wallet balance back to $100,000 with a single click at any time and start fresh."
  },
  {
    q: "Are the crypto prices real and live?",
    a: "Yes! The prices on NexTradeX update live in real time based on actual market data for popular cryptocurrencies like Bitcoin (BTC), Ethereum (ETH), and Solana (SOL). Your practice trades reflect live market movements so you learn under realistic market conditions."
  },
  {
    q: "Can I practice futures trading and leverage safely?",
    a: "Yes! You can practice both simple Spot trading (buying and holding coins) and Futures trading (predicting if prices will go up or down with leverage up to 125x). It is a safe way to understand how leverage, margin, stop-loss orders, and take-profit targets work before trading with real capital."
  },
  {
    q: "How do I track my profit, loss, and trading performance?",
    a: "Your personal dashboard automatically tracks all your past and open trades, win rates, and total profit or loss (PnL) in real time. This makes it easy to see which strategies are working and build trading confidence over time."
  },
  {
    q: "Who is NexTradeX built for?",
    a: "NexTradeX is built for everyone! Whether you are a complete beginner taking your first steps in crypto, or an experienced trader wanting to test out a new strategy or indicator without risking real capital, NexTradeX provides the perfect risk-free environment."
  }
];

export default function HomePage({ isLoggedIn }) {
  const [prices, setPrices] = useState([]);
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTab, setActiveTab] = useState("spot");

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

      {/* 1. HERO SECTION */}
      <section className="pt-8 sm:pt-12 pb-20 px-6 max-w-[1200px] mx-auto text-center space-y-10 sm:space-y-12">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-[#f0edfe] border border-[#dfd7fe] rounded-full px-4 py-1.5 text-xs font-medium text-carbon hover:border-[#8574ff] transition-colors shadow-xs">
            <span className="bg-[#8574ff] text-white font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
              100% FREE
            </span>
            <span>Real-Time Crypto Paper Trading</span>
            <ChevronRight size={13} className="text-[#8574ff]" />
          </div>
        </div>

        {/* Display Headline */}
        <h1 className="font-openrunde text-[44px] sm:text-[58px] font-semibold text-carbon tracking-[-2.5px] leading-[1.12] max-w-4xl mx-auto pt-2">
          Master Crypto Trading Without Risking Real Capital.
        </h1>

        {/* Subtitle Body Text */}
        <p className="font-openrunde text-lg sm:text-xl text-[#666666] max-w-2xl mx-auto tracking-[-0.32px] leading-relaxed">
          Simulate spot, futures, and options strategies using live market data feeds, advanced charting, and $100,000 in virtual funds.
        </p>

        {/* Dual Action Pill Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/auth"
            className="bg-[#8574ff] hover:bg-[#7462f5] text-white font-semibold px-7 py-3.5 rounded-full text-base tracking-[-0.32px] transition-all transform hover:scale-105 shadow-md flex items-center gap-2"
          >
            <span>Start Free Practice</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            to="/markets"
            className="bg-[#f4f4f6] hover:bg-[#e6e6ea] text-carbon font-semibold px-6 py-3.5 rounded-full text-base tracking-[-0.32px] transition-colors"
          >
            View Live Markets
          </Link>
        </div>

        {/* Market Data Partners */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-10 sm:gap-16 opacity-85 hover:opacity-100 transition-opacity">
          {partnerLogos.map((partner, idx) => (
            <React.Fragment key={partner.name}>
              {idx > 0 && <div className="hidden sm:block h-5 w-[1px] bg-[#e2e2e8]" />}
              {partner.icon ? (
                <img
                  src={partner.icon}
                  alt={partner.label}
                  className={`${partner.height || "h-7"} object-contain opacity-90 hover:opacity-100 transition-all`}
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

      {/* 2. LIVE DASHBOARD PREVIEW SECTION */}
      <section className="w-full relative pb-28">
        
        {/* Category Navigation Tabs */}
        <div className="flex justify-center relative z-20 -mb-5 sm:-mb-6 px-4">
          <div className="bg-white border border-fog/80 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-3 py-1.5 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-graphite backdrop-blur-xl">
            <button
              onClick={() => setActiveTab("spot")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeTab === "spot" ? "bg-[#efeff4] text-carbon font-semibold shadow-xs" : "text-ash hover:text-carbon"
              }`}
            >
              Spot Trading
            </button>
            <button
              onClick={() => setActiveTab("futures")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeTab === "futures" ? "bg-[#efeff4] text-carbon font-semibold shadow-xs" : "text-ash hover:text-carbon"
              }`}
            >
              Futures
            </button>
            <button
              onClick={() => setActiveTab("markets")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeTab === "markets" ? "bg-[#efeff4] text-carbon font-semibold shadow-xs" : "text-ash hover:text-carbon"
              }`}
            >
              Markets
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeTab === "analytics" ? "bg-[#efeff4] text-carbon font-semibold shadow-xs" : "text-ash hover:text-carbon"
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {/* Dashboard Frame */}
        <div 
          className="w-full pt-20 sm:pt-28 pb-20 sm:pb-32 px-4 sm:px-8 shadow-2xl relative bg-cover bg-center bg-no-repeat min-h-[560px] flex items-center justify-center"
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
                    Paper Trading Portfolio
                  </h3>
                  <p className="font-openrunde text-xs text-ash tracking-[-0.32px]">
                    Live Real-Time Market Streaming Feed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-wash text-mint text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                  Live WebSocket Active
                </span>
                <span className="px-3 py-1 rounded-full bg-mist text-graphite text-xs font-medium border border-fog">
                  Demo Mode
                </span>
              </div>
            </div>

            {/* Metric Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="metric-card-visitors">
                <div className="flex items-center justify-between text-xs text-ash mb-1">
                  <span>Virtual Balance</span>
                  <span className="delta-positive">Ready</span>
                </div>
                <div className="font-openrunde font-semibold text-2xl text-carbon tracking-[-0.61px]">
                  $100,000.00
                </div>
              </div>

              <div className="metric-card-visitors">
                <div className="flex items-center justify-between text-xs text-ash mb-1">
                  <span>Simulated PnL</span>
                  <span className="delta-positive">+$2,450.00</span>
                </div>
                <div className="font-openrunde font-semibold text-2xl text-carbon tracking-[-0.61px]">
                  +$2,450.00
                </div>
              </div>

              <div className="metric-card-visitors">
                <div className="flex items-center justify-between text-xs text-ash mb-1">
                  <span>Paper Win Rate</span>
                  <span className="delta-positive">76.4%</span>
                </div>
                <div className="font-openrunde font-semibold text-2xl text-carbon tracking-[-0.61px]">
                  76.4%
                </div>
              </div>
            </div>

            {/* Live Prices Preview */}
            <div className="table-container-visitors overflow-hidden">
              <table className="table-visitors">
                <thead>
                  <tr>
                    <th>Market Pair</th>
                    <th>Live Price</th>
                    <th>24h Change</th>
                    <th>Mode</th>
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
                    <td className="text-xs text-ash">Spot & Futures</td>
                  </tr>
                  <tr>
                    <td className="flex items-center gap-2">
                      <img src={ethIcon} alt="ETH" className="w-5 h-5" />
                      <span className="font-medium text-carbon">ETH / USDT</span>
                    </td>
                    <td className="font-semibold text-carbon">${ethPrice}</td>
                    <td><span className="delta-positive">+1.85%</span></td>
                    <td className="text-xs text-ash">Spot & Futures</td>
                  </tr>
                  <tr>
                    <td className="flex items-center gap-2">
                      <img src={solIcon} alt="SOL" className="w-5 h-5" />
                      <span className="font-medium text-carbon">SOL / USDT</span>
                    </td>
                    <td className="font-semibold text-carbon">${solPrice}</td>
                    <td><span className="delta-positive">+5.12%</span></td>
                    <td className="text-xs text-ash">Spot & Futures</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </section>

      {/* 3. CORE FEATURES GRID */}
      <section className="py-16 px-6 max-w-[1200px] mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="font-openrunde text-3xl md:text-4xl font-medium text-carbon tracking-[-0.61px]">
            Key Trading Features
          </h2>
          <p className="font-openrunde text-base text-graphite tracking-[-0.32px]">
            Everything you need to practice, refine, and master crypto trading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card-visitors">
            <div className="icon-circle">
              <HugeiconsIcon icon={FlashIcon} size={20} color="#ffffff" />
            </div>
            <h3 className="font-openrunde font-medium text-xl text-carbon mb-2 tracking-[-0.31px]">
              Real-Time Execution
            </h3>
            <p className="font-openrunde text-sm text-graphite leading-relaxed tracking-[-0.32px]">
              Practice order placement with live streaming price feeds and instant fill simulation.
            </p>
          </div>

          <div className="feature-card-visitors">
            <div className="icon-circle">
              <HugeiconsIcon icon={Shield01Icon} size={20} color="#ffffff" />
            </div>
            <h3 className="font-openrunde font-medium text-xl text-carbon mb-2 tracking-[-0.31px]">
              Zero Financial Risk
            </h3>
            <p className="font-openrunde text-sm text-graphite leading-relaxed tracking-[-0.32px]">
              Test strategies in a safe environment with $100,000 initial virtual capital and instant resets.
            </p>
          </div>

          <div className="feature-card-visitors">
            <div className="icon-circle">
              <HugeiconsIcon icon={AnalyticsUpIcon} size={20} color="#ffffff" />
            </div>
            <h3 className="font-openrunde font-medium text-xl text-carbon mb-2 tracking-[-0.31px]">
              Portfolio Analytics
            </h3>
            <p className="font-openrunde text-sm text-graphite leading-relaxed tracking-[-0.32px]">
              Track your trade history, win rates, and PnL performance with intuitive visual dashboards.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION SECTION */}
      <section className="max-w-[900px] mx-auto px-6 py-16 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="font-openrunde text-3xl md:text-4xl font-medium text-carbon tracking-[-0.61px]">
            Frequently Asked Questions
          </h2>
          <p className="font-openrunde text-base text-graphite tracking-[-0.32px]">
            Clear answers about paper trading on NexTradeX.
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
                  <h3 className="font-openrunde text-base sm:text-lg font-medium text-carbon tracking-[-0.31px]">
                    {faq.q}
                  </h3>
                  <ChevronDown size={18} className={`text-ash transition-transform duration-200 ${isOpen ? "rotate-180 text-carbon" : ""}`} />
                </div>
                {isOpen && (
                  <div className="pt-3.5 mt-3.5 border-t border-fog text-base text-graphite leading-relaxed tracking-[-0.32px]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. INSTANT VIRTUAL WALLET SHOWCASE */}
      <section className="py-12 px-6 max-w-[1200px] mx-auto">
        <div 
          className="bg-[#fbf9ff] text-carbon rounded-[32px] p-8 sm:p-12 md:p-14 border border-[#e2d8fe] shadow-[0_20px_50px_rgba(133,116,255,0.12)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${footerBg})` }}
        >
          
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#8574ff]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#33c758]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 max-w-xl relative z-10 text-left">
            <h2 className="font-openrunde text-3xl sm:text-4xl md:text-[42px] font-semibold tracking-[-1px] text-carbon leading-[1.15]">
              Practice trading with a <span className="text-[#8574ff]">$100,000</span> virtual wallet.
            </h2>

            <p className="font-openrunde text-base sm:text-lg text-[#555555] leading-relaxed tracking-[-0.32px]">
              Experience spot and perpetual futures trading with live order books, real-time prices, and 1-click balance refills whenever you want to start fresh.
            </p>

            <div className="pt-2">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 bg-[#8574ff] hover:bg-[#7462f5] text-white font-semibold px-7 py-3.5 rounded-full text-base tracking-[-0.32px] transition-all transform hover:scale-105 shadow-lg"
              >
                <span>Create Free Account</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="relative z-10 flex-1 flex justify-center items-center">
            <img
              src={cryptoWalletImg}
              alt="NexTradeX 3D Crypto Wallet"
              className="w-full max-w-[320px] sm:max-w-[380px] object-contain transition-transform duration-700 hover:scale-105 animate-float"
            />
          </div>

        </div>
      </section>

    </div>
  );
}
