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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
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
  FileText,
  X,
  Coins,
  Activity,
  Info,
  Layers,
  Sparkles
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

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

  // Hover segments for donut interaction
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Action Modals State
  const [depositModal, setDepositModal] = useState({ open: false, walletType: "SPOT", amount: "" });
  const [transferModal, setTransferModal] = useState({ open: false, from: "SPOT", to: "FUTURES", amount: "" });

  const [copiedText, setCopiedText] = useState(false);

  // Simulated Transaction History Log
  const [txHistory, setTxHistory] = useState([]);

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
      
      // Add to simulated transaction log
      const newTx = {
        id: `tx-${Date.now()}`,
        type: "DEPOSIT",
        wallet: walletType,
        amount: Number(amount),
        status: "COMPLETED",
        date: new Date().toISOString(),
        address: "Simulated System Credit"
      };
      setTxHistory(prev => [newTx, ...prev]);

      setSuccessMessage(`Successfully deposited $${amount} into your ${walletType} wallet!`);
      await loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (e) {
      setError(e.message || "Failed to process deposit.");
      setSuccessMessage("");
    }
  };

  const executeModalDeposit = async (amountVal) => {
    const amt = parseFloat(amountVal || depositModal.amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please specify a valid deposit amount.");
      return;
    }
    setDepositModal({ ...depositModal, open: false, amount: "" });
    await handleQuickDeposit(depositModal.walletType, amt);
  };

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
      
      // Add to simulated transaction log
      const newTx = {
        id: `tx-${Date.now()}`,
        type: "TRANSFER",
        wallet: `${transferModal.from} -> ${transferModal.to}`,
        amount: Number(amt),
        status: "COMPLETED",
        date: new Date().toISOString(),
        address: "Internal Transfer"
      };
      setTxHistory(prev => [newTx, ...prev]);

      setSuccessMessage(`Successfully transferred ${formatCurrency(amt)} from ${transferModal.from} to ${transferModal.to}!`);
      await loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to transfer funds.");
      setSuccessMessage("");
    }
  };



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
      const strokeDashoffset = 100 - cumulativePercent + 25; 
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

  // Spot holdings cards configuration (with color branding & icons)
  const spotHoldings = useMemo(() => {
    const usdtBalance = spotWallet ? Number(spotWallet.availableBalance) : 0;
    const lockedUsdt = spotWallet ? Number(spotWallet.lockedFunds) : 0;

    const assets = [
      { symbol: "USDT", name: "Tether USD", balance: usdtBalance, locked: lockedUsdt, price: 1.00, change24h: 0.00, color: "from-[#02c076]/20 to-[#02c076]/5", badgeColor: "#02c076" }
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
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 bg-canvas-dark text-white min-h-screen font-body relative">
        
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-hairline-on-dark pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-heading flex items-center gap-2">
              <WalletIcon className="text-primary" size={26} />
              Wallet Center
            </h1>
            <p className="text-xs text-muted mt-1 leading-relaxed">Redesigned multi-wallet manager: audit simulated equities, allocate holdings, or complete internal routes.</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button 
              onClick={() => setDepositModal({ open: true, walletType: "SPOT", amount: "" })}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-xs font-bold font-mono tracking-wide rounded bg-primary text-on-primary hover:bg-[#f0b90b] transition-all shadow-glow-primary"
            >
              <PlusCircle size={14} />
              ADD FUNDS
            </button>
            <button 
              onClick={() => setTransferModal({ open: true, from: "SPOT", to: "FUTURES", amount: "" })}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-xs font-bold font-mono tracking-wide rounded border border-hairline-on-dark hover:bg-white/[0.03] text-white hover:border-primary/20 transition-all"
            >
              <RefreshCw size={14} />
              TRANSFER
            </button>

          </div>
        </div>

        {/* FEEDBACK BANNERS */}
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

        {/* ANIMATED SEGMENTED TAB NAVIGATION */}
        <Tabs value={activeTab} onValueChange={(val) => { setError(""); setActiveTab(val); }} className="w-full">
          <TabsList className="flex p-1 bg-surface-card-dark border border-hairline-on-dark rounded-xl max-w-sm h-auto">
            {["OVERVIEW", "SPOT", "FUTURES"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="flex-1 py-2 text-center text-xs font-bold tracking-wide rounded-lg z-10 transition-all data-[state=active]:bg-surface-elevated-dark data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-hairline-on-dark/50 text-muted hover:text-white bg-transparent border-0 cursor-pointer"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* LOADING STATE */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="h-64 bg-surface-card-dark border border-hairline-on-dark rounded-xl col-span-full" />
            <div className="h-48 bg-surface-card-dark border border-hairline-on-dark rounded-xl" />
            <div className="h-48 bg-surface-card-dark border border-hairline-on-dark rounded-xl" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* ============================================================== */}
              {/* TAB 1: OVERVIEW */}
              {/* ============================================================== */}
              {activeTab === "OVERVIEW" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Portfolio Net Worth with Neon Glassmorphism */}
                  <div className="lg:col-span-8 space-y-4">
                    <span className="font-mono text-[10px] text-muted uppercase tracking-widest block">Asset Overview</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Glass Net Worth Card */}
                      <Card className="glass-panel ambient-glow border border-primary/20 bg-surface-card-dark/80 rounded-2xl p-6 flex flex-col justify-between h-56 relative overflow-hidden shadow-elevation-lg group">
                        
                        {/* Background Sparkline line */}
                        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                          <svg width="100%" height="100%" viewBox="0 0 300 120" preserveAspectRatio="none">
                            <path d="M 0 80 Q 50 110 100 70 T 200 40 T 300 20 L 300 120 L 0 120 Z" fill="#fcd535" />
                            <path d="M 0 80 Q 50 110 100 70 T 200 40 T 300 20" fill="none" stroke="#fcd535" strokeWidth="2" />
                          </svg>
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center gap-1.5 text-muted text-[10px] font-mono uppercase tracking-wider">
                            <span>Portfolio Net Worth</span>
                            <Sparkles size={12} className="text-primary animate-pulse" />
                          </div>
                          <h2 className="text-4xl font-extrabold font-mono text-primary mt-2.5">
                            {formatCurrency(totalPortfolioValue)}
                          </h2>
                          <span className="text-[10px] text-muted-strong font-mono block mt-1">≈ BTC {(totalPortfolioValue / 68420).toFixed(5)}</span>
                        </div>
                        
                        <div className="relative z-10 flex gap-4 border-t border-hairline-on-dark/50 pt-4">
                          <div className="flex-1">
                            <span className="text-[9px] text-muted font-mono block uppercase">24H Net Delta</span>
                            <span className="text-xs font-bold font-mono text-trading-up flex items-center gap-0.5 mt-0.5">
                              <TrendingUp size={13} />
                              +$452.80 (+3.12%)
                            </span>
                          </div>
                          <div className="flex-1 border-l border-hairline-on-dark/40 pl-4">
                            <span className="text-[9px] text-muted font-mono block uppercase">Security Audits</span>
                            <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                              <ShieldCheck size={14} className="text-trading-up" />
                              Sim SA Safe
                            </span>
                          </div>
                        </div>
                      </Card>

                      {/* Interactive Allocation Donut */}
                      <Card className="interactive-surface bg-[#121218] border border-hairline-on-dark rounded-2xl p-6 shadow-elevation-md">
                        <CardHeader className="p-0 pb-3">
                          <span className="font-mono text-xs text-muted uppercase tracking-wider block">Wallet Allocation Ratio</span>
                        </CardHeader>
                        <CardContent className="p-0 flex flex-row items-center justify-between gap-5">
                          
                          {/* SVG Ring Donut */}
                          <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
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
                                  strokeWidth={hoveredSegment === seg.walletType ? "4.5" : "3.5"}
                                  strokeDasharray={seg.strokeDasharray}
                                  strokeDashoffset={seg.strokeDashoffset}
                                  onMouseEnter={() => setHoveredSegment(seg.walletType)}
                                  onMouseLeave={() => setHoveredSegment(null)}
                                  className="transition-all duration-300 ease-out cursor-pointer"
                                />
                              ))}
                            </svg>
                            <div className="absolute text-center pointer-events-none">
                              <span className="text-[8px] font-mono text-muted uppercase tracking-widest block">Alloc</span>
                              <span className="text-xs font-bold font-mono text-white">100%</span>
                            </div>
                          </div>

                          {/* Interactive Legend List */}
                          <div className="space-y-2 flex-1 font-mono text-[10px]">
                            {allocationSegments.map((seg) => (
                              <div 
                                key={seg.walletType} 
                                onMouseEnter={() => setHoveredSegment(seg.walletType)}
                                onMouseLeave={() => setHoveredSegment(null)}
                                className={`flex justify-between items-center p-1 rounded transition-colors ${
                                  hoveredSegment === seg.walletType ? "bg-white/[0.04]" : ""
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: seg.color }} />
                                  <span className="text-white font-bold">{seg.walletType}</span>
                                </div>
                                <span className="text-muted font-bold">{seg.pct.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Timeline Transaction Progress Log */}
                    <Card className="bg-[#121218] border border-hairline-on-dark rounded-2xl overflow-hidden shadow-elevation-md">
                      <CardHeader className="bg-[#181822] px-6 py-4 border-b border-hairline-on-dark">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                          <Activity size={14} className="text-primary" />
                          Simulated Transaction Timeline
                        </CardTitle>
                        <CardDescription className="text-[9px] text-muted">Auditing deposit credits, internal transfers, and payout timelines.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        {txHistory.map((tx, idx) => (
                          <div key={tx.id} className="relative flex gap-4 pl-6 border-l border-hairline-on-dark/60 last:border-0 pb-1">
                            {/* Dot indicator */}
                            <span className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center border-4 border-canvas-dark">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            </span>
                            
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 items-center text-xs font-mono">
                              <div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                  tx.type === "DEPOSIT" ? "bg-trading-up/10 text-trading-up" : tx.type === "WITHDRAWAL" ? "bg-trading-down/10 text-trading-down" : "bg-[#a370f7]/10 text-[#a370f7]"
                                }`}>
                                  {tx.type}
                                </span>
                                <span className="text-white font-bold ml-2">{tx.wallet}</span>
                              </div>
                              <div className="text-primary font-bold">{formatCurrency(tx.amount)}</div>
                              <div className="text-muted text-[10px] break-all">{tx.address}</div>
                              <div className="text-right text-[10px] text-muted-strong">{new Date(tx.date).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* WALLET ASSETS GRID QUICK-OVERVIEW LIST */}
                  <div className="lg:col-span-4 space-y-4">
                    <span className="font-mono text-[10px] text-muted uppercase tracking-widest block">Wallet Summary</span>
                    
                    {/* Spot Card */}
                    <div 
                      onClick={() => setActiveTab("SPOT")}
                      className="flex justify-between items-center bg-[#121218] border border-hairline-on-dark rounded-2xl p-4 hover:border-primary/30 transition-all cursor-pointer shadow-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <span className="text-xs font-extrabold font-mono">SP</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-white group-hover:text-primary transition-colors">Spot Wallet</span>
                          <span className="text-[9px] text-muted font-mono uppercase">Standard Assets</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-mono block">
                          {formatCurrency(spotWallet ? Number(spotWallet.balance) : 0)}
                        </span>
                        <span className="text-[9px] text-muted font-mono block">Avail: {formatCurrency(spotWallet ? Number(spotWallet.availableBalance) : 0)}</span>
                      </div>
                    </div>

                    {/* Futures Card */}
                    <div 
                      onClick={() => setActiveTab("FUTURES")}
                      className="flex justify-between items-center bg-[#121218] border border-hairline-on-dark rounded-2xl p-4 hover:border-primary/30 transition-all cursor-pointer shadow-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#3bc1eb]/10 flex items-center justify-center text-[#3bc1eb]">
                          <span className="text-xs font-extrabold font-mono">FT</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-white group-hover:text-primary transition-colors">Futures Wallet</span>
                          <span className="text-[9px] text-muted font-mono uppercase">Leveraged Perp Contract</span>
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
                    <div className="flex justify-between items-center bg-[#121218] border border-hairline-on-dark rounded-2xl p-4 hover:border-primary/10 transition-all shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#02c076]/10 flex items-center justify-center text-[#02c076]">
                          <span className="text-xs font-extrabold font-mono">MG</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-white">Margin Wallet</span>
                          <span className="text-[9px] text-muted font-mono uppercase">Lending & Borrowing</span>
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

                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 2: SPOT PORTFOLIO */}
              {/* ============================================================== */}
              {activeTab === "SPOT" && (
                <div className="space-y-6">
                  
                  {/* Spot Metrics cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="interactive-surface bg-[#121218] border border-hairline-on-dark rounded-2xl p-5 shadow-elevation-sm">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider block">Spot Total Balance</span>
                      <h3 className="text-2xl font-extrabold font-mono text-white mt-1.5">
                        {formatCurrency(spotWallet ? Number(spotWallet.balance) : 0)}
                      </h3>
                    </Card>
                    <Card className="interactive-surface bg-[#121218] border border-hairline-on-dark rounded-2xl p-5 shadow-elevation-sm">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider block">Spot Available</span>
                      <h3 className="text-2xl font-extrabold font-mono text-trading-up mt-1.5">
                        {formatCurrency(spotWallet ? Number(spotWallet.availableBalance) : 0)}
                      </h3>
                    </Card>
                    <Card className="interactive-surface bg-[#121218] border border-hairline-on-dark rounded-2xl p-5 shadow-elevation-sm">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider block">In-Order / Locked</span>
                      <h3 className="text-2xl font-extrabold font-mono text-muted mt-1.5">
                        {formatCurrency(spotWallet ? Number(spotWallet.lockedFunds) : 0)}
                      </h3>
                    </Card>
                  </div>

                  {/* Redesigned Spot Holdings grid of Token Cards */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                          <Coins size={14} className="text-primary" />
                          Crypto Holdings
                        </h4>
                        <p className="text-[10px] text-muted">Click any asset card below to initiate transfers or simulated deposits.</p>
                      </div>

                      {/* Search box input */}
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
                        <input
                          type="text"
                          placeholder="Search asset symbol..."
                          value={spotSearch}
                          onChange={(e) => setSpotSearch(e.target.value)}
                          className="bg-[#121218] border border-hairline-on-dark rounded-xl pl-8 pr-3 py-2 text-xs font-mono w-full text-white placeholder-muted outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {spotHoldings.map((hold) => (
                        <div 
                          key={hold.symbol}
                          className={`relative rounded-2xl p-5 border border-hairline-on-dark/80 bg-gradient-to-br ${hold.color} hover:border-primary/30 transition-all duration-300 shadow-sm flex flex-col justify-between h-48 group overflow-hidden`}
                        >
                          <div className="absolute right-0 top-0 w-24 h-24 rounded-full opacity-10 blur-xl pointer-events-none" style={{ backgroundColor: hold.badgeColor }} />
                          
                          <div>
                            {/* Coin Info */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: hold.badgeColor }}>
                                  {hold.symbol.substring(0, 2)}
                                </div>
                                <div>
                                  <span className="text-xs font-bold block text-white">{hold.symbol}</span>
                                  <span className="text-[9px] text-muted-strong font-sans">{hold.name}</span>
                                </div>
                              </div>

                              <span className={`text-[10px] font-mono font-bold ${hold.change24h >= 0 ? "text-trading-up" : "text-trading-down"}`}>
                                {hold.change24h >= 0 ? "+" : ""}{hold.change24h}%
                              </span>
                            </div>

                            {/* Balance details */}
                            <div className="mt-4 font-mono">
                              <span className="text-[10px] text-muted block uppercase">Available Balance</span>
                              <span className="text-lg font-bold text-white block mt-0.5">
                                {hold.balance.toFixed(4)} <span className="text-xs text-muted-strong">{hold.symbol}</span>
                              </span>
                              <span className="text-[10px] text-muted-strong block mt-0.5">≈ {formatCurrency(hold.totalValue)}</span>
                            </div>
                          </div>

                          {/* Quick Overlay Actions */}
                          <div className="flex gap-1.5 border-t border-hairline-on-dark/20 pt-3 mt-4">
                            <button
                              onClick={() => setTransferModal({ open: true, from: "SPOT", to: "FUTURES", amount: hold.balance.toFixed(4) })}
                              className="flex-1 py-1 text-[9px] font-bold font-mono rounded bg-white/[0.04] hover:bg-white/[0.1] border border-hairline-on-dark text-white text-center transition-colors"
                            >
                              Transfer
                            </button>
                            <button
                              onClick={() => setDepositModal({ open: true, walletType: "SPOT", amount: "" })}
                              className="flex-1 py-1 text-[9px] font-bold font-mono rounded bg-primary/10 hover:bg-primary/20 border border-primary/25 text-primary text-center transition-colors"
                            >
                              Deposit
                            </button>
                          </div>

                        </div>
                      ))}
                      {spotHoldings.length === 0 && (
                        <div className="col-span-full py-16 text-center text-muted text-xs">No assets matched your search filter.</div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 3: FUTURES LEDGER */}
              {/* ============================================================== */}
              {activeTab === "FUTURES" && (
                <div className="space-y-6">
                  
                  {/* Futures Metrics grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="interactive-surface bg-[#121218] border border-hairline-on-dark rounded-xl p-5 shadow-elevation-sm">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider block">Futures Total Value</span>
                      <h3 className="text-xl font-extrabold font-mono text-white mt-1.5">
                        {formatCurrency(futuresWallet ? Number(futuresWallet.balance) : 0)}
                      </h3>
                    </Card>
                    <Card className="interactive-surface bg-[#121218] border border-hairline-on-dark rounded-xl p-5 shadow-elevation-sm">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider block">Unrealized profit/loss</span>
                      <h3 className={`text-xl font-extrabold font-mono mt-1.5 ${
                        (futuresWallet ? Number(futuresWallet.unrealizedPnL) : 0) >= 0 ? "text-trading-up" : "text-trading-down"
                      }`}>
                        {(futuresWallet ? Number(futuresWallet.unrealizedPnL) : 0) >= 0 ? "+" : ""}
                        {formatCurrency(futuresWallet ? Number(futuresWallet.unrealizedPnL) : 0)}
                      </h3>
                    </Card>
                    <Card className="interactive-surface bg-[#121218] border border-hairline-on-dark rounded-xl p-5 shadow-elevation-sm">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider block">Margin Locked</span>
                      <h3 className="text-xl font-extrabold font-mono text-white mt-1.5">
                        {formatCurrency(futuresWallet ? Number(futuresWallet.lockedFunds) : 0)}
                      </h3>
                    </Card>
                    <Card className="interactive-surface bg-[#121218] border border-hairline-on-dark rounded-xl p-5 shadow-elevation-sm">
                      <span className="font-mono text-xs text-muted uppercase tracking-wider block">Leveraged Exposure</span>
                      <h3 className="text-xl font-extrabold font-mono text-primary mt-1.5">
                        {futuresPositions.length} Positions
                      </h3>
                    </Card>
                  </div>

                  {/* Futures Active Positions Table */}
                  <Card className="bg-[#121218] border border-hairline-on-dark rounded-2xl overflow-hidden shadow-elevation-md">
                    <CardHeader className="bg-[#181822] p-5 border-b border-hairline-on-dark flex flex-row items-center justify-between">
                      <div>
                        <h4 className="font-heading text-xs font-bold text-white uppercase tracking-wider">Active Futures Positions</h4>
                        <p className="text-[10px] text-muted mt-0.5">Simulated leveraged exposures and margin buffer ratios.</p>
                      </div>
                      <span className="text-[9px] font-mono bg-trading-up/10 text-trading-up px-2.5 py-0.5 rounded font-bold">Positions: {futuresPositions.length}</span>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse font-mono text-xs">
                          <thead>
                            <tr className="border-b border-hairline-on-dark text-[9px] font-bold text-muted uppercase tracking-wider bg-canvas-dark/20 py-2.5">
                              <th className="py-2.5 px-6">Symbol</th>
                              <th className="py-2.5 px-6">Position Mode</th>
                              <th className="py-2.5 px-6 text-right">Size</th>
                              <th className="py-2.5 px-6 text-right">Entry Price</th>
                              <th className="py-2.5 px-6 text-right">Leverage</th>
                              <th className="py-2.5 px-6 text-center">Margin Ratio Buffer</th>
                              <th className="py-2.5 px-6 text-right">Unrealized PnL</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-hairline-on-dark">
                            {futuresPositions.map((p) => {
                              const pnlVal = parseFloat(p.unrealizedPnL || "0");
                              const isProfit = pnlVal >= 0;
                              const marginPercentage = Math.min(100, Math.max(1, (Number(p.collateral) / (p.quantity * p.entryPrice || 1)) * 100 * p.leverage));
                              return (
                                <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                                  <td className="py-3.5 px-6 font-bold text-white">{p.symbol}</td>
                                  <td className="py-3.5 px-6">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                      p.positionMode === "LONG" ? "bg-trading-up/10 text-trading-up" : "bg-trading-down/10 text-trading-down"
                                    }`}>
                                      {p.positionMode}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-6 text-right font-semibold text-white">{p.quantity}</td>
                                  <td className="py-3.5 px-6 text-right text-muted">{formatCurrency(p.entryPrice)}</td>
                                  <td className="py-3.5 px-6 text-right text-primary font-extrabold">{p.leverage}x</td>
                                  <td className="py-3.5 px-6">
                                    <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                                      <div className="w-full h-1.5 rounded-full bg-canvas-dark overflow-hidden flex">
                                        <div className="h-full bg-trading-up" style={{ width: `${marginPercentage}%` }} />
                                      </div>
                                      <span className="text-[8px] text-muted mt-0.5">{marginPercentage.toFixed(1)}% Collateral</span>
                                    </div>
                                  </td>
                                  <td className={`py-3.5 px-6 text-right font-bold text-sm ${isProfit ? "text-trading-up" : "text-trading-down"}`}>
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
            </motion.div>
          </AnimatePresence>
        )}

        {/* ============================================================== */}
        {/* ADD FUNDS / DEPOSIT MODAL */}
        {/* ============================================================== */}
        <Dialog open={depositModal.open} onOpenChange={(open) => setDepositModal(prev => ({ ...prev, open, amount: open ? prev.amount : "" }))}>
          <DialogContent className="bg-[#121218] border-hairline-on-dark max-w-md w-full p-0 overflow-hidden shadow-elevation-lg text-white">
            <DialogHeader className="bg-[#181822] border-b border-hairline-on-dark px-5 py-4 flex flex-row justify-between items-center space-y-0">
              <DialogTitle className="font-heading text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <PlusCircle className="text-primary" size={16} />
                Deposit Simulated Capital
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={(e) => { e.preventDefault(); executeModalDeposit(); }} className="p-5 space-y-4 font-mono text-xs">
              
              <p className="text-[11px] text-muted leading-relaxed font-sans border-b border-hairline-on-dark/30 pb-3">
                This is a simulated paper trading platform. You can instantly credit virtual funds to any of your wallets for free.
              </p>

              {/* Target Wallet selection */}
              <div>
                <label className="text-[9px] text-muted uppercase tracking-widest mb-1.5 block">
                  Destination Wallet
                </label>
                <select
                  value={depositModal.walletType}
                  onChange={(e) => setDepositModal({ ...depositModal, walletType: e.target.value })}
                  className="bg-canvas-dark border border-hairline-on-dark text-xs text-white w-full rounded-xl px-3 py-2 cursor-pointer outline-none focus:border-primary"
                >
                  <option value="SPOT">SPOT WALLET</option>
                  <option value="MARGIN">MARGIN WALLET</option>
                  <option value="FUTURES">FUTURES WALLET</option>
                  <option value="OPTIONS">OPTIONS WALLET</option>
                </select>
              </div>

              {/* Amount input */}
              <div>
                <label className="text-[9px] text-muted uppercase tracking-widest mb-1.5 block">
                  Deposit Amount (USD)
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
                    className="bg-canvas-dark border border-hairline-on-dark text-sm text-white w-full rounded-xl px-3 py-2.5 pr-12 outline-none focus:border-primary transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs font-mono">USD</span>
                </div>
              </div>

              {/* Instant Quick Deposit Presets */}
              <div className="space-y-1.5 border-t border-hairline-on-dark/40 pt-3">
                <label className="text-[9px] text-muted uppercase tracking-widest block">
                  Instant One-Click Presets
                </label>
                <div className="flex gap-2">
                  {[1000, 10000, 100000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => executeModalDeposit(amt)}
                      className="flex-1 py-2 text-xs font-mono font-bold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/25 rounded-lg transition-all"
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
                  className="flex-1 py-2.5 text-xs font-mono font-bold border border-hairline-on-dark text-white rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-mono font-bold bg-primary text-on-primary hover:bg-[#f0b90b] rounded-lg transition-colors"
                >
                  CONFIRM DEPOSIT
                </button>
              </div>

            </form>
          </DialogContent>
        </Dialog>

        {/* ============================================================== */}
        {/* TRANSFER MODAL */}
        {/* ============================================================== */}
        <Dialog open={transferModal.open} onOpenChange={(open) => setTransferModal(prev => ({ ...prev, open, amount: open ? prev.amount : "" }))}>
          <DialogContent className="bg-[#121218] border-hairline-on-dark max-w-md w-full p-0 overflow-hidden shadow-elevation-lg text-white">
            <DialogHeader className="bg-[#181822] border-b border-hairline-on-dark px-5 py-4 flex flex-row justify-between items-center space-y-0">
              <DialogTitle className="font-heading text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw className="text-primary" size={16} />
                Transfer Assets Internally
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={executeTransfer} className="p-5 space-y-4 font-mono text-xs">
              
              {/* Transfer route selects */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-muted uppercase tracking-widest mb-1.5 block">
                    From Wallet
                  </label>
                  <select
                    value={transferModal.from}
                    onChange={(e) => setTransferModal({ ...transferModal, from: e.target.value })}
                    className="bg-canvas-dark border border-hairline-on-dark text-xs text-white w-full rounded-xl px-3 py-2 cursor-pointer outline-none focus:border-primary"
                  >
                    <option value="SPOT">SPOT</option>
                    <option value="MARGIN">MARGIN</option>
                    <option value="FUTURES">FUTURES</option>
                    <option value="OPTIONS">OPTIONS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-muted uppercase tracking-widest mb-1.5 block">
                    To Wallet
                  </label>
                  <select
                    value={transferModal.to}
                    onChange={(e) => setTransferModal({ ...transferModal, to: e.target.value })}
                    className="bg-canvas-dark border border-hairline-on-dark text-xs text-white w-full rounded-xl px-3 py-2 cursor-pointer outline-none focus:border-primary"
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
                  <label className="text-[9px] text-muted uppercase tracking-widest block">
                    Transfer Amount
                  </label>
                  <span className="text-[9px] text-muted">
                    Avail: {formatCurrency(
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
                    className="bg-canvas-dark border border-hairline-on-dark text-sm text-white w-full rounded-xl px-3 py-2.5 pr-12 outline-none focus:border-primary transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs">USD</span>
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
                    className="flex-1 py-1.5 text-[9px] bg-canvas-dark border border-hairline-on-dark text-muted hover:text-white rounded-lg transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setTransferModal({ ...transferModal, open: false })}
                  className="flex-1 py-2.5 text-xs font-mono font-bold border border-hairline-on-dark text-white rounded-lg hover:bg-white/[0.02] transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-mono font-bold bg-primary text-on-primary hover:bg-[#f0b90b] rounded-lg transition-colors"
                >
                  CONFIRM TRANSFER
                </button>
              </div>

            </form>
          </DialogContent>
        </Dialog>


      </div>
    </PageTransition>
  );
}
