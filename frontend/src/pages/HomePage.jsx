import React, { useState, useEffect } from "react";
import NumberFlow, { continuous } from '@number-flow/react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { Headphones, Mail, Globe } from "lucide-react";
import { fetchAllPrices } from "../api";
import { useWebSocket } from "../hooks/useWebSocket";
import xIcon from "../assets/Icons/x.com_icon.png";
import linkedInIcon from "../assets/Icons/LinkedIn_icon.svg.png";
import githubIcon from "../assets/Icons/github_icon.png";
import gmailIcon from "../assets/Icons/Gmail_icon_svg.webp";
import tradingVideo from "../assets/videos/TradingVid.mp4";
import qrCodeImg from "../assets/QrCode/QrCode.png";

// Cryptocurrency SVG Icons from cryptologos.cc
import btcIcon from "../assets/Icons/btc.svg";
import ethIcon from "../assets/Icons/eth.svg";
import solIcon from "../assets/Icons/sol.svg";
import linkIcon from "../assets/Icons/link.svg";
import ltcIcon from "../assets/Icons/ltc.svg";
import arbIcon from "../assets/Icons/arb.svg";
import opIcon from "../assets/Icons/op.svg";
import suiIcon from "../assets/Icons/sui.svg";
import tiaIcon from "../assets/Icons/tia.svg";
import seiIcon from "../assets/Icons/sei.svg";

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

