import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Button } from "./components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/ui/Card";
import { Input } from "./components/ui/Input";
import { Zap, Shield, Layers, TrendingUp, Globe, Activity } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import MarketsPage from "./pages/MarketsPage";
import SpotTradingPage from "./pages/SpotTradingPage";
import FuturesTradingPage from "./pages/FuturesTradingPage";
import OptionsTradingPage from "./pages/OptionsTradingPage";
import WalletsPage from "./pages/WalletsPage";
import OrdersPage from "./pages/OrdersPage";

function HomePage() {
  return (
    <main className="relative z-10 w-full max-w-7xl mx-auto px-6">
      {/* HERO SECTION */}
      <section className="py-24 md:py-32 flex flex-col lg:flex-row items-center justify-between gap-16">
        <div className="flex-1 text-center lg:text-left relative z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
            <span className="w-2 h-2 rounded-full bg-tertiary absolute" />
            <span className="font-mono text-xs text-muted tracking-wider uppercase">Live Network V2</span>
          </div>

          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6">
            Trade with <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-secondary via-primary to-tertiary bg-clip-text text-transparent">
              Mathematical Precision
            </span>
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
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
        <div className="flex-1 relative w-full h-[400px] md:h-[500px] flex items-center justify-center animate-float">
          {/* Orbital Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border border-primary/20 animate-spin-slow absolute"
              style={{ borderStyle: "dashed" }}
            />
            <div className="w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full border border-secondary/30 animate-spin-reverse-slow absolute" />
          </div>

          {/* Core Node */}
          <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-[0_0_80px_rgba(247,147,26,0.5)]">
            <Layers size={48} className="text-white opacity-90" />
          </div>

          {/* Floating Stats Glass Cards */}
          <Card variant="glass" className="absolute top-[10%] left-[5%] p-4 w-40 animate-bounce" style={{ animationDuration: "4s" }}>
            <p className="font-mono text-xs text-muted mb-1">24H Volume</p>
            <p className="font-heading text-xl text-white font-semibold">$2.4B</p>
          </Card>

          <Card
            variant="glass"
            className="absolute bottom-[15%] right-[5%] p-4 w-48 animate-bounce"
            style={{ animationDuration: "5s", animationDelay: "1s" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-tertiary/20 flex items-center justify-center">
                <Activity size={16} className="text-tertiary" />
              </div>
              <div>
                <p className="font-mono text-[10px] text-muted leading-tight">Transactions</p>
                <p className="font-heading text-lg text-white font-semibold">1,042/s</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FEATURE CARDS (BLOCKCHAIN LAYOUT) */}
      <section className="py-24 relative z-20">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">Engineered for Alpha</h2>
          <p className="text-muted font-mono tracking-wider uppercase text-sm">Security • Speed • Liquidity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Standard Card 1 */}
          <Card className="group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <Zap size={100} className="text-primary/10 rotate-12" />
            </div>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(247,147,26,0.4)] transition-all">
                <Zap size={24} className="text-primary" />
              </div>
              <CardTitle>Lightning Execution</CardTitle>
              <CardDescription>Sub-millisecond trade settlement powered by our optimized matching engine.</CardDescription>
            </CardHeader>
          </Card>

          {/* Standard Card 2 */}
          <Card className="group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <Shield size={100} className="text-primary/10 -rotate-12" />
            </div>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-secondary/20 border border-secondary/50 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all">
                <Shield size={24} className="text-secondary" />
              </div>
              <CardTitle>Cryptographic Trust</CardTitle>
              <CardDescription>Fully audited smart contracts. Your assets are secured by the underlying network.</CardDescription>
            </CardHeader>
          </Card>

          {/* Standard Card 3 */}
          <Card className="group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <Globe size={100} className="text-primary/10 rotate-6" />
            </div>
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-tertiary/20 border border-tertiary/50 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(255,214,0,0.4)] transition-all">
                <Globe size={24} className="text-tertiary" />
              </div>
              <CardTitle>Global Liquidity</CardTitle>
              <CardDescription>Access aggregated liquidity pools across multiple chains from a single terminal.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* INPUT TERMINAL SHOWCASE */}
      <section className="py-24 border-y border-white/5 relative bg-grid-pattern">
        <div className="max-w-2xl mx-auto">
          <Card
            variant="glass"
            className="w-full relative z-10 border-t border-l border-t-primary border-l-primary !rounded-none"
          >
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary" />
            <CardHeader>
              <CardTitle className="font-mono text-xl text-primary">{">&"}nbsp;_INITIALIZE_TRADE</CardTitle>
              <CardDescription>Enter parameters for algorithmic execution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
                  Asset Pair
                </label>
                <Input placeholder="e.g. BTC/USDC" />
              </div>
              <div>
                <label className="font-mono text-xs text-muted uppercase tracking-widest mb-2 block">
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
        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-body">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-primary">
            <TrendingUp size={18} className="text-white" />
          </div>
          <Link to="/" className="font-heading font-bold text-xl tracking-tight">
            NexTrade<span className="text-primary">X</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 font-mono text-sm text-muted">
          <div className="relative group">
            <Link to="/trade/spot" className="hover:text-primary transition-colors">
              Trade
            </Link>
            <div className="absolute left-0 top-full pt-2 hidden group-hover:block">
              <div className="bg-background border border-white/10 rounded shadow-lg py-2 min-w-[140px]">
                <Link to="/trade/spot" className="block px-4 py-2 hover:bg-white/5 hover:text-primary">Spot</Link>
                <Link to="/trade/futures" className="block px-4 py-2 hover:bg-white/5 hover:text-primary">Futures</Link>
                <Link to="/trade/options" className="block px-4 py-2 hover:bg-white/5 hover:text-primary">Options</Link>
              </div>
            </div>
          </div>
          <Link to="/markets" className="hover:text-primary transition-colors">
            Markets
          </Link>
          <Link to="/wallets" className="hover:text-primary transition-colors">
            Wallets
          </Link>
          <Link to="/orders" className="hover:text-primary transition-colors">
            Orders
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden sm:inline-flex font-mono" asChild>
            <Link to="/auth">Log In</Link>
          </Button>
          <Button asChild>
            <Link to="/wallets">Connect Wallet</Link>
          </Button>
        </div>
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
        </Routes>
      </div>
    </div>
  );
}

export default App;
