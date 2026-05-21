import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { fetchUserProfile, updateUserProfile } from "../api";
import { User, Mail, Shield, CheckCircle, XCircle, Key, Lock } from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    const loadProfile = async () => {
      try {
        const res = await fetchUserProfile();
        if (res?.data) {
          setProfile(res.data);
          setForm({
            firstName: res.data.firstName || "",
            lastName: res.data.lastName || "",
            email: res.data.email || "",
          });
        }
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
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
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-on-dark light:text-ink font-sans tracking-tight">Account Overview</h1>
          <p className="text-sm text-muted mt-1.5">Manage your personal information, security credentials, and preferences.</p>
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

          {/* Right Column - Profile Settings Form */}
          <div className="lg:col-span-8">
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
          </div>
        </div>
      </div>
    </PageTransition>
  );
}