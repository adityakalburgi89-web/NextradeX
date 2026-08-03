import React, { useEffect, useState, useMemo } from "react";
import { fetchAllPrices, fetchWallets, fetchUserProfile } from "../api";
import { Card, CardContent } from "../components/ui/Card";
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
  Users,
  User,
  FileText,
  Layers,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [prices, setPrices] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
        console.error("Failed to load dashboard data");
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
    const defaultFavs = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];
    return prices.filter(p => defaultFavs.includes(p.symbol));
  }, [prices]);

  const topGainersList = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(b.percentChange24h || 0) - Number(a.percentChange24h || 0))
      .slice(0, 5);
  }, [prices]);

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
      <div className="table-container-visitors border-none rounded-none">
        <table className="table-visitors">
          <thead>
            <tr>
              <th>Asset</th>
              <th className="text-right">Price</th>
              <th className="text-right">Change (24h)</th>
              <th className="text-right">24h Volume</th>
              <th className="text-center w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((coin, index) => {
              const isProfit = Number(coin.percentChange24h) >= 0;
              const symbolBase = coin.symbol.replace("USDT", "");
              return (
                <tr key={index}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-mist text-carbon font-semibold text-xs flex items-center justify-center">
                        {symbolBase.charAt(0)}
                      </div>
                      <div>
                        <span className="text-carbon font-medium block">{coin.symbol}</span>
                        <span className="text-xs text-ash">{symbolBase} / USDT</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-right font-medium text-carbon">
                    {formatCurrency(coin.currentPrice)}
                  </td>
                  <td className="text-right font-medium">
                    <span className={isProfit ? "delta-positive" : "delta-negative"}>
                      {formatPercent(coin.percentChange24h)}
                    </span>
                  </td>
                  <td className="text-right text-ash text-xs">
                    {Number(coin.volume24h || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-center">
                    <Link
                      to={`/trade/spot?symbol=${coin.symbol}`}
                      className="btn-text-link text-xs"
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
      <div className="max-w-[1200px] mx-auto px-6 py-10 font-openrunde">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT ACCORDION SIDEBAR */}
          <div className="lg:col-span-3 space-y-2 bg-white border border-fog rounded-[16px] p-4 text-sm select-none">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-lavender text-white font-medium shadow-subtle"
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>

            {/* Assets Accordion */}
            <div className="space-y-1">
              <button
                onClick={() => setAssetsOpen(!assetsOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-full hover:bg-mist text-carbon transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Wallet size={16} className="text-ash" />
                  <span className="font-medium">Assets</span>
                </div>
                {assetsOpen ? <ChevronUp size={14} className="text-ash" /> : <ChevronDown size={14} className="text-ash" />}
              </button>

              {assetsOpen && (
                <div className="pl-10 space-y-1 text-xs text-graphite">
                  <Link to="/wallets" className="block py-2 hover:text-carbon transition-colors">Overview</Link>
                  <Link to="/trade/spot" className="block py-2 hover:text-carbon transition-colors">Spot Wallet</Link>
                  <Link to="/trade/margin" className="block py-2 hover:text-carbon transition-colors">Margin Wallet</Link>
                  <Link to="/trade/futures" className="block py-2 hover:text-carbon transition-colors">Futures Wallet</Link>
                </div>
              )}
            </div>

            {/* Orders Accordion */}
            <div className="space-y-1">
              <button
                onClick={() => setOrdersOpen(!ordersOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-full hover:bg-mist text-carbon transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-ash" />
                  <span className="font-medium">Orders</span>
                </div>
                {ordersOpen ? <ChevronUp size={14} className="text-ash" /> : <ChevronDown size={14} className="text-ash" />}
              </button>

              {ordersOpen && (
                <div className="pl-10 space-y-1 text-xs text-graphite">
                  <Link to="/orders" className="block py-2 hover:text-carbon transition-colors">Spot Orders</Link>
                  <Link to="/orders" className="block py-2 hover:text-carbon transition-colors">Futures Orders</Link>
                </div>
              )}
            </div>

            <Link
              to="/referral"
              className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-mist text-carbon transition-colors"
            >
              <Users size={16} className="text-ash" />
              <span className="font-medium">Referral</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2.5 rounded-full hover:bg-mist text-carbon transition-colors"
            >
              <User size={16} className="text-ash" />
              <span className="font-medium">Account Profile</span>
            </Link>
          </div>

          {/* MAIN DASHBOARD CONTENT */}
          <div className="lg:col-span-9 space-y-6">

            {/* USER IDENTITY HEADER SECTION */}
            <div className="dashboard-panel-visitors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-lavender text-white flex items-center justify-center font-bold text-base shadow-subtle">
                  {user?.username?.charAt(0)?.toUpperCase() || "T"}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-carbon tracking-[-0.31px] flex items-center gap-2">
                    {user?.username || "Trader"}
                    <span className="text-xs font-medium bg-mist text-graphite border border-fog px-2.5 py-0.5 rounded-full">
                      {user?.role || "USER"}
                    </span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ash mt-1">
                    <span>UID: <span className="text-carbon font-medium">{user?.id || "—"}</span></span>
                    <span>Email: <span className="text-carbon font-medium">{user?.email || "—"}</span></span>
                    <span>Engine: <span className="text-mint font-medium">Active (125x)</span></span>
                  </div>
                </div>
              </div>

              <Link to="/wallets" className="btn-primary-lavender">
                <span>Manage Capital</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* ESTIMATED TOTAL VALUE & METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="metric-card-visitors">
                <div className="flex items-center justify-between text-xs text-ash mb-1">
                  <span>Est. Total Equity</span>
                  <button onClick={() => setShowBalance(!showBalance)} className="hover:text-carbon">
                    {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                <div className="font-openrunde font-semibold text-2xl text-carbon tracking-[-0.61px]">
                  {showBalance ? `$${totalUSDEquity.toFixed(2)}` : "********"}
                </div>
                <p className="text-xs text-ash mt-1">
                  {showBalance ? `≈ ₹${totalINREquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "≈ ₹********"}
                </p>
              </div>

              <div className="metric-card-visitors">
                <div className="flex items-center justify-between text-xs text-ash mb-1">
                  <span>Unrealized PnL</span>
                  <span className="delta-positive">+8.4%</span>
                </div>
                <div className="font-openrunde font-semibold text-2xl text-carbon tracking-[-0.61px]">
                  +$1,240.00
                </div>
                <p className="text-xs text-ash mt-1">Active Positions PnL</p>
              </div>

              <div className="metric-card-visitors">
                <div className="flex items-center justify-between text-xs text-ash mb-1">
                  <span>Margin Ratio</span>
                  <span className="delta-positive">Safe</span>
                </div>
                <div className="font-openrunde font-semibold text-2xl text-carbon tracking-[-0.61px]">
                  12.4%
                </div>
                <p className="text-xs text-ash mt-1">125x Leverage Cap</p>
              </div>
            </div>

            {/* MARKETS / HOLDINGS TABLE GRID */}
            <div className="table-container-visitors">
              {/* Tab Bar */}
              <div className="tab-bar-visitors px-6 pt-2">
                {["Holding", "Hot", "New Listing", "Favorite", "Top Gainers"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`tab-item-visitors ${activeSubTab === tab ? "active" : ""}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-0">
                {activeSubTab === "Holding" ? (
                  holdingsList.length > 0 ? (
                    <table className="table-visitors">
                      <thead>
                        <tr>
                          <th>Asset</th>
                          <th className="text-right">Balance</th>
                          <th className="text-right">Estimated Value (INR)</th>
                          <th className="text-right">Status</th>
                          <th className="text-center w-24">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdingsList.map((coin, index) => (
                          <tr key={index}>
                            <td>
                              <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-lavender text-white font-semibold text-xs flex items-center justify-center">
                                  ₮
                                </div>
                                <div>
                                  <span className="text-carbon font-medium block">{coin.symbol}</span>
                                  <span className="text-xs text-ash">{coin.name}</span>
                                </div>
                              </div>
                            </td>
                            <td className="text-right font-medium text-carbon">
                              {coin.amount.toFixed(2)} USDT
                            </td>
                            <td className="text-right font-medium text-carbon">
                              ₹{coin.priceINR.toLocaleString()}
                            </td>
                            <td className="text-right font-medium">
                              <span className="delta-positive">Active</span>
                            </td>
                            <td className="text-center">
                              <Link
                                to={coin.walletType ? `/trade/${coin.walletType.toLowerCase()}` : "/trade/spot"}
                                className="btn-text-link text-xs"
                              >
                                Trade
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
              </div>
            </div>

          </div>

        </div>
      </div>
    </PageTransition>
  );
}
