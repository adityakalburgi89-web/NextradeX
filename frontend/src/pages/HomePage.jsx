import React, { useState, useEffect, useRef } from "react";
import NumberFlow, { continuous } from '@number-flow/react';
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";
import { Headphones, Mail, Globe, Play } from "lucide-react";
import { fetchAllPrices } from "../api";
import { useWebSocket } from "../hooks/useWebSocket";
import xIcon from "../assets/Icons/x.com_icon.png";
import linkedInIcon from "../assets/Icons/LinkedIn_icon.svg.png";
import githubIcon from "../assets/Icons/github_icon.png";
import gmailIcon from "../assets/Icons/Gmail_icon_svg.webp";
import qrCodeImg from "../assets/QrCode/QrCode.png";

// Platform Videos
import vidAboutCrypto from "../assets/videos/Platfrom Video/AboutCrypto.mp4";
import vidCryptoTrading from "../assets/videos/Platfrom Video/CryptoTrading.mp4";
import vidHowPriceWorks from "../assets/videos/Platfrom Video/HowPriceWorks.mp4";
import vidHowToTrade from "../assets/videos/Platfrom Video/HowToTrade.mp4";
import vidExplainer from "../assets/videos/Platfrom Video/NexTradeX_explainer_video_animation_202606090201.mp4";
import vidRiskManagement from "../assets/videos/Platfrom Video/RiskManagment.mp4";
import vidTraders from "../assets/videos/Platfrom Video/Traders.mp4";
import vidTradingRisk from "../assets/videos/Platfrom Video/TradingRisk.mp4";

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
    <div className="w-8 h-8 rounded-full bg-background border border-transparent/20 flex items-center justify-center text-foreground font-mono text-sm font-bold">
      {symbol.charAt(0)}
    </div>
  );
};

const centerCoins = [
  { symbol: "BTC", icon: btcIcon },
  { symbol: "ETH", icon: ethIcon },
  { symbol: "SOL", icon: solIcon },
  { symbol: "LINK", icon: linkIcon },
  { symbol: "LTC", icon: ltcIcon },
  { symbol: "ARB", icon: arbIcon },
  { symbol: "OP", icon: opIcon },
  { symbol: "SUI", icon: suiIcon }
];

