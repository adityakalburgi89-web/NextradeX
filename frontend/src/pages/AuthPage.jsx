import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { loginUser, registerUser } from "../api";

const initialForm = { username: "", email: "", password: "", firstName: "", lastName: "" };

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") {
        await loginUser({ username: form.username, password: form.password });
      } else {
        await registerUser({
          username: form.username,
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
        });
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            {/* Mode Toggle */}
            <div className="flex items-center bg-white/[0.04] rounded-xl p-1 mb-6 border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 font-mono text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all duration-300 ${
                  mode === "login"
                    ? "bg-gradient-to-r from-secondary to-primary text-white shadow-glow-primary font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 font-mono text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all duration-300 ${
                  mode === "register"
                    ? "bg-gradient-to-r from-secondary to-primary text-white shadow-glow-primary font-bold"
                    : "text-muted hover:text-white"
                }`}
              >
                Register
              </button>
            </div>
            <CardTitle>{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
            <CardDescription>
              {mode === "login" ? "Sign in to access your trading terminal." : "Register to start paper trading on NexTradeX."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div>
                <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">Username</label>
                <Input name="username" value={form.username} onChange={handleChange} required placeholder="Enter username" />
              </div>
              {mode === "register" && (
                <div className="space-y-5 animate-slide-down">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">First Name</label>
                      <Input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">Last Name</label>
                      <Input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">Email</label>
                    <Input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="john@example.com" />
                  </div>
                </div>
              )}
              <div>
                <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">Password</label>
                <Input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="Enter password" />
              </div>
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 animate-slide-down">
                  <p className="text-accent-red text-sm font-mono">{error}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full font-mono" loading={loading}>
                {mode === "login" ? "Log In" : "Register"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageTransition>
  );
}
