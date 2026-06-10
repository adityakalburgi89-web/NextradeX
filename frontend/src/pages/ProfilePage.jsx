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

  // API Keys state
  const [apiKeys, setApiKeys] = useState([
    { id: 1, label: "Automated Strategy Bot", access: "Trade & Read", created: "2026-05-18", key: "ntx_pub_392f...81aa" }
  ]);
  const [newKeyLabel, setNewKeyLabel] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

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

  const handleGenerateKey = (e) => {
    e.preventDefault();
    if (!newKeyLabel) return;
    const randomKey = "ntx_pub_" + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const randomSecret = "ntx_sec_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const newKeyItem = {
      id: Date.now(),
      label: newKeyLabel,
      access: "Trade & Read",
      created: new Date().toISOString().split("T")[0],
      key: randomKey.substring(0, 12) + "..." + randomKey.substring(randomKey.length - 4)
    };

    setApiKeys(prev => [...prev, newKeyItem]);
    setGeneratedKey({ key: randomKey, secret: randomSecret, label: newKeyLabel });
    setShowKeyModal(true);
    setNewKeyLabel("");
  };

  const handleRevokeKey = (id) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
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
            <h1 className="text-2xl md:text-3xl font-bold text-on-dark light:text-ink font-sans tracking-tight">Account Overview</h1>
            <p className="text-sm text-muted mt-1.5">Manage your personal information, security credentials, and API access.</p>
          </div>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="font-mono text-xs hover:bg-surface-card-dark flex items-center gap-1.5">
              <Compass size={14} /> Global Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Identity and Security Overview */}
          <div className="lg:col-span-4 space-y-6">
            {/* Identity Card */}
            <div className="p-6 rounded-xl bg-surface-card-dark border border-hairline-on-dark light:bg-canvas-light light:border-hairline-on-light flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-full bg-surface-elevated-dark light:bg-surface-soft-light flex items-center justify-center border-2 border-primary shadow-sm">
                  <User size={36} className="text-primary" />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-trading-up border-2 border-surface-card-dark light:border-canvas-light flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-on-dark light:text-ink font-mono">{profile.username}</h3>
              <span className="mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                {profile.role || "Trader"}
              </span>
              <p className="text-xs text-muted mt-4">Account ID: <span className="font-mono text-on-dark light:text-ink">NTX-{(profile.username || "USER").substring(0, 3).toUpperCase()}-9482</span></p>
            </div>

            {/* Account Security Status */}
            <div className="p-6 rounded-xl bg-surface-card-dark border border-hairline-on-dark light:bg-canvas-light light:border-hairline-on-light space-y-4">
              <h4 className="text-sm font-semibold text-on-dark light:text-ink uppercase tracking-wider font-mono">Account Security</h4>

              <div className="space-y-3">
                {/* Verification Status */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated-dark/50 light:bg-surface-soft-light border border-hairline-on-dark light:border-hairline-on-light">
                  <div className="flex items-center gap-2.5">
                    <Shield size={16} className="text-muted" />
                    <span className="text-sm text-body light:text-ink">KYC Verification</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    {profile.active ? (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-trading-up/10 text-trading-up border border-trading-up/20 uppercase tracking-wider">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-trading-down/10 text-trading-down border border-trading-down/20 uppercase tracking-wider">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>

                {/* Email Status */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated-dark/50 light:bg-surface-soft-light border border-hairline-on-dark light:border-hairline-on-light">
                  <div className="flex items-center gap-2.5">
                    <Mail size={16} className="text-muted" />
                    <span className="text-sm text-body light:text-ink">Email Security</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    {profile.emailVerified ? (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-trading-up/10 text-trading-up border border-trading-up/20 uppercase tracking-wider">
                        Enabled
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-wider">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* 2FA Status (Simulated detail) */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated-dark/50 light:bg-surface-soft-light border border-hairline-on-dark light:border-hairline-on-light">
                  <div className="flex items-center gap-2.5">
                    <Lock size={16} className="text-muted" />
                    <span className="text-sm text-body light:text-ink">Two-Factor (2FA)</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-trading-up/10 text-trading-up border border-trading-up/20 uppercase tracking-wider font-mono">
                    Enabled
                  </span>
                </div>

                {/* Security Keys (Simulated detail) */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-elevated-dark/50 light:bg-surface-soft-light border border-hairline-on-dark light:border-hairline-on-light">
                  <div className="flex items-center gap-2.5">
                    <Key size={16} className="text-muted" />
                    <span className="text-sm text-body light:text-ink">Security Keys</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider font-mono">
                    2 Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Navigation & Layout Selector */}
          <div className="lg:col-span-8 space-y-6">
            {/* Custom Tab Selector */}
            <div className="flex border-b border-hairline-on-dark light:border-hairline-on-light">
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  setError("");
                  setSuccess("");
                }}
                className={`pb-4 px-6 font-sans text-sm font-bold border-b-2 transition-all ${activeTab === "dashboard"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-white hover:border-white/20"
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
                  : "border-transparent text-muted hover:text-white hover:border-white/20"
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
                  <div className="p-5 rounded-xl border border-hairline-on-dark bg-surface-card-dark hover:border-primary/30 transition-all flex flex-col justify-between h-[120px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Wallet size={72} className="text-primary" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Spot Wallet Balance</span>
                      <h4 className="text-xl font-bold font-mono text-white mt-1">${getWalletBalance("SPOT")}</h4>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono mt-4 pt-2 border-t border-white/[0.04]">
                      <span className="text-primary font-semibold">Asset Tier: Premium</span>
                      <Link to="/trade/spot" className="text-muted hover:text-white flex items-center gap-0.5">
                        Trade Spot <ArrowUpRight size={10} />
                      </Link>
                    </div>
                  </div>

                  {/* Futures Card */}
                  <div className="p-5 rounded-xl border border-hairline-on-dark bg-surface-card-dark hover:border-[#3861fb]/30 transition-all flex flex-col justify-between h-[120px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Activity size={72} className="text-[#3861fb]" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Futures Wallet Balance</span>
                      <h4 className="text-xl font-bold font-mono text-white mt-1">${getWalletBalance("FUTURES")}</h4>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono mt-4 pt-2 border-t border-white/[0.04]">
                      <span className="text-[#3861fb] font-semibold">Margin Ratio: 0.0%</span>
                      <Link to="/trade/futures" className="text-muted hover:text-white flex items-center gap-0.5">
                        Trade Futures <ArrowUpRight size={10} />
                      </Link>
                    </div>
                  </div>

                  {/* Margin Card */}
                  <div className="p-5 rounded-xl border border-hairline-on-dark bg-surface-card-dark hover:border-emerald-500/30 transition-all flex flex-col justify-between h-[120px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Shield size={72} className="text-emerald-500" />
                    </div>
                    <div>
                      <span className="font-mono text-[10px] text-muted uppercase tracking-wider">Margin Wallet Balance</span>
                      <h4 className="text-xl font-bold font-mono text-white mt-1">${getWalletBalance("MARGIN")}</h4>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono mt-4 pt-2 border-t border-white/[0.04]">
                      <span className="text-emerald-500 font-semibold">Collateral Status: Good</span>
                      <Link to="/trade/margin" className="text-muted hover:text-white flex items-center gap-0.5">
                        Trade Margin <ArrowUpRight size={10} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 2. Trading Tier Status */}
                <div className="p-5 rounded-xl border border-hairline-on-dark bg-surface-card-dark space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-white font-heading uppercase tracking-wider">Trading Fee Tier</h4>
                      <p className="text-xs text-muted mt-0.5">Accumulated 30-day simulated trading volume fee rates.</p>
                    </div>
                    <span className="px-3 py-1 font-mono text-xs font-bold rounded-lg bg-primary/10 border border-primary/20 text-primary uppercase">
                      VIP Level 1
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-center">
                    <div className="p-3 bg-canvas-dark/40 rounded-lg border border-white/[0.02] font-mono">
                      <span className="text-[10px] text-muted block uppercase">Maker Fee</span>
                      <span className="text-sm font-bold text-white mt-1 block">0.012%</span>
                    </div>
                    <div className="p-3 bg-canvas-dark/40 rounded-lg border border-white/[0.02] font-mono">
                      <span className="text-[10px] text-muted block uppercase">Taker Fee</span>
                      <span className="text-sm font-bold text-white mt-1 block">0.024%</span>
                    </div>
                    <div className="p-3 bg-canvas-dark/40 rounded-lg border border-white/[0.02] font-mono">
                      <span className="text-[10px] text-muted block uppercase">30d Volume</span>
                      <span className="text-sm font-bold text-white mt-1 block">$142,590.00</span>
                    </div>
                    <div className="p-3 bg-canvas-dark/40 rounded-lg border border-white/[0.02] font-mono">
                      <span className="text-[10px] text-muted block uppercase">Next Tier At</span>
                      <span className="text-sm font-bold text-primary mt-1 block">$500,000</span>
                    </div>
                  </div>
                </div>

                {/* 3. API Keys Management Section */}
                <div className="p-5 rounded-xl border border-hairline-on-dark bg-surface-card-dark space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white font-heading uppercase tracking-wider">Simulated API Keys</h4>
                      <p className="text-xs text-muted mt-0.5">Generate client keys for programmatic trading in our sandboxed environment.</p>
                    </div>

                    <form onSubmit={handleGenerateKey} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Key label..."
                        value={newKeyLabel}
                        onChange={(e) => setNewKeyLabel(e.target.value)}
                        className="bg-canvas-dark border border-white/[0.08] hover:border-white/20 focus:border-primary/85 rounded px-2.5 py-1.5 text-xs text-white placeholder-muted outline-none font-sans transition-all w-[150px] sm:w-[180px]"
                      />
                      <button
                        type="submit"
                        className="p-2 bg-primary hover:bg-primary-active text-black rounded transition-colors flex items-center justify-center"
                        title="Generate Key"
                      >
                        <Plus size={14} className="stroke-[3]" />
                      </button>
                    </form>
                  </div>

                  {/* API Keys Table */}
                  <div className="overflow-x-auto border border-white/[0.04] rounded-lg">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-[#12161a] text-muted uppercase tracking-wider text-[10px] font-bold border-b border-white/[0.04]">
                        <tr>
                          <th className="py-2.5 px-4">Label</th>
                          <th className="py-2.5 px-4">Public Key</th>
                          <th className="py-2.5 px-4 text-center">Perms</th>
                          <th className="py-2.5 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {apiKeys.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="py-6 text-center text-muted font-sans italic text-xs">
                              No keys active. Create one above for programmatic access.
                            </td>
                          </tr>
                        ) : (
                          apiKeys.map((k) => (
                            <tr key={k.id} className="hover:bg-white/[0.01] transition-colors">
                              <td className="py-3 px-4 font-sans font-bold text-white">{k.label}</td>
                              <td className="py-3 px-4 text-muted">{k.key}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase">
                                  {k.access}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => handleRevokeKey(k.id)}
                                  className="text-trading-down hover:text-white text-[10px] font-bold border border-trading-down/20 bg-trading-down/10 hover:bg-trading-down px-2 py-0.5 rounded transition-all uppercase"
                                >
                                  Revoke
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* API Key Modal */}
                <Dialog open={showKeyModal} onOpenChange={(open) => { setShowKeyModal(open); if (!open) setGeneratedKey(null); }}>
                  <DialogContent className="bg-[#0a0a0f] border border-white/10 rounded-xl p-6 space-y-4 shadow-2xl text-white max-w-md w-full">
                    {generatedKey && (
                      <>
                        <DialogHeader className="border-b border-white/[0.06] pb-3 flex flex-row justify-between items-center space-y-0 pr-6">
                          <DialogTitle className="flex items-center gap-2 text-primary font-bold text-sm uppercase font-heading tracking-wider">
                            <FileCode size={18} />
                            <span>Key Generated Successfully</span>
                          </DialogTitle>
                        </DialogHeader>

                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex gap-2 text-amber-500 text-xs">
                          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                          <p className="leading-relaxed font-sans">
                            <strong>Write down your secret key!</strong> It will not be shown again for security reasons. Copy both keys now.
                          </p>
                        </div>

                        <div className="space-y-3 font-mono text-xs">
                          <div>
                            <label className="text-muted text-[10px] uppercase block mb-1">Key Label</label>
                            <div className="bg-canvas-dark border border-white/[0.08] p-2 rounded text-white font-sans">{generatedKey.label}</div>
                          </div>

                          <div>
                            <label className="text-muted text-[10px] uppercase block mb-1">Public API Key</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                readOnly
                                value={generatedKey.key}
                                className="bg-canvas-dark border border-white/[0.08] p-2 rounded text-white flex-1 overflow-x-auto select-all"
                              />
                              <button
                                type="button"
                                onClick={() => copyToClipboard(generatedKey.key, "key")}
                                className="p-2 border border-white/[0.08] hover:border-primary bg-white/5 rounded text-white flex items-center justify-center cursor-pointer"
                              >
                                {copiedKey ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-muted text-[10px] uppercase block mb-1">Secret API Key</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                readOnly
                                value={generatedKey.secret}
                                className="bg-canvas-dark border border-white/[0.08] p-2 rounded text-white flex-1 overflow-x-auto select-all"
                              />
                              <button
                                type="button"
                                onClick={() => copyToClipboard(generatedKey.secret, "secret")}
                                className="p-2 border border-white/[0.08] hover:border-primary bg-white/5 rounded text-white flex items-center justify-center cursor-pointer"
                              >
                                {copiedSecret ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>)
              </div>
            )}

            {/* Render Settings Form Tab */}
            {activeTab === "settings" && (
              <Card className="h-full">
                <CardHeader className="border-b border-hairline-on-dark light:border-hairline-on-light pb-5 mb-6">
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <CardDescription>Update your profile credentials and email preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2 block font-semibold">
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
                        <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2 block font-semibold">
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
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2 block font-semibold">
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
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2 block font-semibold">
                        Username
                      </label>
                      <Input value={profile.username} disabled className="opacity-60 bg-surface-elevated-dark/50 cursor-not-allowed" />
                      <p className="text-xs text-muted mt-2">Username is used for system identification and cannot be altered.</p>
                    </div>

                    {success && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-trading-up/10 border border-trading-up/20 animate-slide-down">
                        <p className="text-trading-up text-sm font-mono">{success}</p>
                      </div>
                    )}
                    {error && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-trading-down/10 border border-trading-down/20 animate-slide-down">
                        <p className="text-trading-down text-sm font-mono">{error}</p>
                      </div>
                    )}

                    <div className="pt-6 border-t border-hairline-on-dark light:border-hairline-on-light flex justify-end">
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