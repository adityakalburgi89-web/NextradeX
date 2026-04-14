import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { loginUser, registerUser } from "../api";

const initialForm = { username: "", email: "", password: "", firstName: "", lastName: "" };

const AUTH_CONTENT = {
  login: {
    title: "Welcome back",
    description: "Sign in to access your trading terminal.",
    button: "Log In"
  },
  register: {
    title: "Create your account",
    description: "Register to start paper trading on NexTradeX.",
    button: "Register"
  }
};

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const content = AUTH_CONTENT[mode];

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

  const getToggleStyle = () => ({
    width: '50%',
    transform: mode === 'login' ? 'translateX(0%)' : 'translateX(100%)',
  });

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md overflow-hidden">
          <CardHeader>
            <div className="relative mb-6">
              <div className="flex items-center bg-white/[0.04] rounded-xl p-1 border border-white/[0.06] relative overflow-hidden">
                <div
                  className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-secondary to-primary shadow-glow-primary"
                  style={{
                    ...getToggleStyle(),
                    transition: 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 font-mono text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg relative z-10 ${mode === "login" ? "text-white font-bold" : "text-muted hover:text-white"
                    }`}
                  style={{ transition: 'color 0.4s ease' }}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`flex-1 font-mono text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg relative z-10 ${mode === "register" ? "text-white font-bold" : "text-muted hover:text-white"
                    }`}
                  style={{ transition: 'color 0.4s ease' }}
                >
                  Register
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden h-8">
              <div
                className="transition-all duration-500 ease-out"
                style={{
                  transform: mode === 'login' ? 'translateY(0)' : 'translateY(-10px)',
                  opacity: mode === 'login' ? 1 : 0,
                }}
              >
                <CardTitle>Welcome back</CardTitle>
              </div>
              <div
                className="absolute top-0 left-0 right-0 transition-all duration-500 ease-out"
                style={{
                  transform: mode === 'register' ? 'translateY(0)' : 'translateY(10px)',
                  opacity: mode === 'register' ? 1 : 0,
                }}
              >
                <CardTitle>Create your account</CardTitle>
              </div>
            </div>

            <div className="relative overflow-hidden h-6 mt-2">
              <div
                className="transition-all duration-500 ease-out"
                style={{
                  transform: mode === 'login' ? 'translateY(0)' : 'translateY(-10px)',
                  opacity: mode === 'login' ? 1 : 0,
                }}
              >
                <CardDescription>Sign in to access your trading terminal.</CardDescription>
              </div>
              <div
                className="absolute top-0 left-0 right-0 transition-all duration-500 ease-out"
                style={{
                  transform: mode === 'register' ? 'translateY(0)' : 'translateY(10px)',
                  opacity: mode === 'register' ? 1 : 0,
                }}
              >
                <CardDescription>Register to start paper trading on NexTradeX.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div>
                <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">Username</label>
                <Input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  placeholder="Username"
                />
              </div>

              <div
                className="transition-all duration-500 ease-out overflow-hidden"
                style={{
                  maxHeight: mode === "register" ? '500px' : '0',
                  opacity: mode === "register" ? 1 : 0,
                  marginTop: mode === "register" ? '0' : '-1rem',
                }}
              >
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">First Name</label>
                      <Input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">Last Name</label>
                      <Input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2.5 block">Email</label>
                    <Input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="Email address"
                    />
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
                  placeholder="Password"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                    >
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
                {content.button}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageTransition>
  );
}