import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    if (newMode !== mode) {
      setMode(newMode);
      setError("");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md overflow-hidden">
          <CardHeader>
            <div className="relative mb-6">
              <div className="flex items-center bg-white/[0.04] rounded-xl p-1 border border-white/[0.06] relative">
                <div 
                  className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-secondary to-primary transition-all duration-300 ease-out"
                  style={{
                    width: '50%',
                    transform: mode === 'login' ? 'translateX(0)' : 'translateX(100%)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`flex-1 font-mono text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all duration-300 relative z-10 ${
                    mode === "login" ? "text-white font-bold" : "text-muted hover:text-white"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`flex-1 font-mono text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all duration-300 relative z-10 ${
                    mode === "register" ? "text-white font-bold" : "text-muted hover:text-white"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>
            <CardTitle className="transition-all duration-300">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription className="transition-all duration-300">
              {mode === "login" ? "Sign in to access your trading terminal." : "Register to start paper trading on NexTradeX."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5" key={mode}>
              <div className="transition-all duration-300">
                <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">Username</label>
                <Input name="username" value={form.username} onChange={handleChange} required placeholder="Enter username" />
              </div>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  mode === "register" ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-5 pt-2">
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
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">Password</label>
                <Input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  value={form.password} 
                  onChange={handleChange} 
                  required 
                  placeholder="Enter password"
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
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
