import React, { useState, useEffect, useRef } from "react";
import NumberFlow, { continuous } from '@number-flow/react';
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/ui/Card";
import { Input } from "./components/ui/Input";
import { PageTransition } from "./components/ui/PageTransition";
import { useTheme } from "./context/ThemeContext";
import { Zap, Shield, Layers, TrendingUp, Globe, Activity, Menu, BarChart3, Package, Target, Headphones, ChevronDown, Mail, User, LogOut, Search, X, Sun, Moon } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import MarketsPage from "./pages/MarketsPage";
import SpotTradingPage from "./pages/SpotTradingPage";
import FuturesTradingPage from "./pages/FuturesTradingPage";
import OptionsTradingPage from "./pages/OptionsTradingPage";
import MarginTradingPage from "./pages/MarginTradingPage";
import PortfolioAnalyticsPage from "./pages/PortfolioAnalyticsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import WalletsPage from "./pages/WalletsPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import CareersPage from "./pages/CareersPage";
import AboutPage from "./pages/Company/AboutPage";
import TermsPage from "./pages/Company/TermsPage";
import PrivacyPage from "./pages/Company/PrivacyPage";
import ContractSpecsPage from "./pages/Information/ContractSpecsPage";
import TradingFeesPage from "./pages/Information/TradingFeesPage";
import SettlementPricesPage from "./pages/Information/SettlementPricesPage";
import BugBountyPage from "./pages/Information/BugBountyPage";
import APIDocsPage from "./pages/resources/APIDocsPage";
import SupportPage from "./pages/support/SupportPage";
import UserGuidePage from "./pages/resources/UserGuidePage";
import ReferralPage from "./pages/resources/ReferralPage";
import EarnPage from "./pages/EarnPage";
import FundingPage from "./pages/FundingPage";
import SubAccountsPage from "./pages/SubAccountsPage";
import { hasAuthToken, clearAuthToken, fetchUserProfile } from "./api";
import xIcon from "./assets/Icons/x.com_icon.png";
import linkedInIcon from "./assets/Icons/LinkedIn_icon.svg.png";
import githubIcon from "./assets/Icons/github_icon.png";
import gmailIcon from "./assets/Icons/Gmail_icon_svg.webp";
import Chatbot from "./components/Chatbot";
import tradingVideo from "./assets/videos/TradingVid.mp4";
import qrCodeImg from "./assets/QrCode/QrCode.png";

// Cryptocurrency SVG Icons from cryptologos.cc
import btcIcon from "./assets/Icons/btc.svg";
import ethIcon from "./assets/Icons/eth.svg";
import solIcon from "./assets/Icons/sol.svg";
import linkIcon from "./assets/Icons/link.svg";
import ltcIcon from "./assets/Icons/ltc.svg";
import arbIcon from "./assets/Icons/arb.svg";
import opIcon from "./assets/Icons/op.svg";
import suiIcon from "./assets/Icons/sui.svg";
import tiaIcon from "./assets/Icons/tia.svg";
import seiIcon from "./assets/Icons/sei.svg";

/* ═══════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════ */
// Framer Motion Animation Variants for a Pro UX Look
const fadeInUpSpring = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 55,
      damping: 14,
      mass: 0.9
    }
  }
};

const textReveal = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1] // Custom easeOutExpo
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const marketTabs = {
  popular: [
    { pair: "BTC / USDT", price: "$96,482.50", change: "+3.45%", isUp: true, vol: "$12.8B" },
    { pair: "ETH / USDT", price: "$3,584.20", change: "+1.85%", isUp: true, vol: "$5.4B" },
    { pair: "SOL / USDT", price: "$184.65", change: "+5.12%", isUp: true, vol: "$2.9B" },
    { pair: "LINK / USDT", price: "$18.25", change: "-0.75%", isUp: false, vol: "$420M" },
    { pair: "LTC / USDT", price: "$86.40", change: "+0.25%", isUp: true, vol: "$310M" },
  ],
  new: [
    { pair: "ARB / USDT", price: "$1.12", change: "+12.45%", isUp: true, vol: "$180M" },
    { pair: "OP / USDT", price: "$2.45", change: "+8.20%", isUp: true, vol: "$120M" },
    { pair: "SUI / USDT", price: "$1.95", change: "+15.30%", isUp: true, vol: "$220M" },
    { pair: "TIA / USDT", price: "$5.82", change: "-4.15%", isUp: false, vol: "$95M" },
    { pair: "SEI / USDT", price: "$0.54", change: "-2.85%", isUp: false, vol: "$80M" },
  ],
  gainers: [
    { pair: "SUI / USDT", price: "$1.95", change: "+15.30%", isUp: true, vol: "$220M" },
    { pair: "ARB / USDT", price: "$1.12", change: "+12.45%", isUp: true, vol: "$180M" },
    { pair: "OP / USDT", price: "$2.45", change: "+8.20%", isUp: true, vol: "$120M" },
    { pair: "SOL / USDT", price: "$184.65", change: "+5.12%", isUp: true, vol: "$2.9B" },
    { pair: "BTC / USDT", price: "$96,482.50", change: "+3.45%", isUp: true, vol: "$12.8B" },
  ]
};

