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
import { formatCurrency, formatPercent } from "../lib/utils";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Search, 
  Copy, 
  Check, 
  PieChart, 
  TrendingUp, 
  ShieldCheck,
  PlusCircle,
  FileText,
  X,
  Coins,
  Activity,
  Info,
  Layers,
  Sparkles,
  Download,
  Upload,
  Repeat,
  Send,
  ArrowRight,
  ChevronDown,
  Clock,
  AlertCircle,
  CheckCircle2
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

  // Navigation tab
  const [activeTab, setActiveTab] = useState("OVERVIEW"); // OVERVIEW | SPOT | FUTURES | MARGIN

  // Search/Filters
  const [spotSearch, setSpotSearch] = useState("");
  const [hoveredSegment, setHoveredSegment] = useState(null);
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

  const executeModalDeposit = async (e) => {
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
      await withdrawFromWallet(withdrawModal.walletType, amt, withdrawModal.address || "0xSimulatedUserAddress", "BEP20");
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

  const allocationSegments = useMemo(() => {
    const total = totalPortfolioValue || 1;
    let cumulativePercent = 0;
    
    const orderedTypes = ["SPOT", "FUTURES", "MARGIN", "OPTIONS"];
    const colors = {
      SPOT: "#ff5722",
      FUTURES: "#918df6",
      MARGIN: "#33c758",
      OPTIONS: "#ffa600"
    };

    return orderedTypes.map((type) => {
      const w = walletMap[type];
      const val = w ? Number(w.balance || 0) : 0;
      const pct = totalPortfolioValue > 0 ? (val / total) * 100 : 25;
      
      const strokeDasharray = `${pct} ${100 - pct}`;
      const strokeDashoffset = 100 - cumulativePercent + 25; 
      cumulativePercent += pct;

      return {
        walletType: type,
        pct,
        color: colors[type] || "#181925",
        strokeDasharray,
        strokeDashoffset,
        balance: val
      };
    });
  }, [wallets, totalPortfolioValue, walletMap]);

  if (loading && wallets.length === 0) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-sm font-medium text-ash flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-carbon border-t-transparent animate-spin" />
            Loading Wallet Center...
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 py-8 font-openrunde space-y-6">
        
        {/* HERO HEADER & QUICK ACTIONS */}
        <div className="bg-white border border-fog/80 rounded-[24px] p-6 shadow-subtle-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-ember/10 text-ember flex items-center justify-center">
                <WalletIcon size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-carbon tracking-tight">Wallet Center</h1>
                <p className="text-xs text-ash font-medium">Manage your multi-wallet capital, instant deposits, transfers, and order history.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-ash mt-3 font-medium">
              <span>Refreshed: <span className="text-carbon font-bold">{lastRefreshed}</span></span>
              <button
                onClick={loadData}
                className="flex items-center gap-1 text-carbon font-bold hover:underline"
              >
                <RefreshCw size={12} /> Sync Balances
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setDepositModal({ open: true, walletType: "SPOT", amount: "" })}
              className="flex items-center justify-center gap-2 bg-ember hover:bg-ember/90 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-subtle"
            >
              <Download size={14} /> Deposit Funds
            </button>

            <button
              onClick={() => setTransferModal({ open: true, from: "SPOT", to: "FUTURES", amount: "" })}
              className="flex items-center justify-center gap-2 bg-mist hover:bg-fog text-carbon font-bold text-xs px-5 py-2.5 rounded-full border border-fog transition-all"
            >
              <Repeat size={14} /> Transfer Capital
            </button>

            <button
              onClick={() => setWithdrawModal({ open: true, walletType: "SPOT", amount: "", address: "" })}
              className="flex items-center justify-center gap-2 bg-mist hover:bg-fog text-carbon font-bold text-xs px-5 py-2.5 rounded-full border border-fog transition-all"
            >
              <Upload size={14} /> Withdraw
            </button>
          </div>
        </div>

        {/* FEEDBACK NOTIFICATIONS */}
        {error && (
          <div className="p-4 rounded-2xl bg-ember/10 text-ember text-xs font-bold flex items-center gap-2 border border-ember/20">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-mint-wash text-mint text-xs font-bold flex items-center gap-2 border border-mint/20">
            <CheckCircle2 size={16} /> {successMessage}
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex bg-mist p-1 rounded-2xl border border-fog w-fit">
          {["OVERVIEW", "SPOT", "FUTURES", "MARGIN"].map((tab) => (
            <button
              key={tab}
              onClick={() => { setError(""); setActiveTab(tab); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-white text-carbon shadow-subtle"
                  : "text-ash hover:text-carbon"
              }`}
            >
              {tab === "OVERVIEW" ? "Overview" : tab === "SPOT" ? "Spot Wallet" : tab === "FUTURES" ? "Futures Wallet" : "Margin Wallet"}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB CONTENT */}
        {activeTab === "OVERVIEW" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT 8 COLUMNS: CAPITAL OVERVIEW & ALLOCATION */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Total Net Worth Card */}
                <div className="bg-white border border-fog/80 rounded-[20px] p-6 space-y-4 shadow-subtle flex flex-col justify-between h-[200px]">
                  <div>
                    <span className="text-xs font-bold text-ash uppercase">Total Portfolio Capital</span>
                    <div className="text-3xl font-black text-carbon tracking-tight mt-2">
                      {formatCurrency(totalPortfolioValue)}
                    </div>
                    <span className="text-xs text-ash font-medium block mt-1">
                      ≈ BTC {(totalPortfolioValue / 68420).toFixed(5)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-fog/50 flex items-center justify-between text-xs">
                    <span className="text-ash font-medium">Multi-Wallet Status</span>
                    <span className="text-mint font-bold flex items-center gap-1 bg-mint-wash px-2.5 py-0.5 rounded-full text-[11px]">
                      <ShieldCheck size={12} /> Active
                    </span>
                  </div>
                </div>

                {/* Interactive Allocation Donut Chart */}
                <div className="bg-white border border-fog/80 rounded-[20px] p-6 shadow-subtle h-[200px] flex items-center justify-between gap-4">
                  
                  {/* SVG Donut Ring */}
                  <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                    <svg width="100%" height="100%" viewBox="0 0 42 42" className="-rotate-90">
                      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f5f5f5" strokeWidth="3.5" />
                      {allocationSegments.map((seg) => (
                        <circle
                          key={seg.walletType}
                          cx="21"
                          cy="21"
                          r="15.915"
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth={hoveredSegment === seg.walletType ? "4.5" : "3.5"}
                          strokeDasharray={seg.strokeDasharray}
                          strokeDashoffset={seg.strokeDashoffset}
                          onMouseEnter={() => setHoveredSegment(seg.walletType)}
                          onMouseLeave={() => setHoveredSegment(null)}
                          className="transition-all duration-300 cursor-pointer"
                        />
                      ))}
                    </svg>
                    <div className="absolute text-center pointer-events-none">
                      <span className="text-[9px] font-bold text-ash uppercase block">Allocation</span>
                      <span className="text-xs font-black text-carbon">100%</span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="space-y-2 flex-1 text-xs font-medium">
                    {allocationSegments.map((seg) => (
                      <div
                        key={seg.walletType}
                        onMouseEnter={() => setHoveredSegment(seg.walletType)}
                        onMouseLeave={() => setHoveredSegment(null)}
                        className={`flex justify-between items-center p-1.5 rounded-lg transition-colors cursor-pointer ${
                          hoveredSegment === seg.walletType ? "bg-mist font-bold" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                          <span className="text-carbon font-semibold text-[11px]">{seg.walletType}</span>
                        </div>
                        <span className="text-carbon font-bold text-[11px]">{seg.pct.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

              {/* REAL TRANSACTION & ORDER HISTORY LOG */}
              <div className="bg-white border border-fog/80 rounded-[20px] p-6 space-y-4 shadow-subtle">
                <div className="flex items-center justify-between border-b border-fog/50 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-carbon">Order & Transaction History</h3>
                    <p className="text-xs text-ash mt-0.5">Real-time trade executions and system balance operations</p>
                  </div>
                  <Link to="/orders" className="text-xs font-bold text-ember hover:underline">
                    View All Orders →
                  </Link>
                </div>

                {orderHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-fog text-ash font-medium text-[11px]">
                          <th className="pb-2.5">Date</th>
                          <th className="pb-2.5">Type</th>
                          <th className="pb-2.5">Symbol</th>
                          <th className="pb-2.5 text-right">Price</th>
                          <th className="pb-2.5 text-right">Quantity</th>
                          <th className="pb-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-fog/40">
                        {orderHistory.slice(0, 6).map((order, idx) => (
                          <tr key={order.id || idx} className="hover:bg-mist/50 transition-colors">
                            <td className="py-3 text-ash font-mono text-[11px]">
                              {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                            </td>
                            <td className="py-3">
                              <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                                order.side === "BUY" ? "bg-mint-wash text-mint" : "bg-ember/10 text-ember"
                              }`}>
                                {order.side || "TRADE"}
                              </span>
                            </td>
                            <td className="py-3 font-bold text-carbon">{order.symbol}</td>
                            <td className="py-3 text-right font-bold text-carbon">
                              {order.price ? formatCurrency(order.price) : "MARKET"}
                            </td>
                            <td className="py-3 text-right font-medium text-graphite">
                              {Number(order.quantity || 0).toFixed(4)}
                            </td>
                            <td className="py-3 text-center">
                              <span className="bg-mist text-carbon font-semibold text-[10px] px-2 py-0.5 rounded-full border border-fog uppercase">
                                {order.status || "COMPLETED"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-ash text-xs">
                    No order history recorded yet. Make your first trade or deposit funds to get started!
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT 4 COLUMNS: INDIVIDUAL WALLET SUMMARY CARDS */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-sm font-bold text-carbon">Wallet Breakdown</h3>

              {/* Spot Wallet Summary */}
              <div className="bg-white border border-fog/80 rounded-[20px] p-5 space-y-3 shadow-subtle hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-ember/10 text-ember flex items-center justify-center shrink-0">
                      <Coins size={13} />
                    </div>
                    <span className="text-xs font-bold text-carbon">Spot Wallet</span>
                  </div>
                  <span className="text-[10px] font-bold text-mint bg-mint-wash px-2 py-0.5 rounded-full">Available</span>
                </div>

                <div>
                  <div className="text-2xl font-black text-carbon tracking-tight">
                    {formatCurrency(spotWallet ? Number(spotWallet.balance || 0) : 0)}
                  </div>
                  <div className="text-[11px] text-ash mt-0.5">
                    Locked Funds: {formatCurrency(spotWallet ? Number(spotWallet.lockedFunds || 0) : 0)}
                  </div>
                </div>

                <div className="pt-2 border-t border-fog/50 flex items-center justify-between">
                  <button
                    onClick={() => setTransferModal({ open: true, from: "SPOT", to: "FUTURES", amount: "" })}
                    className="text-xs font-bold text-carbon hover:underline"
                  >
                    Transfer Funds
                  </button>
                  <Link to="/trade/spot" className="text-xs font-bold text-ember hover:underline flex items-center gap-0.5">
                    Trade Spot <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Futures Wallet Summary */}
              <div className="bg-white border border-fog/80 rounded-[20px] p-5 space-y-3 shadow-subtle hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-lavender/15 text-lavender flex items-center justify-center shrink-0">
                      <TrendingUp size={13} />
                    </div>
                    <span className="text-xs font-bold text-carbon">Futures Wallet</span>
                  </div>
                  <span className="text-[10px] font-bold text-lavender bg-lavender/10 px-2 py-0.5 rounded-full">125x Cap</span>
                </div>

                <div>
                  <div className="text-2xl font-black text-carbon tracking-tight">
                    {formatCurrency(futuresWallet ? Number(futuresWallet.balance || 0) : 0)}
                  </div>
                  <div className="text-[11px] text-ash mt-0.5">
                    Unrealized PnL: {formatCurrency(futuresWallet ? Number(futuresWallet.unrealizedPnL || 0) : 0)}
                  </div>
                </div>

                <div className="pt-2 border-t border-fog/50 flex items-center justify-between">
                  <button
                    onClick={() => setTransferModal({ open: true, from: "FUTURES", to: "SPOT", amount: "" })}
                    className="text-xs font-bold text-carbon hover:underline"
                  >
                    Transfer Funds
                  </button>
                  <Link to="/trade/futures" className="text-xs font-bold text-ember hover:underline flex items-center gap-0.5">
                    Trade Futures <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Margin Wallet Summary */}
              <div className="bg-white border border-fog/80 rounded-[20px] p-5 space-y-3 shadow-subtle hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-mint/15 text-mint flex items-center justify-center shrink-0">
                      <Layers size={13} />
                    </div>
                    <span className="text-xs font-bold text-carbon">Margin Wallet</span>
                  </div>
                  <span className="text-[10px] font-bold text-mint bg-mint-wash px-2 py-0.5 rounded-full">Cross / Isolated</span>
                </div>

                <div>
                  <div className="text-2xl font-black text-carbon tracking-tight">
                    {formatCurrency(marginWallet ? Number(marginWallet.balance || 0) : 0)}
                  </div>
                  <div className="text-[11px] text-ash mt-0.5">
                    Available: {formatCurrency(marginWallet ? Number(marginWallet.availableBalance || 0) : 0)}
                  </div>
                </div>

                <div className="pt-2 border-t border-fog/50 flex items-center justify-between">
                  <button
                    onClick={() => setTransferModal({ open: true, from: "MARGIN", to: "SPOT", amount: "" })}
                    className="text-xs font-bold text-carbon hover:underline"
                  >
                    Transfer Funds
                  </button>
                  <Link to="/trade/margin" className="text-xs font-bold text-ember hover:underline flex items-center gap-0.5">
                    Trade Margin <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SPOT WALLET TAB */}
        {activeTab === "SPOT" && (
          <div className="bg-white border border-fog/80 rounded-[24px] p-6 space-y-6 shadow-subtle-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-fog/50 pb-4">
              <div>
                <h3 className="text-base font-bold text-carbon">Spot Holdings & USDT Balance</h3>
                <p className="text-xs text-ash mt-0.5">Manage your liquid assets available for spot trading</p>
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
                <input
                  type="text"
                  placeholder="Filter assets..."
                  value={spotSearch}
                  onChange={(e) => setSpotSearch(e.target.value)}
                  className="bg-mist text-carbon text-xs pl-8 pr-4 py-2 rounded-xl border border-fog focus:outline-none focus:border-carbon w-48 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-5 rounded-[20px] bg-mist/50 border border-fog/80 space-y-2">
                <div className="text-xs font-bold text-ash uppercase">USDT Spot Balance</div>
                <div className="text-2xl font-black text-carbon">
                  {formatCurrency(spotWallet ? Number(spotWallet.balance || 0) : 0)}
                </div>
                <div className="text-xs text-ash">
                  Available: {formatCurrency(spotWallet ? Number(spotWallet.availableBalance || 0) : 0)}
                </div>
              </div>

              <div className="p-5 rounded-[20px] bg-mist/50 border border-fog/80 space-y-2">
                <div className="text-xs font-bold text-ash uppercase">Locked in Orders</div>
                <div className="text-2xl font-black text-carbon">
                  {formatCurrency(spotWallet ? Number(spotWallet.lockedFunds || 0) : 0)}
                </div>
                <div className="text-xs text-ash">Active limit orders collateral</div>
              </div>
            </div>
          </div>
        )}

        {/* FUTURES WALLET TAB */}
        {activeTab === "FUTURES" && (
          <div className="bg-white border border-fog/80 rounded-[24px] p-6 space-y-6 shadow-subtle-2">
            <div className="border-b border-fog/50 pb-4">
              <h3 className="text-base font-bold text-carbon">Futures Wallet & Open Positions</h3>
              <p className="text-xs text-ash mt-0.5">Leverage collateral and live derivative positions</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-[20px] bg-mist/50 border border-fog/80 space-y-2">
                <div className="text-xs font-bold text-ash uppercase">Futures Margin Balance</div>
                <div className="text-2xl font-black text-carbon">
                  {formatCurrency(futuresWallet ? Number(futuresWallet.balance || 0) : 0)}
                </div>
              </div>

              <div className="p-5 rounded-[20px] bg-mist/50 border border-fog/80 space-y-2">
                <div className="text-xs font-bold text-ash uppercase">Unrealized PnL</div>
                <div className="text-2xl font-black text-mint">
                  {formatCurrency(futuresWallet ? Number(futuresWallet.unrealizedPnL || 0) : 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEPOSIT MODAL */}
        {depositModal.open && (
          <div className="fixed inset-0 bg-carbon/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-fog/80 rounded-[24px] p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-fog/50 pb-3">
                <h3 className="text-base font-bold text-carbon">Deposit Capital</h3>
                <button onClick={() => setDepositModal({ ...depositModal, open: false })} className="text-ash hover:text-carbon">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={executeModalDeposit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-carbon mb-1.5 block">Target Wallet</label>
                  <select
                    value={depositModal.walletType}
                    onChange={(e) => setDepositModal({ ...depositModal, walletType: e.target.value })}
                    className="w-full bg-mist text-carbon text-sm px-4 py-2.5 rounded-xl border border-fog focus:outline-none"
                  >
                    <option value="SPOT">Spot Wallet</option>
                    <option value="FUTURES">Futures Wallet</option>
                    <option value="MARGIN">Margin Wallet</option>
                    <option value="OPTIONS">Options Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-carbon mb-1.5 block">Deposit Amount ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1000"
                    value={depositModal.amount}
                    onChange={(e) => setDepositModal({ ...depositModal, amount: e.target.value })}
                    className="w-full bg-mist text-carbon text-sm px-4 py-2.5 rounded-xl border border-fog focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDepositModal({ ...depositModal, open: false })}
                    className="bg-mist text-carbon font-bold text-xs px-4 py-2.5 rounded-full border border-fog"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-ember hover:bg-ember/90 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-subtle"
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
          <div className="fixed inset-0 bg-carbon/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-fog/80 rounded-[24px] p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-fog/50 pb-3">
                <h3 className="text-base font-bold text-carbon">Transfer Funds</h3>
                <button onClick={() => setTransferModal({ ...transferModal, open: false })} className="text-ash hover:text-carbon">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={executeTransfer} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-carbon mb-1.5 block">From Wallet</label>
                  <select
                    value={transferModal.from}
                    onChange={(e) => setTransferModal({ ...transferModal, from: e.target.value })}
                    className="w-full bg-mist text-carbon text-sm px-4 py-2.5 rounded-xl border border-fog focus:outline-none"
                  >
                    <option value="SPOT">Spot Wallet</option>
                    <option value="FUTURES">Futures Wallet</option>
                    <option value="MARGIN">Margin Wallet</option>
                    <option value="OPTIONS">Options Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-carbon mb-1.5 block">To Wallet</label>
                  <select
                    value={transferModal.to}
                    onChange={(e) => setTransferModal({ ...transferModal, to: e.target.value })}
                    className="w-full bg-mist text-carbon text-sm px-4 py-2.5 rounded-xl border border-fog focus:outline-none"
                  >
                    <option value="FUTURES">Futures Wallet</option>
                    <option value="SPOT">Spot Wallet</option>
                    <option value="MARGIN">Margin Wallet</option>
                    <option value="OPTIONS">Options Wallet</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-carbon mb-1.5 block">Transfer Amount ($)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 500"
                    value={transferModal.amount}
                    onChange={(e) => setTransferModal({ ...transferModal, amount: e.target.value })}
                    className="w-full bg-mist text-carbon text-sm px-4 py-2.5 rounded-xl border border-fog focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setTransferModal({ ...transferModal, open: false })}
                    className="bg-mist text-carbon font-bold text-xs px-4 py-2.5 rounded-full border border-fog"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-ember hover:bg-ember/90 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-subtle"
                  >
                    Execute Transfer
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
