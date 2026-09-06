import React, { useEffect, useState, useMemo } from "react";
import { 
  fetchWallets, 
  depositToWallet, 
  transferBetweenWallets, 
  fetchOpenFuturesPositions,
  fetchOrderHistory,
  fetchActiveOrders,
  withdrawFromWallet
} from "../api";
import { PageTransition } from "../components/ui/PageTransition";
import { formatCurrency } from "../lib/utils";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Search, 
  Check, 
  TrendingUp, 
  Plus,
  X,
  Coins,
  Activity,
  Layers,
  Repeat,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Home,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  ArrowRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function WalletsPage() {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [futuresPositions, setFuturesPositions] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Tabs: OVERVIEW | TRANSACTIONS
  const [activeTab, setActiveTab] = useState("OVERVIEW"); 
  const [txFilter, setTxFilter] = useState("ALL"); // ALL | BUY | SELL
  const [searchQuery, setSearchQuery] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  // Action Modals State
  const [depositModal, setDepositModal] = useState({ open: false, walletType: "SPOT", amount: "" });
  const [transferModal, setTransferModal] = useState({ open: false, from: "SPOT", to: "FUTURES", amount: "" });
  const [withdrawModal, setWithdrawModal] = useState({ open: false, walletType: "SPOT", amount: "", address: "" });

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
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (e) {
      setError("Failed to synchronize wallet metrics. Please verify your login session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Deposit function
  const handleQuickDeposit = async (walletType, amount) => {
    try {
      setError("");
      setSuccessMessage(`Processing deposit of $${amount} into ${walletType}...`);
      await depositToWallet(walletType, amount);
      setSuccessMessage(`Successfully deposited $${amount} into your ${walletType} wallet!`);
      await loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (e) {
      setError(e.message || "Failed to process deposit.");
      setSuccessMessage("");
    }
  };

  const executeDepositModal = async (e) => {
    e.preventDefault();
    const amt = parseFloat(depositModal.amount);
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
      setTransferModal({ ...transferModal, open: false, amount: "" });
      await transferBetweenWallets(transferModal.from, transferModal.to, amt);
      setSuccessMessage(`Successfully transferred ${formatCurrency(amt)} from ${transferModal.from} to ${transferModal.to}!`);
      await loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to transfer funds.");
      setSuccessMessage("");
    }
  };

  const executeWithdrawal = async (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawModal.amount);
    if (isNaN(amt) || amt <= 0) {
      setError("Please specify a valid withdrawal amount.");
      return;
    }
    try {
      setError("");
      setSuccessMessage(`Processing withdrawal of ${formatCurrency(amt)} from ${withdrawModal.walletType}...`);
      setWithdrawModal({ ...withdrawModal, open: false, amount: "", address: "" });
      await withdrawFromWallet(withdrawModal.walletType, amt, withdrawModal.address || "0xUserAddress", "BEP20");
      setSuccessMessage(`Successfully processed withdrawal of ${formatCurrency(amt)}!`);
      await loadData();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to process withdrawal.");
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

  // Real backend order transactions mapping
  const realTransactions = useMemo(() => {
    return orderHistory.map((ord, idx) => ({
      id: ord.id ? `ORD-${ord.id}` : `ORD-${idx + 100}`,
      symbol: ord.symbol || "BTCUSDT",
      side: ord.side || "BUY",
      type: ord.type || "LIMIT",
      amount: ord.price ? `$${Number(ord.price).toLocaleString()}` : "$0.00",
      quantity: ord.quantity || ord.amount || "1.0",
      status: ord.status || "FILLED",
      date: ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : "Recent"
    }));
  }, [orderHistory]);

  const filteredTransactions = useMemo(() => {
    return realTransactions.filter((tx) => {
      const matchesSearch = tx.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || tx.side.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = txFilter === "ALL" || tx.side === txFilter;
      return matchesSearch && matchesFilter;
    });
  }, [realTransactions, searchQuery, txFilter]);

  if (loading && wallets.length === 0) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[500px] bg-[#121316] text-white font-openrunde">
          <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-[#c4f000] border-t-transparent animate-spin" />
            Synchronizing Wallet Balances...
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#121316] text-white font-openrunde p-3 sm:p-6 lg:p-8 flex justify-center">
        
        {/* MAIN DASHBOARD CONTAINER */}
        <div className="w-full max-w-[1380px] bg-[#1a1b20] border border-white/5 rounded-[32px] sm:rounded-[36px] p-4 sm:p-6 lg:p-7 flex flex-col md:flex-row gap-6 shadow-2xl overflow-hidden">
          
          {/* FLOATING LEFT PILL NAVBAR */}
          <aside className="bg-[#24252c] border border-white/5 rounded-[26px] sm:rounded-[30px] p-3 py-5 sm:py-6 flex md:flex-col items-center justify-between shrink-0 w-full md:w-20 shadow-lg self-stretch">
            
            {/* Top Brand & Nav Icons */}
            <div className="flex md:flex-col items-center gap-6 w-full">
              <Link to="/" className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center font-black text-xl text-white transition-transform hover:scale-105">
                H
              </Link>

              {/* Icon Menu Stack */}
              <nav className="flex md:flex-col items-center gap-3.5 w-full">
                <button
                  onClick={() => navigate("/profile")}
                  title="Profile Overview"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all"
                >
                  <Home size={19} />
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  title="Security & Verification"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all"
                >
                  <Calendar size={19} />
                </button>

                {/* Active Wallet Icon */}
                <button
                  title="Wallets & Assets"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#c4f000] text-black shadow-lg shadow-[#c4f000]/25 flex items-center justify-center transition-all"
                >
                  <BarChart3 size={19} />
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  title="Settings"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all"
                >
                  <Settings size={19} />
                </button>

                <button
                  title="Notifications"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all relative"
                >
                  <Bell size={19} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#c4f000] rounded-full" />
                </button>
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="flex md:flex-col items-center gap-3">
              <button
                onClick={() => navigate("/auth")}
                title="Log Out"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all cursor-pointer"
              >
                <LogOut size={19} />
              </button>

              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#375bf5] to-[#c4f000] p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-[#1a1b20] flex items-center justify-center font-bold text-xs sm:text-sm text-white">
                  W
                </div>
              </div>
            </div>

          </aside>

          {/* MAIN DASHBOARD CONTENT AREA */}
          <main className="flex-1 space-y-6 overflow-hidden">
            
            {/* TOP HEADER: Title + Action Buttons */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  Wallet & Capital Overview
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-normal mt-0.5">
                  Manage multi-wallet balances, instant deposits, and internal transfers.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setDepositModal({ open: true, walletType: "SPOT", amount: "5000" })}
                  className="bg-[#c4f000] hover:bg-[#b5dc00] text-black font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all shadow-md shadow-[#c4f000]/20 shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>+ $5,000 Deposit</span>
                </button>

                <button
                  onClick={() => setTransferModal({ open: true, from: "SPOT", to: "FUTURES", amount: "" })}
                  className="bg-[#375bf5] hover:bg-[#2c4ee0] text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all shadow-md shadow-[#375bf5]/25 shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Repeat size={15} />
                  <span>Transfer</span>
                </button>

                <button
                  onClick={() => setWithdrawModal({ open: true, walletType: "SPOT", amount: "", address: "" })}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-full transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpRight size={15} />
                  <span>Withdraw</span>
                </button>
              </div>
            </header>

            {/* ERROR / SUCCESS ALERTS */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError("")} className="hover:text-white">✕</button>
              </div>
            )}
            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-[#c4f000]/10 border border-[#c4f000]/20 text-[#c4f000] text-xs font-semibold flex items-center justify-between">
                <span>{successMessage}</span>
                <button onClick={() => setSuccessMessage("")} className="hover:text-white">✕</button>
              </div>
            )}

            {/* SUB-NAV TABS FOR WALLET DASHBOARD */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <button
                onClick={() => setActiveTab("OVERVIEW")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "OVERVIEW"
                    ? "bg-[#c4f000] text-black font-extrabold shadow-md shadow-[#c4f000]/20"
                    : "text-slate-400 hover:text-white bg-white/5"
                }`}
              >
                Capital Overview
              </button>

              <button
                onClick={() => setActiveTab("TRANSACTIONS")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "TRANSACTIONS"
                    ? "bg-[#c4f000] text-black font-extrabold shadow-md shadow-[#c4f000]/20"
                    : "text-slate-400 hover:text-white bg-white/5"
                }`}
              >
                Order & Trade History
              </button>
            </div>

            {/* VIEW TAB 1: OVERVIEW */}
            {activeTab === "OVERVIEW" && (
              <div className="space-y-6">
                
                {/* TOP GRID: MAIN CHART CARD + ROYAL BLUE SUMMARY CARD */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* MAIN ANALYTICS CHART CARD (7 Cols) */}
                  <div className="lg:col-span-7 bg-[#24252c] border border-white/5 rounded-[28px] p-6 space-y-6 flex flex-col justify-between">
                    
                    {/* Header Title & Dropdown */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-white tracking-tight">Net Equity Curve</h2>
                      <button onClick={loadData} className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                        <RefreshCw size={12} /> Sync
                      </button>
                    </div>

                    {/* Glowing Multi-Node SVG Line Chart */}
                    <div className="relative w-full h-44 py-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="walletChartGradient1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c4f000" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#c4f000" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Green Line */}
                        <path
                          d="M0,85 Q70,90 140,50 T260,70 T380,35 T500,55"
                          fill="none"
                          stroke="#c4f000"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M0,85 Q70,90 140,50 T260,70 T380,35 T500,55 L500,120 L0,120 Z"
                          fill="url(#walletChartGradient1)"
                        />

                        {/* Blue Line */}
                        <path
                          d="M0,60 Q90,30 200,70 T340,30 T500,45"
                          fill="none"
                          stroke="#375bf5"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                        />

                        {/* Highlight Nodes */}
                        <circle cx="140" cy="50" r="5" fill="#c4f000" />
                        <circle cx="340" cy="30" r="5" fill="#375bf5" />
                      </svg>
                    </div>

                    {/* 3 Bottom Metric Stat Columns */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5 text-left">
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Total Balance</div>
                        <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
                          {formatCurrency(totalPortfolioValue)}
                        </div>
                        <div className="text-[11px] text-[#c4f000] mt-1">Live Net Equity</div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400 font-medium">Spot Balance</div>
                        <div className="text-xl sm:text-2xl font-extrabold text-[#c4f000] tracking-tight mt-0.5">
                          {formatCurrency(spotWallet ? Number(spotWallet.balance || 0) : 0)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">Available for Orders</div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400 font-medium">Futures Collateral</div>
                        <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
                          {formatCurrency(futuresWallet ? Number(futuresWallet.balance || 0) : 0)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">125x Leverage Cap</div>
                      </div>
                    </div>

                  </div>

                  {/* ROYAL BLUE SUB-ACCOUNT BREAKDOWN CARD (5 Cols) */}
                  <div className="lg:col-span-5 bg-[#375bf5] rounded-[28px] p-6 text-white flex flex-col justify-between shadow-xl shadow-[#375bf5]/20">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold tracking-tight">Sub-Account Balances</h2>
                      <span className="text-xs text-white/80 font-medium">Refreshed {lastRefreshed}</span>
                    </div>

                    {/* Sub-Accounts List */}
                    <div className="space-y-3.5 my-4">
                      
                      {/* Spot Wallet */}
                      <div className="bg-black/20 rounded-2xl p-4 flex items-center justify-between hover:bg-black/30 transition-colors">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Coins size={14} className="text-[#c4f000]" /> Spot Wallet
                          </div>
                          <div className="text-[10px] text-white/70 mt-0.5">Available for Spot orders</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-[#c4f000]">
                            {formatCurrency(spotWallet ? Number(spotWallet.balance || 0) : 0)}
                          </div>
                          <div className="text-[10px] text-white/60 font-medium">Active</div>
                        </div>
                      </div>

                      {/* Futures Wallet */}
                      <div className="bg-black/20 rounded-2xl p-4 flex items-center justify-between hover:bg-black/30 transition-colors">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <TrendingUp size={14} className="text-white" /> Futures Wallet
                          </div>
                          <div className="text-[10px] text-white/70 mt-0.5">Leverage Trading Collateral</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-white">
                            {formatCurrency(futuresWallet ? Number(futuresWallet.balance || 0) : 0)}
                          </div>
                          <div className="text-[10px] text-white/60 font-medium">125x Max</div>
                        </div>
                      </div>

                      {/* Margin Wallet */}
                      <div className="bg-black/20 rounded-2xl p-4 flex items-center justify-between hover:bg-black/30 transition-colors">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Layers size={14} className="text-white/80" /> Margin Wallet
                          </div>
                          <div className="text-[10px] text-white/70 mt-0.5">Borrowed Trading Capital</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-white">
                            {formatCurrency(marginWallet ? Number(marginWallet.balance || 0) : 0)}
                          </div>
                          <div className="text-[10px] text-white/60 font-medium">Cross 3x</div>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* BOTTOM GRID CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* CARD 1: DONUT HEALTH RING (6 Cols) */}
                  <div className="md:col-span-6 bg-[#24252c] border border-white/5 rounded-[28px] p-6 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-400">Account Safety</div>
                      <div className="text-sm font-semibold text-white mt-1">Optimal Execution Mode</div>
                      <div className="text-[11px] text-slate-500 mt-2">Zero Liquidation Warnings</div>
                    </div>

                    {/* Circular Progress Ring */}
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-white/10"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-[#c4f000]"
                          strokeDasharray="100, 100"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-xs font-extrabold text-white">100%</span>
                    </div>
                  </div>

                  {/* CARD 2: QUICK TRADE LINK (6 Cols) */}
                  <div className="md:col-span-6 bg-[#24252c] border border-white/5 rounded-[28px] p-6 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-400">Trade Spot Market</div>
                      <div className="text-sm font-semibold text-white mt-1">Execute Instant Orders</div>
                      <div className="text-[11px] text-slate-500 mt-2">Zero Commission Fee Tier</div>
                    </div>

                    <Link
                      to="/trade/spot"
                      className="bg-[#c4f000] hover:bg-[#b5dc00] text-black font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-md flex items-center gap-1.5"
                    >
                      <span>Trade Spot</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                </div>

              </div>
            )}

            {/* VIEW TAB 2: TRANSACTIONS & HISTORY FEED */}
            {activeTab === "TRANSACTIONS" && (
              <div className="bg-[#24252c] border border-white/5 rounded-[28px] p-6 space-y-6 shadow-xl">
                
                {/* Header Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {["ALL", "BUY", "SELL"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setTxFilter(tab)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          txFilter === tab
                            ? "bg-[#c4f000] text-black font-extrabold"
                            : "bg-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Search input */}
                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search symbol or side..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#1a1b20] border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#c4f000]"
                    />
                  </div>
                </div>

                {/* Transactions Table Feed */}
                {filteredTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-4 rounded-2xl bg-[#1a1b20] border border-white/5 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            tx.side === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                          }`}>
                            <Coins size={18} />
                          </div>

                          <div>
                            <div className="text-sm font-bold text-white">{tx.symbol} • {tx.side}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>Qty: {tx.quantity}</span>
                              <span>•</span>
                              <span>{tx.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-sm font-extrabold ${tx.side === "BUY" ? "text-emerald-400" : "text-white"}`}>
                            {tx.amount}
                          </div>
                          <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-1">
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs font-medium space-y-2">
                    <Activity size={24} className="mx-auto text-slate-500" />
                    <div>No order history found for your account.</div>
                  </div>
                )}

              </div>
            )}

          </main>

        </div>

        {/* DEPOSIT MODAL */}
        {depositModal.open && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#24252c] border border-white/10 rounded-[28px] p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-base font-bold">Deposit Capital</h3>
                <button onClick={() => setDepositModal({ ...depositModal, open: false })} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={executeDepositModal} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Target Wallet</label>
                  <select
                    value={depositModal.walletType}
                    onChange={(e) => setDepositModal({ ...depositModal, walletType: e.target.value })}
                    className="w-full bg-[#1a1b20] border border-white/10 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none"
                  >
                    <option value="SPOT">Spot Wallet</option>
                    <option value="FUTURES">Futures Wallet</option>
                    <option value="MARGIN">Margin Wallet</option>
                    <option value="OPTIONS">Options Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Deposit Amount ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 5000"
                    value={depositModal.amount}
                    onChange={(e) => setDepositModal({ ...depositModal, amount: e.target.value })}
                    className="w-full bg-[#1a1b20] border border-white/10 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDepositModal({ ...depositModal, open: false })}
                    className="bg-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-full cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#c4f000] text-black font-extrabold text-xs px-6 py-2.5 rounded-full shadow-md cursor-pointer"
                  >
                    Confirm Deposit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TRANSFER MODAL */}
        {transferModal.open && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#24252c] border border-white/10 rounded-[28px] p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-base font-bold">Transfer Between Wallets</h3>
                <button onClick={() => setTransferModal({ ...transferModal, open: false })} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={executeTransfer} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">From</label>
                    <select
                      value={transferModal.from}
                      onChange={(e) => setTransferModal({ ...transferModal, from: e.target.value })}
                      className="w-full bg-[#1a1b20] border border-white/10 text-white text-xs px-3 py-2.5 rounded-2xl focus:outline-none"
                    >
                      <option value="SPOT">Spot Wallet</option>
                      <option value="FUTURES">Futures Wallet</option>
                      <option value="MARGIN">Margin Wallet</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">To</label>
                    <select
                      value={transferModal.to}
                      onChange={(e) => setTransferModal({ ...transferModal, to: e.target.value })}
                      className="w-full bg-[#1a1b20] border border-white/10 text-white text-xs px-3 py-2.5 rounded-2xl focus:outline-none"
                    >
                      <option value="FUTURES">Futures Wallet</option>
                      <option value="SPOT">Spot Wallet</option>
                      <option value="MARGIN">Margin Wallet</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Amount ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1000"
                    value={transferModal.amount}
                    onChange={(e) => setTransferModal({ ...transferModal, amount: e.target.value })}
                    className="w-full bg-[#1a1b20] border border-white/10 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setTransferModal({ ...transferModal, open: false })}
                    className="bg-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-full cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#375bf5] text-white font-extrabold text-xs px-6 py-2.5 rounded-full shadow-md cursor-pointer"
                  >
                    Execute Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* WITHDRAWAL MODAL */}
        {withdrawModal.open && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#24252c] border border-white/10 rounded-[28px] p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-base font-bold">Withdraw Capital</h3>
                <button onClick={() => setWithdrawModal({ ...withdrawModal, open: false })} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={executeWithdrawal} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Source Wallet</label>
                  <select
                    value={withdrawModal.walletType}
                    onChange={(e) => setWithdrawModal({ ...withdrawModal, walletType: e.target.value })}
                    className="w-full bg-[#1a1b20] border border-white/10 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none"
                  >
                    <option value="SPOT">Spot Wallet</option>
                    <option value="FUTURES">Futures Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Withdrawal Address (BEP20 / TRC20)</label>
                  <input
                    type="text"
                    placeholder="e.g. 0x71C...89A"
                    value={withdrawModal.address}
                    onChange={(e) => setWithdrawModal({ ...withdrawModal, address: e.target.value })}
                    className="w-full bg-[#1a1b20] border border-white/10 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">Amount ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1000"
                    value={withdrawModal.amount}
                    onChange={(e) => setWithdrawModal({ ...withdrawModal, amount: e.target.value })}
                    className="w-full bg-[#1a1b20] border border-white/10 text-white text-sm px-4 py-2.5 rounded-2xl focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setWithdrawModal({ ...withdrawModal, open: false })}
                    className="bg-white/10 text-white font-bold text-xs px-4 py-2.5 rounded-full cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-red-500 text-white font-extrabold text-xs px-6 py-2.5 rounded-full shadow-md cursor-pointer"
                  >
                    Confirm Withdrawal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}
