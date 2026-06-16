import React, { useEffect, useState, useMemo } from "react";
import { fetchAllPrices, fetchWallets, fetchUserProfile } from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import DashboardSkeleton from "../components/DashboardSkeleton";
import EmptyState from "../components/EmptyState";
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
  DollarSign,
  Package,
  Layers
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
    return wallets
      .filter(w => w.walletType === "SPOT" || Number(w.balance) > 0)
      .map(w => {
        let name = "Tether";
        let symbol = "USDT";
        let icon = "https://cryptologos.cc/logos/tether-usdt-logo.png";
        if (w.walletType === "FUTURES") {
          name = "Futures USDT Wallet";
          symbol = "USDT (Futures)";
        } else if (w.walletType === "MARGIN") {
          name = "Margin USDT Wallet";
          symbol = "USDT (Margin)";
        } else if (w.walletType === "OPTIONS") {
          name = "Options USDT Wallet";
          symbol = "USDT (Options)";
        }
        const bal = Number(w.balance || 0);
        return {
          symbol,
          name,
          amount: bal,
          costUSD: bal,
          priceINR: bal * 83,
          change: 0.00,
          icon,
          walletType: w.walletType
        };
      });
  }, [wallets]);

  const hotList = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(b.volume24h || 0) - Number(a.volume24h || 0))
      .slice(0, 5);
  }, [prices]);

  const newListingList = useMemo(() => {
    const newSymbols = ["SOLUSDT", "OPUSDT", "ARBUSDT", "SUIUSDT", "TIAUSDT"];
    return prices.filter(p => newSymbols.includes(p.symbol));
  }, [prices]);

  const favoriteList = useMemo(() => {
    try {
      const stored = localStorage.getItem("nextradex_favorites");
      if (stored) {
        const favSymbols = JSON.parse(stored);
        if (Array.isArray(favSymbols) && favSymbols.length > 0) {
          return prices.filter(p => favSymbols.includes(p.symbol));
        }
      }
    } catch (e) {
      console.error(e);
    }
    const defaultFavs = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
    return prices.filter(p => defaultFavs.includes(p.symbol));
  }, [prices]);

  const topGainersList = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(b.percentChange24h || 0) - Number(a.percentChange24h || 0))
      .slice(0, 5);
  }, [prices]);

  const getCryptoIcon = (symbol) => {
    const base = (symbol?.endsWith("USDT") ? symbol.slice(0, -4) : symbol)?.toUpperCase();
    const mapper = {
      BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg",
      ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
      BNB: "https://cryptologos.cc/logos/bnb-bnb-logo.svg",
      SOL: "https://cryptologos.cc/logos/solana-sol-logo.svg",
      LTC: "https://cryptologos.cc/logos/litecoin-ltc-logo.svg",
      LINK: "https://cryptologos.cc/logos/chainlink-link-logo.svg",
      XRP: "https://cryptologos.cc/logos/xrp-xrp-logo.svg",
      ADA: "https://cryptologos.cc/logos/cardano-ada-logo.svg",
      DOGE: "https://cryptologos.cc/logos/dogecoin-doge-logo.svg",
      DOT: "https://cryptologos.cc/logos/polkadot-new-dot-logo.svg"
    };
    return mapper[base] || `https://cryptologos.cc/logos/${base?.toLowerCase()}-${base?.toLowerCase()}-logo.svg`;
  };

  const renderMarketTable = (list) => {
    if (!list || list.length === 0) {
      return (
        <EmptyState
          icon={Layers}
          title={`No ${activeSubTab} Items`}
          description={`No assets match this category right now.`}
          actionLabel="Explore Markets"
          action={() => window.location.href = "/markets"}
        />
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-transparent text-[10px] font-bold text-muted uppercase font-mono bg-background/10">
              <th className="py-4 px-6">Coin</th>
              <th className="py-4 px-6 text-right">Last Price</th>
              <th className="py-4 px-6 text-right">Change (24h)</th>
              <th className="py-4 px-6 text-right">24h Volume</th>
              <th className="py-4 px-6 text-center w-24">Trade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline-on-dark font-mono text-xs">
            {list.map((coin, index) => {
              const isProfit = Number(coin.percentChange24h) >= 0;
              const symbolBase = coin.symbol.replace("USDT", "");
              return (
                <tr key={index} className="hover:bg-background/25 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-background flex items-center justify-center p-0.5">
                        <img 
                          src={getCryptoIcon(coin.symbol)} 
                          alt={coin.symbol} 
                          className="w-full h-full object-contain" 
                          onError={(e) => { e.target.src = "https://cryptologos.cc/logos/tether-usdt-logo.png"; }} 
                        />
                      </div>
                      <div>
                        <span className="text-foreground font-bold block">{coin.symbol}</span>
                        <span className="text-[10px] text-muted font-sans font-semibold">{symbolBase} / USDT</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-semibold">
                    <span className="text-foreground block">{formatCurrency(coin.currentPrice)}</span>
                  </td>
                  <td className={`py-4 px-6 text-right font-bold text-sm ${isProfit ? "text-trading-up" : "text-trading-down"}`}>
                    {formatPercent(coin.percentChange24h)}
                  </td>
                  <td className="py-4 px-6 text-right text-muted">
                    {Number(coin.volume24h || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <Link
                      to={`/trade/spot?symbol=${coin.symbol}`}
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
    );
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLLAPSIBLE ACCORDION SIDEBAR NAV */}
          <div className="lg:col-span-3 space-y-2 bg-background border border-transparent rounded-2xl p-4 font-sans text-sm select-none">

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
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-background text-foreground hover:text-foreground transition-all"
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
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-background text-foreground hover:text-foreground transition-all"
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
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background text-foreground hover:text-foreground transition-all"
            >
              <Users size={18} className="text-muted" />
              <span className="font-semibold">Referral</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background text-foreground hover:text-foreground transition-all"
            >
              <User size={18} className="text-muted" />
              <span className="font-semibold">Account</span>
            </Link>

            <Link
              to="/sub-accounts"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background text-foreground hover:text-foreground transition-all"
            >
              <Users size={18} className="text-muted" />
              <span className="font-semibold">Sub Accounts</span>
            </Link>


          </div>

          {/* MAIN PREMIUM BINANCE DASHBOARD PANEL */}
          <div className="lg:col-span-9 space-y-6">

            {/* USER IDENTITY HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background border border-transparent rounded-2xl p-6 shadow-elevation-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center border border-primary/20 overflow-hidden relative shadow-glow-primary">
                  <User size={24} className="text-on-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground font-heading flex items-center gap-2">
                    {user?.username || "Trader"}
                    <span className="text-[10px] font-normal text-primary border border-primary/30 px-2 py-0.5 rounded font-mono uppercase">{user?.role || "USER"}</span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted font-mono mt-1">
                    <span>UID: <span className="text-foreground font-semibold">{user?.id || "—"}</span></span>
                    <span>Email: <span className="text-foreground font-semibold">{user?.email || "—"}</span></span>
                    <span>Status: <span className={`font-semibold uppercase ${user?.active ? "text-trading-up" : "text-trading-down"}`}>{user?.active ? "Active" : "Inactive"}</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* ESTIMATED TOTAL VALUE */}
            <div className="relative overflow-hidden bg-background border border-transparent rounded-2xl p-6 shadow-elevation-lg flex flex-col md:flex-row md:items-center justify-between gap-6">

              <div className="space-y-4 relative z-10 flex-1">
                <div className="flex items-center gap-2 text-muted font-mono text-[10px] uppercase">
                  <span>Est. Total Value</span>
                  <button onClick={() => setShowBalance(!showBalance)} className="hover:text-foreground transition-colors">
                    {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-3xl font-extrabold text-foreground font-mono flex items-baseline gap-2">
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
                <Button className="font-mono text-xs font-bold uppercase py-2 px-5 rounded-2xl shadow-glow-primary" asChild>
                  <Link to="/wallets">Deposit</Link>
                </Button>
              </div>
            </div>

            {/* MARKETS / HOLDINGS TABLE GRID */}
            <Card className="bg-background border border-transparent rounded-2xl shadow-elevation-md overflow-hidden" aria-live="polite">
              {/* Binance Tab filter bar */}
              <div className="bg-background/20 border-b border-transparent px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6 font-heading text-xs font-bold uppercase select-none">
                  {["Holding", "Hot", "New Listing", "Favorite", "Top Gainers"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`pb-1 relative transition-colors ${activeSubTab === tab ? "text-primary" : "text-muted hover:text-foreground"}`}
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
                  holdingsList.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-transparent text-[10px] font-bold text-muted uppercase font-mono bg-background/10">
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
                              <tr key={index} className="hover:bg-background/25 transition-colors">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full overflow-hidden bg-background flex items-center justify-center p-0.5">
                                      <img src={coin.icon} alt={coin.symbol} className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://cryptologos.cc/logos/tether-usdt-logo.png"; }} />
                                    </div>
                                    <div>
                                      <span className="text-foreground font-bold block">{coin.symbol}</span>
                                      <span className="text-[10px] text-muted font-sans font-semibold">{coin.name}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-right font-semibold">
                                  <span className="text-foreground block">{coin.amount.toFixed(8)}</span>
                                  <span className="text-[10px] text-muted">≈ ${coin.costUSD.toLocaleString()}</span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <span className="text-foreground block">₹{coin.priceINR.toLocaleString()}</span>
                                  <span className="text-[10px] text-muted">≈ ${(coin.priceINR / 83).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                </td>
                                <td className={`py-4 px-6 text-right font-bold text-sm ${isProfit ? "text-trading-up" : "text-trading-down"}`}>
                                  {isProfit ? "+" : ""}{coin.change}%
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <Link
                                    to={coin.walletType ? `/trade/${coin.walletType.toLowerCase()}` : "/trade/spot"}
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
                    <EmptyState
                      icon={Wallet}
                      title="No Holdings Yet"
                      description="Start trading to build your portfolio. Make your first deposit and explore the markets."
                      actionLabel="Go to Markets"
                      action={() => window.location.href = "/markets"}
                    />
                  )
                ) : activeSubTab === "Hot" ? (
                  renderMarketTable(hotList)
                ) : activeSubTab === "New Listing" ? (
                  renderMarketTable(newListingList)
                ) : activeSubTab === "Favorite" ? (
                  renderMarketTable(favoriteList)
                ) : activeSubTab === "Top Gainers" ? (
                  renderMarketTable(topGainersList)
                ) : (
                  <EmptyState
                    icon={Layers}
                    title={`No ${activeSubTab} Items`}
                    description={`You're not tracking any ${activeSubTab.toLowerCase()} assets yet.`}
                    actionLabel="Explore Markets"
                    action={() => window.location.href = "/markets"}
                  />
                )}
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </PageTransition>
  );
}
