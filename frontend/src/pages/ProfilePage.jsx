import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { fetchUserProfile, updateUserProfile } from "../api";
import { User, Mail, Shield, CheckCircle, XCircle } from "lucide-react";

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
      <div className="mx-auto max-w-2xl space-y-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>View and manage your account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User size={28} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{profile.username}</p>
                <p className="text-sm text-muted capitalize">{profile.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Shield size={14} />
                  <span className="font-mono text-[10px] uppercase tracking-wider">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  {profile.active ? (
                    <>
                      <CheckCircle size={16} className="text-accent-green" />
                      <span className="text-accent-green text-sm">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-accent-red" />
                      <span className="text-accent-red text-sm">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex items-center gap-2 text-muted mb-1">
                  <Mail size={14} />
                  <span className="font-mono text-[10px] uppercase tracking-wider">Email</span>
                </div>
                <div className="flex items-center gap-2">
                  {profile.emailVerified ? (
                    <>
                      <CheckCircle size={16} className="text-accent-green" />
                      <span className="text-accent-green text-sm">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-yellow-500" />
                      <span className="text-yellow-500 text-sm">Unverified</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 pt-4 border-t border-white/[0.06]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
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
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
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
                <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                  Email
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
                <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">
                  Username
                </label>
                <Input value={profile.username} disabled className="opacity-60" />
                <p className="text-xs text-muted mt-1">Username cannot be changed</p>
              </div>

              {success && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-green/10 border border-accent-green/20">
                  <p className="text-accent-green text-sm font-mono">{success}</p>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20">
                  <p className="text-accent-red text-sm font-mono">{error}</p>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} className="w-full font-mono" loading={saving}>
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageTransition>
  );
}