import React, { useEffect, useState, useMemo } from "react";
import { fetchAllPrices, fetchWallets, fetchUserProfile } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { SkeletonRow } from "../components/ui/Skeleton";
import { formatCurrency, formatPercent } from "../lib/utils";
import {
  LayoutDashboard,
  Wallet,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Gift,
  Users,
  User,
  Settings,
  Grid,
  FileText,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [prices, setPrices] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBalance, setShowBalance] = useState(true);
  const [assetsOpen, setAssetsOpen] = useState(true);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState("Holding");

  useEffect(() => {
    const load = async () => {
      try {
        const [pricesRes, walletsRes, profileRes] = await Promise.all([
          fetchAllPrices(),
          fetchWallets().catch(() => ({ data: [] })),
          fetchUserProfile().catch(() => null)
        ]);

        setPrices(pricesRes?.data || []);
        setWallets(walletsRes?.data || []);
        if (profileRes?.data) {
          setUser(profileRes.data);
        }
      } catch (e) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalUSDEquity = useMemo(() => {
    return wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);
  }, [wallets]);

  const totalINREquity = useMemo(() => {
    // 1 USD = 83 INR
    return totalUSDEquity * 83;
  }, [totalUSDEquity]);

  const holdingsList = useMemo(() => {
    const spotWallet = wallets.find(w => w.walletType === "SPOT");
    const balance = spotWallet ? Number(spotWallet.balance) : 0;
    return [
      { symbol: "USDT", name: "Tether", amount: balance, costUSD: balance, priceINR: balance * 83, change: 0.00, icon: "https://cryptologos.cc/logos/tether-usdt-logo.png" }
    ];
  }, [wallets]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-6 animate-pulse">
        <div className="h-10 bg-surface-card-dark rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-32 bg-surface-card-dark rounded col-span-3" />
          <div className="h-32 bg-surface-card-dark rounded" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLLAPSIBLE ACCORDION SIDEBAR NAV */}
          <div className="lg:col-span-3 space-y-2 bg-surface-card-dark border border-hairline-on-dark rounded-2xl p-4 font-sans text-sm select-none">

            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-on-primary font-bold transition-all shadow-glow-primary"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>

            {/* Assets Accordion */}
            <div className="space-y-1">
              <button
                onClick={() => setAssetsOpen(!assetsOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/[0.04] text-body hover:text-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <Wallet size={18} className="text-muted" />
                  <span className="font-semibold">Assets</span>
                </div>
                {assetsOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
              </button>

              {assetsOpen && (
                <div className="pl-11 space-y-1 text-xs font-mono text-muted animate-slide-down">
                  <Link to="/wallets" className="block py-2.5 hover:text-primary transition-colors">Overview</Link>
                  <Link to="/trade/spot" className="block py-2.5 hover:text-primary transition-colors">Spot</Link>
                  <Link to="/trade/margin" className="block py-2.5 hover:text-primary transition-colors">Margin</Link>
                  <Link to="/trade/futures" className="block py-2.5 hover:text-primary transition-colors">Futures</Link>
                  <Link to="/trade/options" className="block py-2.5 hover:text-primary transition-colors">Options</Link>
                  <Link to="/earn" className="block py-2.5 hover:text-primary transition-colors">Earn</Link>
                  <Link to="/funding" className="block py-2.5 hover:text-primary transition-colors">Funding</Link>
                </div>
              )}
            </div>

            {/* Orders Accordion */}
            <div className="space-y-1">
              <button
                onClick={() => setOrdersOpen(!ordersOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/[0.04] text-body hover:text-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-muted" />
                  <span className="font-semibold">Orders</span>
                </div>
                {ordersOpen ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
              </button>

              {ordersOpen && (
                <div className="pl-11 space-y-1 text-xs font-mono text-muted animate-slide-down">
                  <Link to="/orders" className="block py-2.5 hover:text-primary transition-colors">Spot Orders</Link>
                  <Link to="/orders" className="block py-2.5 hover:text-primary transition-colors">Margin Orders</Link>
                  <Link to="/orders" className="block py-2.5 hover:text-primary transition-colors">Futures Orders</Link>
                </div>
              )}
            </div>



            <Link
              to="/referral"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.04] text-body hover:text-white transition-all"
            >
              <Users size={18} className="text-muted" />
              <span className="font-semibold">Referral</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.04] text-body hover:text-white transition-all"
            >
              <User size={18} className="text-muted" />
              <span className="font-semibold">Account</span>
            </Link>

            <Link
              to="/sub-accounts"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.04] text-body hover:text-white transition-all"
            >
              <Users size={18} className="text-muted" />
              <span className="font-semibold">Sub Accounts</span>
            </Link>


          </div>

          {/* MAIN PREMIUM BINANCE DASHBOARD PANEL */}
          <div className="lg:col-span-9 space-y-6">

            {/* USER IDENTITY HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card-dark border border-hairline-on-dark rounded-2xl p-6 shadow-elevation-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center border border-primary/20 overflow-hidden relative shadow-glow-primary">
                  <User size={24} className="text-on-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-heading tracking-tight flex items-center gap-2">
                    {user?.username || "CAKE ON TABLE"}
                    <span className="text-[10px] font-normal text-primary border border-primary/30 px-2 py-0.5 rounded font-mono uppercase">Regular User</span>
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-muted font-mono mt-1">
                    <span>UID: <span className="text-body font-semibold">{user?.id || "—"}</span></span>
                    <span>VIP Level: <span className="text-body font-semibold">Regular User</span></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-center border-t md:border-t-0 pt-4 md:pt-0 border-hairline-on-dark font-mono text-xs text-muted">
                <div>
                  <span className="block text-[10px] uppercase">Following</span>
                  <span className="text-sm font-bold text-white">39</span>
                </div>
                <div className="border-l border-hairline-on-dark pl-6">
                  <span className="block text-[10px] uppercase">Followers</span>
                  <span className="text-sm font-bold text-white">44</span>
                </div>
              </div>
            </div>

            {/* ESTIMATED TOTAL VALUE WITH MINI GLOW SPARKLINE */}
            <div className="relative overflow-hidden bg-surface-card-dark border border-hairline-on-dark rounded-2xl p-6 shadow-elevation-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Sparkline glow background */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none z-0">
                <svg className="w-48 h-20 text-primary" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M0 25C15 20 30 28 45 15C60 2 75 18 100 5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M0 25C15 20 30 28 45 15C60 2 75 18 100 5V30H0V25Z"
                    fill="url(#sparkline-grad)"
                    opacity="0.1"
                  />
                  <defs>
                    <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="space-y-4 relative z-10 flex-1">
                <div className="flex items-center gap-2 text-muted font-mono text-[10px] uppercase tracking-wider">
                  <span>Est. Total Value</span>
                  <button onClick={() => setShowBalance(!showBalance)} className="hover:text-white transition-colors">
                    {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2">
                    {showBalance ? totalUSDEquity.toFixed(8) : "********"}
                    <span className="text-base font-normal text-muted">USDT</span>
                  </h3>
                  <p className="text-xs font-mono text-muted">
                    {showBalance ? `≈ ₹${totalINREquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "≈ ₹********"}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-muted">Total Unrealized PnL:</span>
                  <span className={`${wallets.reduce((sum, w) => sum + Number(w.unrealizedPnL || 0), 0) >= 0 ? "text-trading-up" : "text-trading-down"} font-bold flex items-center gap-0.5`}>
                    {wallets.reduce((sum, w) => sum + Number(w.unrealizedPnL || 0), 0) >= 0 ? "+" : ""}${wallets.reduce((sum, w) => sum + Number(w.unrealizedPnL || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap md:flex-col lg:flex-row items-center gap-3 relative z-10">
                <Button className="font-mono text-xs font-bold uppercase py-2 px-5 rounded-lg shadow-glow-primary" asChild>
                  <Link to="/wallets">Deposit</Link>
                </Button>
                <Button variant="outline" className="font-mono text-xs font-bold uppercase py-2 px-5 rounded-lg border-hairline-on-dark text-body hover:bg-white/[0.04]" asChild>
                  <Link to="/wallets">Withdraw</Link>
                </Button>
              </div>
            </div>

            {/* MARKETS / HOLDINGS TABLE GRID */}
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-2xl shadow-elevation-md overflow-hidden">
              {/* Binance Tab filter bar */}
              <div className="bg-canvas-dark/20 border-b border-hairline-on-dark px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 font-heading text-xs font-bold tracking-wider uppercase select-none">
                  {["Holding", "Hot", "New Listing", "Favorite", "Top Gainers"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`pb-1 relative transition-colors ${activeSubTab === tab ? "text-primary" : "text-muted hover:text-white"}`}
                    >
                      {tab}
                      {activeSubTab === tab && (
                        <span className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-primary rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
                <Link to="/markets" className="text-xs font-bold text-primary hover:underline">More &gt;</Link>
              </div>

              <CardContent className="p-0">
                {activeSubTab === "Holding" ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-hairline-on-dark text-[10px] font-bold text-muted uppercase tracking-wider font-mono bg-canvas-dark/10">
                          <th className="py-4 px-6">Coin</th>
                          <th className="py-4 px-6 text-right">Amount</th>
                          <th className="py-4 px-6 text-right">Asset Price / Cost Price</th>
                          <th className="py-4 px-6 text-right">Change (24h)</th>
                          <th className="py-4 px-6 text-center w-24">Trade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline-on-dark font-mono text-xs">
                        {holdingsList.map((coin, index) => {
                          const isProfit = coin.change >= 0;
                          return (
                            <tr key={index} className="hover:bg-canvas-dark/25 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-7 h-7 rounded-full overflow-hidden bg-white/10 flex items-center justify-center p-0.5">
                                    <img src={coin.icon} alt={coin.symbol} className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://cryptologos.cc/logos/tether-usdt-logo.png"; }} />
                                  </div>
                                  <div>
                                    <span className="text-white font-bold block">{coin.symbol}</span>
                                    <span className="text-[10px] text-muted font-sans font-semibold">{coin.name}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-right font-semibold">
                                <span className="text-white block">{coin.amount.toFixed(8)}</span>
                                <span className="text-[10px] text-muted">≈ ${coin.costUSD.toLocaleString()}</span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <span className="text-white block">₹{coin.priceINR.toLocaleString()}</span>
                                <span className="text-[10px] text-muted">≈ ${(coin.priceINR / 83).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                              </td>
                              <td className={`py-4 px-6 text-right font-bold text-sm ${isProfit ? "text-trading-up" : "text-trading-down"}`}>
                                {isProfit ? "+" : ""}{coin.change}%
                              </td>
                              <td className="py-4 px-6 text-center">
                                <Link
                                  to="/trade/spot"
                                  className="text-xs font-bold text-primary hover:underline font-heading uppercase"
                                >
                                  Trade
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center text-muted font-mono text-xs">
                    No items in {activeSubTab} list yet.
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </PageTransition>
  );
}
