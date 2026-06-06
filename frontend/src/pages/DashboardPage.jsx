import React, { useEffect, useState, useMemo } from "react";
import { fetchAllPrices, fetchWallets, fetchUserProfile } from "../api";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { formatCurrency } from "../lib/utils";
import {
  Wallet,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRightLeft,
  PlusCircle,
  CandlestickChart,
  User,
  Activity
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

  // ── Derived account metrics (Binance-style overview) ───────────────────────
  const totalUnrealizedPnL = useMemo(() => {
    return wallets.reduce((sum, w) => sum + Number(w.unrealizedPnL || 0), 0);
  }, [wallets]);

  const totalAvailable = useMemo(() => {
    return wallets.reduce((sum, w) => sum + Number(w.availableBalance ?? w.balance ?? 0), 0);
  }, [wallets]);

  const openPositionsCount = useMemo(() => {
    return wallets.filter(w => Math.abs(Number(w.unrealizedPnL || 0)) > 0).length;
  }, [wallets]);

  const pnlPositive = totalUnrealizedPnL >= 0;

  const walletBreakdown = useMemo(() => {
    const order = ["SPOT", "MARGIN", "FUTURES", "OPTIONS", "FUNDING"];
    const colors = {
      SPOT: "#fcd535",
      MARGIN: "#02c076",
      FUTURES: "#3bc1eb",
      OPTIONS: "#a370f7",
      FUNDING: "#f6465d"
    };
    const map = wallets.reduce((acc, w) => {
      acc[w.walletType] = w;
      return acc;
    }, {});
    return order.map((type) => {
      const w = map[type];
      const bal = w ? Number(w.balance || 0) : 0;
      const pct = totalUSDEquity > 0 ? (bal / totalUSDEquity) * 100 : 0;
      return { type, balance: bal, pct, color: colors[type] || "#ffffff", present: !!w };
    });
  }, [wallets, totalUSDEquity]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        <div className="h-10 bg-surface-card-dark rounded-xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 bg-surface-card-dark rounded-xl" />
          <div className="h-28 bg-surface-card-dark rounded-xl" />
          <div className="h-28 bg-surface-card-dark rounded-xl" />
          <div className="h-28 bg-surface-card-dark rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-64 bg-surface-card-dark rounded-xl lg:col-span-2" />
          <div className="h-64 bg-surface-card-dark rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="w-full bg-canvas-dark text-white min-h-screen font-sans py-4">
        <div className="max-w-7xl mx-auto px-4 space-y-4">

          {/* ── HEADER: identity + equity + quick actions ───────────────── */}
          <div className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center border border-primary/20 shadow-glow-primary flex-shrink-0">
                <User size={22} className="text-on-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-extrabold font-heading tracking-tight text-white">
                    {user?.username || "Trader"}
                  </h1>
                  <span className="text-[9px] font-mono font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">Regular</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted font-mono mt-0.5">
                  <span>UID: <span className="text-body font-semibold">{user?.id || "—"}</span></span>
                  <span className="border-l border-hairline-on-dark pl-3">Account Overview</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button className="font-mono text-xs font-bold uppercase py-2.5 px-4 rounded-lg shadow-glow-primary flex items-center gap-1.5" asChild>
                <Link to="/wallets"><PlusCircle size={14} /> Deposit</Link>
              </Button>
              <Button variant="outline" className="font-mono text-xs font-bold uppercase py-2.5 px-4 rounded-lg flex items-center gap-1.5" asChild>
                <Link to="/trade/spot"><CandlestickChart size={14} /> Trade</Link>
              </Button>
              <Button variant="outline" className="font-mono text-xs font-bold uppercase py-2.5 px-4 rounded-lg flex items-center gap-1.5" asChild>
                <Link to="/wallets"><ArrowRightLeft size={14} /> Transfer</Link>
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-trading-down/10 border border-trading-down/20">
              <p className="text-trading-down text-xs font-mono">{error}</p>
            </div>
          )}

          {/* ── SUMMARY STAT CARDS ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Equity */}
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted font-mono text-[10px] uppercase tracking-widest">
                  <Wallet size={13} className="text-primary" />
                  <span>Total Equity</span>
                  <button onClick={() => setShowBalance(!showBalance)} className="ml-auto hover:text-white transition-colors">
                    {showBalance ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                </div>
                <h3 className="text-2xl font-extrabold font-mono text-white mt-2 tracking-tight">
                  {showBalance ? formatCurrency(totalUSDEquity) : "********"}
                </h3>
                <p className="text-[10px] font-mono text-muted mt-1">
                  {showBalance ? `≈ ₹${totalINREquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "≈ ₹********"}
                </p>
              </CardContent>
            </Card>

            {/* Available Balance */}
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted font-mono text-[10px] uppercase tracking-widest">
                  <Layers size={13} className="text-[#3bc1eb]" />
                  <span>Available Balance</span>
                </div>
                <h3 className="text-2xl font-extrabold font-mono text-white mt-2 tracking-tight">
                  {showBalance ? formatCurrency(totalAvailable) : "********"}
                </h3>
                <p className="text-[10px] font-mono text-muted mt-1">Ready to trade across wallets</p>
              </CardContent>
            </Card>

            {/* Today's PnL */}
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted font-mono text-[10px] uppercase tracking-widest">
                  {pnlPositive ? <TrendingUp size={13} className="text-trading-up" /> : <TrendingDown size={13} className="text-trading-down" />}
                  <span>Unrealized PnL</span>
                </div>
                <h3 className={`text-2xl font-extrabold font-mono mt-2 tracking-tight ${pnlPositive ? "text-trading-up" : "text-trading-down"}`}>
                  {showBalance ? `${pnlPositive ? "+" : ""}${formatCurrency(totalUnrealizedPnL)}` : "********"}
                </h3>
                <p className="text-[10px] font-mono text-muted mt-1">Across all open positions</p>
              </CardContent>
            </Card>

            {/* Open Positions */}
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted font-mono text-[10px] uppercase tracking-widest">
                  <Activity size={13} className="text-primary" />
                  <span>Open Positions</span>
                </div>
                <h3 className="text-2xl font-extrabold font-mono text-white mt-2 tracking-tight">
                  {openPositionsCount}
                </h3>
                <Link to="/trade/futures" className="text-[10px] font-mono text-primary hover:underline mt-1 inline-block">
                  View positions &gt;
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* ── MAIN GRID: holdings table + allocation overview ─────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

            {/* Holdings / Markets Table */}
            <Card className="lg:col-span-2 bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md overflow-hidden">
              <div className="bg-canvas-dark/30 border-b border-hairline-on-dark px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-5 font-heading text-[11px] font-bold tracking-wider uppercase select-none">
                  {["Holding", "Hot", "New Listing", "Favorite", "Top Gainers"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`pb-1 relative transition-colors ${activeSubTab === tab ? "text-primary" : "text-muted hover:text-white"}`}
                    >
                      {tab}
                      {activeSubTab === tab && (
                        <span className="absolute bottom-[-14px] left-0 right-0 h-[2px] bg-primary rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
                <Link to="/markets" className="text-[11px] font-bold text-primary hover:underline">More &gt;</Link>
              </div>

              <CardContent className="p-0">
                {activeSubTab === "Holding" ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-hairline-on-dark text-[10px] font-bold text-muted uppercase tracking-wider font-mono bg-canvas-dark/10">
                          <th className="py-3.5 px-5">Coin</th>
                          <th className="py-3.5 px-5 text-right">Amount</th>
                          <th className="py-3.5 px-5 text-right">Asset Price / Cost</th>
                          <th className="py-3.5 px-5 text-right">Change (24h)</th>
                          <th className="py-3.5 px-5 text-center w-24">Trade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline-on-dark font-mono text-xs">
                        {holdingsList.map((coin, index) => {
                          const isProfit = coin.change >= 0;
                          return (
                            <tr key={index} className="hover:bg-canvas-dark/25 transition-colors">
                              <td className="py-3.5 px-5">
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
                              <td className="py-3.5 px-5 text-right font-semibold">
                                <span className="text-white block">{showBalance ? coin.amount.toFixed(8) : "****"}</span>
                                <span className="text-[10px] text-muted">{showBalance ? `≈ $${coin.costUSD.toLocaleString()}` : "≈ ****"}</span>
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                <span className="text-white block">₹{coin.priceINR.toLocaleString()}</span>
                                <span className="text-[10px] text-muted">≈ ${(coin.priceINR / 83).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                              </td>
                              <td className={`py-3.5 px-5 text-right font-bold text-sm ${isProfit ? "text-trading-up" : "text-trading-down"}`}>
                                {isProfit ? "+" : ""}{coin.change}%
                              </td>
                              <td className="py-3.5 px-5 text-center">
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

            {/* Asset Allocation Overview */}
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md overflow-hidden">
              <div className="bg-canvas-dark/30 border-b border-hairline-on-dark px-5 py-3.5 flex items-center justify-between">
                <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-white">Asset Allocation</span>
                <Link to="/wallets" className="text-[11px] font-bold text-primary hover:underline">Wallets &gt;</Link>
              </div>
              <CardContent className="p-5 space-y-4">
                {walletBreakdown.map((seg) => (
                  <div key={seg.type}>
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: seg.color }} />
                        <span className="text-white font-bold uppercase">{seg.type}</span>
                      </div>
                      <span className="text-muted font-semibold">
                        {showBalance ? formatCurrency(seg.balance) : "****"}
                        <span className="text-muted-strong ml-1.5">{seg.pct.toFixed(1)}%</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-canvas-dark overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, seg.pct)}%`, backgroundColor: seg.color }}
                      />
                    </div>
                  </div>
                ))}

                <div className="border-t border-hairline-on-dark pt-4 flex items-center justify-between font-mono">
                  <span className="text-[10px] text-muted uppercase tracking-wider">Total Equity</span>
                  <span className="text-sm font-extrabold text-white">
                    {showBalance ? formatCurrency(totalUSDEquity) : "********"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── QUICK NAVIGATION (preserves assetsOpen / ordersOpen state) ─ */}
          <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md overflow-hidden">
            <div className="bg-canvas-dark/30 border-b border-hairline-on-dark px-5 py-3.5">
              <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-white">Quick Access</span>
            </div>
            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assets group */}
              <div className="border border-hairline-on-dark rounded-lg bg-canvas-dark/20 overflow-hidden">
                <button
                  onClick={() => setAssetsOpen(!assetsOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet size={16} className="text-primary" />
                    <span className="font-heading text-xs font-bold uppercase tracking-wider text-white">Assets</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted">{assetsOpen ? "Hide" : "Show"}</span>
                </button>
                {assetsOpen && (
                  <div className="px-4 pb-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono text-muted animate-slide-down">
                    <Link to="/wallets" className="py-1.5 hover:text-primary transition-colors">Overview</Link>
                    <Link to="/trade/spot" className="py-1.5 hover:text-primary transition-colors">Spot</Link>
                    <Link to="/trade/margin" className="py-1.5 hover:text-primary transition-colors">Margin</Link>
                    <Link to="/trade/futures" className="py-1.5 hover:text-primary transition-colors">Futures</Link>
                    <Link to="/trade/options" className="py-1.5 hover:text-primary transition-colors">Options</Link>
                    <Link to="/earn" className="py-1.5 hover:text-primary transition-colors">Earn</Link>
                    <Link to="/funding" className="py-1.5 hover:text-primary transition-colors">Funding</Link>
                  </div>
                )}
              </div>

              {/* Orders group */}
              <div className="border border-hairline-on-dark rounded-lg bg-canvas-dark/20 overflow-hidden">
                <button
                  onClick={() => setOrdersOpen(!ordersOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity size={16} className="text-[#3bc1eb]" />
                    <span className="font-heading text-xs font-bold uppercase tracking-wider text-white">Orders</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted">{ordersOpen ? "Hide" : "Show"}</span>
                </button>
                {ordersOpen && (
                  <div className="px-4 pb-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono text-muted animate-slide-down">
                    <Link to="/orders" className="py-1.5 hover:text-primary transition-colors">Spot Orders</Link>
                    <Link to="/orders" className="py-1.5 hover:text-primary transition-colors">Margin Orders</Link>
                    <Link to="/orders" className="py-1.5 hover:text-primary transition-colors">Futures Orders</Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </PageTransition>
  );
}
