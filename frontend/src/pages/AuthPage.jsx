import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { loginUser, registerUser, googleLogin, completeProfile, setAuthToken } from "../api";

const initialForm = { username: "", email: "", password: "", firstName: "", lastName: "" };
const profileSetupForm = { username: "", firstName: "", lastName: "" };

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
  const [setupForm, setSetupForm] = useState(profileSetupForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  const content = AUTH_CONTENT[mode];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const setup = params.get("setup");
    const errorParam = params.get("error");
    const errorMsg = params.get("message");

    if (token) {
      setAuthToken(token);
      if (setup === "true") {
        setNeedsSetup(true);
      } else {
        window.location.href = "/";
      }
    }

    if (errorParam) {
      setError(errorMsg || "Authentication failed");
      window.history.replaceState({}, document.title, "/auth");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSetupChange = (e) => {
    const { name, value } = e.target;
    setSetupForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await completeProfile({
        username: setupForm.username,
        firstName: setupForm.firstName,
        lastName: setupForm.lastName,
      });
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Profile setup failed");
    } finally {
      setLoading(false);
    }
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

  if (needsSetup) {
    return (
      <PageTransition>
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md overflow-hidden border border-hairline-on-dark light:border-hairline-on-light">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Complete Your Profile</CardTitle>
              <CardDescription className="text-sm mt-1">Choose a username and verify your name to continue.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSetupSubmit}>
              <CardContent className="space-y-5">
                <div>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2 block font-semibold">Username</label>
                  <Input
                    name="username"
                    value={setupForm.username}
                    onChange={handleSetupChange}
                    required
                    placeholder="Choose a username"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2 block font-semibold">First Name</label>
                    <Input
                      name="firstName"
                      value={setupForm.firstName}
                      onChange={handleSetupChange}
                      required
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2 block font-semibold">Last Name</label>
                    <Input
                      name="lastName"
                      value={setupForm.lastName}
                      onChange={handleSetupChange}
                      required
                      placeholder="Last name"
                    />
                  </div>
                </div>
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-trading-down/10 border border-trading-down/20 animate-slide-down">
                    <p className="text-trading-down text-sm font-mono">{error}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <Button type="submit" className="w-full font-mono font-bold" loading={loading}>
                  Complete Setup
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md overflow-hidden border border-hairline-on-dark light:border-hairline-on-light">
          <CardHeader className="pb-4">
            <div className="relative mb-6">
              <div className="flex items-center bg-surface-elevated-dark light:bg-surface-strong-light rounded-xl p-1 border border-hairline-on-dark light:border-hairline-on-light relative overflow-hidden">
                <div
                  className="absolute top-1 bottom-1 rounded-lg bg-primary"
                  style={{
                    ...getToggleStyle(),
                    transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 font-mono text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg relative z-10 transition-colors duration-300 ${mode === "login"
                      ? "text-on-primary font-bold"
                      : "text-muted hover:text-on-dark light:hover:text-ink"
                    }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`flex-1 font-mono text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg relative z-10 transition-colors duration-300 ${mode === "register"
                      ? "text-on-primary font-bold"
                      : "text-muted hover:text-on-dark light:hover:text-ink"
                    }`}
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
                <CardTitle className="text-xl">Welcome back</CardTitle>
              </div>
              <div
                className="absolute top-0 left-0 right-0 transition-all duration-500 ease-out"
                style={{
                  transform: mode === 'register' ? 'translateY(0)' : 'translateY(10px)',
                  opacity: mode === 'register' ? 1 : 0,
                }}
              >
                <CardTitle className="text-xl">Create your account</CardTitle>
              </div>
            </div>

            <div className="relative overflow-hidden h-6 mt-1.5">
              <div
                className="transition-all duration-500 ease-out"
                style={{
                  transform: mode === 'login' ? 'translateY(0)' : 'translateY(-10px)',
                  opacity: mode === 'login' ? 1 : 0,
                }}
              >
                <CardDescription className="text-sm">Sign in to access your NexTradeX trading terminal.</CardDescription>
              </div>
              <div
                className="absolute top-0 left-0 right-0 transition-all duration-500 ease-out"
                style={{
                  transform: mode === 'register' ? 'translateY(0)' : 'translateY(10px)',
                  opacity: mode === 'register' ? 1 : 0,
                }}
              >
                <CardDescription className="text-sm">Register to start paper trading on NexTradeX.</CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pb-5">
              <div>
                <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2 block font-semibold">Username</label>
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
                  marginTop: mode === "register" ? '1.25rem' : '0',
                  marginBottom: mode === "register" ? '1.25rem' : '0',
                }}
              >
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2 block font-semibold">First Name</label>
                      <Input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        required={mode === "register"}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2 block font-semibold">Last Name</label>
                      <Input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        required={mode === "register"}
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2 block font-semibold">Email Address</label>
                    <Input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required={mode === "register"}
                      placeholder="Email address"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2 block font-semibold">Password</label>
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
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-trading-down/10 border border-trading-down/20 animate-slide-down">
                  <p className="text-trading-down text-sm font-mono">{error}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-6">
              <Button type="submit" className="w-full font-mono font-bold" loading={loading}>
                {content.button}
              </Button>
              <div className="relative flex items-center w-full my-1">
                <div className="flex-grow border-t border-hairline-on-dark light:border-hairline-on-light"></div>
                <span className="flex-shrink mx-4 text-muted text-xs font-mono uppercase tracking-wider">or</span>
                <div className="flex-grow border-t border-hairline-on-dark light:border-hairline-on-light"></div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full font-mono flex items-center justify-center gap-2 hover:bg-surface-elevated-dark light:hover:bg-surface-strong-light"
                onClick={googleLogin}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageTransition>
  );
}