const renderCoinIcon = (symbol) => {
  const iconMap = {
    "BTC / USDT": btcIcon,
    "ETH / USDT": ethIcon,
    "SOL / USDT": solIcon,
    "LINK / USDT": linkIcon,
    "LTC / USDT": ltcIcon,
    "ARB / USDT": arbIcon,
    "OP / USDT": opIcon,
    "SUI / USDT": suiIcon,
    "TIA / USDT": tiaIcon,
    "SEI / USDT": seiIcon,
  };
  const src = iconMap[symbol];
  if (src) {
    return <img src={src} className="w-8 h-8 flex-shrink-0 object-contain" alt={symbol} />;
  }
  return (
    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-mono text-sm font-bold">
      {symbol.charAt(0)}
    </div>
  );
};

function HomePage() {
  const [activeMarketTab, setActiveMarketTab] = useState("popular");
  const [userCount, setUserCount] = useState(316258026);

  useEffect(() => {
    const timer = setInterval(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 4) + 1);
    }, 2500);
    return () => clearInterval(timer);
  }, []);
  return (
    <PageTransition>
      <main className="w-full text-white bg-canvas-dark">
        {/* HERO SECTION BAND (Full-Bleed bg-canvas-dark) */}
        <section className="relative overflow-hidden py-20 md:py-32 border-b border-hairline-on-dark bg-canvas-dark min-h-[calc(100vh-64px)] flex items-center">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 pointer-events-none"
          >
            <source src={tradingVideo} type="video/mp4" />
          </video>
          {/* Dark Overlay Gradient to maintain contrast and blend the video */}
          <div className="absolute inset-0 bg-gradient-to-b from-canvas-dark/10 via-canvas-dark/70 to-canvas-dark z-0" />
          
          {/* Subtle background ambient mesh (no heavy gradients as per elevation guidelines) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.05] blur-[160px] pointer-events-none z-0" />
          
          <motion.div 
            className="max-w-7xl mx-auto px-6 relative z-10 w-full text-left"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >

            {/* Display Headline - Text Reveal */}
            <div className="overflow-hidden">
              <motion.h1 
                variants={textReveal}
                className="font-heading text-4xl sm:text-5xl md:text-[60px] lg:text-[72px] font-bold leading-[1.1] mb-6 tracking-tight"
              >
                TRADE WITH. <br />
                <span className="text-primary">MATHEMATICAL PRECISION</span>
              </motion.h1>
            </div>

            {/* Subtext */}
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.15 } 
                }
              }}
              className="text-muted text-base md:text-lg max-w-2xl mb-10 leading-relaxed font-sans"
            >
              Experience high-density simulated trading, real-time depth visualizations, and custom order matching. Zero risk, professional-grade tools.
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0, 
                  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 } 
                }
              }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-start"
            >
              <Button variant="primaryPill" className="w-full sm:w-auto" asChild>
                <Link to="/auth">Start Trading</Link>
              </Button>
              <Button variant="outline" className="w-full sm:w-auto text-body hover:bg-surface-card-dark" asChild>
                <Link to="/markets">View Markets</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* TRUST BADGES GRID (Flat surface cards) */}
        <section className="bg-canvas-dark py-12 border-b border-hairline-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                { badge: "No.1", label: "Simulated Volume", desc: "Highest simulated trades routed daily" },
                { badge: "24/7", label: "Customer Support", desc: "Support with simulated desk agents" },
                { badge: "100%", label: "Reserves (SAFU)", desc: "All simulated assets collateralized 1:1" },
                { badge: "0.0%", label: "Slippage Guarantee", desc: "Precise simulated matching execution" },
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  variants={fadeInUpSpring}
                  className="bg-surface-card-dark rounded-lg border border-hairline-on-dark p-5 flex items-center gap-4 hover:border-primary/30 transition-all duration-300 interactive-surface"
                >
                  <span className="text-primary font-mono text-xl font-bold px-3 py-1 bg-primary/10 border border-primary/20 rounded flex-shrink-0">
                    {item.badge}
                  </span>
                  <div>
                    <div className="text-white text-sm font-semibold tracking-tight font-heading">{item.label}</div>
                    <div className="text-muted text-xs font-sans leading-relaxed mt-0.5">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* HERO USER STAT BANDS */}
        <section className="py-20 bg-canvas-dark border-b border-hairline-on-dark text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/[0.02] blur-[130px] pointer-events-none" />
          <motion.div 
            variants={fadeInUpSpring}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-7xl mx-auto px-6 relative z-10"
          >
            <span className="font-mono text-xs text-primary uppercase tracking-widest mb-4 block font-semibold">Platform Metric</span>
            <div className="inline-flex items-center gap-2 select-none border border-hairline-on-dark bg-surface-card-dark/30 rounded-2xl px-8 py-6 backdrop-blur-md shadow-elevation-md">
              <h2 className="font-mono text-5xl md:text-8xl font-bold tracking-wider text-primary leading-none">
                <NumberFlow plugins={[continuous]} value={userCount} />
              </h2>
            </div>
            <h3 className="font-heading text-lg md:text-2xl font-semibold tracking-tight text-white/95 max-w-2xl mx-auto mt-6">
              Simulated Users Trust NexTradeX Platform Ecosystem
            </h3>
            <p className="text-muted text-xs font-sans mt-2 max-w-md mx-auto">
              Simulated platform metrics updated in real-time under high-stress system conditions.
            </p>
          </motion.div>
        </section>

        {/* PRO TRADING FEATURES */}
        <section className="py-20 relative bg-canvas-dark border-b border-hairline-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              variants={fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-16"
            >
              <span className="font-mono text-xs text-primary uppercase tracking-widest mb-4 block font-semibold">Best in Class</span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white">Pro Trading Features For Everyone</h2>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {[
                { icon: <Package size={22} />, title: "Basket Orders With Margin Benefits", desc: "Place multiple simulated orders together as a basket to enjoy custom margin offsetting." },
                { icon: <Target size={22} />, title: "Strategy Builder", desc: "Build and analyse virtual trading strategies comprising groups of futures and options contracts." },
                { icon: <Layers size={22} />, title: "Deep OTM/ITM Strikes", desc: "Trade simulated deep OTM/ITM options strikes with customizable daily and weekly expiry terms." },
                { icon: <BarChart3 size={22} />, title: "PnL Analytics", desc: "Conveniently track and analyse your simulated trading history with advanced visual indices." }
              ].map((feature, idx) => (
                <motion.div key={idx} variants={fadeInUpSpring} className="flex items-start gap-5 p-6 rounded-xl border border-hairline-on-dark bg-surface-card-dark hover:border-primary/30 transition-all duration-300 group interactive-surface">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-heading text-base font-semibold text-white mb-1.5">{feature.title}</h4>
                    <p className="text-sm text-muted leading-relaxed font-sans">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FUNDS SAFU BAND (reserves stats) */}
        <section className="py-20 bg-canvas-dark border-b border-hairline-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              variants={fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="mb-12 text-center lg:text-left"
            >
              <span className="font-mono text-xs text-primary uppercase tracking-widest mb-3 block font-semibold">Security Guarantee</span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-primary mb-4 uppercase">FUNDS ARE SAFU</h2>
              <p className="text-muted text-sm md:text-base max-w-2xl font-sans">
                All mock balances are backed 1:1 on our virtual ledger. Verified proof of simulated reserves protects all users.
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                { value: "185,248 BTC", label: "Total Simulated Reserves", desc: "Equivalent to ~$12.4B paper balance allocated to user accounts" },
                { value: "100.00%", label: "Collateralized Ratio", desc: "Virtual funds fully collateralized by simulated vaults" },
                { value: "45,290 BTC", label: "Simulated Funds Recovered", desc: "Mock trading volume protection system recovery pool" }
              ].map((item, idx) => (
                <motion.div 
                  key={idx} 
                  variants={fadeInUpSpring}
                  className="border-l border-hairline-on-dark pl-6 flex flex-col justify-between"
                >
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-primary mb-2 tracking-tight">{item.value}</div>
                  <div>
                    <div className="text-white text-sm font-semibold tracking-tight mb-1">{item.label}</div>
                    <div className="text-muted text-xs leading-relaxed font-sans">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CRYPTOCURRENCIES LIST (Binance-Inspired markets-table-card) */}
        <section className="py-20 bg-canvas-dark border-b border-hairline-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              variants={fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-12"
            >
              <span className="font-mono text-xs text-primary uppercase tracking-widest mb-4 block font-semibold">Simulation Markets</span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Supported Cryptocurrencies</h2>
              <p className="text-muted text-sm md:text-base max-w-xl mx-auto font-sans">
                Discover virtual currencies, lot restrictions, and tick rules routed through our simulation engine.
              </p>
            </motion.div>

            <motion.div 
              variants={fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="max-w-5xl mx-auto"
            >
              <div className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden p-6 shadow-elevation-md">
                {/* Tab Header */}
                <div className="flex items-center gap-2 border-b border-hairline-on-dark pb-4 mb-6">
                  {Object.keys(marketTabs).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveMarketTab(tab)}
                      className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-200 capitalize ${
                        activeMarketTab === tab
                          ? "bg-primary text-on-primary font-bold shadow-glow-primary"
                          : "text-muted hover:text-white bg-transparent"
                      }`}
                    >
                      {tab === "popular" ? "Popular Pairs" : tab === "new" ? "New Listings" : "Top Gainers"}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#15191e] border-b border-hairline-on-dark font-heading text-white">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Token Pair</th>
                        <th className="px-6 py-4 font-semibold text-right">Last Price</th>
                        <th className="px-6 py-4 font-semibold text-right">24h Change</th>
                        <th className="px-6 py-4 font-semibold text-right">24h Volume</th>
                        <th className="px-6 py-4 font-semibold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-on-dark font-mono text-muted">
                      {marketTabs[activeMarketTab].map((coin, index) => (
                        <tr key={index} className="hover:bg-surface-elevated-dark/30 transition-colors duration-150 group">
                          <td className="px-6 py-4 text-white font-semibold flex items-center gap-3">
                            {renderCoinIcon(coin.pair)}
                            <span className="group-hover:text-primary transition-colors">{coin.pair}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-white font-medium">{coin.price}</td>
                          <td className={`px-6 py-4 text-right font-medium ${coin.isUp ? "text-trading-up" : "text-trading-down"}`}>
                            <span className="inline-flex items-center gap-1 justify-end">
                              {coin.isUp ? "▲" : "▼"} {coin.change}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">{coin.vol}</td>
                          <td className="px-6 py-4 text-center">
                            <Button size="sm" className="h-[28px] px-4 font-semibold text-xs text-on-primary bg-primary rounded-sm hover:bg-primary-active transition-all" asChild>
                              <Link to="/trade/spot">Trade</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* QR PROMO & APP DOWNLOAD SECTION */}
        <section className="py-20 bg-canvas-dark border-b border-hairline-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              variants={fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="bg-surface-card-dark border border-hairline-on-dark rounded-xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-elevation-md"
            >
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                  Trade On The Go. <br />Anytime, Anywhere.
                </h2>
                <p className="text-muted text-sm md:text-base leading-relaxed font-sans max-w-xl">
                  Scan the mock code with your browser simulator to run the trading terminal on mobile devices. Full support for custom lot sizing, tickers, and profile tracking.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <a href="#download-ios" className="flex items-center gap-3 px-5 py-2 bg-[#15191e] border border-hairline-on-dark rounded-lg text-left hover:border-primary/45 transition-all duration-300">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,22C14.32,22.05 13.89,21.23 12.37,21.23C10.84,21.23 10.37,22 9.09,22.05C7.79,22.1 6.8,20.78 5.96,19.58C4.26,17.12 2.97,12.59 4.71,9.58C5.58,8.08 7.13,7.13 8.81,7.1C10.09,7.08 11.3,7.96 12.08,7.96C12.86,7.96 14.3,6.92 15.82,7.08C16.46,7.1 18.26,7.34 19.46,9.1C19.36,9.16 17.25,10.39 17.27,12.87C17.3,15.84 19.9,16.83 19.93,16.84C19.91,16.91 19.5,18.3 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                    </svg>
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted font-sans leading-none">Download on the</p>
                      <p className="text-xs font-semibold text-white font-heading mt-1 leading-tight">App Store</p>
                    </div>
                  </a>
                  <a href="#download-android" className="flex items-center gap-3 px-5 py-2 bg-[#15191e] border border-hairline-on-dark rounded-lg text-left hover:border-primary/45 transition-all duration-300">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,5.27V18.73L16.55,12L3,5.27M17.87,11.33L19.5,12.15C19.82,12.31 19.82,12.69 19.5,12.85L17.87,13.67L15,12.24L17.87,11.33M4.24,6.47L14.28,11.5L4.24,16.53V6.47M4.24,17.47L14.28,12.5L4.24,7.53V17.47Z" />
                    </svg>
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted font-sans leading-none">Get it on</p>
                      <p className="text-xs font-semibold text-white font-heading mt-1 leading-tight">Google Play</p>
                    </div>
                  </a>
                  <a href="#download-apk" className="flex items-center gap-3 px-5 py-2 bg-[#15191e] border border-hairline-on-dark rounded-lg text-left hover:border-primary/45 transition-all duration-300">
                    <Globe size={18} className="text-white" />
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted font-sans leading-none">Download APK for</p>
                      <p className="text-xs font-semibold text-white font-heading mt-1 leading-tight">macOS / Windows</p>
                    </div>
                  </a>
                </div>
              </div>
              
              {/* Actual QR Code Image */}
              <div className="relative group bg-white p-3 rounded-xl border border-hairline-on-dark flex flex-col items-center justify-center flex-shrink-0 shadow-elevation-lg overflow-hidden">
                <style dangerouslySetInnerHTML={{__html: `
                  @keyframes scan-line {
                    0% { top: 0%; opacity: 0; }
                    5% { opacity: 1; }
                    95% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                  }
                  .qr-scan-line {
                    position: absolute;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, #fcd535, transparent);
                    box-shadow: 0 0 10px #fcd535;
                    animation: scan-line 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                    z-index: 20;
                  }
                `}} />
                <div className="qr-scan-line" />
                <img src={qrCodeImg} alt="QR Code" className="w-40 h-40 object-contain relative z-10" />
                <div className="mt-3 text-center">
                  <span className="text-[10px] text-[#181a20] font-bold tracking-wider font-mono uppercase block">Scan to Download</span>
                  <span className="text-[8px] text-[#707a8a] font-sans block mt-0.5">iOS & Android App</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SUPPORT + FAQ */}
        <section className="py-20 bg-canvas-dark border-b border-hairline-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Support Card */}
              <motion.div 
                variants={fadeInUpSpring}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="lg:col-span-2"
              >
                <div className="bg-surface-card-dark border border-hairline-on-dark rounded-xl p-8 relative overflow-hidden h-full flex flex-col justify-between shadow-elevation-md interactive-surface">
                  <div className="space-y-6 relative z-10">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold leading-tight text-white">24x7 Customer Support</h3>
                    <p className="text-muted text-sm leading-relaxed font-sans">
                      Got questions or issues? Our simulated help center is active around the clock with real-time simulated agents.
                    </p>

                    <div className="space-y-4 font-sans border-t border-hairline-on-dark pt-6">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                          <Headphones size={16} />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] text-primary uppercase tracking-widest leading-none mb-1">Help Center</p>
                          <p className="text-xs text-muted leading-relaxed">Visit our support database for documentation answers.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                          <Mail size={16} />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] text-primary uppercase tracking-widest leading-none mb-1">Support Ticket</p>
                          <p className="text-xs text-muted leading-relaxed">Raise a virtual ticket to consult with developer desk agents.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 relative z-10 border-t border-hairline-on-dark pt-6">
                    <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">Connect with our Creator</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <a href="https://x.com/AdityaKalb4818" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-[#15191e] border border-hairline-on-dark flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <img src={xIcon} alt="X" className="w-4 h-4 object-contain brightness-0 invert" />
                      </a>
                      <a href="mailto:contact@nextradex.sim" className="w-9 h-9 rounded-md bg-[#15191e] border border-hairline-on-dark flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <img src={gmailIcon} alt="Gmail" className="w-4 h-4 object-contain" />
                      </a>
                      <a href="https://portfolio-zeta-two-0s3z3wko1s.vercel.app" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-[#15191e] border border-hairline-on-dark flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <Globe size={16} className="text-muted" />
                      </a>
                      <a href="https://www.linkedin.com/in/aditya-kalburgi-080b5b267/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-[#15191e] border border-hairline-on-dark flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <img src={linkedInIcon} alt="LinkedIn" className="w-4 h-4 object-contain" />
                      </a>
                      <a href="https://github.com/aditykalburgi" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-[#15191e] border border-hairline-on-dark flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <img src={githubIcon} alt="GitHub" className="w-4 h-4 object-contain brightness-0 invert" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* FAQ */}
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="lg:col-span-3 font-sans"
              >
                <h3 className="font-heading text-2xl md:text-3xl font-bold mb-8 tracking-tight text-white">Frequently Asked Questions</h3>
                <div className="border-t border-hairline-on-dark divide-y divide-hairline-on-dark">
                  <motion.div variants={fadeInUpSpring}>
                    <FAQItem
                      question="Is NexTradeX a regulated trading platform?"
                      answer="NexTradeX operates strictly as a paper trading simulation platform for educational purposes. All trades, orders, funds, and positions are entirely simulated."
                    />
                  </motion.div>
                  <motion.div variants={fadeInUpSpring}>
                    <FAQItem
                      question="Do I need actual crypto to use NexTradeX?"
                      answer="No. All accounts receive immediate mock balances upon login. No credit cards or deposits are required."
                    />
                  </motion.div>
                  <motion.div variants={fadeInUpSpring}>
                    <FAQItem
                      question="What simulated contracts are available?"
                      answer="We support spot trading pairs, leveraged futures with configurable margin structures, and European-style options contracts."
                    />
                  </motion.div>
                  <motion.div variants={fadeInUpSpring}>
                    <FAQItem
                      question="How does simulated market data stream?"
                      answer="Our backend aggregates tick snapshots and streams updates via high-frequency WebSockets to emulate live market dynamics."
                    />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA BAND (Pre-Footer Banner) */}
        <section className="py-20 bg-canvas-dark">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              variants={fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="bg-surface-card-dark border border-hairline-on-dark rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-elevation-md"
            >
              <div className="space-y-2 text-center md:text-left">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Secure, Low-Fee Trading on NexTradeX
                </h2>
                <p className="text-muted text-sm md:text-base font-sans">
                  Create a virtual account in less than a minute and begin testing options chains instantly.
                </p>
              </div>
              <Button variant="default" className="w-full md:w-auto h-12 px-8 text-base font-semibold" asChild>
                <Link to="/auth">Sign Up Now</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}

/* ═══════════════════════════════════════════
   FAQ ACCORDION ITEM
   ═══════════════════════════════════════════ */
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-hairline-on-dark py-5 transition-all duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="font-heading text-sm md:text-base font-semibold text-white group-hover:text-primary transition-colors pr-4">
          {question}
        </span>
        <ChevronDown 
          size={18} 
          className={`text-muted transition-transform duration-300 ${open ? 'rotate-180 text-primary' : 'group-hover:text-white'}`} 
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-spring ${
          open ? 'max-h-60 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-sm text-muted leading-relaxed font-sans pr-6">
          {answer}
        </p>
      </div>
    </div>
  );
}

function SearchModal({ open, onClose, query, setQuery }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const searchResults = [
    { label: "Markets", path: "/markets", description: "View all markets" },
    { label: "Spot Trading", path: "/trade/spot", description: "Trade spot pairs" },
    { label: "Futures Trading", path: "/trade/futures", description: "Trade futures contracts" },
    { label: "Options Trading", path: "/trade/options", description: "Trade options" },
    { label: "Wallets", path: "/wallets", description: "Manage your wallets" },
    { label: "Orders", path: "/orders", description: "View order history" },
    { label: "Profile", path: "/profile", description: "Your profile" },
    { label: "Careers", path: "/careers", description: "Join our team" },
    { label: "API Docs", path: "/api-docs", description: "API documentation" },
    { label: "Support", path: "/support", description: "Get help" },
    { label: "User Guide", path: "/user-guide", description: "Learn how to trade" },
    { label: "Referral Program", path: "/referral", description: "Earn rewards" },
  ].filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
    setQuery("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search size={18} className="text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages..."
            className="flex-1 bg-transparent text-white placeholder-muted outline-none text-sm"
          />
          <button onClick={onClose}>
            <X size={18} className="text-muted hover:text-white" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {query && searchResults.length === 0 ? (
            <div className="p-4 text-center text-muted text-sm">No results found</div>
          ) : (
            <div className="py-2">
              {searchResults.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors text-left"
                >
                  <div>
                    <div className="text-white text-sm font-medium">{item.label}</div>
                    <div className="text-muted text-xs">{item.description}</div>
                  </div>
                  <ChevronDown size={16} className="text-muted rotate-[-90deg]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */
function Footer() {
  const linkClass = "text-xs font-semibold text-[#707a8a] hover:text-[#f0b90b] transition-colors duration-200 block py-1.5";
  return (
    <footer className="relative z-10 bg-[#fafafa] border-t border-[#eaecef] py-16 text-[#181a20]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center mb-4">
              <span className="font-heading font-bold text-lg tracking-tight text-[#181a20]">
                NexTrade<span className="text-[#fcd535]">X</span>
              </span>
            </div>
            <p className="text-xs text-[#707a8a] leading-relaxed max-w-[200px]">
              NexTradeX is a paper trading simulation platform for educational purposes. No real assets are traded.
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-[#181a20] mb-4">About</h4>
            <nav className="space-y-1">
              <Link to="/about" className={linkClass}>About Us</Link>
              <Link to="/careers" className={linkClass}>Careers</Link>
              <Link to="/" className={linkClass}>Press</Link>
              <Link to="/" className={linkClass}>Community</Link>
            </nav>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-[#181a20] mb-4">Products</h4>
            <nav className="space-y-1">
              <Link to="/trade/spot" className={linkClass}>Spot Trading</Link>
              <Link to="/trade/futures" className={linkClass}>Futures Trading</Link>
              <Link to="/trade/options" className={linkClass}>Options Trading</Link>
              <Link to="/markets" className={linkClass}>Markets Board</Link>
            </nav>
          </div>

          {/* Service */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-[#181a20] mb-4">Service</h4>
            <nav className="space-y-1">
              <Link to="/support" className={linkClass}>Support Center</Link>
              <Link to="/user-guide" className={linkClass}>User Guide</Link>
              <Link to="/api-docs" className={linkClass}>API Docs</Link>
              <Link to="/bug-bounty" className={linkClass}>Bug Bounty</Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-[#181a20] mb-4">Legal</h4>
            <nav className="space-y-1">
              <Link to="/terms" className={linkClass}>Terms of Service</Link>
              <Link to="/privacy" className={linkClass}>Privacy Policy</Link>
              <Link to="/settlement-prices" className={linkClass}>Settlement Prices</Link>
              <Link to="/trading-fees" className={linkClass}>Trading Fees</Link>
            </nav>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-[#181a20] mb-4">Socials</h4>
            <nav className="space-y-3">
              <a href="https://x.com/AdityaKalb4818" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-semibold text-[#707a8a] hover:text-[#f0b90b] transition-colors duration-200">
                <img src={xIcon} alt="X" className="w-4 h-4 object-contain" /> <span>X (Twitter)</span>
              </a>
              <a href="https://www.linkedin.com/in/aditya-kalburgi-080b5b267/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-semibold text-[#707a8a] hover:text-[#f0b90b] transition-colors duration-200">
                <img src={linkedInIcon} alt="LinkedIn" className="w-4 h-4 object-contain" /> <span>LinkedIn</span>
              </a>
              <a href="mailto:contact@nextradex.sim" className="flex items-center gap-3 text-xs font-semibold text-[#707a8a] hover:text-[#f0b90b] transition-colors duration-200">
                <img src={gmailIcon} alt="Email" className="w-4 h-4 object-contain" /> <span>Email</span>
              </a>
              <a href="https://github.com/aditykalburgi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-semibold text-[#707a8a] hover:text-[#f0b90b] transition-colors duration-200">
                <img src={githubIcon} alt="GitHub" className="w-4 h-4 object-contain brightness-0 contrast-50" /> <span>GitHub</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="glow-line mt-12 mb-8" />
        <p className="text-center text-xs text-muted">
          NexTradeX &copy; {new Date().getFullYear()}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════ */
function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/");
  return (
    <Link
      to={to}
      className={`nav-link hover:text-primary transition-colors duration-200 ${isActive ? "text-primary active" : ""
        }`}
    >
      {children}
    </Link>
  );
}

function TradeDropdown({ theme }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isTradeActive = location.pathname.startsWith("/trade");

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className={`nav-link cursor-pointer hover:text-primary transition-colors duration-200 ${isTradeActive ? "text-primary active" : ""}`}>
        Trade
      </span>
      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50 animate-fade-in-fast">
          <div className={`rounded-xl shadow-elevation-lg py-2 min-w-[160px] border ${
            theme === 'dark' 
              ? 'bg-surface-card-dark border-hairline-on-dark text-white' 
              : 'bg-white border-hairline-on-light text-ink'
          }`}>
            <Link
              to="/trade/spot"
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-white/[0.04] hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Spot
            </Link>
            <Link
              to="/trade/futures"
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-white/[0.04] hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Futures
            </Link>
            <Link
              to="/trade/margin"
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-white/[0.04] hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Margin
            </Link>
            <Link
              to="/trade/options"
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold hover:bg-white/[0.04] hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Options
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
    APP SHELL
    ═══════════════════════════════════════════ */
function App() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = hasAuthToken();
      if (token) {
        try {
          const res = await fetchUserProfile();
          if (res?.data) {
            setUser(res.data);
            setIsLoggedIn(true);
          }
        } catch (err) {
          if (err.status === 401 || err.status === 403) {
            clearAuthToken();
          } else {
            console.error("[App] Failed to fetch user profile:", err.message);
          }
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    clearAuthToken();
    setIsLoggedIn(false);
    setUser(null);
    setUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-body">
      {/* Background Ambient Glows */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] blur-[150px] rounded-full pointer-events-none animate-drift transition-all duration-500 ${theme === 'dark' ? 'bg-primary/[0.07]' : 'bg-primary/[0.03]'}`} />
      <div className={`fixed bottom-0 right-0 w-[600px] h-[600px] blur-[180px] rounded-full pointer-events-none animate-drift transition-all duration-500 ${theme === 'dark' ? 'bg-secondary/[0.07]' : 'bg-secondary/[0.03]'}`} style={{ animationDelay: "-10s" }} />
      <div className={`fixed top-1/2 left-0 w-[400px] h-[400px] blur-[120px] rounded-full pointer-events-none animate-drift transition-all duration-500 ${theme === 'dark' ? 'bg-tertiary/[0.03]' : 'bg-tertiary/[0.01]'}`} style={{ animationDelay: "-5s" }} />

      {/* Navigation */}
      <nav className={`sticky top-0 z-50 h-16 border-b transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-canvas-dark border-hairline-on-dark text-white' 
          : 'bg-canvas-light border-hairline-on-light text-ink'
      } flex items-center`}>
        <div className="flex items-center justify-between px-6 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-heading font-bold text-xl tracking-tight flex items-center gap-1 hover:opacity-90 transition-opacity">
              <span className="text-primary">NexTradeX</span>
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 font-mono text-xs tracking-wider">
              <TradeDropdown theme={theme} />
              <NavLink to="/markets">Markets</NavLink>
              <NavLink to="/wallets">Wallets</NavLink>
              <NavLink to="/orders">Orders</NavLink>
              <NavLink to="/analytics">Analytics</NavLink>
              <NavLink to="/leaderboard">Leaderboard</NavLink>
              <NavLink to="/admin">Admin</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-muted hover:text-primary"
              title="Search"
            >
              <Search size={18} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-all duration-300 text-muted hover:text-primary group"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="relative w-[18px] h-[18px]">
                <Sun 
                  size={18} 
                  className={`absolute inset-0 transition-all duration-500 ${
                    theme === 'dark' 
                      ? 'opacity-100 rotate-0 scale-100 text-primary' 
                      : 'opacity-0 rotate-180 scale-0'
                  }`}
                />
                <Moon 
                  size={18} 
                  className={`absolute inset-0 transition-all duration-500 ${
                    theme === 'light' 
                      ? 'opacity-100 rotate-0 scale-100 text-primary' 
                      : 'opacity-0 -rotate-180 scale-0'
                  }`}
                />
              </div>
            </button>

            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-surface-card-dark border-hairline-on-dark hover:bg-surface-elevated-dark' 
                      : 'bg-white border-hairline-on-light hover:bg-surface-soft-light'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <User size={12} className="text-on-primary" />
                  </div>
                  <span className="font-mono text-xs font-semibold hidden sm:inline">{user?.username}</span>
                  <ChevronDown size={12} className={`text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full pt-2 z-50 animate-fade-in-fast">
                    <div className={`rounded-xl shadow-elevation-lg py-2 min-w-[180px] border ${
                      theme === 'dark'
                        ? 'bg-surface-card-dark border-hairline-on-dark text-white'
                        : 'bg-white border-hairline-on-light text-ink'
                    }`}>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-xs hover:bg-white/[0.04] hover:text-primary transition-colors font-semibold"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={14} />
                        Profile
                      </Link>
                      <Link
                        to="/wallets"
                        className="flex items-center gap-3 px-4 py-2 text-xs hover:bg-white/[0.04] hover:text-primary transition-colors font-semibold"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Layers size={14} />
                        Wallets
                      </Link>
                      <div className={`border-t my-1 ${theme === 'dark' ? 'border-hairline-on-dark' : 'border-hairline-on-light'}`} />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-xs w-full text-left hover:bg-white/[0.04] hover:text-trading-down transition-colors font-semibold"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="tertiaryText" className="hidden sm:inline-flex text-xs" asChild>
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button className="hidden sm:inline-flex text-xs h-9" asChild>
                  <Link to="/auth">Connect Wallet</Link>
                </Button>
              </>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t animate-slide-down ${
          theme === 'dark' ? 'bg-canvas-dark border-hairline-on-dark text-white' : 'bg-canvas-light border-hairline-on-light text-ink'
        }`}>
          <div className="px-6 py-4 space-y-1 font-mono text-sm">
            <Link to="/trade/spot" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Spot Trading</Link>
            <Link to="/trade/futures" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Futures Trading</Link>
            <Link to="/trade/options" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Options Trading</Link>
            <div className={`h-[1px] my-3 ${theme === 'dark' ? 'bg-hairline-on-dark' : 'bg-hairline-on-light'}`} />
            <Link to="/markets" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Markets</Link>
            <Link to="/wallets" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Wallets</Link>
            <Link to="/orders" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
            {isLoggedIn ? (
              <>
                <div className={`h-[1px] my-3 ${theme === 'dark' ? 'bg-hairline-on-dark' : 'bg-hairline-on-light'}`} />
                <Link to="/profile" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-trading-down transition-colors w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <div className={`h-[1px] my-3 ${theme === 'dark' ? 'bg-hairline-on-dark' : 'bg-hairline-on-light'}`} />
                <Link to="/auth" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
              </>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 w-full">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/trade/spot" element={<SpotTradingPage />} />
          <Route path="/trade/futures" element={<FuturesTradingPage />} />
          <Route path="/trade/options" element={<OptionsTradingPage />} />
          <Route path="/trade/margin" element={<MarginTradingPage />} />
          <Route path="/analytics" element={<PortfolioAnalyticsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/wallets" element={<WalletsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/earn" element={<EarnPage />} />
          <Route path="/funding" element={<FundingPage />} />
          <Route path="/sub-accounts" element={<SubAccountsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contract-specs" element={<ContractSpecsPage />} />
          <Route path="/trading-fees" element={<TradingFeesPage />} />
          <Route path="/settlement-prices" element={<SettlementPricesPage />} />
          <Route path="/bug-bounty" element={<BugBountyPage />} />
          <Route path="/api-docs" element={<APIDocsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/user-guide" element={<UserGuidePage />} />
          <Route path="/referral" element={<ReferralPage />} />
          <Route path="*" element={<NotFoundPage />} />
</Routes>
        </div>

        {/* Search Modal */}
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} query={searchQuery} setQuery={setSearchQuery} />

        {/* Floating Chatbot Assistant Trixie */}
        <Chatbot />

        {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
