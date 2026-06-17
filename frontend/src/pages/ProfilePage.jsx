import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { fetchUserProfile, updateUserProfile, fetchWallets } from "../api";
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Key,
  Lock,
  Wallet,
  Plus,
  ArrowUpRight,
  Copy,
  Check,
  Compass,
  Activity,
  AlertTriangle,
  FileCode
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" or "settings"
  const [wallets, setWallets] = useState([]);



  const [profile, setProfile] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "",
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
        setSuccess("Profile updated successfully");
      }
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };



  const getWalletBalance = (type) => {
    const w = wallets.find(item => item.walletType === type);
    return w ? Number(w.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="font-mono text-muted">Loading profile...</div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-dark light:text-foreground font-sans">Account Overview</h1>
            <p className="text-sm text-muted mt-1.5">Manage your personal information, security credentials, and API access.</p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="font-mono text-xs hover:bg-background flex items-center gap-1.5">
              <Compass size={14} /> Global Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Identity and Security Overview */}
          <div className="lg:col-span-4 space-y-6">
            {/* Identity Card */}
            <div className="p-6 rounded-xl bg-background border border-transparent light:bg-background light:border-transparent flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-background light:bg-background flex items-center justify-center border-2 border-primary shadow-sm">
                  <User size={36} className="text-primary" />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-trading-up border-2 border-surface-card-dark light:border-canvas-light flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-background animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-on-dark light:text-foreground font-mono">{profile.username}</h3>
              <span className="mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 uppercase">
                {profile.role || "Trader"}
              </span>
              <p className="text-xs text-muted mt-4">Account ID: <span className="font-mono text-on-dark light:text-foreground">NTX-{(profile.username || "USER").substring(0, 3).toUpperCase()}-9482</span></p>
            </div>

            {/* Account Security Status */}
            <div className="p-6 rounded-xl bg-background border border-transparent light:bg-background light:border-transparent space-y-4">
              <h4 className="text-sm font-semibold text-on-dark light:text-foreground uppercase font-mono">Account Security</h4>

              <div className="space-y-3">
                {/* Verification Status */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 light:bg-background border border-transparent light:border-transparent">
                  <div className="flex items-center gap-2.5">
                    <Shield size={16} className="text-muted" />
                    <span className="text-sm text-foreground light:text-foreground">KYC Verification</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    {profile.active ? (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-trading-up/10 text-trading-up border border-trading-up/20 uppercase">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-trading-down/10 text-trading-down border border-trading-down/20 uppercase">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>

                {/* Email Status */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 light:bg-background border border-transparent light:border-transparent">
                  <div className="flex items-center gap-2.5">
                    <Mail size={16} className="text-muted" />
                    <span className="text-sm text-foreground light:text-foreground">Email Security</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    {profile.emailVerified ? (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-trading-up/10 text-trading-up border border-trading-up/20 uppercase">
                        Enabled
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* 2FA Status (Simulated detail) */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 light:bg-background border border-transparent light:border-transparent">
                  <div className="flex items-center gap-2.5">
                    <Lock size={16} className="text-muted" />
                    <span className="text-sm text-foreground light:text-foreground">Two-Factor (2FA)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-trading-up/10 text-trading-up border border-trading-up/20 uppercase font-mono">
                    Enabled
                  </span>
                </div>

                {/* Security Keys (Simulated detail) */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 light:bg-background border border-transparent light:border-transparent">
                  <div className="flex items-center gap-2.5">
                    <Key size={16} className="text-muted" />
                    <span className="text-sm text-foreground light:text-foreground">Security Keys</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase font-mono">
                    2 Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Navigation & Layout Selector */}
          <div className="lg:col-span-8 space-y-6">
            {/* Custom Tab Selector */}
            <div className="flex border-b border-transparent light:border-transparent">
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setError("");
                  setSuccess("");
                }}
                className={`pb-4 px-6 font-sans text-sm font-bold border-b-2 transition-all ${activeTab === "dashboard"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground hover:border-transparent/20"
                  }`}
              >
                Profile Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveTab("settings");
                  setError("");
                  setSuccess("");
                }}
                className={`pb-4 px-6 font-sans text-sm font-bold border-b-2 transition-all ${activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground hover:border-transparent/20"
                  }`}
              >
                Personal Details
              </button>
            </div>

            {/* Render Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* 1. Wallet Balances Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Spot Card */}
                  <div className="p-5 rounded-xl border border-transparent bg-background hover:border-primary/30 transition-all flex flex-col justify-between h-[120px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Wallet size={72} className="text-primary" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-muted uppercase">Spot Wallet Balance</span>
                      <h4 className="text-xl font-bold font-mono text-foreground mt-1">${getWalletBalance("SPOT")}</h4>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono mt-4 pt-2 border-t border-transparent">
                      <span className="text-primary font-semibold">Asset Tier: Premium</span>
                      <Link to="/trade/spot" className="text-muted hover:text-foreground flex items-center gap-0.5">
                        Trade Spot <ArrowUpRight size={10} />
                      </Link>
                    </div>
                  </div>

                  {/* Futures Card */}
                  <div className="p-5 rounded-xl border border-transparent bg-background hover:border-[#3861fb]/30 transition-all flex flex-col justify-between h-[120px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Activity size={72} className="text-[#3861fb]" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-muted uppercase">Futures Wallet Balance</span>
                      <h4 className="text-xl font-bold font-mono text-foreground mt-1">${getWalletBalance("FUTURES")}</h4>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono mt-4 pt-2 border-t border-transparent">
                      <span className="text-[#3861fb] font-semibold">Margin Ratio: 0.0%</span>
                      <Link to="/trade/futures" className="text-muted hover:text-foreground flex items-center gap-0.5">
                        Trade Futures <ArrowUpRight size={10} />
                      </Link>
                    </div>
                  </div>

                  {/* Margin Card */}
                  <div className="p-5 rounded-xl border border-transparent bg-background hover:border-emerald-500/30 transition-all flex flex-col justify-between h-[120px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Shield size={72} className="text-emerald-500" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-muted uppercase">Margin Wallet Balance</span>
                      <h4 className="text-xl font-bold font-mono text-foreground mt-1">${getWalletBalance("MARGIN")}</h4>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono mt-4 pt-2 border-t border-transparent">
                      <span className="text-emerald-500 font-semibold">Collateral Status: Good</span>
                      <Link to="/trade/margin" className="text-muted hover:text-foreground flex items-center gap-0.5">
                        Trade Margin <ArrowUpRight size={10} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 2. Trading Tier Status */}
                <div className="p-5 rounded-xl border border-transparent bg-background space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-foreground font-heading uppercase">Trading Fee Tier</h4>
                      <p className="text-xs text-muted mt-0.5">Accumulated 30-day simulated trading volume fee rates.</p>
                    </div>
                    <span className="px-3 py-1 font-mono text-xs font-bold rounded-2xl bg-primary/10 border border-primary/20 text-primary uppercase">
                      VIP Level 1
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-center">
                    <div className="p-3 bg-background/40 rounded-2xl border border-transparent font-mono">
                      <span className="text-[10px] text-muted block uppercase">Maker Fee</span>
                      <span className="text-sm font-bold text-foreground mt-1 block">0.012%</span>
                    </div>
                    <div className="p-3 bg-background/40 rounded-2xl border border-transparent font-mono">
                      <span className="text-[10px] text-muted block uppercase">Taker Fee</span>
                      <span className="text-sm font-bold text-foreground mt-1 block">0.024%</span>
                    </div>
                    <div className="p-3 bg-background/40 rounded-2xl border border-transparent font-mono">
                      <span className="text-[10px] text-muted block uppercase">30d Volume</span>
                      <span className="text-sm font-bold text-foreground mt-1 block">$142,590.00</span>
                    </div>
                    <div className="p-3 bg-background/40 rounded-2xl border border-transparent font-mono">
                      <span className="text-[10px] text-muted block uppercase">Next Tier At</span>
                      <span className="text-sm font-bold text-primary mt-1 block">$500,000</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Render Settings Form Tab */}
            {activeTab === "settings" && (
              <Card className="h-full">
                <CardHeader className="border-b border-transparent light:border-transparent pb-5 mb-6">
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>Update your profile credentials and email preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="font-mono text-[10px] text-muted uppercase mb-2 block font-semibold">
                          First Name
                        </label>
                        <Input
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] text-muted uppercase mb-2 block font-semibold">
                          Last Name
                        </label>
                        <Input
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase mb-2 block font-semibold">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase mb-2 block font-semibold">
                        Username
                      </label>
                      <Input value={profile.username} disabled className="opacity-60 bg-background/50 cursor-not-allowed" />
                      <p className="text-xs text-muted mt-2">Username is used for system identification and cannot be altered.</p>
                    </div>

                    {success && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-trading-up/10 border border-trading-up/20 animate-slide-down">
                        <p className="text-trading-up text-sm font-mono">{success}</p>
                      </div>
                    )}
                    {error && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-trading-down/10 border border-trading-down/20 animate-slide-down">
                        <p className="text-trading-down text-sm font-mono">{error}</p>
                      </div>
                    )}

                    <div className="pt-6 border-t border-transparent light:border-transparent flex justify-end">
                      <Button type="submit" className="w-full md:w-auto px-8" loading={saving}>
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}