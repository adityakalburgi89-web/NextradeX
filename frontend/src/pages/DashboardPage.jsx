import React, { useEffect, useState, useMemo } from "react";
import { 
  fetchAllPrices, 
  fetchWallets, 
  fetchUserProfile, 
  fetchOrderHistory, 
  fetchWatchlist,
  toggleWatchlist 
} from "../api";
import { PageTransition } from "../components/ui/PageTransition";
import DashboardSkeleton from "../components/DashboardSkeleton";
import EmptyState from "../components/EmptyState";
import { formatCurrency, formatPercent } from "../lib/utils";
import {
  Wallet,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronDown,
  Layers,
  ArrowRight,
  Star,
  Download,
  Upload,
  Repeat,
  Send
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Local Crypto Icons
import btcIcon from "../assets/Icons/btc.svg";
import ethIcon from "../assets/Icons/eth.svg";
import solIcon from "../assets/Icons/sol.svg";
import bnbIcon from "../assets/Icons/bnb.svg";
import dotIcon from "../assets/Icons/dot.svg";
import linkIcon from "../assets/Icons/link.svg";
import ltcIcon from "../assets/Icons/ltc.svg";
import arbIcon from "../assets/Icons/arb.svg";
import opIcon from "../assets/Icons/op.svg";
import suiIcon from "../assets/Icons/sui.svg";
import tiaIcon from "../assets/Icons/tia.svg";
import seiIcon from "../assets/Icons/sei.svg";

import UniversalCoinIcon from "../lib/coinIcons";
const CoinIcon = UniversalCoinIcon;

// Helper SVG Sparkline Component
function Sparkline({ data, isPositive = true, width = 90, height = 30 }) {
  if (!data || data.length < 2) {
    const points = isPositive ? [10, 15, 12, 18, 22, 25] : [25, 22, 18, 15, 12, 10];
    return <Sparkline data={points} isPositive={isPositive} width={width} height={height} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color = isPositive ? "#33c758" : "#ff3e00";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// Portfolio Area Chart Component
function PortfolioAreaChart({ timeframe, totalBalance, changePercent }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const chartData = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const base = totalBalance > 0 ? totalBalance : 83727.9;
    const factor = changePercent ? changePercent / 100 : 0.031;

    return days.map((day, idx) => {
      const variation = Math.sin(idx * 0.9) * 0.04 + (idx / days.length) * factor;
      const val = base * (0.95 + variation);
      const btcVal = (val / 68420).toFixed(3);
      const pct = (variation * 100).toFixed(2);
      return { day, value: val, btcVal, pct: (Number(pct) >= 0 ? `+${pct}%` : `${pct}%`) };
    });
  }, [totalBalance, changePercent]);

  const width = 540;
  const height = 180;
  const padding = 20;

  const values = chartData.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const pointsArray = chartData.map((d, idx) => {
    const x = padding + (idx / (chartData.length - 1)) * (width - padding * 2);
    const y = height - padding - ((d.value - minVal) / range) * (height - padding * 2);
    return { x, y, data: d };
  });

  const pathD = pointsArray.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`),
    ""
  );

  const areaD = `${pathD} L ${width - padding},${height - 10} L ${padding},${height - 10} Z`;

  const activePoint = hoverIndex !== null ? pointsArray[hoverIndex] : pointsArray[4];

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto cursor-crosshair overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5722" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ff5722" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Filled Area */}
        <path d={areaD} fill="url(#portfolioGradient)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="#ff5722" strokeWidth="2.5" strokeLinecap="round" />

        {/* Points & Interactive Hover Area */}
        {pointsArray.map((pt, idx) => (
          <g key={idx} onMouseEnter={() => setHoverIndex(idx)}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === idx ? "5" : "3"}
              fill="#ff5722"
              stroke="#ffffff"
              strokeWidth="2"
              className="transition-all duration-150"
            />
            <rect
              x={pt.x - 20}
              y={0}
              width="40"
              height={height}
              fill="transparent"
            />
          </g>
        ))}

        {/* Active Highlight Line */}
        {activePoint && (
          <line
            x1={activePoint.x}
            y1={0}
            x2={activePoint.x}
            y2={height - 20}
            stroke="#ff5722"
            strokeDasharray="4 4"
            strokeWidth="1.5"
            opacity="0.6"
          />
        )}
      </svg>

      {/* Tooltip Popup */}
      {activePoint && (
        <div
          className="absolute bg-carbon text-white text-xs rounded-xl p-3 shadow-xl pointer-events-none z-10 transition-all duration-150 border border-fog/20"
          style={{
            left: `${Math.min(Math.max((activePoint.x / width) * 100, 15), 75)}%`,
            top: "20px",
            transform: "translateX(-50%)"
          }}
        >
          <div className="text-[10px] text-ash uppercase font-semibold mb-1">
            {activePoint.data.day}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">${activePoint.data.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-white">
              {activePoint.data.btcVal} BTC
            </span>
          </div>
          <div className="text-[10px] font-medium text-mint mt-1">
            {activePoint.data.pct} 24h
          </div>
        </div>
      )}

      {/* Days X-Axis Labels */}
      <div className="flex justify-between items-center text-[11px] text-ash pt-2 px-2 border-t border-fog/50 mt-1">
        {chartData.map((d, idx) => (
          <span
            key={d.day}
            className={`cursor-pointer transition-colors ${
              (hoverIndex === idx || (hoverIndex === null && idx === 4))
                ? "text-ember font-semibold"
                : "hover:text-carbon"
            }`}
            onMouseEnter={() => setHoverIndex(idx)}
          >
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [user, setUser] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [showBalance, setShowBalance] = useState(true);
  const [chain, setChain] = useState("BNB Chain");
  const [marketLeadersPeriod, setMarketLeadersPeriod] = useState("Month");
  const [portfolioTimeframe, setPortfolioTimeframe] = useState("7D");
  const [recentTimeframe, setRecentTimeframe] = useState("24H");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  const loadData = async () => {
    try {
      const [pricesRes, walletsRes, profileRes, ordersRes, watchlistRes] = await Promise.all([
        fetchAllPrices(),
        fetchWallets().catch(() => ({ data: [] })),
        fetchUserProfile().catch(() => null),
        fetchOrderHistory().catch(() => ({ data: [] })),
        fetchWatchlist().catch(() => ({ data: [] }))
      ]);

      setPrices(pricesRes?.data || []);
      setWallets(walletsRes?.data || []);
      if (profileRes?.data) setUser(profileRes.data);
      setOrderHistory(ordersRes?.data || []);
      setWatchlist(watchlistRes?.data || []);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (e) {
      console.error("[Dashboard] Error loading backend data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Total Equity calculation from real user wallets
  const totalUSDEquity = useMemo(() => {
    return wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);
  }, [wallets]);

  // Overall 24h PnL Change % calculated from user holdings or market average
  const portfolioChange24h = useMemo(() => {
    if (!prices || prices.length === 0) return 0;
    const btc = prices.find(p => p.symbol === "BTCUSDT");
    return btc ? Number(btc.percentChange24h || 0) : 1.18;
  }, [prices]);

  // Dynamic Ticker Coins across top
  const topTickers = useMemo(() => {
    const targetSymbols = ["BNBUSDT", "BTCUSDT", "DOTUSDT", "ETHUSDT"];
    const found = targetSymbols.map(sym => prices.find(p => p.symbol === sym)).filter(Boolean);
    if (found.length >= 4) return found;
    return prices.slice(0, 4);
  }, [prices]);

  // Market Leaders sorted by 24h Volume
  const marketLeaders = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(b.volume24h || 0) - Number(a.volume24h || 0))
      .slice(0, 3);
  }, [prices]);

  // Top Assets
  const topAssets = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(b.currentPrice || 0) - Number(a.currentPrice || 0))
      .slice(0, 5);
  }, [prices]);

  // Top Gainers
  const topGainers = useMemo(() => {
    return [...prices]
      .sort((a, b) => Number(b.percentChange24h || 0) - Number(a.percentChange24h || 0))
      .slice(0, 5);
  }, [prices]);

  // Recent Transactions / Assets List with filter
  const tableList = useMemo(() => {
    let list = prices;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        p => p.symbol.toLowerCase().includes(q) || (p.name && p.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [prices, searchQuery]);

  const handleToggleWatchlist = async (symbol) => {
    try {
      await toggleWatchlist(symbol);
      const res = await fetchWatchlist();
      setWatchlist(res?.data || []);
    } catch (err) {
      console.error("Watchlist toggle failed:", err);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <PageTransition>
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 py-6 font-openrunde space-y-6">
        
        {/* TOP ROW: 4 TICKER CARDS + MY BALANCE CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* TOP TICKERS (8 COLS) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topTickers.map((coin) => {
              const symbolBase = coin.symbol.replace("USDT", "");
              const isProfit = Number(coin.percentChange24h || 0) >= 0;
              return (
                <div
                  key={coin.symbol}
                  className="bg-white border border-fog/80 rounded-[20px] p-4 flex flex-col justify-between hover:shadow-subtle hover:border-carbon/20 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <CoinIcon symbol={coin.symbol} size="w-11 h-11" />
                    <div>
                      <div className="text-sm font-extrabold text-carbon leading-tight">{coin.name || symbolBase}</div>
                      <div className="text-[10px] text-ash font-medium uppercase tracking-wide">{symbolBase} / USDT</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-fog/40 flex items-center justify-between">
                    <div className="text-lg font-black text-carbon tracking-tight">
                      {formatCurrency(coin.currentPrice)}
                    </div>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[11px] flex items-center gap-0.5 ${
                        isProfit ? "bg-mint-wash text-mint" : "bg-ember/10 text-ember"
                      }`}
                    >
                      {isProfit ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {formatPercent(coin.percentChange24h)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MY BALANCE CARD (4 COLS) */}
          <div className="lg:col-span-4 bg-white border border-fog/80 rounded-[20px] p-4 flex flex-col justify-between shadow-subtle-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-carbon">My Balance</span>
              </div>
              <div className="relative inline-block">
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                  className="appearance-none bg-mist text-carbon text-[11px] font-bold px-2.5 py-1 pr-6 rounded-full border border-fog cursor-pointer focus:outline-none"
                >
                  <option value="BNB Chain">BNB Chain</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="Polygon">Polygon</option>
                  <option value="Solana">Solana</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-ash pointer-events-none" />
              </div>
            </div>

            <div className="my-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-carbon tracking-tight">
                  {showBalance ? formatCurrency(totalUSDEquity) : "••••••••"}
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-ash hover:text-carbon transition-colors"
                >
                  {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-ash mt-0.5">
                <span>{lastRefreshed}</span>
                <button
                  onClick={loadData}
                  className="flex items-center gap-1 hover:text-carbon transition-colors font-semibold"
                >
                  <RefreshCw size={10} /> Refresh
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              <button
                onClick={() => navigate("/wallets")}
                className="flex items-center justify-center gap-1 bg-ember hover:bg-ember/90 text-white font-bold text-[11px] py-1.5 rounded-xl transition-all shadow-subtle"
              >
                <Download size={12} /> Deposit
              </button>

              <button
                onClick={() => navigate("/wallets")}
                className="flex items-center justify-center gap-1 bg-mist hover:bg-fog text-carbon font-semibold text-[11px] py-1.5 rounded-xl border border-fog transition-all"
              >
                <Upload size={12} /> Withdraw
              </button>

              <button
                onClick={() => navigate("/trade/spot")}
                className="flex items-center justify-center gap-1 bg-mist hover:bg-fog text-carbon font-semibold text-[11px] py-1.5 rounded-xl border border-fog transition-all"
              >
                <Repeat size={12} /> Swap
              </button>

              <button
                onClick={() => navigate("/wallets")}
                className="flex items-center justify-center gap-1 bg-mist hover:bg-fog text-carbon font-semibold text-[11px] py-1.5 rounded-xl border border-fog transition-all"
              >
                <Send size={12} /> Transfer
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: MARKET LEADERS + PORTFOLIO VALUE CHART + TOP ASSETS & TOP GAINERS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT 3 COLUMNS: MARKET LEADERS */}
          <div className="lg:col-span-3 bg-white border border-fog/80 rounded-[20px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-carbon">Market Leaders</h3>
              <div className="flex bg-mist p-0.5 rounded-lg border border-fog text-[11px] font-medium">
                {["Week", "Month"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setMarketLeadersPeriod(p)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      marketLeadersPeriod === p
                        ? "bg-white text-carbon shadow-subtle font-semibold"
                        : "text-ash hover:text-carbon"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Leader Progress Bars */}
            <div className="flex gap-1.5 pt-1">
              <div className="h-2 rounded-full bg-ember flex-[3]" />
              <div className="h-2 rounded-full bg-ember/40 flex-[2]" />
              <div className="h-2 rounded-full bg-ember/20 flex-[1]" />
            </div>

            <div className="text-[11px] text-ash flex justify-between font-medium">
              <span>June 1</span>
              <span>June 30</span>
            </div>

            {/* Market Leaders List */}
            <div className="space-y-3 pt-2">
              {marketLeaders.map((coin) => {
                const symbolBase = coin.symbol.replace("USDT", "");
                return (
                  <div key={coin.symbol} className="flex items-center justify-between border-b border-fog/40 pb-3 last:border-none last:pb-0">
                    <div className="flex items-center gap-2.5">
                      <CoinIcon symbol={coin.symbol} size="w-6 h-6" />
                      <div>
                        <div className="text-xs font-bold text-carbon">{coin.name || symbolBase}</div>
                        <div className="text-[11px] font-semibold text-carbon">{formatCurrency(coin.currentPrice)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-ash font-medium">24h Vol</div>
                      <div className="text-xs font-medium text-graphite">
                        ${Number(coin.volume24h || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CENTER 5 COLUMNS: PORTFOLIO VALUE CHART */}
          <div className="lg:col-span-5 bg-white border border-fog/80 rounded-[20px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-carbon">Portfolio Value</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-carbon">
                    {formatCurrency(totalUSDEquity > 0 ? totalUSDEquity : 83727.9)}
                  </span>
                  <span className={`text-xs font-semibold ${portfolioChange24h >= 0 ? "text-mint" : "text-ember"}`}>
                    {formatPercent(portfolioChange24h)} vs Last 24h
                  </span>
                </div>
              </div>

              {/* Timeframe Buttons */}
              <div className="flex bg-mist p-0.5 rounded-lg border border-fog text-[10px] font-medium">
                {["12H", "2H", "1D", "7D", "1M", "1Y"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setPortfolioTimeframe(tf)}
                    className={`px-2 py-1 rounded-md transition-all ${
                      portfolioTimeframe === tf
                        ? "bg-white text-carbon shadow-subtle font-bold"
                        : "text-ash hover:text-carbon"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <PortfolioAreaChart
              timeframe={portfolioTimeframe}
              totalBalance={totalUSDEquity}
              changePercent={portfolioChange24h}
            />
          </div>

          {/* RIGHT 4 COLUMNS: TOP ASSETS & TOP GAINERS */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* TOP ASSETS CARD */}
            <div className="bg-white border border-fog/80 rounded-[20px] p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-fog/40 pb-2">
                <h3 className="text-sm font-bold text-carbon">Top Assets</h3>
                <button className="text-ash hover:text-carbon"><MoreHorizontal size={16} /></button>
              </div>

              <div className="space-y-2">
                {topAssets.map((coin) => {
                  const symbolBase = coin.symbol.replace("USDT", "");
                  const isProfit = Number(coin.percentChange24h || 0) >= 0;
                  return (
                    <div key={coin.symbol} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2.5">
                        <CoinIcon symbol={coin.symbol} size="w-7 h-7" />
                        <div>
                          <div className="font-bold text-carbon">{coin.name || symbolBase}</div>
                          <div className="text-[10px] text-ash font-medium">{symbolBase}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-semibold text-carbon">{formatCurrency(coin.currentPrice)}</div>
                        <div className={`text-[10px] font-bold ${isProfit ? "text-mint" : "text-ember"}`}>
                          {formatPercent(coin.percentChange24h)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TOP GAINERS CARD */}
            <div className="bg-white border border-fog/80 rounded-[20px] p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-fog/40 pb-2">
                <h3 className="text-sm font-bold text-carbon">Top Gainers</h3>
                <button className="text-ash hover:text-carbon"><MoreHorizontal size={16} /></button>
              </div>

              <div className="space-y-2">
                {topGainers.map((coin) => {
                  const symbolBase = coin.symbol.replace("USDT", "");
                  return (
                    <div key={coin.symbol} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2">
                        <CoinIcon symbol={coin.symbol} size="w-5 h-5" />
                        <span className="font-bold text-carbon uppercase">{symbolBase}</span>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <span className="text-[10px] text-ash">
                          ${(Number(coin.volume24h || 0) / 1000).toFixed(1)}k
                        </span>
                        <span className="font-semibold text-carbon">{formatCurrency(coin.currentPrice)}</span>
                        <span className="text-[10px] font-extrabold text-mint bg-mint-wash px-1.5 py-0.5 rounded">
                          {formatPercent(coin.percentChange24h)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: RECENT TRANSACTIONS / MARKET ASSETS TABLE */}
        <div className="bg-white border border-fog/80 rounded-[20px] p-6 space-y-5 shadow-subtle-2">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-carbon">Recent transactions</h3>
              <p className="text-xs text-ash mt-0.5">Keep track of all transactions and live market assets here</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-mist text-carbon text-xs pl-8 pr-4 py-2 rounded-xl border border-fog focus:outline-none focus:border-carbon w-48 transition-colors"
                />
              </div>

              {/* Timeframe Filters */}
              <div className="flex bg-mist p-0.5 rounded-xl border border-fog text-xs font-medium">
                {["1D", "7D", "1M", "1Y", "24H"].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setRecentTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      recentTimeframe === tf
                        ? "bg-white text-carbon shadow-subtle font-bold"
                        : "text-ash hover:text-carbon"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* TABLE CONTENT */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-fog text-ash font-medium text-[11px]">
                  <th className="pb-3 w-8">
                    <input type="checkbox" className="rounded border-fog text-carbon focus:ring-0 cursor-pointer" />
                  </th>
                  <th className="pb-3">Assets</th>
                  <th className="pb-3 text-right">Price</th>
                  <th className="pb-3 text-right">24h Change</th>
                  <th className="pb-3 text-right">24h Volume</th>
                  <th className="pb-3 text-center">24h Trend</th>
                  <th className="pb-3 text-right">Market Cap</th>
                  <th className="pb-3 text-center w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fog/40">
                {tableList.slice(0, 8).map((coin) => {
                  const symbolBase = coin.symbol.replace("USDT", "");
                  const isProfit = Number(coin.percentChange24h || 0) >= 0;
                  const isWatchlisted = watchlist.includes(coin.symbol);

                  return (
                    <tr key={coin.symbol} className="hover:bg-mist/50 transition-colors">
                      <td className="py-3.5">
                        <input type="checkbox" className="rounded border-fog text-carbon focus:ring-0 cursor-pointer" />
                      </td>

                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleWatchlist(coin.symbol)}
                            className="text-ash hover:text-amber transition-colors"
                          >
                            <Star size={14} className={isWatchlisted ? "text-amber fill-amber" : ""} />
                          </button>

                          <CoinIcon symbol={coin.symbol} size="w-7 h-7" />

                          <div>
                            <span className="font-bold text-carbon block">{coin.name || symbolBase}</span>
                            <span className="text-[10px] text-ash uppercase font-medium">{symbolBase}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 text-right font-bold text-carbon">
                        {formatCurrency(coin.currentPrice)}
                      </td>

                      <td className="py-3.5 text-right">
                        <span className={`font-semibold inline-flex items-center gap-0.5 ${isProfit ? "text-mint" : "text-ember"}`}>
                          {isProfit ? "+" : ""}{formatPercent(coin.percentChange24h)}
                        </span>
                      </td>

                      <td className="py-3.5 text-right font-medium text-ash">
                        ${Number(coin.volume24h || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>

                      <td className="py-3.5 text-center">
                        <div className="flex justify-center">
                          <Sparkline isPositive={isProfit} width={75} height={22} />
                        </div>
                      </td>

                      <td className="py-3.5 text-right font-semibold text-carbon">
                        ${((Number(coin.currentPrice || 0) * 1000000) / 1e9).toFixed(2)}B
                      </td>

                      <td className="py-3.5 text-center">
                        <Link
                          to={`/trade/spot?symbol=${coin.symbol}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-ember hover:underline"
                        >
                          Trade <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </PageTransition>
  );
}
