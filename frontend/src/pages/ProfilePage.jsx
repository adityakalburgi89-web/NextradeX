import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchUserProfile, updateUserProfile, fetchWallets, clearAuthToken, logoutUser } from "../api";
import { PageTransition } from "../components/ui/PageTransition";
import { formatCurrency } from "../lib/utils";
import {
  User,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  Key,
  Lock,
  Wallet,
  ArrowUpRight,
  Compass,
  Activity,
  Check,
  AlertCircle,
  Edit3,
  Layers,
  Sparkles,
  ArrowRight,
  LogOut
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "settings"
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
  const totalUSDEquity = useMemo(() => {
    return wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);
  }, [wallets]);

  const getWalletBalance = (type) => {
    const w = wallets.find(item => item.walletType === type);
    return w ? Number(w.balance || 0) : 0;
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-sm font-medium text-ash flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-carbon border-t-transparent animate-spin" />
            Loading account details...
          </div>
        </div>
      </PageTransition>
    );
  }

  const initial = profile.username?.charAt(0)?.toUpperCase() || "U";
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username;

  return (
    <PageTransition>
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 py-8 font-openrunde space-y-8">
        
        {/* HERO ACCOUNT HEADER BANNER */}
        <div className="bg-white border border-fog/80 rounded-[24px] p-6 shadow-subtle-2 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-ember text-white flex items-center justify-center font-black text-2xl shadow-subtle">
                {initial}
              </div>
              <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${profile.active ? "bg-mint" : "bg-amber"}`} />
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-carbon tracking-tight">{fullName}</h1>
                <span className="text-xs font-bold bg-mist text-carbon border border-fog px-3 py-0.5 rounded-full uppercase">
                  {profile.role || "USER"}
                </span>
                {profile.active && (
                  <span className="text-xs font-bold bg-mint-wash text-mint px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified Trader
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ash mt-1.5 font-medium">
                <span>UID: <span className="text-carbon font-bold">#{profile.id ? String(profile.id).padStart(5, '0') : "00001"}</span></span>
                <span>Username: <span className="text-carbon font-bold">@{profile.username}</span></span>
                <span>Email: <span className="text-carbon font-bold">{profile.email || "—"}</span></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-mist hover:bg-fog text-carbon font-bold text-xs px-4 py-2.5 rounded-full border border-fog transition-all"
            >
              <Compass size={14} /> Dashboard
            </Link>
            <Link
              to="/wallets"
              className="flex items-center gap-2 bg-ember hover:bg-ember/90 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-all shadow-subtle"
            >
              <Wallet size={14} /> Manage Capital
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-ember/10 hover:bg-ember/20 text-ember font-bold text-xs px-4 py-2.5 rounded-full border border-ember/30 transition-all cursor-pointer"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </div>

        {/* MAIN GRID SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 4 COLUMNS: ACCOUNT SECURITY & KYC VERIFICATION PANEL */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Account Status Card */}
            <div className="bg-white border border-fog/80 rounded-[20px] p-6 space-y-5 shadow-subtle">
              <h3 className="text-sm font-bold text-carbon border-b border-fog/50 pb-3">Account Security & Verification</h3>

              <div className="space-y-3.5">
                
                {/* Real KYC Status */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-mist/60 border border-fog/60">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-carbon" />
                    <div>
                      <div className="text-xs font-bold text-carbon">KYC Verification</div>
                      <div className="text-[10px] text-ash font-medium">Identity verification status</div>
                    </div>
                  </div>
                  {profile.active ? (
                    <span className="text-[11px] font-bold text-mint bg-mint-wash px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check size={12} /> Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber bg-amber/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle size={12} /> Pending
                    </span>
                  )}
                </div>

                {/* Real Email Verification Status */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-mist/60 border border-fog/60">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-carbon" />
                    <div>
                      <div className="text-xs font-bold text-carbon">Email Verification</div>
                      <div className="text-[10px] text-ash font-medium">Account email status</div>
                    </div>
                  </div>
                  {profile.emailVerified ? (
                    <span className="text-[11px] font-bold text-mint bg-mint-wash px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check size={12} /> Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber bg-amber/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <AlertCircle size={12} /> Pending
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* Total Balance Summary Card */}
            <div className="bg-white border border-fog/80 rounded-[20px] p-6 space-y-4 shadow-subtle">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ash uppercase">Total Portfolio Capital</span>
                <Wallet size={16} className="text-carbon" />
              </div>
              <div className="text-3xl font-black text-carbon tracking-tight">
                {formatCurrency(totalUSDEquity)}
              </div>
              <p className="text-xs text-ash">Aggregated live capital balance across Spot, Futures, Margin, & Options wallets.</p>
            </div>

          </div>

          {/* RIGHT 8 COLUMNS: MAIN TAB CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Custom Tab Selector */}
            <div className="flex bg-mist p-1 rounded-2xl border border-fog w-fit">
              <button
                onClick={() => { setActiveTab("overview"); setError(""); setSuccess(""); }}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "overview"
                    ? "bg-white text-carbon shadow-subtle"
                    : "text-ash hover:text-carbon"
                }`}
              >
                Capital Overview
              </button>

              <button
                onClick={() => { setActiveTab("settings"); setError(""); setSuccess(""); }}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "settings"
                    ? "bg-white text-carbon shadow-subtle"
                    : "text-ash hover:text-carbon"
                }`}
              >
                Edit Personal Details
              </button>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Real Wallet Balances Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Spot Wallet */}
                  <div className="bg-white border border-fog/80 rounded-[20px] p-5 flex flex-col justify-between space-y-4 hover:shadow-subtle transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ash uppercase">Spot Wallet</span>
                      <span className="text-[10px] font-bold bg-mint-wash text-mint px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-carbon tracking-tight">
                        {formatCurrency(getWalletBalance("SPOT"))}
                      </div>
                      <div className="text-xs text-ash mt-1">Available for Spot orders</div>
                    </div>
                    <div className="pt-3 border-t border-fog/50 flex justify-end">
                      <Link to="/trade/spot" className="text-xs font-bold text-ember hover:underline flex items-center gap-1">
                        Trade Spot <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Futures Wallet */}
                  <div className="bg-white border border-fog/80 rounded-[20px] p-5 flex flex-col justify-between space-y-4 hover:shadow-subtle transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ash uppercase">Futures Wallet</span>
                      <span className="text-[10px] font-bold bg-mint-wash text-mint px-2 py-0.5 rounded-full">125x Cap</span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-carbon tracking-tight">
                        {formatCurrency(getWalletBalance("FUTURES"))}
                      </div>
                      <div className="text-xs text-ash mt-1">Leverage Trading Collateral</div>
                    </div>
                    <div className="pt-3 border-t border-fog/50 flex justify-end">
                      <Link to="/trade/futures" className="text-xs font-bold text-ember hover:underline flex items-center gap-1">
                        Trade Futures <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Margin Wallet */}
                  <div className="bg-white border border-fog/80 rounded-[20px] p-5 flex flex-col justify-between space-y-4 hover:shadow-subtle transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ash uppercase">Margin Wallet</span>
                      <span className="text-[10px] font-bold bg-mint-wash text-mint px-2 py-0.5 rounded-full">Cross / Isolated</span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-carbon tracking-tight">
                        {formatCurrency(getWalletBalance("MARGIN"))}
                      </div>
                      <div className="text-xs text-ash mt-1">Borrowed Trading Capital</div>
                    </div>
                    <div className="pt-3 border-t border-fog/50 flex justify-end">
                      <Link to="/trade/margin" className="text-xs font-bold text-ember hover:underline flex items-center gap-1">
                        Trade Margin <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>

                  {/* Options Wallet */}
                  <div className="bg-white border border-fog/80 rounded-[20px] p-5 flex flex-col justify-between space-y-4 hover:shadow-subtle transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ash uppercase">Options Wallet</span>
                      <span className="text-[10px] font-bold bg-mint-wash text-mint px-2 py-0.5 rounded-full">Settlement</span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-carbon tracking-tight">
                        {formatCurrency(getWalletBalance("OPTIONS"))}
                      </div>
                      <div className="text-xs text-ash mt-1">Options Trading Fund</div>
                    </div>
                    <div className="pt-3 border-t border-fog/50 flex justify-end">
                      <Link to="/wallets" className="text-xs font-bold text-ember hover:underline flex items-center gap-1">
                        Manage Wallets <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* EDIT SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="bg-white border border-fog/80 rounded-[24px] p-6 space-y-6 shadow-subtle-2">
                <div>
                  <h3 className="text-base font-bold text-carbon">Personal Information</h3>
                  <p className="text-xs text-ash mt-1">Update your profile credentials and account details.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-carbon mb-1.5 block">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                        className="w-full bg-mist text-carbon text-sm px-4 py-2.5 rounded-xl border border-fog focus:outline-none focus:border-carbon transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-carbon mb-1.5 block">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                        className="w-full bg-mist text-carbon text-sm px-4 py-2.5 rounded-xl border border-fog focus:outline-none focus:border-carbon transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-carbon mb-1.5 block">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className="w-full bg-mist text-carbon text-sm px-4 py-2.5 rounded-xl border border-fog focus:outline-none focus:border-carbon transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-carbon mb-1.5 block">Username (System Identifier)</label>
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className="w-full bg-mist/50 text-ash text-sm px-4 py-2.5 rounded-xl border border-fog cursor-not-allowed font-mono"
                    />
                    <p className="text-[11px] text-ash mt-1">Username is fixed for security identification.</p>
                  </div>

                  {success && (
                    <div className="p-3.5 rounded-xl bg-mint-wash text-mint text-xs font-bold flex items-center gap-2 border border-mint/20">
                      <CheckCircle2 size={16} /> {success}
                    </div>
                  )}

                  {error && (
                    <div className="p-3.5 rounded-xl bg-ember/10 text-ember text-xs font-bold flex items-center gap-2 border border-ember/20">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <div className="pt-4 border-t border-fog flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-ember hover:bg-ember/90 text-white font-bold text-xs px-6 py-3 rounded-full transition-all shadow-subtle disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </PageTransition>
  );
}