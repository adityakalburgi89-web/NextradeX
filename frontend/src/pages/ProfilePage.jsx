import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile, fetchWallets, clearAuthToken, logoutUser } from "../api";
import { PageTransition } from "../components/ui/PageTransition";
import { formatCurrency } from "../lib/utils";
import {
  Home,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Search,
  ChevronDown,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Shield,
  User,
  Mail,
  Lock,
  Wallet,
  Activity,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Coins,
  TrendingUp,
  Layers
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "settings" | "security" | "notifications"
  const [chartTimeframe, setChartTimeframe] = useState("1D"); // "1D" | "1W" | "1M" | "1Y"
  const [wallets, setWallets] = useState([]);

  const [profile, setProfile] = useState({
    id: null,
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "USER",
    active: false,
    emailVerified: false,
  });

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    orderFills: true,
    securityAlerts: true,
    weeklyReport: false,
    marketingEmails: false
  });

  useEffect(() => {
    const loadProfileAndWallets = async () => {
      try {
        const [profileRes, walletsRes] = await Promise.allSettled([
          fetchUserProfile(),
          fetchWallets()
        ]);

        if (profileRes.status === "fulfilled" && profileRes.value?.data) {
          const profileData = profileRes.value.data;
          setProfile(profileData);
          setForm({
            firstName: profileData.firstName || "",
            lastName: profileData.lastName || "",
            email: profileData.email || "",
          });
        }

        if (walletsRes.status === "fulfilled" && walletsRes.value?.data) {
          setWallets(walletsRes.value.data);
        }
      } catch (err) {
        setError(err.message || "Failed to load account details");
      } finally {
        setLoading(false);
      }
    };
    loadProfileAndWallets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await updateUserProfile(form);
      if (res?.data) {
        setProfile(res.data);
        setSuccess("Profile details updated successfully!");
      }
    } catch (err) {
      setError(err.message || "Failed to update profile details");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser().catch(() => {});
    } finally {
      clearAuthToken();
      window.location.href = "/auth";
    }
  };

  // Calculate real total USD equity across all user wallets
  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);
  }, [wallets]);

  const walletMap = useMemo(() => {
    return wallets.reduce((acc, w) => {
      acc[w.walletType] = w;
      return acc;
    }, {});
  }, [wallets]);

  const spotWallet = walletMap["SPOT"];
  const futuresWallet = walletMap["FUTURES"];
  const marginWallet = walletMap["MARGIN"];

  // Calendar days setup
  const activeDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const highlightedDay = 15;

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[500px] bg-[#121316] text-white font-openrunde">
          <div className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-[#c4f000] border-t-transparent animate-spin" />
            Synchronizing Dashboard Profile...
          </div>
        </div>
      </PageTransition>
    );
  }

  const initial = profile.username?.charAt(0)?.toUpperCase() || "A";
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username || "Trader";

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
                  onClick={() => setActiveTab("overview")}
                  title="Dashboard Overview"
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                    activeTab === "overview"
                      ? "bg-[#c4f000] text-black shadow-lg shadow-[#c4f000]/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Home size={19} />
                </button>

                <button
                  onClick={() => setActiveTab("security")}
                  title="Security Center"
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                    activeTab === "security"
                      ? "bg-[#c4f000] text-black shadow-lg shadow-[#c4f000]/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Calendar size={19} />
                </button>

                <button
                  onClick={() => navigate("/wallets")}
                  title="Wallets & Assets"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full text-slate-400 hover:text-white hover:bg-white/5 flex items-center justify-center transition-all"
                >
                  <BarChart3 size={19} />
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  title="Profile Settings"
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                    activeTab === "settings"
                      ? "bg-[#c4f000] text-black shadow-lg shadow-[#c4f000]/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Settings size={19} />
                </button>

                <button
                  onClick={() => setActiveTab("notifications")}
                  title="Notification Preferences"
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all relative ${
                    activeTab === "notifications"
                      ? "bg-[#c4f000] text-black shadow-lg shadow-[#c4f000]/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Bell size={19} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#c4f000] rounded-full" />
                </button>
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="flex md:flex-col items-center gap-3">
              <button
                onClick={handleLogout}
                title="Log Out"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all cursor-pointer"
              >
                <LogOut size={19} />
              </button>

              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#375bf5] to-[#c4f000] p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-[#1a1b20] flex items-center justify-center font-bold text-xs sm:text-sm text-white">
                  {initial}
                </div>
              </div>
            </div>

          </aside>

          {/* MAIN DASHBOARD CONTENT AREA */}
          <main className="flex-1 space-y-6 overflow-hidden">
            
            {/* TOP HEADER: Greeting + Search + Premium Pill */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  Hello, {fullName}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 font-normal mt-0.5">
                  Institutional Simulation Suite • Ready for today's market execution.
                </p>
              </div>

              {/* Header Right Tools */}
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64 md:w-72">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search for some activities"
                    className="w-full bg-[#24252c] border border-white/10 rounded-full pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#c4f000] transition-colors"
                  />
                </div>

                <button 
                  onClick={() => navigate("/wallets")}
                  className="bg-[#375bf5] hover:bg-[#2e4ed8] text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg shadow-[#375bf5]/25 transition-transform active:scale-95 shrink-0 cursor-pointer"
                >
                  Premium VIP
                </button>
              </div>
            </header>

            {/* Notification alert banners */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError("")} className="hover:text-white">✕</button>
              </div>
            )}
            {success && (
              <div className="p-4 rounded-2xl bg-[#c4f000]/10 border border-[#c4f000]/20 text-[#c4f000] text-xs font-semibold flex items-center justify-between">
                <span>{success}</span>
                <button onClick={() => setSuccess("")} className="hover:text-white">✕</button>
              </div>
            )}

            {/* VIEW TAB 1: OVERVIEW DASHBOARD */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                
                {/* TOP GRID: MAIN CHART CARD + ROYAL BLUE CALENDAR CARD */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* MAIN ANALYTICS CHART CARD (7 Cols) */}
                  <div className="lg:col-span-7 bg-[#24252c] border border-white/5 rounded-[28px] p-6 space-y-6 flex flex-col justify-between">
                    
                    {/* Header Title & Timeframe Selector */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-white tracking-tight">Portfolio Activity & Performance</h2>
                      
                      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full text-[11px] font-bold">
                        {["1D", "1W", "1M", "1Y", "ALL"].map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setChartTimeframe(tf)}
                            className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                              chartTimeframe === tf
                                ? "bg-[#c4f000] text-black font-extrabold"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Glowing Multi-Node SVG Line Chart */}
                    <div className="relative w-full h-44 py-2">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="profileChartGradient1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c4f000" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#c4f000" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Green Line */}
                        <path
                          d="M0,80 Q70,95 130,45 T250,75 T370,30 T500,60"
                          fill="none"
                          stroke="#c4f000"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M0,80 Q70,95 130,45 T250,75 T370,30 T500,60 L500,120 L0,120 Z"
                          fill="url(#profileChartGradient1)"
                        />

                        {/* Blue Line */}
                        <path
                          d="M0,50 Q80,20 180,60 T320,25 T500,40"
                          fill="none"
                          stroke="#375bf5"
                          strokeWidth="2.5"
                          strokeDasharray="4 4"
                        />

                        {/* Highlight Nodes */}
                        <circle cx="130" cy="45" r="5" fill="#c4f000" />
                        <circle cx="320" cy="25" r="5" fill="#375bf5" />
                      </svg>
                    </div>

                    {/* Real Metric Stat Columns */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5 text-left">
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Total Equity</div>
                        <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
                          {formatCurrency(totalBalance)}
                        </div>
                        <div className="text-[11px] text-[#c4f000] mt-1">Aggregated Balance</div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400 font-medium">Spot Capital</div>
                        <div className="text-xl sm:text-2xl font-extrabold text-[#c4f000] tracking-tight mt-0.5">
                          {formatCurrency(spotWallet ? Number(spotWallet.balance || 0) : 0)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">Available for Spot</div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400 font-medium">Futures Collateral</div>
                        <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
                          {formatCurrency(futuresWallet ? Number(futuresWallet.balance || 0) : 0)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">Leverage Trading Fund</div>
                      </div>
                    </div>

                  </div>

                  {/* ROYAL BLUE CALENDAR CARD */}
                  <div className="lg:col-span-5 bg-[#375bf5] rounded-[28px] p-6 text-white flex flex-col justify-between shadow-xl shadow-[#375bf5]/20 min-h-[340px]">
                    
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold tracking-tight">Your Active Days</h2>
                      <button className="flex items-center gap-1 text-xs font-semibold text-white/90 hover:text-white bg-white/10 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                        <span>November</span>
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Weekday Labels Header */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-white/70 tracking-wider my-3">
                      <span>MON</span>
                      <span>TUE</span>
                      <span>WED</span>
                      <span>THU</span>
                      <span>FRI</span>
                      <span>SAT</span>
                      <span>SUN</span>
                    </div>

                    {/* 31 Day Grid */}
                    <div className="grid grid-cols-7 gap-1.5 place-items-center text-center my-auto">
                      {activeDays.map((day) => {
                        const isHighlighted = day === highlightedDay;
                        const isPast = day < highlightedDay;
                        return (
                          <div
                            key={day}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isHighlighted
                                ? "bg-[#c4f000] text-black font-black shadow-md scale-110"
                                : isPast
                                ? "bg-black/25 text-white hover:bg-black/40 cursor-pointer"
                                : "text-white/35"
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[11px] text-white/60 font-medium text-center pt-2 border-t border-white/10">
                      15 active trading sessions logged
                    </div>

                  </div>

                </div>

                {/* BOTTOM GRID CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* CARD 1: ACCOUNT HEALTH & SECURITY (6 Cols) */}
                  <div className="md:col-span-6 bg-[#24252c] border border-white/5 rounded-[28px] p-6 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-400">Account Security</div>
                      <div className="text-sm font-semibold text-white mt-1">Optimal Protection Mode</div>
                      <div className="text-[11px] text-slate-500 mt-2">KYC Tier 3 Verified</div>
                    </div>

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

                  {/* CARD 2: QUICK ACTION SHORTCUT (6 Cols) */}
                  <div className="md:col-span-6 bg-[#24252c] border border-white/5 rounded-[28px] p-6 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-400">Manage Capital</div>
                      <div className="text-sm font-semibold text-white mt-1">Deposit or Transfer Funds</div>
                      <div className="text-[11px] text-slate-500 mt-2">Instant Settlement Supported</div>
                    </div>

                    <button
                      onClick={() => navigate("/wallets")}
                      className="bg-[#c4f000] hover:bg-[#b5dc00] text-black font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Manage Wallets</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* VIEW TAB 2: PROFILE SETTINGS */}
            {activeTab === "settings" && (
              <div className="bg-[#24252c] border border-white/5 rounded-[28px] p-6 sm:p-8 space-y-6 max-w-3xl">
                <h2 className="text-xl font-bold text-white">Account & Profile Details</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        className="w-full bg-[#1a1b20] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-[#c4f000] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        className="w-full bg-[#1a1b20] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-[#c4f000] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full bg-[#1a1b20] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:border-[#c4f000] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#c4f000] hover:bg-[#b5dc00] text-black font-extrabold text-sm px-6 py-3 rounded-full transition-all shadow-md mt-2 disabled:opacity-60 cursor-pointer"
                  >
                    {saving ? "Saving Changes..." : "Save Profile Details"}
                  </button>
                </form>
              </div>
            )}

            {/* VIEW TAB 3: SECURITY CENTER */}
            {activeTab === "security" && (
              <div className="bg-[#24252c] border border-white/5 rounded-[28px] p-6 sm:p-8 space-y-6 max-w-3xl">
                <h2 className="text-xl font-bold text-white">Security & Authentication</h2>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1a1b20] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Account Role</div>
                      <div className="text-xs text-slate-400 mt-0.5">{profile.role || "Standard User"}</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#c4f000]/20 text-[#c4f000] font-extrabold text-xs">
                      Active VIP
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1a1b20] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</div>
                      <div className="text-xs text-slate-400 mt-0.5">Google Authenticator & Security Passkeys</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs">
                      Enabled
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1a1b20] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Identity Verification (KYC)</div>
                      <div className="text-xs text-slate-400 mt-0.5">Tier 3 Verified Account Status</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#c4f000]/20 text-[#c4f000] font-extrabold text-xs">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW TAB 4: NOTIFICATIONS PREFERENCES */}
            {activeTab === "notifications" && (
              <div className="bg-[#24252c] border border-white/5 rounded-[28px] p-6 sm:p-8 space-y-6 max-w-3xl">
                <h2 className="text-xl font-bold text-white">Notification & Alert Preferences</h2>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#1a1b20] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Order Fill Alerts</div>
                      <div className="text-xs text-slate-400 mt-0.5">Receive immediate notifications on order execution</div>
                    </div>
                    <button
                      onClick={() => setNotifPrefs({ ...notifPrefs, orderFills: !notifPrefs.orderFills })}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${notifPrefs.orderFills ? "bg-[#c4f000]" : "bg-white/20"}`}
                    >
                      <span className={`w-5 h-5 rounded-full bg-black absolute top-0.5 transition-transform ${notifPrefs.orderFills ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#1a1b20] border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Security & Login Alerts</div>
                      <div className="text-xs text-slate-400 mt-0.5">Notify on new IP or device authorizations</div>
                    </div>
                    <button
                      onClick={() => setNotifPrefs({ ...notifPrefs, securityAlerts: !notifPrefs.securityAlerts })}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${notifPrefs.securityAlerts ? "bg-[#c4f000]" : "bg-white/20"}`}
                    >
                      <span className={`w-5 h-5 rounded-full bg-black absolute top-0.5 transition-transform ${notifPrefs.securityAlerts ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </PageTransition>
  );
}