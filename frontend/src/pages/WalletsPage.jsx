import React, { useEffect, useState, useMemo } from "react";
import { 
  fetchWallets, 
  depositToWallet, 
  transferBetweenWallets, 
  fetchOpenFuturesPositions,
  fetchOrderHistory,
  fetchActiveOrders
} from "../api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { PageTransition } from "../components/ui/PageTransition";
import { formatCurrency, formatPercent } from "../lib/utils";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Search, 
  Copy, 
  Check, 
  PieChart, 
  TrendingUp, 
  Wallet as WalletIcon, 
  ChevronRight,
  ShieldCheck,
  PlusCircle,
  FileText
} from "lucide-react";

export default function WalletsPage() {
  const [wallets, setWallets] = useState([]);
  const [futuresPositions, setFuturesPositions] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Navigation tab
  const [activeTab, setActiveTab] = useState("OVERVIEW"); // OVERVIEW, SPOT, FUTURES

  // Search/Filters
  const [spotSearch, setSpotSearch] = useState("");

  // Action Modals State
  const [depositModal, setDepositModal] = useState({ open: false, walletType: "SPOT", amount: "" });
  const [transferModal, setTransferModal] = useState({ open: false, from: "SPOT", to: "FUTURES", amount: "" });

  const [copiedText, setCopiedText] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [walletsRes, positionsRes, historyRes, activeRes] = await Promise.all([
        fetchWallets(),
        fetchOpenFuturesPositions().catch(() => ({ data: [] })),
        fetchOrderHistory().catch(() => ({ data: [] })),
        fetchActiveOrders().catch(() => ({ data: [] }))
      ]);

      setWallets(walletsRes?.data || []);
      setFuturesPositions(positionsRes?.data || []);
      setOrderHistory(historyRes?.data || []);
      setActiveOrders(activeRes?.data || []);
    } catch (e) {
      setError("Failed to synchronize wallet metrics. Check your login session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Copy addresses helper
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Quick Deposit function
  const handleQuickDeposit = async (walletType, amount) => {
    try {
      setError("");
      setSuccessMessage(`Initiating deposit of $${amount} into ${walletType}...`);
      await depositToWallet(walletType, amount);
      setSuccessMessage(`Successfully deposited $${amount} into your ${walletType} wallet!`);
      await loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (e) {
      setError(e.message || "Failed to process deposit.");
      setSuccessMessage("");
    }
  };

  // Modal Deposit trigger
  const executeModalDeposit = async (amountVal) => {
    const amt = parseFloat(amountVal || depositModal.amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please specify a valid deposit amount.");
      return;
    }
    setDepositModal({ ...depositModal, open: false, amount: "" });
    await handleQuickDeposit(depositModal.walletType, amt);
  };

  // Transfer function
  const executeTransfer = async (e) => {
    e.preventDefault();
    const amt = parseFloat(transferModal.amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please specify a valid transfer amount.");
      return;
    }
    if (transferModal.from === transferModal.to) {
      setError("Source and destination wallets must be different.");
      return;
    }

    try {
      setError("");
      setSuccessMessage(`Transferring ${formatCurrency(amt)} from ${transferModal.from} to ${transferModal.to}...`);
      setTransferModal({ ...transferModal, open: false });
      await transferBetweenWallets(transferModal.from, transferModal.to, amt);
      setSuccessMessage(`Successfully transferred ${formatCurrency(amt)} from ${transferModal.from} to ${transferModal.to}!`);
      await loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to transfer funds.");
      setSuccessMessage("");
    }
  };

  // Calculations for Overview Tab
  const walletMap = useMemo(() => {
    return wallets.reduce((acc, w) => {
      acc[w.walletType] = w;
      return acc;
    }, {});
  }, [wallets]);

  const spotWallet = walletMap["SPOT"];
  const marginWallet = walletMap["MARGIN"];
  const futuresWallet = walletMap["FUTURES"];
  const optionsWallet = walletMap["OPTIONS"];

  const totalPortfolioValue = useMemo(() => {
    return wallets.reduce((acc, w) => acc + (Number(w.balance) || 0), 0);
  }, [wallets]);

  const allocationSegments = useMemo(() => {
    const total = totalPortfolioValue || 1;
    let cumulativePercent = 0;
    
    // Sort wallets to have consistent colors
    const orderedTypes = ["SPOT", "MARGIN", "FUTURES", "OPTIONS"];
    const colors = {
      SPOT: "#fcd535",      // Yellow
      MARGIN: "#02c076",    // Green
      FUTURES: "#3bc1eb",   // Light Blue
      OPTIONS: "#a370f7"    // Purple
    };

    return orderedTypes.map((type) => {
      const w = walletMap[type];
      const val = w ? Number(w.balance) : 0;
      const pct = (val / total) * 100;
      
      const strokeDasharray = `${pct} ${100 - pct}`;
      const strokeDashoffset = 100 - cumulativePercent + 25; // 25 is rotation offset to start top
      cumulativePercent += pct;

      return {
        walletType: type,
        pct,
        color: colors[type] || "#ffffff",
        strokeDasharray,
        strokeDashoffset,
        balance: val
      };
    });
  }, [wallets, totalPortfolioValue, walletMap]);

  // Mock holding prices for Spot Section
  const spotHoldings = useMemo(() => {
    const usdtBalance = spotWallet ? Number(spotWallet.availableBalance) : 0;
    const lockedUsdt = spotWallet ? Number(spotWallet.lockedFunds) : 0;

    // Standard holds list incorporating the user's actual Spot USDT balance
    const assets = [
      { symbol: "USDT", name: "Tether USD", balance: usdtBalance, locked: lockedUsdt, price: 1.00, change24h: 0.01 },
      { symbol: "BTC", name: "Bitcoin", balance: 0.0825, locked: 0.0, price: 68420.50, change24h: 1.85 },
      { symbol: "ETH", name: "Ethereum", balance: 1.48, locked: 0.12, price: 3795.10, change24h: -0.42 },
      { symbol: "BNB", name: "BNB", balance: 3.25, locked: 0.0, price: 592.80, change24h: 4.12 },
      { symbol: "SOL", name: "Solana", balance: 12.8, locked: 0.0, price: 172.40, change24h: -1.25 }
    ];

    return assets
      .map(a => ({
        ...a,
        totalValue: (a.balance + a.locked) * a.price
      }))
      .filter(a => 
        a.symbol.toLowerCase().includes(spotSearch.toLowerCase()) ||
        a.name.toLowerCase().includes(spotSearch.toLowerCase())
      );
  }, [spotWallet, spotSearch]);



  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6 bg-[#0a0a0f] text-white min-h-screen font-sans">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-hairline-on-dark/50 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight font-heading flex items-center gap-2">
              <WalletIcon className="text-primary" size={24} />
              Wallet Dashboard
            </h1>
            <p className="text-xs text-muted">Manage simulated balances, transfer internally, or review asset allocations across NexTradeX.</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button 
              onClick={() => setDepositModal({ ...depositModal, open: true })}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold font-mono tracking-wide rounded bg-primary text-on-primary hover:bg-[#f0b90b] transition-all"
            >
              <PlusCircle size={14} />
              ADD FUNDS
            </button>
            <button 
              onClick={() => setTransferModal({ ...transferModal, open: true })}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold font-mono tracking-wide rounded border border-hairline-on-dark hover:bg-white/[0.03] text-white transition-all"
            >
              <RefreshCw size={14} />
              TRANSFER
            </button>
          </div>
        </div>

        {/* NOTIFICATION FEEDBACK BANNERS */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-trading-down/10 border border-trading-down/20 animate-slide-down">
            <p className="text-trading-down text-xs font-mono">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-trading-up/10 border border-trading-up/20 animate-slide-down">
            <p className="text-trading-up text-xs font-mono">{successMessage}</p>
          </div>
        )}

        {/* DASHBOARD TAB SEGMENTED NAVIGATION */}
        <div className="flex gap-2 p-1 bg-surface-card-dark/60 border border-hairline-on-dark rounded-lg max-w-sm">
          {["OVERVIEW", "SPOT", "FUTURES"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setError("");
                setActiveTab(tab);
              }}
              className={`flex-1 py-1.5 text-center text-xs font-bold tracking-wide rounded transition-all ${
                activeTab === tab 
                  ? "bg-[#181822] text-[#fcd535] border border-hairline-on-dark/50" 
                  : "text-muted hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-surface-card-dark border border-hairline-on-dark rounded-xl animate-pulse col-span-full" />
            <div className="h-48 bg-surface-card-dark border border-hairline-on-dark rounded-xl animate-pulse" />
            <div className="h-48 bg-surface-card-dark border border-hairline-on-dark rounded-xl animate-pulse" />
            <div className="h-48 bg-surface-card-dark border border-hairline-on-dark rounded-xl animate-pulse" />
          </div>
        ) : (
          <>
            {/* ============================================================== */}
            {/* OVERVIEW SECTION */}
            {/* ============================================================== */}
            {activeTab === "OVERVIEW" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* PORTFOLIO METRICS & SVG CHART */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Portfolio Balance Card */}
                  <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl p-5 flex flex-col justify-between h-full shadow-elevation-md">
                    <CardHeader className="p-0">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider block">Estimated Balance</span>
                      <h2 className="text-3xl font-extrabold font-mono text-[#fcd535] mt-1">
                        {formatCurrency(totalPortfolioValue)}
                      </h2>
                      <span className="text-[10px] text-muted font-mono block mt-0.5">≈ BTC 1.54283</span>
                    </CardHeader>
                    
                    <CardContent className="p-0 pt-6 space-y-4">
                      {/* PnL and Metrics */}
                      <div className="flex gap-4 border-t border-hairline-on-dark/40 pt-4">
                        <div className="flex-1">
                          <span className="text-[10px] text-muted font-mono block uppercase">24H Unrealized PnL</span>
                          <span className="text-sm font-bold font-mono text-trading-up flex items-center gap-0.5 mt-0.5">
                            <TrendingUp size={14} />
                            +$452.80 ({formatPercent(3.12)})
                          </span>
                        </div>
                        <div className="flex-1 border-l border-hairline-on-dark/40 pl-4">
                          <span className="text-[10px] text-muted font-mono block uppercase">Account Security</span>
                          <span className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
                            <ShieldCheck size={14} className="text-[#02c076]" />
                            Verified Verified
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Allocation Donut Chart Card */}
                  <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl p-5 shadow-elevation-md">
                    <CardHeader className="p-0 mb-4">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider block">Asset Allocation</span>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-row items-center justify-between gap-4">
                      
                      {/* SVG circular donut chart */}
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut-chart transform -rotate-90">
                          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#181822" strokeWidth="3" />
                          {allocationSegments.map((seg) => (
                            <circle
                              key={seg.walletType}
                              cx="21"
                              cy="21"
                              r="15.91549430918954"
                              fill="transparent"
                              stroke={seg.color}
                              strokeWidth="3.5"
                              strokeDasharray={seg.strokeDasharray}
                              strokeDashoffset={seg.strokeDashoffset}
                              className="transition-all duration-500 ease-out"
                            />
                          ))}
                        </svg>
                        
                        <div className="absolute text-center">
                          <span className="text-[10px] font-mono text-muted uppercase tracking-widest block">Value</span>
                          <span className="text-xs font-bold font-mono text-white">100%</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="space-y-1.5 flex-1 font-mono text-[10px]">
                        {allocationSegments.map((seg) => (
                          <div key={seg.walletType} className="flex justify-between items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: seg.color }} />
                              <span className="text-white font-bold">{seg.walletType}</span>
                            </div>
                            <span className="text-muted font-semibold">{seg.pct.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* WALLET ASSETS GRID QUICK-OVERVIEW LIST */}
                <div className="lg:col-span-4 space-y-3">
                  <span className="font-mono text-[10px] text-muted uppercase tracking-widest block">Wallet Summary</span>
                  
                  {/* Spot Card */}
                  <div 
                    onClick={() => setActiveTab("SPOT")}
                    className="flex justify-between items-center bg-[#121218] border border-hairline-on-dark rounded-xl p-3 hover:border-primary/20 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#fcd535]/10 flex items-center justify-center text-[#fcd535]">
                        <span className="text-xs font-bold font-mono">SP</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-white group-hover:text-primary transition-colors">Spot Wallet</span>
                        <span className="text-[10px] text-muted font-mono uppercase">Standard Assets</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono block">
                        {formatCurrency(spotWallet ? Number(spotWallet.balance) : 0)}
                      </span>
                      <span className="text-[9px] text-muted font-mono block">Available: {formatCurrency(spotWallet ? Number(spotWallet.availableBalance) : 0)}</span>
                    </div>
                  </div>

                  {/* Futures Card */}
                  <div 
                    onClick={() => setActiveTab("FUTURES")}
                    className="flex justify-between items-center bg-[#121218] border border-hairline-on-dark rounded-xl p-3 hover:border-primary/20 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#3bc1eb]/10 flex items-center justify-center text-[#3bc1eb]">
                        <span className="text-xs font-bold font-mono">FT</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-white group-hover:text-primary transition-colors">Futures Wallet</span>
                        <span className="text-[10px] text-muted font-mono uppercase">Leveraged Perp Contract</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono block">
                        {formatCurrency(futuresWallet ? Number(futuresWallet.balance) : 0)}
                      </span>
                      <span className="text-[9px] text-muted font-mono block">PnL: {formatCurrency(futuresWallet ? Number(futuresWallet.unrealizedPnL) : 0)}</span>
                    </div>
                  </div>

                  {/* Margin Card */}
                  <div className="flex justify-between items-center bg-[#121218] border border-hairline-on-dark rounded-xl p-3 hover:border-primary/10 transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#02c076]/10 flex items-center justify-center text-[#02c076]">
                        <span className="text-xs font-bold font-mono">MG</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-white">Margin Wallet</span>
                        <span className="text-[10px] text-muted font-mono uppercase">Lending & Borrowing</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono block">
                        {formatCurrency(marginWallet ? Number(marginWallet.balance) : 0)}
                      </span>
                      <span className="text-[9px] text-muted font-mono block">Locked: {formatCurrency(marginWallet ? Number(marginWallet.lockedFunds) : 0)}</span>
                    </div>
                  </div>
                </div>

                {/* RECENT TRANSACTION / ORDER HISTORY TABLE */}
                <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl col-span-full overflow-hidden shadow-elevation-md">
                  <CardHeader className="bg-[#181822] px-5 py-4 border-b border-hairline-on-dark flex flex-row items-center justify-between">
                    <div>
                      <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={14} className="text-primary" />
                        Recent Executions
                      </h4>
                      <p className="text-[10px] text-muted font-sans mt-0.5">Real-time trade order confirmations and funding audit history.</p>
                    </div>
                    <span className="text-[9px] font-mono text-muted uppercase">Sync Status: Active</span>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-mono text-xs">
                        <thead>
                          <tr className="border-b border-hairline-on-dark text-[9px] font-bold text-muted uppercase tracking-wider bg-canvas-dark/20 py-2.5">
                            <th className="py-2.5 px-5">Symbol</th>
                            <th className="py-2.5 px-5">Type</th>
                            <th className="py-2.5 px-5">Side</th>
                            <th className="py-2.5 px-5 text-right">Price</th>
                            <th className="py-2.5 px-5 text-right">Quantity</th>
                            <th className="py-2.5 px-5 text-right">Filled Qty</th>
                            <th className="py-2.5 px-5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline-on-dark">
                          {orderHistory.slice(0, 5).map((o) => (
                            <tr key={o.id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="py-3.5 px-5 font-bold text-white">{o.symbol}</td>
                              <td className="py-3.5 px-5 text-muted uppercase">{o.tradeType} {o.orderType}</td>
                              <td className="py-3.5 px-5">
                                <span className={`font-bold ${o.side === "BUY" ? "text-trading-up" : "text-trading-down"}`}>
                                  {o.side}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-right font-semibold">{formatCurrency(o.price)}</td>
                              <td className="py-3.5 px-5 text-right">{o.quantity}</td>
                              <td className="py-3.5 px-5 text-right">{o.filledQuantity}</td>
                              <td className="py-3.5 px-5 text-center">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  o.status === "FILLED" ? "bg-trading-up/10 text-trading-up" : "bg-primary/10 text-primary"
                                }`}>
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {orderHistory.length === 0 && (
                            <tr>
                              <td colSpan="7" className="py-12 text-center text-muted text-xs">No recent transaction executions found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}

            {/* ============================================================== */}
            {/* SPOT SECTION */}
            {/* ============================================================== */}
            {activeTab === "SPOT" && (
              <div className="space-y-6">
                
                {/* Spot Metrics cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl p-5 shadow-elevation-sm">
                    <span className="font-mono text-xs text-muted uppercase tracking-wider block">Spot Total Balance</span>
                    <h3 className="text-2xl font-extrabold font-mono text-white mt-1">
                      {formatCurrency(spotWallet ? Number(spotWallet.balance) : 0)}
                    </h3>
                  </Card>
                  <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl p-5 shadow-elevation-sm">
                    <span className="font-mono text-xs text-muted uppercase tracking-wider block">Spot Available</span>
                    <h3 className="text-2xl font-extrabold font-mono text-trading-up mt-1">
                      {formatCurrency(spotWallet ? Number(spotWallet.availableBalance) : 0)}
                    </h3>
                  </Card>
                  <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl p-5 shadow-elevation-sm">
                    <span className="font-mono text-xs text-muted uppercase tracking-wider block">In-Order / Locked</span>
                    <h3 className="text-2xl font-extrabold font-mono text-muted mt-1">
                      {formatCurrency(spotWallet ? Number(spotWallet.lockedFunds) : 0)}
                    </h3>
                  </Card>
                </div>

                {/* Spot Holdings Filter Table */}
                <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl overflow-hidden shadow-elevation-md">
                  <CardHeader className="bg-[#181822] p-5 border-b border-hairline-on-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider">Spot Portfolio Holdings</h4>
                      <p className="text-[10px] text-muted font-sans mt-0.5">Asset holdings list based on direct deposits and completed spot trades.</p>
                    </div>

                    {/* Search holdings input */}
                    <div className="relative max-w-xs w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                      <input
                        type="text"
                        placeholder="Search assets (e.g. BTC, ETH)"
                        value={spotSearch}
                        onChange={(e) => setSpotSearch(e.target.value)}
                        className="bg-canvas-dark border border-hairline-on-dark rounded px-8 py-1.5 text-xs font-mono w-full text-white placeholder-muted outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-mono text-xs">
                        <thead>
                          <tr className="border-b border-hairline-on-dark text-[9px] font-bold text-muted uppercase tracking-wider bg-canvas-dark/20 py-2.5">
                            <th className="py-2.5 px-5">Asset</th>
                            <th className="py-2.5 px-5">Name</th>
                            <th className="py-2.5 px-5 text-right">Available Balance</th>
                            <th className="py-2.5 px-5 text-right">Locked In Orders</th>
                            <th className="py-2.5 px-5 text-right">Current Price</th>
                            <th className="py-2.5 px-5 text-right">Estimated Value</th>
                            <th className="py-2.5 px-5 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline-on-dark">
                          {spotHoldings.map((hold) => (
                            <tr key={hold.symbol} className="hover:bg-white/[0.01] transition-colors">
                              <td className="py-3.5 px-5 font-bold text-white flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-[#fcd535]/15 text-[#fcd535] text-[10px] flex items-center justify-center font-bold">
                                  {hold.symbol.substring(0, 2)}
                                </div>
                                {hold.symbol}
                              </td>
                              <td className="py-3.5 px-5 text-muted font-sans font-medium">{hold.name}</td>
                              <td className="py-3.5 px-5 text-right font-semibold text-white">{hold.balance.toFixed(4)}</td>
                              <td className="py-3.5 px-5 text-right text-muted">{hold.locked.toFixed(4)}</td>
                              <td className="py-3.5 px-5 text-right text-muted">{formatCurrency(hold.price)}</td>
                              <td className="py-3.5 px-5 text-right text-primary font-bold">{formatCurrency(hold.totalValue)}</td>
                              <td className="py-3.5 px-5 text-center">
                                <button 
                                  onClick={() => setTransferModal({ open: true, from: "SPOT", to: "FUTURES", amount: "" })}
                                  className="text-primary hover:text-white transition-colors text-[10px] font-bold px-2.5 py-1 rounded bg-[#fcd535]/10 border border-[#fcd535]/25"
                                >
                                  Transfer
                                </button>
                              </td>
                            </tr>
                          ))}
                          {spotHoldings.length === 0 && (
                            <tr>
                              <td colSpan="7" className="py-12 text-center text-muted text-xs">No holdings matched your filter options.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}

            {/* ============================================================== */}
            {/* FUTURES SECTION */}
            {/* ============================================================== */}
            {activeTab === "FUTURES" && (
              <div className="space-y-6">
                
                {/* Futures Metrics grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl p-5 shadow-elevation-sm">
                    <span className="font-mono text-xs text-muted uppercase tracking-wider block">Futures Total Equity</span>
                    <h3 className="text-xl font-extrabold font-mono text-white mt-1">
                      {formatCurrency(futuresWallet ? Number(futuresWallet.balance) : 0)}
                    </h3>
                  </Card>
                  <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl p-5 shadow-elevation-sm">
                    <span className="font-mono text-xs text-muted uppercase tracking-wider block">Unrealized PnL</span>
                    <h3 className={`text-xl font-extrabold font-mono mt-1 ${
                      (futuresWallet ? Number(futuresWallet.unrealizedPnL) : 0) >= 0 ? "text-trading-up" : "text-trading-down"
                    }`}>
                      {(futuresWallet ? Number(futuresWallet.unrealizedPnL) : 0) >= 0 ? "+" : ""}
                      {formatCurrency(futuresWallet ? Number(futuresWallet.unrealizedPnL) : 0)}
                    </h3>
                  </Card>
                  <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl p-5 shadow-elevation-sm">
                    <span className="font-mono text-xs text-muted uppercase tracking-wider block">Margin Locked</span>
                    <h3 className="text-xl font-extrabold font-mono text-white mt-1">
                      {formatCurrency(futuresWallet ? Number(futuresWallet.lockedFunds) : 0)}
                    </h3>
                  </Card>
                  <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl p-5 shadow-elevation-sm">
                    <span className="font-mono text-xs text-muted uppercase tracking-wider block">Active Positions</span>
                    <h3 className="text-xl font-extrabold font-mono text-primary mt-1">
                      {futuresPositions.length} Positions
                    </h3>
                  </Card>
                </div>

                {/* Futures Active Positions Table */}
                <Card className="bg-[#121218] border border-hairline-on-dark rounded-xl overflow-hidden shadow-elevation-md">
                  <CardHeader className="bg-[#181822] p-5 border-b border-hairline-on-dark flex flex-row items-center justify-between">
                    <div>
                      <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider">Active Leveraged Positions</h4>
                      <p className="text-[10px] text-muted font-sans mt-0.5">Direct leveraged exposure positions actively tracking market indexes.</p>
                    </div>
                    <span className="text-[9px] font-mono bg-trading-up/10 text-trading-up px-2 py-0.5 rounded font-bold">Positions: {futuresPositions.length}</span>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-mono text-xs">
                        <thead>
                          <tr className="border-b border-hairline-on-dark text-[9px] font-bold text-muted uppercase tracking-wider bg-canvas-dark/20 py-2.5">
                            <th className="py-2.5 px-5">Symbol</th>
                            <th className="py-2.5 px-5">Mode</th>
                            <th className="py-2.5 px-5 text-right">Size</th>
                            <th className="py-2.5 px-5 text-right">Entry Price</th>
                            <th className="py-2.5 px-5 text-right">Leverage</th>
                            <th className="py-2.5 px-5 text-right">Collateral</th>
                            <th className="py-2.5 px-5 text-right">Unrealized PnL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-hairline-on-dark">
                          {futuresPositions.map((p) => {
                            const pnlVal = parseFloat(p.unrealizedPnL || "0");
                            const isProfit = pnlVal >= 0;
                            return (
                              <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                                <td className="py-3.5 px-5 font-bold text-white">{p.symbol}</td>
                                <td className="py-3.5 px-5">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                    p.positionMode === "LONG" ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"
                                  }`}>
                                    {p.positionMode}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 text-right font-semibold text-white">{p.quantity}</td>
                                <td className="py-3.5 px-5 text-right text-muted">{formatCurrency(p.entryPrice)}</td>
                                <td className="py-3.5 px-5 text-right text-[#fcd535] font-extrabold">{p.leverage}x</td>
                                <td className="py-3.5 px-5 text-right font-medium">{formatCurrency(p.collateral)}</td>
                                <td className={`py-3.5 px-5 text-right font-bold text-sm ${isProfit ? "text-trading-up" : "text-trading-down"}`}>
                                  {isProfit ? "+" : ""}{formatCurrency(pnlVal)}
                                </td>
                              </tr>
                            );
                          })}
                          {futuresPositions.length === 0 && (
                            <tr>
                              <td colSpan="7" className="py-12 text-center text-muted text-xs">No active leveraged positions found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* ADD FUNDS / DEPOSIT MODAL */}
        {/* ============================================================== */}
        {depositModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#121218] border border-hairline-on-dark rounded-xl max-w-md w-full overflow-hidden shadow-elevation-lg animate-slide-up">
              
              <div className="bg-[#181822] border-b border-hairline-on-dark px-5 py-4 flex justify-between items-center">
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <PlusCircle className="text-primary" size={16} />
                  Deposit Simulated Capital
                </h3>
                <button 
                  onClick={() => setDepositModal({ ...depositModal, open: false, amount: "" })}
                  className="text-muted hover:text-white transition-colors font-bold font-mono text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); executeModalDeposit(); }} className="p-5 space-y-4">
                
                <p className="text-[11px] text-muted leading-relaxed font-sans border-b border-hairline-on-dark/30 pb-3">
                  This is a simulated paper trading platform. You can instantly credit virtual funds to any of your wallets for free.
                </p>

                {/* Target Wallet selection */}
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                    1. Destination Wallet
                  </label>
                  <select
                    value={depositModal.walletType}
                    onChange={(e) => setDepositModal({ ...depositModal, walletType: e.target.value })}
                    className="bg-canvas-dark border border-hairline-on-dark font-mono text-xs text-white w-full rounded px-3 py-2 cursor-pointer outline-none focus:border-primary"
                  >
                    <option value="SPOT">SPOT WALLET</option>
                    <option value="MARGIN">MARGIN WALLET</option>
                    <option value="FUTURES">FUTURES WALLET</option>
                    <option value="OPTIONS">OPTIONS WALLET</option>
                  </select>
                </div>

                {/* Amount input */}
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                    2. Deposit Amount (USD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder="0.00"
                      value={depositModal.amount || ""}
                      onChange={(e) => setDepositModal({ ...depositModal, amount: e.target.value })}
                      className="bg-canvas-dark border border-hairline-on-dark font-mono text-sm text-white w-full rounded px-3 py-2 pr-12 outline-none focus:border-primary transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs font-mono">USD</span>
                  </div>
                </div>

                {/* Instant Quick Deposit Presets */}
                <div className="space-y-1.5 border-t border-hairline-on-dark/40 pt-3">
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest block">
                    Instant One-Click Presets
                  </label>
                  <div className="flex gap-2">
                    {[1000, 10000, 100000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => executeModalDeposit(amt)}
                        className="flex-1 py-2 text-xs font-mono font-bold bg-[#fcd535]/10 text-[#fcd535] hover:bg-[#fcd535]/20 border border-[#fcd535]/25 rounded transition-all"
                      >
                        +${amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDepositModal({ ...depositModal, open: false, amount: "" })}
                    className="flex-1 py-2.5 text-xs font-mono font-bold border border-hairline-on-dark text-white rounded hover:bg-white/[0.02] transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-mono font-bold bg-primary text-on-primary hover:bg-[#f0b90b] rounded transition-colors"
                  >
                    CONFIRM DEPOSIT
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TRANSFER MODAL */}
        {/* ============================================================== */}
        {transferModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#121218] border border-hairline-on-dark rounded-xl max-w-md w-full overflow-hidden shadow-elevation-lg animate-slide-up">
              
              <div className="bg-[#181822] border-b border-hairline-on-dark px-5 py-4 flex justify-between items-center">
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="text-primary" size={16} />
                  Transfer Assets Internally
                </h3>
                <button 
                  onClick={() => setTransferModal({ ...transferModal, open: false })}
                  className="text-muted hover:text-white transition-colors font-bold font-mono text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={executeTransfer} className="p-5 space-y-4">
                
                {/* Transfer route selects */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                      From Wallet
                    </label>
                    <select
                      value={transferModal.from}
                      onChange={(e) => setTransferModal({ ...transferModal, from: e.target.value })}
                      className="bg-canvas-dark border border-hairline-on-dark font-mono text-xs text-white w-full rounded px-3 py-2 cursor-pointer outline-none focus:border-primary"
                    >
                      <option value="SPOT">SPOT</option>
                      <option value="MARGIN">MARGIN</option>
                      <option value="FUTURES">FUTURES</option>
                      <option value="OPTIONS">OPTIONS</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">
                      To Wallet
                    </label>
                    <select
                      value={transferModal.to}
                      onChange={(e) => setTransferModal({ ...transferModal, to: e.target.value })}
                      className="bg-canvas-dark border border-hairline-on-dark font-mono text-xs text-white w-full rounded px-3 py-2 cursor-pointer outline-none focus:border-primary"
                    >
                      <option value="SPOT">SPOT</option>
                      <option value="MARGIN">MARGIN</option>
                      <option value="FUTURES">FUTURES</option>
                      <option value="OPTIONS">OPTIONS</option>
                    </select>
                  </div>
                </div>

                {/* Amount input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest block">
                      Transfer Amount
                    </label>
                    <span className="text-[10px] font-mono text-muted">
                      Available: {formatCurrency(
                        walletMap[transferModal.from] ? Number(walletMap[transferModal.from].availableBalance) : 0
                      )}
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={transferModal.amount}
                      onChange={(e) => setTransferModal({ ...transferModal, amount: e.target.value })}
                      className="bg-canvas-dark border border-hairline-on-dark font-mono text-sm text-white w-full rounded px-3 py-2 pr-12 outline-none focus:border-primary transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs font-mono">USD</span>
                  </div>
                </div>

                {/* Preset balance buttons */}
                <div className="flex gap-2">
                  {[25, 50, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        const w = walletMap[transferModal.from];
                        const bal = w ? Number(w.availableBalance) : 0;
                        setTransferModal({ ...transferModal, amount: (bal * (pct / 100)).toFixed(2) });
                      }}
                      className="flex-1 py-1 text-[9px] font-mono bg-canvas-dark border border-hairline-on-dark text-muted hover:text-white rounded transition-colors"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTransferModal({ ...transferModal, open: false })}
                    className="flex-1 py-2.5 text-xs font-mono font-bold border border-hairline-on-dark text-white rounded hover:bg-white/[0.02] transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-mono font-bold bg-primary text-on-primary hover:bg-[#f0b90b] rounded transition-colors"
                  >
                    CONFIRM TRANSFER
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SEND / WITHDRAWAL MODAL */}
        {/* ============================================================== */}


      </div>
    </PageTransition>
  );
}
