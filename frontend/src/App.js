import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Button } from "./components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/ui/Card";
import { Input } from "./components/ui/Input";
import { PageTransition } from "./components/ui/PageTransition";
import { Zap, Shield, Layers, TrendingUp, Globe, Activity, Menu, X, BarChart3, Package, Target, Headphones, ChevronDown, Mail, User, LogOut } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import MarketsPage from "./pages/MarketsPage";
import SpotTradingPage from "./pages/SpotTradingPage";
import FuturesTradingPage from "./pages/FuturesTradingPage";
import OptionsTradingPage from "./pages/OptionsTradingPage";
import WalletsPage from "./pages/WalletsPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import { hasAuthToken, clearAuthToken, fetchUserProfile } from "./api";
import xIcon from "./assets/x.com_icon.png";
import linkedInIcon from "./assets/LinkedIn_icon.svg.png";
import githubIcon from "./assets/github_icon.png";
import gmailIcon from "./assets/Gmail_icon_svg.webp";

/* ═══════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════ */
function HomePage() {
  return (
    <PageTransition>
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6">
        {/* HERO SECTION */}
        <section className="py-28 md:py-36 flex flex-col lg:flex-row items-center justify-between gap-20">
          <div className="flex-1 text-center lg:text-left relative z-20 stagger-children">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
              </span>
              <span className="font-mono text-xs text-muted tracking-wider uppercase">Live Network V2</span>
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] mb-8 tracking-tight">
              Trade with <br className="hidden md:block" />
              <span className="text-gradient">
                Mathematical Precision
              </span>
            </h1>

            <p className="text-muted text-lg md:text-xl max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed">
              Experience the deepest liquidity and lowest slippage in decentralized finance.
              Engineered for true void performance.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/trade/spot">Start Trading</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link to="/markets">View Markets</Link>
              </Button>
            </div>
          </div>

          {/* 3D Visual Area */}
          <div className="flex-1 relative w-full h-[400px] md:h-[500px] flex items-center justify-center">
            {/* Orbital Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border border-primary/15 animate-spin-slow absolute"
                style={{ borderStyle: "dashed" }}
              />
              <div className="w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full border border-secondary/20 animate-spin-reverse-slow absolute" />
            </div>

            {/* Core Node */}
            <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-[0_0_80px_rgba(247,147,26,0.4)] animate-float gpu-accelerated">
              <Layers size={48} className="text-white opacity-90" />
            </div>

            {/* Floating Stats Glass Cards */}
            <Card variant="glass" className="absolute top-[10%] left-[5%] p-4 w-44 animate-float gpu-accelerated" style={{ animationDelay: "0s" }}>
              <p className="font-mono text-[10px] text-muted mb-1 uppercase tracking-wider">24H Volume</p>
              <p className="font-heading text-xl text-white font-semibold">$2.4B</p>
            </Card>

            <Card
              variant="glass"
              className="absolute bottom-[15%] right-[5%] p-4 w-48 animate-float-slow gpu-accelerated"
              style={{ animationDelay: "2s" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-tertiary/15 flex items-center justify-center border border-tertiary/20">
                  <Activity size={16} className="text-tertiary" />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted leading-tight uppercase tracking-wider">Transactions</p>
                  <p className="font-heading text-lg text-white font-semibold">1,042/s</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section className="py-28 relative z-20">
          <div className="text-center mb-20 stagger-children">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-5 tracking-tight">Engineered for Alpha</h2>
            <p className="text-muted font-mono tracking-wider uppercase text-sm">Security · Speed · Liquidity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
            {/* Card 1 */}
            <Card className="group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
                <Zap size={100} className="text-primary rotate-12" />
              </div>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_24px_rgba(247,147,26,0.3)] transition-all duration-500">
                  <Zap size={22} className="text-primary" />
                </div>
                <CardTitle>Lightning Execution</CardTitle>
                <CardDescription>Sub-millisecond trade settlement powered by our optimized matching engine.</CardDescription>
              </CardHeader>
            </Card>

            {/* Card 2 */}
            <Card className="group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
                <Shield size={100} className="text-secondary -rotate-12" />
              </div>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_24px_rgba(234,88,12,0.3)] transition-all duration-500">
                  <Shield size={22} className="text-secondary" />
                </div>
                <CardTitle>Cryptographic Trust</CardTitle>
                <CardDescription>Fully audited smart contracts. Your assets are secured by the underlying network.</CardDescription>
              </CardHeader>
            </Card>

            {/* Card 3 */}
            <Card className="group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
                <Globe size={100} className="text-tertiary rotate-6" />
              </div>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tertiary/20 to-tertiary/5 border border-tertiary/20 flex items-center justify-center mb-4 group-hover:shadow-[0_0_24px_rgba(255,214,0,0.3)] transition-all duration-500">
                  <Globe size={22} className="text-tertiary" />
                </div>
                <CardTitle>Global Liquidity</CardTitle>
                <CardDescription>Access aggregated liquidity pools across multiple chains from a single terminal.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* INPUT TERMINAL SHOWCASE */}
        <section className="py-28 border-y border-white/[0.04] relative bg-grid-pattern">
          <div className="max-w-2xl mx-auto">
            <PageTransition>
              <Card
                variant="glass"
                className="w-full relative z-10 border-t border-l border-t-primary/40 border-l-primary/40 !rounded-2xl"
              >
                <div className="absolute -top-[2px] -left-[2px] w-2 h-2 bg-primary rounded-sm" />
                <CardHeader>
                  <CardTitle className="font-mono text-lg text-primary">{">"}&#160;_INITIALIZE_TRADE</CardTitle>
                  <CardDescription>Enter parameters for algorithmic execution.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                      Asset Pair
                    </label>
                    <Input placeholder="e.g. BTC/USDC" />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                      Leverage (x)
                    </label>
                    <Input type="number" placeholder="10" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full font-mono" asChild>
                    <Link to="/trade/futures">EXECUTE_ORDER</Link>
                  </Button>
                </CardFooter>
              </Card>
            </PageTransition>
          </div>
        </section>

        {/* PRO TRADING FEATURES */}
        <section className="py-28 relative z-20">
          <div className="text-center mb-16 stagger-children">
            <span className="font-mono text-xs text-primary uppercase tracking-widest mb-4 block">Best in Class</span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight">Pro Trading Features For Everyone</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
            <FeatureRow
              icon={<Package size={22} />}
              title="Basket Orders With Margin Benefits"
              description="Place multiple orders together as a basket to enjoy margin offsetting"
            />
            <FeatureRow
              icon={<Target size={22} />}
              title="Strategy Builder"
              description="Build and analyse trading strategies comprising of group of futures and options"
            />
            <FeatureRow
              icon={<Layers size={22} />}
              title="Deep OTM/ITM Strikes"
              description="Trade deep OTM/ITM options strikes with daily and weekly expiry"
            />
            <FeatureRow
              icon={<BarChart3 size={22} />}
              title="PnL Analytics"
              description="Conveniently track and analyse your trading performance"
            />
          </div>
        </section>

        {/* CRYPTOCURRENCIES LIST */}
        <section className="py-28 border-t border-white/[0.04] relative z-20">
          <div className="text-center mb-16 stagger-children">
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mb-4">List of cryptocurrencies</h2>
            <p className="text-muted text-sm md:text-base">Discover which cryptocurrencies, trade and tick sizes are available through our partner, Paxos.</p>
          </div>
          
          <div className="max-w-4xl mx-auto stagger-children">
            <Card variant="glass" className="overflow-hidden border border-white/[0.06] !p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/[0.04] border-b border-white/[0.08] font-heading text-white">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Token</th>
                      <th className="px-6 py-4 font-semibold text-center">Min Trade Size</th>
                      <th className="px-6 py-4 font-semibold text-center">Max Trade Size</th>
                      <th className="px-6 py-4 font-semibold text-center">Tick Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-mono text-muted">
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium flex items-center gap-2">Bitcoin</td>
                      <td className="px-6 py-4 text-center">0.0001</td>
                      <td className="px-6 py-4 text-center">10</td>
                      <td className="px-6 py-4 text-center">0.25</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">Ethereum</td>
                      <td className="px-6 py-4 text-center">0.002</td>
                      <td className="px-6 py-4 text-center">135</td>
                      <td className="px-6 py-4 text-center">0.05</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">Litecoin</td>
                      <td className="px-6 py-4 text-center">0.05</td>
                      <td className="px-6 py-4 text-center">3759</td>
                      <td className="px-6 py-4 text-center">0.01</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">Bitcoin Cash</td>
                      <td className="px-6 py-4 text-center">0.02</td>
                      <td className="px-6 py-4 text-center">1342</td>
                      <td className="px-6 py-4 text-center">0.05</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">PAX Gold</td>
                      <td className="px-6 py-4 text-center">0.002</td>
                      <td className="px-6 py-4 text-center">211</td>
                      <td className="px-6 py-4 text-center">0.01</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">Chainlink</td>
                      <td className="px-6 py-4 text-center">0.4</td>
                      <td className="px-6 py-4 text-center">33277</td>
                      <td className="px-6 py-4 text-center">0.01</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">Uniswap</td>
                      <td className="px-6 py-4 text-center">0.6</td>
                      <td className="px-6 py-4 text-center">51480</td>
                      <td className="px-6 py-4 text-center">0.01</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">Aave</td>
                      <td className="px-6 py-4 text-center">0.04</td>
                      <td className="px-6 py-4 text-center">2577</td>
                      <td className="px-6 py-4 text-center">0.01</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white font-medium">Solana</td>
                      <td className="px-6 py-4 text-center">0.00000001</td>
                      <td className="px-6 py-4 text-center">1800</td>
                      <td className="px-6 py-4 text-center">0.01</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </section>

        {/* SUPPORT + FAQ */}
        <section className="py-28 border-t border-white/[0.04]">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Support Card */}
            <div className="lg:col-span-2">
              <Card variant="glass" className="h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-10 pointer-events-none">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    <circle cx="80" cy="180" r="120" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary" />
                    <circle cx="120" cy="200" r="160" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-primary" />
                    <circle cx="60" cy="220" r="200" stroke="currentColor" strokeWidth="0.3" fill="none" className="text-primary" />
                  </svg>
                </div>
                <CardContent className="p-8 relative z-10 space-y-8">
                  <h3 className="font-heading text-2xl md:text-3xl font-bold leading-tight">24x7 Customer<br />Support</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5">Have a question?</p>
                      <p className="text-sm text-white/80">Visit our <Link to="/" className="text-primary hover:underline underline-offset-2">Support Centre</Link> for quick answers</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5">Need help?</p>
                      <p className="text-sm text-white/80">Raise a <Link to="/" className="text-primary hover:underline underline-offset-2">support ticket</Link><br />We are here to help</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-muted uppercase tracking-widest mb-3">Connect with us</p>
                      <div className="flex items-center gap-3">
                        <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all duration-300">
                          <X size={14} className="text-muted" />
                        </a>
                        <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all duration-300">
                          <Mail size={14} className="text-muted" />
                        </a>
                        <a href="#" className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center hover:bg-primary/20 hover:border-primary/30 transition-all duration-300">
                          <Globe size={14} className="text-muted" />
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <div className="lg:col-span-3">
              <h3 className="font-heading text-2xl md:text-3xl font-bold mb-8 tracking-tight">Frequently Asked Questions</h3>
              <div className="space-y-3 stagger-children">
                <FAQItem
                  question="Is NexTradeX a regulated platform?"
                  answer="NexTradeX operates as a paper trading simulation platform for educational purposes. All trades are simulated and no real assets are involved."
                />
                <FAQItem
                  question="Do I need crypto to trade on NexTradeX?"
                  answer="No. NexTradeX provides simulated wallets with virtual balances. You can start trading immediately after creating an account without any deposits."
                />
                <FAQItem
                  question="What trading instruments are available?"
                  answer="NexTradeX supports spot trading, leveraged futures with customizable leverage, and options contracts (calls and puts) with configurable strike prices and expiry dates."
                />
                <FAQItem
                  question="How does the real-time pricing work?"
                  answer="Our backend price engine generates realistic market data streamed via WebSocket connections, providing live price updates across all supported trading pairs."
                />
              </div>
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
        className={`overflow-hidden transition-all duration-300 ease-spring ${
          open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 text-sm text-muted leading-relaxed border-t border-white/[0.04] pt-4">
          {answer}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */
function Footer() {
  const linkClass = "text-sm text-muted hover:text-primary transition-colors duration-200 block py-1";
  return (
    <footer className="relative z-10 border-t border-white/[0.06] mt-12">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <span className="font-heading font-bold text-lg tracking-tight">
                NexTrade<span className="text-primary">X</span>
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-[220px]">
              NexTradeX is a paper trading simulation platform for educational purposes. No real assets are traded.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white mb-4">Company</h4>
            <nav className="space-y-0.5">
              <Link to="/" className={linkClass}>About Us</Link>
              <Link to="/" className={linkClass}>Terms of Service</Link>
              <Link to="/" className={linkClass}>Privacy Policy</Link>
              <Link to="/" className={linkClass}>Careers</Link>
            </nav>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white mb-4">Information</h4>
            <nav className="space-y-0.5">
              <Link to="/" className={linkClass}>Contract Specifications</Link>
              <Link to="/" className={linkClass}>Trading Fees</Link>
              <Link to="/" className={linkClass}>Settlement Prices</Link>
              <Link to="/" className={linkClass}>Bug Bounty</Link>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white mb-4">Resources & Support</h4>
            <nav className="space-y-0.5">
              <Link to="/" className={linkClass}>API Docs</Link>
              <Link to="/" className={linkClass}>Support Center</Link>
              <Link to="/" className={linkClass}>User Guide</Link>
              <Link to="/" className={linkClass}>Referral Program</Link>
              <Link to="/" className={linkClass}>Demo Trading</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-heading text-sm font-semibold text-white mb-4">Socials</h4>
            <nav className="space-y-4">
              <a href="https://x.com/AdityaKalb4818" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors duration-200">
                <img src={xIcon} alt="X" className="w-5 h-5 object-contain filter grayscale hover:grayscale-0 transition-all" /> <span>X (Twitter)</span>
              </a>
              <a href="https://www.linkedin.com/in/aditya-kalburgi-080b5b267/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors duration-200">
                <img src={linkedInIcon} alt="LinkedIn" className="w-5 h-5 object-contain filter grayscale hover:grayscale-0 transition-all" /> <span>LinkedIn</span>
              </a>
              <a href="mailto:contact@nextradex.sim" className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors duration-200">
                <img src={gmailIcon} alt="Email" className="w-5 h-5 object-contain filter grayscale hover:grayscale-0 transition-all" /> <span>Email</span>
              </a>
              <a href="https://github.com/aditykalburgi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors duration-200">
                <img src={githubIcon} alt="GitHub" className="w-5 h-5 object-contain filter grayscale hover:grayscale-0 transition-all" /> <span>GitHub</span>
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
      className={`nav-link hover:text-primary transition-colors duration-200 ${
        isActive ? "text-primary active" : ""
      }`}
    >
      {children}
    </Link>
  );
}

function TradeDropdown() {
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
          <div className="glass-panel rounded-xl shadow-elevation-lg py-2 min-w-[160px] animate-slide-down">
            <Link
              to="/trade/spot"
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/[0.04] hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Spot
            </Link>
            <Link
              to="/trade/futures"
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/[0.04] hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              Futures
            </Link>
            <Link
              to="/trade/options"
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/[0.04] hover:text-primary transition-colors"
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/[0.07] blur-[150px] rounded-full pointer-events-none animate-drift" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-secondary/[0.07] blur-[180px] rounded-full pointer-events-none animate-drift" style={{ animationDelay: "-10s" }} />
      <div className="fixed top-1/2 left-0 w-[400px] h-[400px] bg-tertiary/[0.03] blur-[120px] rounded-full pointer-events-none animate-drift" style={{ animationDelay: "-5s" }} />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-background/80 border-b border-white/[0.06]">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center">
            <Link to="/" className="font-heading font-bold text-xl tracking-tight hover:opacity-90 transition-opacity">
              NexTrade<span className="text-primary">X</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-mono text-sm text-muted">
            <TradeDropdown />
            <NavLink to="/markets">Markets</NavLink>
            <NavLink to="/wallets">Wallets</NavLink>
            <NavLink to="/orders">Orders</NavLink>
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="font-mono text-xs text-white hidden sm:inline">{user?.username}</span>
                  <ChevronDown size={14} className={`text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full pt-2 z-50 animate-fade-in-fast">
                    <div className="glass-panel rounded-xl shadow-elevation-lg py-2 min-w-[180px] animate-slide-down">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/[0.04] hover:text-primary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} />
                        Profile
                      </Link>
                      <Link
                        to="/wallets"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/[0.04] hover:text-primary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Layers size={16} />
                        Wallets
                      </Link>
                      <div className="border-t border-white/[0.06] my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left hover:bg-white/[0.04] hover:text-accent-red transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" className="hidden sm:inline-flex font-mono text-xs" asChild>
                  <Link to="/auth">Log In</Link>
                </Button>
                <Button className="hidden sm:inline-flex text-xs" asChild>
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.06] animate-slide-down">
            <div className="px-6 py-4 space-y-1 font-mono text-sm">
              <Link to="/trade/spot" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Spot Trading</Link>
              <Link to="/trade/futures" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Futures Trading</Link>
              <Link to="/trade/options" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Options Trading</Link>
              <div className="glow-line my-3" />
              <Link to="/markets" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Markets</Link>
              <Link to="/wallets" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Wallets</Link>
              <Link to="/orders" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
              {isLoggedIn ? (
                <>
                  <div className="glow-line my-3" />
                  <Link to="/profile" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-accent-red transition-colors w-full text-left">Logout</button>
                </>
              ) : (
                <>
                  <div className="glow-line my-3" />
                  <Link to="/auth" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/trade/spot" element={<SpotTradingPage />} />
          <Route path="/trade/futures" element={<FuturesTradingPage />} />
          <Route path="/trade/options" element={<OptionsTradingPage />} />
          <Route path="/wallets" element={<WalletsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
