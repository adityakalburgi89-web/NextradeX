import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
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

/* ═══════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════ */
function HomePage() {
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
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-left stagger-children">

            {/* Display Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl md:text-[60px] lg:text-[72px] font-bold leading-[1.1] mb-6 tracking-tight">
              TRADE WITH. <br />
              <span className="text-primary">MATHEMATICAL PRECISION</span>
            </h1>

            {/* Subtext */}
            <p className="text-muted text-base md:text-lg max-w-2xl mb-10 leading-relaxed font-sans">
              Experience high-density simulated trading, real-time depth visualizations, and custom order matching. Zero risk, professional-grade tools.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-start">
              <Button variant="primaryPill" className="w-full sm:w-auto" asChild>
                <Link to="/auth">Start Trading</Link>
              </Button>
              <Button variant="outline" className="w-full sm:w-auto text-body hover:bg-surface-card-dark" asChild>
                <Link to="/markets">View Markets</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* TRUST BADGES GRID (Flat surface cards) */}
        <section className="bg-canvas-dark py-12 border-b border-hairline-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { badge: "No.1", label: "Simulated Volume", desc: "Highest simulated trades routed daily" },
                { badge: "24/7", label: "Customer Service", desc: "Live chat with simulated desk agents" },
                { badge: "100%", label: "Reserves (SAFU)", desc: "All simulation assets collateralized 1:1" },
                { badge: "0.0%", label: "Slip Guarantee", desc: "Precise matching for simulation execution" },
              ].map((item, idx) => (
                <div key={idx} className="bg-surface-card-dark rounded-lg border border-hairline-on-dark p-5 flex flex-col gap-2">
                  <div className="text-primary font-mono text-2xl font-bold tracking-tight">{item.badge}</div>
                  <div className="text-white text-sm font-semibold tracking-tight">{item.label}</div>
                  <div className="text-muted text-xs font-sans leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HERO USER STAT BANDS */}
        <section className="py-20 bg-canvas-dark border-b border-hairline-on-dark text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/[0.02] blur-[130px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 stagger-children">
            <span className="font-mono text-xs text-primary uppercase tracking-widest mb-4 block">Platform Metric</span>
            <h2 className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">316,258,026</h2>
            <h3 className="font-heading text-lg md:text-2xl font-semibold tracking-tight text-muted max-w-2xl mx-auto">
              Simulated Users Trust NexTradeX Platform Ecosystem
            </h3>
          </div>
        </section>

        {/* PRO TRADING FEATURES */}
        <section className="py-20 relative bg-canvas-dark border-b border-hairline-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 stagger-children">
              <span className="font-mono text-xs text-primary uppercase tracking-widest mb-4 block">Best in Class</span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white">Pro Trading Features For Everyone</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
              <FeatureRow
                icon={<Package size={22} className="text-primary" />}
                title="Basket Orders With Margin Benefits"
                description="Place multiple simulated orders together as a basket to enjoy custom margin offsetting."
              />
              <FeatureRow
                icon={<Target size={22} className="text-primary" />}
                title="Strategy Builder"
                description="Build and analyse virtual trading strategies comprising group of futures and options contracts."
              />
              <FeatureRow
                icon={<Layers size={22} className="text-primary" />}
                title="Deep OTM/ITM Strikes"
                description="Trade simulated deep OTM/ITM options strikes with customizable daily and weekly expiry terms."
              />
              <FeatureRow
                icon={<BarChart3 size={22} className="text-primary" />}
                title="PnL Analytics"
                description="Conveniently track and analyse your simulated trading history with advanced visual indices."
              />
            </div>
          </div>
        </section>

        {/* FUNDS SAFU BAND (reserves stats) */}
        <section className="py-20 bg-canvas-dark border-b border-hairline-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12 stagger-children text-center lg:text-left">
              <span className="font-mono text-xs text-primary uppercase tracking-widest mb-3 block">Security Guarantee</span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Simulated Reserves You Can Trust</h2>
              <p className="text-muted text-sm md:text-base max-w-2xl font-sans">
                All mock balances are backed 1:1 on our virtual ledger. Verified proof of simulated reserves protects all users.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { value: "$1,248,592,932", label: "Simulated reserves", desc: "Total paper balance allocated to user accounts" },
                { value: "100.00%", label: "Collateralized ratio", desc: "Virtual funds fully collateralized by central simulated vaults" },
                { value: "0.0001 BTC", label: "Min Lot Execution", desc: "Hyper-precise allocation for simulated matching engines" }
              ].map((item, idx) => (
                <div key={idx} className="bg-surface-card-dark border border-hairline-on-dark rounded-xl p-6 stagger-children">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-primary mb-2 tracking-tight">{item.value}</div>
                  <div className="text-white text-sm font-semibold tracking-tight mb-1">{item.label}</div>
                  <div className="text-muted text-xs leading-relaxed font-sans">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CRYPTOCURRENCIES LIST (Binance-Inspired markets-table-card) */}
        <section className="py-20 bg-canvas-dark border-b border-hairline-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 stagger-children">
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">Supported Simulation Cryptocurrencies</h2>
              <p className="text-muted text-sm md:text-base max-w-xl mx-auto font-sans">
                Discover virtual currencies, lot restrictions, and tick rules routed through our simulation engine.
              </p>
            </div>

            <div className="max-w-4xl mx-auto stagger-children">
              <div className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden p-6 shadow-elevation-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#15191e] border-b border-hairline-on-dark font-heading text-white">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Token Pair</th>
                        <th className="px-6 py-4 font-semibold text-center">Min Trade Size</th>
                        <th className="px-6 py-4 font-semibold text-center">Max Trade Size</th>
                        <th className="px-6 py-4 font-semibold text-center text-primary">Tick Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-on-dark font-mono text-muted">
                      {[
                        { token: "BTC / USDT", min: "0.0001", max: "10.00", tick: "0.25" },
                        { token: "ETH / USDT", min: "0.002", max: "135.00", tick: "0.05" },
                        { token: "LTC / USDT", min: "0.05", max: "3,759.00", tick: "0.01" },
                        { token: "LINK / USDT", min: "0.40", max: "33,277.00", tick: "0.01" },
                        { token: "SOL / USDT", min: "0.00000001", max: "1,800.00", tick: "0.01" },
                      ].map((coin, index) => (
                        <tr key={index} className="hover:bg-[#20262d] transition-colors duration-150">
                          <td className="px-6 py-4 text-white font-semibold flex items-center gap-2">{coin.token}</td>
                          <td className="px-6 py-4 text-center">{coin.min}</td>
                          <td className="px-6 py-4 text-center">{coin.max}</td>
                          <td className="px-6 py-4 text-center text-primary">{coin.tick}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QR PROMO & APP DOWNLOAD SECTION */}
        <section className="py-20 bg-canvas-dark border-b border-hairline-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-surface-card-dark border border-hairline-on-dark rounded-xl p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-12 shadow-elevation-md">
              <div className="flex-1 space-y-6 stagger-children text-center lg:text-left">
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                  Trade On The Go. <br />Anytime, Anywhere.
                </h2>
                <p className="text-muted text-sm md:text-base leading-relaxed font-sans max-w-xl">
                  Scan the mock code with your browser simulator to run the trading terminal on mobile devices. Full support for custom lot sizing, tickers, and profile tracking.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <div className="px-4 py-2 bg-[#15191e] border border-hairline-on-dark rounded-md text-xs font-mono text-muted">
                    iOS / iPadOS
                  </div>
                  <div className="px-4 py-2 bg-[#15191e] border border-hairline-on-dark rounded-md text-xs font-mono text-muted">
                    Android / APK
                  </div>
                  <div className="px-4 py-2 bg-[#15191e] border border-hairline-on-dark rounded-md text-xs font-mono text-muted">
                    macOS / Desktop
                  </div>
                </div>
              </div>
              
              {/* Actual QR Code Image */}
              <div className="w-48 h-48 bg-white p-2 rounded-xl border border-hairline-on-dark flex items-center justify-center flex-shrink-0 relative shadow-elevation-lg">
                <img src={qrCodeImg} alt="QR Code" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </section>

        {/* SUPPORT + FAQ */}
        <section className="py-20 bg-canvas-dark border-b border-hairline-on-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Support Card */}
              <div className="lg:col-span-2">
                <div className="bg-surface-card-dark border border-hairline-on-dark rounded-xl p-8 relative overflow-hidden h-full flex flex-col justify-between shadow-elevation-md">
                  <div className="space-y-6 relative z-10">
                    <h3 className="font-heading text-2xl md:text-3xl font-bold leading-tight text-white">24x7 Customer<br />Support</h3>
                    <div className="space-y-4 font-sans">
                      <div>
                        <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-1">Have a question?</p>
                        <p className="text-sm text-body">Visit our simulated Support Centre for quick documentation answers.</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-primary uppercase tracking-widest mb-1">Need help?</p>
                        <p className="text-sm text-body">Raise a virtual support ticket with our developer team.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 relative z-10">
                    <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">Connect with us</p>
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
              </div>

              {/* FAQ */}
              <div className="lg:col-span-3">
                <h3 className="font-heading text-2xl md:text-3xl font-bold mb-8 tracking-tight text-white">Frequently Asked Questions</h3>
                <div className="divide-y divide-hairline-on-dark font-sans">
                  <FAQItem
                    question="Is NexTradeX a regulated trading platform?"
                    answer="NexTradeX operates strictly as a paper trading simulation platform for educational purposes. All trades, orders, funds, and positions are entirely simulated."
                  />
                  <FAQItem
                    question="Do I need actual crypto to use NexTradeX?"
                    answer="No. All accounts receive immediate mock balances upon login. No credit cards or deposits are required."
                  />
                  <FAQItem
                    question="What simulated contracts are available?"
                    answer="We support spot trading pairs, leveraged futures with configurable margin structures, and European-style options contracts."
                  />
                  <FAQItem
                    question="How does simulated market data stream?"
                    answer="Our backend aggregates tick snapshots and streams updates via high-frequency WebSockets to emulate live market dynamics."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BAND (Pre-Footer Banner) */}
        <section className="py-20 bg-canvas-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-surface-card-dark border border-hairline-on-dark rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-elevation-md">
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
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}

/* ═══════════════════════════════════════════
   PRO FEATURE ROW
   ═══════════════════════════════════════════ */
function FeatureRow({ icon, title, description }) {
  return (
    <div className="flex items-start gap-5 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary/20 transition-all duration-300 group">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-glow-primary group-hover:shadow-glow-primary-hover transition-shadow duration-500">
        <span className="text-white">{icon}</span>
      </div>
      <div>
        <h4 className="font-heading text-base font-semibold text-white mb-1.5">{title}</h4>
        <p className="text-sm text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   FAQ ACCORDION ITEM
   ═══════════════════════════════════════════ */
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden transition-all duration-300 hover:border-white/[0.1]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left group"
      >
        <span className="font-body text-sm font-medium text-white pr-4">{question}</span>
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown size={16} className="text-white" />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-spring ${open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-6 pb-5 text-sm text-muted leading-relaxed border-t border-white/[0.04] pt-4">
          {answer}
        </div>
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
        } catch {
          clearAuthToken();
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