export default function HomePage() {
  const [activeMarketTab, setActiveMarketTab] = useState("popular");
  const [userCount, setUserCount] = useState(316258026);
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 4) + 1);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handlePriceUpdate = (payload) => {
    if (Array.isArray(payload)) {
      setPrices(payload);
      return;
    }
    if (payload?.symbol) {
      setPrices((prev) => {
        const idx = prev.findIndex((p) => p.symbol === payload.symbol);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = payload;
          return next;
        }
        return [...prev, payload];
      });
    }
  };

  useWebSocket("/topic/prices", handlePriceUpdate, true);

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const res = await fetchAllPrices();
        if (res?.data) {
          setPrices(res.data);
        }
      } catch (err) {
        console.error("[HomePage] Failed to fetch prices on homepage:", err);
      }
    };
    loadPrices();
  }, []);

  const formatVol = (val) => {
    if (val === undefined || val === null) return "$0";
    if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  const getMappedTab = (pairs) => {
    return pairs.map(symbol => {
      const match = prices.find(p => p.symbol === symbol);
      if (match) {
        const isUp = Number(match.percentChange24h) >= 0;
        return {
          pair: `${match.symbol.replace("USDT", "")} / USDT`,
          price: `$${Number(match.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: `${isUp ? "+" : ""}${Number(match.percentChange24h).toFixed(2)}%`,
          isUp,
          vol: formatVol(Number(match.volume24h)),
          rawSymbol: match.symbol
        };
      }
      const defaultMap = {
        BTCUSDT: { pair: "BTC / USDT", price: "$96,482.50", change: "+3.45%", isUp: true, vol: "$12.8B", rawSymbol: "BTCUSDT" },
        ETHUSDT: { pair: "ETH / USDT", price: "$3,584.20", change: "+1.85%", isUp: true, vol: "$5.4B", rawSymbol: "ETHUSDT" },
        SOLUSDT: { pair: "SOL / USDT", price: "$184.65", change: "+5.12%", isUp: true, vol: "$2.9B", rawSymbol: "SOLUSDT" },
        LINKUSDT: { pair: "LINK / USDT", price: "$18.25", change: "-0.75%", isUp: false, vol: "$420M", rawSymbol: "LINKUSDT" },
        LTCUSDT: { pair: "LTC / USDT", price: "$86.40", change: "+0.25%", isUp: true, vol: "$310M", rawSymbol: "LTCUSDT" },
        ARBUSDT: { pair: "ARB / USDT", price: "$1.12", change: "+12.45%", isUp: true, vol: "$180M", rawSymbol: "ARBUSDT" },
        OPUSDT: { pair: "OP / USDT", price: "$2.45", change: "+8.20%", isUp: true, vol: "$120M", rawSymbol: "OPUSDT" },
        SUIUSDT: { pair: "SUI / USDT", price: "$1.95", change: "+15.30%", isUp: true, vol: "$220M", rawSymbol: "SUIUSDT" },
        TIAUSDT: { pair: "TIA / USDT", price: "$5.82", change: "-4.15%", isUp: false, vol: "$95M", rawSymbol: "TIAUSDT" },
        SEIUSDT: { pair: "SEI / USDT", price: "$0.54", change: "-2.85%", isUp: false, vol: "$80M", rawSymbol: "SEIUSDT" },
      };
      return defaultMap[symbol] || { pair: symbol, price: "—", change: "0.00%", isUp: true, vol: "—", rawSymbol: symbol };
    });
  };

  const dynamicTabs = {
    popular: getMappedTab(["BTCUSDT", "ETHUSDT", "SOLUSDT", "LINKUSDT", "LTCUSDT"]),
    new: getMappedTab(["ARBUSDT", "OPUSDT", "SUIUSDT", "TIAUSDT", "SEIUSDT"]),
    gainers: prices.length > 0
      ? [...prices]
        .sort((a, b) => Number(b.percentChange24h) - Number(a.percentChange24h))
        .slice(0, 5)
        .map(match => {
          const isUp = Number(match.percentChange24h) >= 0;
          return {
            pair: `${match.symbol.replace("USDT", "")} / USDT`,
            price: `$${Number(match.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: `${isUp ? "+" : ""}${Number(match.percentChange24h).toFixed(2)}%`,
            isUp,
            vol: formatVol(Number(match.volume24h)),
            rawSymbol: match.symbol
          };
        })
      : getMappedTab(["SUIUSDT", "ARBUSDT", "OPUSDT", "SOLUSDT", "BTCUSDT"])
  };

  return (
    <PageTransition>
      <main className="w-full text-white light:text-ink bg-canvas-dark light:bg-canvas-light">
        {/* HERO SECTION BAND (Full-Bleed bg-canvas-dark) */}
        <section className="relative overflow-hidden py-20 md:py-32 border-b border-hairline-on-dark light:border-hairline-on-light bg-canvas-dark light:bg-canvas-light min-h-[calc(100vh-64px)] flex items-center">
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
          <div className="absolute inset-0 bg-gradient-to-b from-canvas-dark/10 via-canvas-dark/70 to-canvas-dark light:from-canvas-light/10 light:via-canvas-light/70 light:to-canvas-light z-0" />

          {/* Subtle background ambient mesh */}
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
              <Button variant="outline" className="w-full sm:w-auto text-body light:text-body-on-light hover:bg-surface-card-dark light:hover:bg-surface-strong-light" asChild>
                <Link to="/markets">View Markets</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* TRUST BADGES GRID (Flat surface cards) */}
        <section className="bg-canvas-dark light:bg-canvas-light py-12 border-b border-hairline-on-dark light:border-hairline-on-light">
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
                  className="bg-surface-card-dark light:bg-canvas-light rounded-lg border border-hairline-on-dark light:border-hairline-on-light p-5 flex items-center gap-4 hover:border-primary/30 transition-all duration-300 interactive-surface"
                >
                  <span className="text-primary font-mono text-xl font-bold px-3 py-1 bg-primary/10 border border-primary/20 rounded flex-shrink-0">
                    {item.badge}
                  </span>
                  <div>
                    <div className="text-white light:text-ink text-sm font-semibold tracking-tight font-heading">{item.label}</div>
                    <div className="text-muted text-xs font-sans leading-relaxed mt-0.5">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* HERO USER STAT BANDS */}
        <section className="py-20 bg-canvas-dark light:bg-canvas-light border-b border-hairline-on-dark light:border-hairline-on-light text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/[0.02] blur-[130px] pointer-events-none" />
          <motion.div
            variants={fadeInUpSpring}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-7xl mx-auto px-6 relative z-10"
          >
            <span className="font-mono text-xs text-primary uppercase tracking-widest mb-4 block font-semibold">Platform Metric</span>
            <div className="inline-flex items-center gap-2 select-none border border-hairline-on-dark light:border-hairline-on-light bg-surface-card-dark/30 light:bg-canvas-light/80 rounded-2xl px-8 py-6 backdrop-blur-md shadow-elevation-md">
              <h2 className="font-mono text-5xl md:text-8xl font-bold tracking-wider text-primary leading-none">
                <NumberFlow plugins={[continuous]} value={userCount} />
              </h2>
            </div>
            <h3 className="font-heading text-lg md:text-2xl font-semibold tracking-tight text-white/95 light:text-ink max-w-2xl mx-auto mt-6">
              Simulated Users Trust NexTradeX Platform Ecosystem
            </h3>
            <p className="text-muted text-xs font-sans mt-2 max-w-md mx-auto">
              Simulated platform metrics updated in real-time under high-stress system conditions.
            </p>
          </motion.div>
        </section>

        {/* FUNDS SAFU BAND (reserves stats) */}
        <section className="py-20 bg-canvas-dark light:bg-canvas-light border-b border-hairline-on-dark light:border-hairline-on-light">
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
                  className="border-l border-hairline-on-dark light:border-hairline-on-light pl-6 flex flex-col justify-between"
                >
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-primary mb-2 tracking-tight">{item.value}</div>
                  <div>
                    <div className="text-white light:text-ink text-sm font-semibold tracking-tight mb-1">{item.label}</div>
                    <div className="text-muted text-xs leading-relaxed font-sans">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CRYPTOCURRENCIES LIST */}
        <section className="py-20 bg-canvas-dark light:bg-canvas-light border-b border-hairline-on-dark light:border-hairline-on-light">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              variants={fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-12"
            >
              <span className="font-mono text-xs text-primary uppercase tracking-widest mb-4 block font-semibold">Simulation Markets</span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white light:text-ink mb-4">Supported Cryptocurrencies</h2>
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
              <div className="bg-surface-card-dark light:bg-canvas-light border border-hairline-on-dark light:border-hairline-on-light rounded-xl overflow-hidden p-6 shadow-elevation-md">
                {/* Tab Header */}
                <div className="flex items-center gap-2 border-b border-hairline-on-dark light:border-hairline-on-light pb-4 mb-6">
                  {Object.keys(marketTabs).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveMarketTab(tab)}
                      className={`px-4 py-2 text-xs font-semibold rounded-md transition-all duration-200 capitalize ${activeMarketTab === tab
                        ? "bg-primary text-on-primary font-bold shadow-glow-primary"
                        : "text-muted hover:text-white light:hover:text-ink bg-transparent"
                        }`}
                    >
                      {tab === "popular" ? "Popular Pairs" : tab === "new" ? "New Listings" : "Top Gainers"}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#15191e] light:bg-[#f5f5f5] border-b border-hairline-on-dark light:border-hairline-on-light font-heading text-white light:text-ink">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Token Pair</th>
                        <th className="px-6 py-4 font-semibold text-right">Last Price</th>
                        <th className="px-6 py-4 font-semibold text-right">24h Change</th>
                        <th className="px-6 py-4 font-semibold text-right">24h Volume</th>
                        <th className="px-6 py-4 font-semibold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-on-dark light:divide-hairline-on-light font-mono text-muted">
                      {dynamicTabs[activeMarketTab].map((coin, index) => (
                        <tr key={index} className="hover:bg-surface-elevated-dark/30 light:hover:bg-surface-strong-light/50 transition-colors duration-150 group">
                          <td className="px-6 py-4 text-white light:text-ink font-semibold flex items-center gap-3">
                            {renderCoinIcon(coin.pair)}
                            <span className="group-hover:text-primary transition-colors">{coin.pair}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-white light:text-ink font-medium">{coin.price}</td>
                          <td className={`px-6 py-4 text-right font-medium ${coin.isUp ? "text-trading-up" : "text-trading-down"}`}>
                            <span className="inline-flex items-center gap-1 justify-end">
                              {coin.isUp ? "▲" : "▼"} {coin.change}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">{coin.vol}</td>
                          <td className="px-6 py-4 text-center">
                            <Button size="sm" className="h-[28px] px-4 font-semibold text-xs text-on-primary bg-primary rounded-sm hover:bg-primary-active transition-all" asChild>
                              <Link to={`/trade/spot?symbol=${coin.rawSymbol || "BTCUSDT"}`}>Trade</Link>
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
        <section className="py-20 bg-canvas-dark light:bg-canvas-light border-b border-hairline-on-dark light:border-hairline-on-light">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              variants={fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="bg-surface-card-dark light:bg-canvas-light border border-hairline-on-dark light:border-hairline-on-light rounded-xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-elevation-md"
            >
              <div className="flex-1 space-y-6 text-center lg:text-left">
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-white light:text-ink tracking-tight leading-tight">
                  Trade On The Go. <br />Anytime, Anywhere.
                </h2>
                <p className="text-muted text-sm md:text-base leading-relaxed font-sans max-w-xl">
                  Scan the mock code with your browser simulator to run the trading terminal on mobile devices. Full support for custom lot sizing, tickers, and profile tracking.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <a href="#download-ios" className="flex items-center gap-3 px-5 py-2 bg-[#15191e] light:bg-surface-strong-light border border-hairline-on-dark light:border-hairline-on-light rounded-lg text-left hover:border-primary/45 transition-all duration-300">
                    <svg className="w-5 h-5 text-white light:text-ink" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,22C14.32,22.05 13.89,21.23 12.37,21.23C10.84,21.23 10.37,22 9.09,22.05C7.79,22.1 6.8,20.78 5.96,19.58C4.26,17.12 2.97,12.59 4.71,9.58C5.58,8.08 7.13,7.13 8.81,7.1C10.09,7.08 11.3,7.96 12.08,7.96C12.86,7.96 14.3,6.92 15.82,7.08C16.46,7.1 18.26,7.34 19.46,9.1C19.36,9.16 17.25,10.39 17.27,12.87C17.3,15.84 19.9,16.83 19.93,16.84C19.91,16.91 19.5,18.3 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                    </svg>
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted font-sans leading-none">Download on the</p>
                      <p className="text-xs font-semibold text-white light:text-ink font-heading mt-1 leading-tight">App Store</p>
                    </div>
                  </a>
                  <a href="#download-android" className="flex items-center gap-3 px-5 py-2 bg-[#15191e] light:bg-surface-strong-light border border-hairline-on-dark light:border-hairline-on-light rounded-lg text-left hover:border-primary/45 transition-all duration-300">
                    <svg className="w-5 h-5 text-white light:text-ink" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,5.27V18.73L16.55,12L3,5.27M17.87,11.33L19.5,12.15C19.82,12.31 19.82,12.69 19.5,12.85L17.87,13.67L15,12.24L17.87,11.33M4.24,6.47L14.28,11.5L4.24,16.53V6.47M4.24,17.47L14.28,12.5L4.24,7.53V17.47Z" />
                    </svg>
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted font-sans leading-none">Get it on</p>
                      <p className="text-xs font-semibold text-white light:text-ink font-heading mt-1 leading-tight">Google Play</p>
                    </div>
                  </a>
                  <a href="#download-apk" className="flex items-center gap-3 px-5 py-2 bg-[#15191e] light:bg-surface-strong-light border border-hairline-on-dark light:border-hairline-on-light rounded-lg text-left hover:border-primary/45 transition-all duration-300">
                    <Globe size={18} className="text-white light:text-ink" />
                    <div>
                      <p className="text-[8px] uppercase tracking-wider text-muted font-sans leading-none">Download APK for</p>
                      <p className="text-xs font-semibold text-white light:text-ink font-heading mt-1 leading-tight">macOS / Windows</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Actual QR Code Image */}
              <div className="relative group bg-white p-3 rounded-xl border border-hairline-on-dark light:border-hairline-on-light flex flex-col items-center justify-center flex-shrink-0 shadow-elevation-lg overflow-hidden">
                <style dangerouslySetInnerHTML={{
                  __html: `
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
        <section className="py-20 bg-canvas-dark light:bg-canvas-light border-b border-hairline-on-dark light:border-hairline-on-light">
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
                <div className="bg-surface-card-dark light:bg-canvas-light border border-hairline-on-dark light:border-hairline-on-light rounded-xl p-8 relative overflow-hidden h-full flex flex-col justify-between shadow-elevation-md interactive-surface">
                  <div className="space-y-6 relative z-10">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold leading-tight text-white light:text-ink">24x7 Customer Support</h3>
                    <p className="text-muted text-sm leading-relaxed font-sans">
                      Got questions or issues? Our simulated help center is active around the clock with real-time simulated agents.
                    </p>

                    <div className="space-y-4 font-sans border-t border-hairline-on-dark light:border-hairline-on-light pt-6">
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

                  <div className="mt-8 relative z-10 border-t border-hairline-on-dark light:border-hairline-on-light pt-6">
                    <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">Connect with our Creator</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <a href="https://x.com/AdityaKalb4818" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-[#15191e] light:bg-surface-strong-light border border-hairline-on-dark light:border-hairline-on-light flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <img src={xIcon} alt="X" className="w-4 h-4 object-contain brightness-0 invert light:invert-0" />
                      </a>
                      <a href="mailto:contact@nextradex.sim" className="w-9 h-9 rounded-md bg-[#15191e] light:bg-surface-strong-light border border-hairline-on-dark light:border-hairline-on-light flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <img src={gmailIcon} alt="Gmail" className="w-4 h-4 object-contain" />
                      </a>
                      <a href="https://portfolio-zeta-two-0s3z3wko1s.vercel.app" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-[#15191e] light:bg-surface-strong-light border border-hairline-on-dark light:border-hairline-on-light flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <Globe size={16} className="text-muted" />
                      </a>
                      <a href="https://www.linkedin.com/in/aditya-kalburgi-080b5b267/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-[#15191e] light:bg-surface-strong-light border border-hairline-on-dark light:border-hairline-on-light flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <img src={linkedInIcon} alt="LinkedIn" className="w-4 h-4 object-contain" />
                      </a>
                      <a href="https://github.com/aditykalburgi" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md bg-[#15191e] light:bg-surface-strong-light border border-hairline-on-dark light:border-hairline-on-light flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <img src={githubIcon} alt="GitHub" className="w-4 h-4 object-contain brightness-0 invert light:invert-0" />
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
                <h3 className="font-heading text-2xl md:text-3xl font-bold mb-8 tracking-tight text-white light:text-ink">Frequently Asked Questions</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b border-hairline-on-dark light:border-hairline-on-light py-2">
                    <AccordionTrigger className="font-heading text-sm md:text-base font-semibold text-white light:text-ink hover:text-primary transition-colors text-left hover:no-underline py-4">
                      Is NexTradeX a regulated trading platform?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted leading-relaxed font-sans pr-6 pt-2 pb-4">
                      NexTradeX operates strictly as a paper trading simulation platform for educational purposes. All trades, orders, funds, and positions are entirely simulated.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-b border-hairline-on-dark light:border-hairline-on-light py-2">
                    <AccordionTrigger className="font-heading text-sm md:text-base font-semibold text-white light:text-ink hover:text-primary transition-colors text-left hover:no-underline py-4">
                      Do I need actual crypto to use NexTradeX?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted leading-relaxed font-sans pr-6 pt-2 pb-4">
                      No. All accounts receive immediate mock balances upon login. No credit cards or deposits are required.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-b border-hairline-on-dark light:border-hairline-on-light py-2">
                    <AccordionTrigger className="font-heading text-sm md:text-base font-semibold text-white light:text-ink hover:text-primary transition-colors text-left hover:no-underline py-4">
                      What simulated contracts are available?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted leading-relaxed font-sans pr-6 pt-2 pb-4">
                      We support spot trading pairs, leveraged futures with configurable margin structures, and European-style options contracts.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4" className="border-b border-hairline-on-dark light:border-hairline-on-light py-2">
                    <AccordionTrigger className="font-heading text-sm md:text-base font-semibold text-white light:text-ink hover:text-primary transition-colors text-left hover:no-underline py-4">
                      How does simulated market data stream?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted leading-relaxed font-sans pr-6 pt-2 pb-4">
                      Our backend aggregates tick snapshots and streams updates via high-frequency WebSockets to emulate live market dynamics.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <section className="py-20 bg-canvas-dark light:bg-canvas-light">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              variants={fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="bg-surface-card-dark light:bg-canvas-light border border-hairline-on-dark light:border-hairline-on-light rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-elevation-md"
            >
              <div className="space-y-2 text-center md:text-left">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white light:text-ink tracking-tight">
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