export default function HomePage() {
  const [activeMarketTab, setActiveMarketTab] = useState("popular");
  const [userCount, setUserCount] = useState(316258026);
  const [prices, setPrices] = useState([]);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [activeVideo, setActiveVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setIsPlaying(shouldAutoplay);
  }, [activeVideo, shouldAutoplay]);
  const btcData = prices.find(p => p.symbol === "BTCUSDT");
  const btcPrice = btcData ? Number(btcData.currentPrice) : 96482.50;
  const btcChange = btcData ? Number(btcData.percentChange24h) : 3.45;
  const isBtcUp = btcChange >= 0;

  const [activeCenterCoinIndex, setActiveCenterCoinIndex] = useState(0);

  useEffect(() => {
    const coinTimer = setInterval(() => {
      setActiveCenterCoinIndex((prev) => (prev + 1) % centerCoins.length);
    }, 5000);
    return () => clearInterval(coinTimer);
  }, []);

  // Reduced motion hook
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Motion variants with reduced motion support
  const getReducedMotionVariants = (variants) => {
    if (prefersReducedMotion) {
      // Return visible state without animation
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      };
    }
    return variants;
  };

  const platformVideos = [
    { src: vidExplainer, title: "NexTradeX Overview", desc: "A complete walkthrough of the NexTradeX simulated trading platform and its core features." },
    { src: vidAboutCrypto, title: "About Cryptocurrency", desc: "Understand what cryptocurrency is, how blockchain works, and why it matters for traders." },
    { src: vidCryptoTrading, title: "Crypto Trading Basics", desc: "Learn the fundamentals of buying, selling, and managing crypto positions on an exchange." },
    { src: vidHowPriceWorks, title: "How Price Works", desc: "Discover how supply and demand, order books, and market makers drive asset prices." },
    { src: vidHowToTrade, title: "How To Trade", desc: "Step-by-step guide to placing spot, margin, and futures orders on NexTradeX." },
    { src: vidRiskManagement, title: "Risk Management", desc: "Essential strategies for stop-losses, position sizing, and protecting your capital." },
    { src: vidTraders, title: "Meet The Traders", desc: "Explore different trader profiles — scalpers, swing traders, and long-term holders." },
    { src: vidTradingRisk, title: "Understanding Trading Risk", desc: "A deep dive into volatility, leverage risk, and how to trade responsibly." },
  ];

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
      <main className="w-full text-foreground light:text-foreground bg-background light:bg-background">
        {/* HERO SECTION BAND (Full-Bleed bg-background) */}
        <section className="relative overflow-hidden py-20 lg:py-32 border-b border-transparent light:border-transparent bg-background light:bg-background min-h-[calc(100vh-64px)] flex items-center">
          {/* Subtle background ambient mesh */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.03] blur-[160px] pointer-events-none z-0" />

          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

              {/* Left Column: Content */}
              <motion.div
                className="lg:col-span-7 text-left flex flex-col items-start"
                variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Display Headline - Text Reveal */}
                <div className="overflow-hidden w-full">
                  <motion.h1
                    variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : textReveal}
                    className="font-heading text-4xl sm:text-5xl md:text-[60px] lg:text-[72px] font-bold leading-[1.1] mb-6"
                  >
                    TRADE WITH. <br />
                    <span className="text-primary">MATHEMATICAL PRECISION</span>
                  </motion.h1>
                </div>

                {/* Subtext */}
                <motion.p
                  variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : {
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
                  className="flex flex-col sm:flex-row items-center gap-4 justify-start w-full sm:w-auto"
                >
                  <Button variant="primaryPill" className="w-full sm:w-auto" asChild>
                    <Link to="/auth">Start Trading</Link>
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto text-foreground light:text-foreground hover:bg-background light:hover:bg-background" asChild>
                    <Link to="/markets">View Markets</Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right Column: Visual Tactile Neumorphic Illustration */}
              <div className="lg:col-span-5 flex items-center justify-center relative w-full max-w-md mx-auto lg:max-w-none h-[420px] md:h-[480px]">

                {/* Concentric Neumorphic Circles (Ambient Motion) */}
                <motion.div
                  className="absolute w-[300px] h-[300px] md:w-[360px] md:h-[360px] rounded-full shadow-neo flex items-center justify-center bg-background pointer-events-none"
                  animate={prefersReducedMotion ? {} : { y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                >
                  <div className="w-[240px] h-[240px] md:w-[290px] md:h-[290px] rounded-full shadow-neo-inset flex items-center justify-center bg-background">
                    <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] rounded-full shadow-neo flex items-center justify-center bg-background">
                      <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full shadow-neo-inset-deep flex items-center justify-center bg-background">
                        {/* Innermost deep well with rotating coin */}
                        <div className="w-16 h-16 rounded-full shadow-neo flex items-center justify-center bg-background overflow-hidden">
                          <motion.img
                            key={activeCenterCoinIndex}
                            src={centerCoins[activeCenterCoinIndex].icon}
                            className="w-8 h-8 object-contain"
                            alt={centerCoins[activeCenterCoinIndex].symbol}
                            initial={{ scale: 0.6, opacity: 0, rotate: -45 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.6, opacity: 0, rotate: 45 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Card 1: Interactive Live Price Ticker (Molded Surface) */}
                <motion.div
                  className="absolute top-4 left-0 md:-left-6 bg-background p-5 rounded-[32px] shadow-neo w-[220px] md:w-[240px] cursor-pointer text-left"
                  animate={prefersReducedMotion ? {} : { y: [0, -12, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.2 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl shadow-neo-inset flex items-center justify-center bg-background">
                      <img src={btcIcon} className="w-6 h-6 object-contain" alt="BTC" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-foreground">BTC / USDT</h4>
                      <p className="text-[10px] text-muted font-sans font-medium">Bitcoin</p>
                    </div>
                  </div>

                  <div className="mb-3 px-3.5 py-2.5 rounded-2xl shadow-neo-inset bg-background font-mono">
                    <div className="text-[10px] text-muted mb-0.5">Live Price</div>
                    <div className="text-sm font-bold text-primary flex items-center justify-between">
                      <span>
                        $<NumberFlow value={btcPrice} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
                      </span>
                      <span className={`text-[10px] font-semibold ${isBtcUp ? "text-trading-up" : "text-trading-down"}`}>
                        {btcChange >= 0 ? "+" : ""}{btcChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-8 shadow-neo-inset-sm rounded-xl overflow-hidden bg-background relative flex items-center px-1">
                    <svg className="w-full h-6 stroke-primary stroke-[2] fill-none overflow-visible">
                      <path d="M 0 16 Q 15 6, 30 18 T 60 10 T 90 20 T 120 8 T 150 14 T 180 6 T 210 16" />
                    </svg>
                  </div>
                </motion.div>

                {/* Card 2: Interactive Depth Matching Wells */}
                <motion.div
                  className="absolute bottom-4 right-0 md:-right-6 bg-background p-5 rounded-[32px] shadow-neo w-[200px] md:w-[220px] cursor-pointer text-left"
                  animate={prefersReducedMotion ? {} : { y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 0.8 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                >
                  <h4 className="font-heading text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Matching Engine</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-trading-up font-bold">BID</span>
                      <span className="font-mono text-foreground font-semibold">
                        {(btcPrice - 0.50).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="font-mono text-muted">0.450 BTC</span>
                    </div>
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-muted/20 to-transparent" />
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-trading-down font-bold">ASK</span>
                      <span className="font-mono text-foreground font-semibold">
                        {(btcPrice + 1.00).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="font-mono text-muted">1.124 BTC</span>
                    </div>
                  </div>
                </motion.div>

              </div>

            </div>
          </div>
        </section>

        {/* TRUST BADGES GRID (Flat surface cards) */}
        <section className="bg-background light:bg-background py-12 border-b border-transparent light:border-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : staggerContainer}
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
                  variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUpSpring}
                  className="bg-background light:bg-background rounded-2xl border border-transparent light:border-transparent p-5 flex items-center gap-4 hover:border-primary/30 transition-all duration-300 interactive-surface"
                >
                  <span className="text-primary font-mono text-xl font-bold px-3 py-1 bg-primary/10 border border-primary/20 rounded flex-shrink-0">
                    {item.badge}
                  </span>
                  <div>
                    <div className="text-foreground light:text-foreground text-sm font-semibold font-heading">{item.label}</div>
                    <div className="text-muted text-xs font-sans leading-relaxed mt-0.5">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* HERO USER STAT BANDS */}
        <section className="py-20 bg-background light:bg-background border-b border-transparent light:border-transparent text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/[0.02] blur-[130px] pointer-events-none" />
          <motion.div
            variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUpSpring}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-7xl mx-auto px-6 relative z-10"
          >
            <span className="font-mono text-xs text-primary uppercase mb-4 block font-semibold">Platform Metric</span>
            <div className="inline-flex items-center gap-2 select-none border border-transparent light:border-transparent bg-background/30 light:bg-background/80 rounded-2xl px-8 py-6 backdrop-blur-md shadow-elevation-md">
              <h2 className="font-mono text-5xl md:text-8xl font-bold text-primary leading-none">
                <NumberFlow plugins={[continuous]} value={userCount} />
              </h2>
            </div>
            <h3 className="font-heading text-lg md:text-2xl font-semibold text-foreground light:text-foreground max-w-2xl mx-auto mt-6">
              Simulated Users Trust NexTradeX Platform Ecosystem
            </h3>
            <p className="text-muted text-xs font-sans mt-2 max-w-md mx-auto">
              Simulated platform metrics updated in real-time under high-stress system conditions.
            </p>
          </motion.div>
        </section>

        {/* FUNDS SAFU BAND (reserves stats) */}
        <section className="py-20 bg-background light:bg-background border-b border-transparent light:border-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="mb-12 text-center lg:text-left"
            >
              <span className="font-mono text-xs text-primary uppercase mb-3 block font-semibold">Security Guarantee</span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-primary mb-4 uppercase">FUNDS ARE SAFU</h2>
              <p className="text-muted text-sm md:text-base max-w-2xl font-sans">
                All mock balances are backed 1:1 on our virtual ledger. Verified proof of simulated reserves protects all users.
              </p>
            </motion.div>

            <motion.div
              variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : staggerContainer}
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
                  variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUpSpring}
                  className="border-l border-transparent light:border-transparent pl-6 flex flex-col justify-between"
                >
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-primary mb-2">{item.value}</div>
                  <div>
                    <div className="text-foreground light:text-foreground text-sm font-semibold mb-1">{item.label}</div>
                    <div className="text-muted text-xs leading-relaxed font-sans">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CRYPTOCURRENCIES LIST */}
        <section className="py-20 bg-background light:bg-background border-b border-transparent light:border-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-12"
            >
              <span className="font-mono text-xs text-primary uppercase mb-4 block font-semibold">Simulation Markets</span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground light:text-foreground mb-4">Supported Cryptocurrencies</h2>
              <p className="text-muted text-sm md:text-base max-w-xl mx-auto font-sans">
                Discover virtual currencies, lot restrictions, and tick rules routed through our simulation engine.
              </p>
            </motion.div>

            <motion.div
              variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="max-w-5xl mx-auto"
            >
              <div className="bg-background light:bg-background border border-transparent light:border-transparent rounded-xl overflow-hidden p-6 shadow-elevation-md">
                {/* Tab Header */}
                <div className="flex items-center gap-2 border-b border-transparent light:border-transparent pb-4 mb-6">
                  {Object.keys(marketTabs).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveMarketTab(tab)}
                      className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-all duration-200 capitalize ${activeMarketTab === tab
                        ? "bg-primary text-on-primary font-bold shadow-glow-primary"
                        : "text-muted hover:text-foreground light:hover:text-foreground bg-transparent"
                        }`}
                    >
                      {tab === "popular" ? "Popular Pairs" : tab === "new" ? "New Listings" : "Top Gainers"}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-background light:bg-[#f5f5f5] border-b border-transparent light:border-transparent font-heading text-foreground light:text-foreground">
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
                        <tr key={index} className="hover:bg-background/30 light:hover:bg-background/50 transition-colors duration-150 group">
                          <td className="px-6 py-4 text-foreground light:text-foreground font-semibold flex items-center gap-3">
                            {renderCoinIcon(coin.pair)}
                            <span className="group-hover:text-primary transition-colors">{coin.pair}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-foreground light:text-foreground font-medium">{coin.price}</td>
                          <td className={`px-6 py-4 text-right font-medium ${coin.isUp ? "text-trading-up" : "text-trading-down"}`}>
                            <span className="inline-flex items-center gap-1 justify-end">
                              {coin.isUp ? "▲" : "▼"} {coin.change}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">{coin.vol}</td>
                          <td className="px-6 py-4 text-center">
                            <Button size="sm" className="h-[28px] px-4 font-semibold text-xs text-on-primary bg-primary rounded-xl hover:bg-primary-active transition-all" asChild>
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


        {/* PLATFORM VIDEOS SECTION */}
        <section className="py-20 bg-background light:bg-background border-b border-transparent light:border-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-12"
            >
              <span className="font-mono text-xs text-primary uppercase mb-4 block font-semibold">Learn &amp; Explore</span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground light:text-foreground mb-4">Trixie Explains</h2>
              <p className="text-muted text-sm md:text-base max-w-xl mx-auto font-sans">
                Your AI trading guide breaks down concepts, strategies, and platform features — one video at a time.
              </p>
            </motion.div>

            {/* Featured player + full sidebar */}
            <motion.div
              variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Main player */}
              <div className="lg:col-span-2 bg-background light:bg-background border border-transparent light:border-transparent rounded-xl overflow-hidden shadow-elevation-md">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <video
                    ref={videoRef}
                    key={platformVideos[activeVideo].src}
                    src={platformVideos[activeVideo].src}
                    controls
                    autoPlay={shouldAutoplay}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    className="absolute inset-0 w-full h-full object-cover bg-black"
                  />
                  {!isPlaying && (
                    <div
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.play().catch((err) => console.error(err));
                        }
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/45 cursor-pointer group transition-all duration-300 z-10"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center text-primary shadow-glow-primary group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
                        <Play size={28} className="text-primary fill-primary ml-1" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-foreground light:text-foreground mb-1">{platformVideos[activeVideo].title}</h3>
                  <p className="text-muted text-sm font-sans leading-relaxed">{platformVideos[activeVideo].desc}</p>
                </div>
              </div>

              {/* Sidebar — all 7 non-explainer videos */}
              <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
                {platformVideos.slice(1).map((v, i) => {
                  const idx = i + 1;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveVideo(idx);
                        setShouldAutoplay(true);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 group flex-shrink-0 ${activeVideo === idx
                          ? "border-primary/60 bg-primary/10"
                          : "border-transparent light:border-transparent bg-background light:bg-background hover:border-primary/30"
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${activeVideo === idx ? "bg-primary" : "bg-background group-hover:bg-primary/20"
                        } transition-colors`}>
                        <Play size={14} className={activeVideo === idx ? "text-black" : "text-primary"} fill="currentColor" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground light:text-foreground font-heading truncate">{v.title}</p>
                        <p className="text-[10px] text-muted font-sans truncate mt-0.5">{v.desc.slice(0, 60)}…</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* SUPPORT + FAQ */}
        <section className="py-20 bg-background light:bg-background border-b border-transparent light:border-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Support Card */}
              <motion.div
                variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUpSpring}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="lg:col-span-2"
              >
                <div className="bg-background light:bg-background border border-transparent light:border-transparent rounded-xl p-8 relative overflow-hidden h-full flex flex-col justify-between shadow-elevation-md interactive-surface">
                  <div className="space-y-6 relative z-10">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold leading-tight text-foreground light:text-foreground">24x7 Customer Support</h3>
                    <p className="text-muted text-sm leading-relaxed font-sans">
                      Got questions or issues? Our simulated help center is active around the clock with real-time simulated agents.
                    </p>

                    <div className="space-y-4 font-sans border-t border-transparent light:border-transparent pt-6">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                          <Headphones size={16} />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] text-primary uppercase leading-none mb-1">Help Center</p>
                          <p className="text-xs text-muted leading-relaxed">Visit our support database for documentation answers.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                          <Mail size={16} />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] text-primary uppercase leading-none mb-1">Support Ticket</p>
                          <p className="text-xs text-muted leading-relaxed">Raise a virtual ticket to consult with developer desk agents.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 relative z-10 border-t border-transparent light:border-transparent pt-6">
                    <p className="font-mono text-[10px] text-muted uppercase mb-3">Connect with our Creator</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <a href="https://x.com/AdityaKalb4818" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-2xl bg-background light:bg-background border border-transparent light:border-transparent flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <img src={xIcon} alt="X" className="w-4 h-4 object-contain brightness-0 invert light:invert-0" />
                      </a>
                      <a href="mailto:contact@nextradex.sim" className="w-9 h-9 rounded-2xl bg-background light:bg-background border border-transparent light:border-transparent flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <img src={gmailIcon} alt="Gmail" className="w-4 h-4 object-contain" />
                      </a>
                      <a href="https://portfolio-zeta-two-0s3z3wko1s.vercel.app" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-2xl bg-background light:bg-background border border-transparent light:border-transparent flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <Globe size={16} className="text-muted" />
                      </a>
                      <a href="https://www.linkedin.com/in/aditya-kalburgi-080b5b267/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-2xl bg-background light:bg-background border border-transparent light:border-transparent flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <img src={linkedInIcon} alt="LinkedIn" className="w-4 h-4 object-contain" />
                      </a>
                      <a href="https://github.com/aditykalburgi" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-2xl bg-background light:bg-background border border-transparent light:border-transparent flex items-center justify-center hover:border-primary/40 transition-colors duration-200">
                        <img src={githubIcon} alt="GitHub" className="w-4 h-4 object-contain brightness-0 invert light:invert-0" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* FAQ */}
              <motion.div
                variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="lg:col-span-3 font-sans"
              >
                <h3 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-foreground light:text-foreground">Frequently Asked Questions</h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b border-transparent light:border-transparent py-2">
                    <AccordionTrigger className="font-heading text-sm md:text-base font-semibold text-foreground light:text-foreground hover:text-primary transition-colors text-left hover:no-underline py-4">
                      Is NexTradeX a regulated trading platform?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted leading-relaxed font-sans pr-6 pt-2 pb-4">
                      NexTradeX operates strictly as a paper trading simulation platform for educational purposes. All trades, orders, funds, and positions are entirely simulated.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-b border-transparent light:border-transparent py-2">
                    <AccordionTrigger className="font-heading text-sm md:text-base font-semibold text-foreground light:text-foreground hover:text-primary transition-colors text-left hover:no-underline py-4">
                      Do I need actual crypto to use NexTradeX?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted leading-relaxed font-sans pr-6 pt-2 pb-4">
                      No. All accounts receive immediate mock balances upon login. No credit cards or deposits are required.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-b border-transparent light:border-transparent py-2">
                    <AccordionTrigger className="font-heading text-sm md:text-base font-semibold text-foreground light:text-foreground hover:text-primary transition-colors text-left hover:no-underline py-4">
                      What simulated contracts are available?
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted leading-relaxed font-sans pr-6 pt-2 pb-4">
                      We support spot trading pairs, leveraged futures with configurable margin structures, and European-style options contracts.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4" className="border-b border-transparent light:border-transparent py-2">
                    <AccordionTrigger className="font-heading text-sm md:text-base font-semibold text-foreground light:text-foreground hover:text-primary transition-colors text-left hover:no-underline py-4">
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
        <section className="py-20 bg-background light:bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUpSpring}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="bg-background light:bg-background border border-transparent light:border-transparent rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-elevation-md"
            >
              <div className="space-y-2 text-center md:text-left">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground light:text-foreground">
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
