import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Mail, Lock, User, X, Sparkles, ArrowRight, Play, Volume2, Disc } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { PageTransition } from "../components/ui/PageTransition";
import { loginUser, registerUser, googleLogin, completeProfile, setAuthToken, forgotPassword, resetPassword } from "../api";
import { useToast } from "../hooks/useToast";
import heroBg from "../assets/images/hero-bg.png";
import authBannerGradient from "../assets/images/auth-banner-gradient.jpg";
import Logo from "../assets/images/Logo.png";
import gmailIcon from "../assets/Icons/Gmail_icon_svg.webp";
import githubIcon from "../assets/Icons/github_icon.png";
import xIcon from "../assets/Icons/x.com_icon.png";

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

// Validation helpers
const validateUsername = (v) => {
  if (!v || !v.trim()) return "Username is required";
  if (v.trim().length < 3) return "Username must be at least 3 characters";
  return null;
};

const validateEmail = (v) => {
  if (!v || !v.trim()) return "Email is required";
  if (!/\S+@\S+\.\S+/.test(v)) return "Enter a valid email address";
  return null;
};

const validatePasswordLogin = (v) => {
  if (!v) return "Password is required";
  return null;
};

const validatePasswordRegister = (v) => {
  if (!v) return "Password is required";
  if (v.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(v)) return "Password must contain at least 1 uppercase letter";
  if (!/[0-9]/.test(v)) return "Password must contain at least 1 number";
  return null;
};

const getPasswordStrength = (password) => {
  if (!password || password.length < 8) return "weak";
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (hasUpper && hasNumber) return "strong";
  return "medium";
};

const STRENGTH_METER = {
  weak: {
    label: "Weak password",
    bars: [
      { color: "bg-trading-down", active: true },
      { color: "bg-hairline-on-dark", active: false },
      { color: "bg-hairline-on-dark", active: false },
    ],
  },
  medium: {
    label: "Medium password",
    bars: [
      { color: "bg-trading-warning", active: true },
      { color: "bg-trading-warning", active: true },
      { color: "bg-hairline-on-dark", active: false },
    ],
  },
  strong: {
    label: "Strong password",
    bars: [
      { color: "bg-trading-up", active: true },
      { color: "bg-trading-up", active: true },
      { color: "bg-trading-up", active: true },
    ],
  },
};

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-trading-down text-xs mt-1.5">
      {message}
    </p>
  );
}

function PasswordStrengthMeter({ password, show }) {
  if (!show) return <div className="h-1" aria-hidden="true" />;
  const strength = getPasswordStrength(password);
  const meta = STRENGTH_METER[strength];
  return (
    <div
      className="flex items-center gap-1 mt-2"
      aria-label={meta.label}
      role="meter"
      aria-valuenow={
        strength === "weak" ? 1 : strength === "medium" ? 2 : 3
      }
      aria-valuemin={0}
      aria-valuemax={3}
      aria-valuetext={meta.label}
    >
      {meta.bars.map((bar, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            bar.active ? bar.color : "bg-hairline-on-dark"
          }`}
        />
      ))}
    </div>
  );
}

export default function AuthPage() {
  const location = useLocation();
  const toast = useToast();

  const [mode, setMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") === "register" ? "register" : "login";
  });
  const [form, setForm] = useState(initialForm);
  const [setupForm, setSetupForm] = useState(profileSetupForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  // Field-level errors: { fieldName: "error message" }
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const content = AUTH_CONTENT[mode];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modeParam = params.get("mode");
    if (modeParam === "register") {
      setMode("register");
    } else if (modeParam === "login") {
      setMode("login");
    }
  }, [location.search]);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");

  const [urlResetToken, setUrlResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const setup = params.get("setup");
    const errorParam = params.get("error");
    const errorMsg = params.get("message");
    const resetTokenParam = params.get("resetToken");

    if (resetTokenParam) {
      setUrlResetToken(resetTokenParam);
    }

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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotError("Please enter a valid email address.");
      return;
    }
    setForgotError("");
    setForgotSuccess("");
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotSuccess(`If an account exists for ${forgotEmail}, a password reset link has been sent to your email.`);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err) {
      setForgotError(err.message || "Failed to process request.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    setError("");
    setResetLoading(true);
    try {
      await resetPassword(urlResetToken, newPassword);
      setResetSuccess(true);
      toast.success("Password reset successfully! You can now log in.");
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setResetLoading(false);
    }
  };

  // Clear field error when user starts typing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSetupChange = (e) => {
    const { name, value } = e.target;
    setSetupForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSetupBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (name === "username") {
      const err = validateUsername(value);
      setFieldErrors((prev) => ({ ...prev, ...(err ? { [name]: err } : {}) }));
    }
    if (name === "firstName" && !setupForm.firstName.trim()) {
      setFieldErrors((prev) => ({ ...prev, firstName: "First name is required" }));
    }
    if (name === "lastName" && !setupForm.lastName.trim()) {
      setFieldErrors((prev) => ({ ...prev, lastName: "Last name is required" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldValidators = {
      username: (val) => validateUsername(val),
      email: (val) => validateEmail(val),
      password: (val) => mode === "register" ? validatePasswordRegister(val) : validatePasswordLogin(val),
      firstName: (val) => (mode === "register" && !val.trim() ? "First name is required" : null),
      lastName: (val) => (mode === "register" && !val.trim() ? "Last name is required" : null),
    };
    const validator = fieldValidators[name];
    let err = validator ? validator(value) : null;
    setFieldErrors((prev) => ({
      ...prev,
      ...(err ? { [name]: err } : {}),
    }));
  };

  const validateForm = () => {
    const errors = {};
    const uErr = validateUsername(form.username);
    if (uErr) errors.username = uErr;
    if (mode === "register") {
      const eErr = validateEmail(form.email);
      if (eErr) errors.email = eErr;
      const pErr = validatePasswordRegister(form.password);
      if (pErr) errors.password = pErr;
      if (!form.firstName.trim()) errors.firstName = "First name is required";
      if (!form.lastName.trim()) errors.lastName = "Last name is required";
    } else {
      const pErr = validatePasswordLogin(form.password);
      if (pErr) errors.password = pErr;
    }
    return errors;
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setFieldErrors({});
    setTouched({ username: true, firstName: true, lastName: true });

    // Validate all fields
    const errors = {};
    const uErr = validateUsername(setupForm.username);
    if (uErr) errors.username = uErr;
    if (!setupForm.firstName.trim()) errors.firstName = "First name is required";
    if (!setupForm.lastName.trim()) errors.lastName = "Last name is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await completeProfile({
        username: setupForm.username,
        firstName: setupForm.firstName,
        lastName: setupForm.lastName,
      });
      toast?.success("Profile setup complete! Welcome to NexTradeX.");
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Profile setup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    // Mark all fields as touched
    const allFields = ["username", "email", "password", "firstName", "lastName"];
    const touchedAll = allFields.reduce((acc, f) => ({ ...acc, [f]: true }), {});
    setTouched(touchedAll);
    setFieldErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        await loginUser({ username: form.username, password: form.password });
        toast?.success("Welcome back! You're now logged in.");
      } else {
        await registerUser({
          username: form.username,
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
        });
        toast?.success("Account created! Welcome to NexTradeX.");
      }
      // Clear form state
      setForm(initialForm);
      setFieldErrors({});
      setTouched({});
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

  if (urlResetToken) {
    return (
      <PageTransition>
        <div
          className="min-h-[calc(100vh-140px)] sm:min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-none" />
          <Card className="w-full max-w-md overflow-hidden bg-white/95 backdrop-blur-xl border border-white/80 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.22)] relative z-10">
            <CardHeader className="pb-4 pt-8 px-8">
              <CardTitle className="text-[24px] font-semibold text-[#181925] tracking-[-0.31px]">Set New Password</CardTitle>
              <CardDescription className="text-[15px] text-[#666666] tracking-[-0.32px] mt-1">Enter a strong new password for your NexTradeX account.</CardDescription>
            </CardHeader>
            {resetSuccess ? (
              <CardContent className="space-y-4 text-center py-6 px-8">
                <div className="p-4 rounded-[12px] bg-[#def6e4] text-[#33c758] font-medium text-[15px] tracking-[-0.32px]">Password Updated Successfully!</div>
                <p className="text-[14px] text-[#666666] tracking-[-0.32px]">Your password has been reset. You can now log in with your new password.</p>
                <Button onClick={() => { setUrlResetToken(""); window.location.href = "/auth"; }} className="w-full bg-[#918df6] hover:bg-[#807ce5] text-white rounded-full font-medium text-[15px] tracking-[-0.32px] mt-4 py-3">
                  Proceed to Login
                </Button>
              </CardContent>
            ) : (
              <form onSubmit={handleResetSubmit} noValidate>
                <CardContent className="space-y-5 px-8">
                  {error && (
                    <div role="alert" className="flex items-start gap-2 p-3.5 rounded-[8px] bg-[#fff0ed] border border-[#ff3e00]/20 text-[#ff3e00] text-[13px] tracking-[-0.32px]">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <div>
                    <label className="text-[12px] text-[#181925] tracking-[-0.32px] uppercase mb-2 block font-semibold">New Password</label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
                      required
                      className="border-[#e8e8e8] text-[#181925] placeholder:text-[#999999] rounded-[8px] focus:border-[#918df6] focus:ring-[#918df6]/20"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="focus:outline-none focus-visible:ring-1 focus-visible:ring-[#918df6]/40 rounded text-[#999999] hover:text-[#181925]"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      }
                    />
                    <PasswordStrengthMeter password={newPassword} show={true} />
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-8 px-8">
                  <Button type="submit" className="w-full bg-[#918df6] hover:bg-[#807ce5] text-white rounded-full font-medium text-[15px] tracking-[-0.32px] py-3 shadow-[0_1px_1px_rgba(0,0,0,0.08)]" loading={resetLoading} disabled={resetLoading}>
                    Update Password
                  </Button>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Profile setup form
  if (needsSetup) {
    return (
      <PageTransition>
        <div
          className="min-h-[calc(100vh-140px)] sm:min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-none" />
          <Card className="w-full max-w-md overflow-hidden bg-white/95 backdrop-blur-xl border border-white/80 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.22)] relative z-10">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Complete Your Profile</CardTitle>
              <CardDescription className="text-sm mt-1">Choose a username and verify your name to continue.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSetupSubmit} noValidate>
              <CardContent className="space-y-5">
                {/* Username */}
                <div>
                  <label htmlFor="setup-username" className="font-mono text-[10px] text-muted uppercase mb-2 block font-semibold">
                    Username <span className="text-trading-down" aria-hidden="true">*</span>
                  </label>
                  <div className="relative min-h-[56px]">
                    <Input
                      id="setup-username"
                      name="username"
                      value={setupForm.username}
                      onChange={handleSetupChange}
                      onBlur={handleSetupBlur}
                      autoComplete="username"
                      required
                      aria-required="true"
                      aria-invalid={!!fieldErrors.username}
                      aria-describedby={fieldErrors.username ? "setup-username-error" : undefined}
                      placeholder="Choose a username"
                      className={fieldErrors.username ? "border-trading-down focus-visible:border-trading-down focus-visible:ring-trading-down/20" : ""}
                    />
                  </div>
                  <FieldError id="setup-username-error" message={fieldErrors.username} />
                </div>

                {/* First + Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="setup-firstName" className="font-mono text-[10px] text-muted uppercase mb-2 block font-semibold">
                      First Name <span className="text-trading-down" aria-hidden="true">*</span>
                    </label>
                    <div className="relative min-h-[56px]">
                      <Input
                        id="setup-firstName"
                        name="firstName"
                        value={setupForm.firstName}
                        onChange={handleSetupChange}
                        onBlur={handleSetupBlur}
                        autoComplete="given-name"
                        required
                        aria-required="true"
                        aria-invalid={!!fieldErrors.firstName}
                        aria-describedby={fieldErrors.firstName ? "setup-firstName-error" : undefined}
                        placeholder="First name"
                        className={fieldErrors.firstName ? "border-trading-down focus-visible:border-trading-down focus-visible:ring-trading-down/20" : ""}
                      />
                    </div>
                    <FieldError id="setup-firstName-error" message={fieldErrors.firstName} />
                  </div>
                  <div>
                    <label htmlFor="setup-lastName" className="font-mono text-[10px] text-muted uppercase mb-2 block font-semibold">
                      Last Name <span className="text-trading-down" aria-hidden="true">*</span>
                    </label>
                    <div className="relative min-h-[56px]">
                      <Input
                        id="setup-lastName"
                        name="lastName"
                        value={setupForm.lastName}
                        onChange={handleSetupChange}
                        onBlur={handleSetupBlur}
                        autoComplete="family-name"
                        required
                        aria-required="true"
                        aria-invalid={!!fieldErrors.lastName}
                        aria-describedby={fieldErrors.lastName ? "setup-lastName-error" : undefined}
                        placeholder="Last name"
                        className={fieldErrors.lastName ? "border-trading-down focus-visible:border-trading-down focus-visible:ring-trading-down/20" : ""}
                      />
                    </div>
                    <FieldError id="setup-lastName-error" message={fieldErrors.lastName} />
                  </div>
                </div>

                {/* Top-level form error */}
                {error && (
                  <div role="alert" aria-live="polite" className="flex items-start gap-2 p-3 rounded-2xl bg-trading-down/10 border border-trading-down/20 text-trading-down text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  type="submit"
                  className="w-full font-mono font-bold"
                  loading={loading}
                  disabled={loading}
                  aria-disabled={loading}
                >
                  Complete Setup
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </PageTransition>
    );
  }

  // Main login / register form
  return (
    <PageTransition>
      {/* Outer container with hero-bg background */}
      <div
        className="min-h-[calc(100vh-140px)] sm:min-h-[calc(100vh-160px)] w-full flex items-center justify-center p-4 sm:p-6 md:p-10 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Soft overlay */}
        <div className="absolute inset-0 bg-black/15 backdrop-blur-[3px] pointer-events-none" />

        {/* Floating Split Card Container */}
        <div className="w-full max-w-5xl bg-white rounded-[32px] sm:rounded-[36px] p-3 sm:p-4 md:p-5 shadow-[0_25px_70px_rgba(0,0,0,0.22)] border border-white/90 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10">

          {/* LEFT PANEL: Frosted Gradient Banner */}
          <div className="lg:col-span-5 rounded-[24px] sm:rounded-[28px] overflow-hidden relative flex items-center justify-center min-h-[350px] lg:min-h-[560px] bg-white">
            <img
              src={authBannerGradient}
              alt="Authentication Banner"
              className="w-full h-full object-cover rounded-[24px] sm:rounded-[28px]"
            />
          </div>

          {/* RIGHT PANEL: Login Form Area */}
          <div className="lg:col-span-7 flex flex-col justify-center px-3 sm:px-6 py-4 sm:py-6">
            <div className="w-full max-w-md mx-auto">
              
              {/* Logo / Header */}
              <div className="flex justify-center mb-6">
                <img src={Logo} alt="NexTradeX" className="h-8 w-auto" />
              </div>

              {/* Login / Register toggle */}
              <div className="flex items-center bg-[#f4f4f5] rounded-full p-1 mb-6 relative overflow-hidden">
                <div
                  className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm"
                  style={{
                    ...getToggleStyle(),
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "login"}
                  id="auth-tab-login"
                  onClick={() => { setMode("login"); setFieldErrors({}); setTouched({}); }}
                  className={`flex-1 text-sm font-medium px-4 py-2 rounded-full relative z-10 transition-colors duration-300 ${
                    mode === "login" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Log in
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "register"}
                  id="auth-tab-register"
                  onClick={() => { setMode("register"); setFieldErrors({}); setTouched({}); }}
                  className={`flex-1 text-sm font-medium px-4 py-2 rounded-full relative z-10 transition-colors duration-300 ${
                    mode === "register" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Title + subtitle */}
              <div className="mb-5">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {mode === "login" ? "Welcome back" : "Create an account"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {mode === "login"
                    ? "Sign in to access your paper trading terminal."
                    : "Register to start paper trading on NexTradeX."}
                </p>
              </div>

              {/* Error banner */}
              {error && (
                <div role="alert" className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm mb-4">
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form
                id="auth-form-panel"
                role="tabpanel"
                aria-labelledby={mode === "login" ? "auth-tab-login" : "auth-tab-register"}
                onSubmit={handleSubmit}
                noValidate
                className="space-y-3.5"
              >
                {/* Username */}
                <div>
                  <Input
                    id="auth-username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="username"
                    required
                    aria-required="true"
                    aria-invalid={!!fieldErrors.username}
                    placeholder="Username"
                    className={`h-11 rounded-xl border-gray-200 bg-gray-50/80 focus:bg-white text-sm ${fieldErrors.username ? "border-red-400" : ""}`}
                  />
                  <FieldError id="auth-username-error" message={fieldErrors.username} />
                </div>

                {/* Register-only: First Name, Last Name, Email */}
                <div
                  className="transition-all duration-500 ease-out overflow-hidden"
                  style={{
                    maxHeight: mode === "register" ? '400px' : '0',
                    opacity: mode === "register" ? 1 : 0,
                  }}
                >
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Input
                          id="auth-firstName"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          autoComplete="given-name"
                          required={mode === "register"}
                          placeholder="First name"
                          className={`h-11 rounded-xl border-gray-200 bg-gray-50/80 focus:bg-white text-sm ${fieldErrors.firstName ? "border-red-400" : ""}`}
                        />
                        <FieldError id="auth-firstName-error" message={fieldErrors.firstName} />
                      </div>
                      <div>
                        <Input
                          id="auth-lastName"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          autoComplete="family-name"
                          required={mode === "register"}
                          placeholder="Last name"
                          className={`h-11 rounded-xl border-gray-200 bg-gray-50/80 focus:bg-white text-sm ${fieldErrors.lastName ? "border-red-400" : ""}`}
                        />
                        <FieldError id="auth-lastName-error" message={fieldErrors.lastName} />
                      </div>
                    </div>
                    <div>
                      <Input
                        id="auth-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="email"
                        required={mode === "register"}
                        placeholder="Email address"
                        className={`h-11 rounded-xl border-gray-200 bg-gray-50/80 focus:bg-white text-sm ${fieldErrors.email ? "border-red-400" : ""}`}
                      />
                      <FieldError id="auth-email-error" message={fieldErrors.email} />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    required
                    placeholder="Password"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="focus:outline-none text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                    className={`h-11 rounded-xl border-gray-200 bg-gray-50/80 focus:bg-white text-sm ${fieldErrors.password ? "border-red-400" : ""}`}
                  />
                  <PasswordStrengthMeter password={form.password} show={mode === "register"} />
                  <FieldError id="auth-password-error" message={fieldErrors.password} />
                  {mode === "login" && (
                    <div className="flex justify-end mt-1.5">
                      <button
                        type="button"
                        onClick={() => { setForgotError(""); setForgotSuccess(""); setShowForgotModal(true); }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit button with styled purple/indigo gradient like design */}
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-white shadow-[0_8px_20px_rgba(99,102,241,0.35)] transition-all"
                  loading={loading}
                  disabled={loading}
                >
                  {mode === "login" ? "Get Started" : "Create Account"}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center my-4">
                <div className="flex-grow border-t border-gray-200" />
                <span className="mx-3 text-[11px] text-gray-400 uppercase tracking-wider font-medium">or continue with</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              {/* Social logins */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={googleLogin}
                  aria-label="Log in with Google"
                  className="flex items-center justify-center h-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("GitHub Login integration enabled.")}
                  aria-label="Log in with GitHub"
                  className="flex items-center justify-center h-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
                >
                  <img src={githubIcon} alt="GitHub" className="w-5 h-5 object-contain" />
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("X / Twitter Login integration enabled.")}
                  aria-label="Log in with X"
                  className="flex items-center justify-center h-11 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all cursor-pointer shadow-xs"
                >
                  <img src={xIcon} alt="X" className="w-5 h-5 object-contain" />
                </button>
              </div>

              {/* Switch mode link */}
              <p className="text-center text-xs text-gray-500 mt-5">
                {mode === "login" ? (
                  <>Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => { setMode("register"); setFieldErrors({}); setTouched({}); }} className="text-indigo-600 hover:underline font-semibold">Sign up</button>
                  </>
                ) : (
                  <>Already have an account?{" "}
                    <button type="button" onClick={() => { setMode("login"); setFieldErrors({}); setTouched({}); }} className="text-indigo-600 hover:underline font-semibold">Log in</button>
                  </>
                )}
              </p>

            </div>
          </div>

        </div>
      </div>
      {/* Forgot Password Modal */}
      <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <DialogContent className="max-w-md bg-white border border-[#e8e8e8] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.06)]">
          <DialogHeader>
            <DialogTitle className="text-[20px] font-semibold text-[#181925] tracking-[-0.31px]">Forgot Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotSubmit} className="space-y-4 pt-2">
            <p className="text-[14px] text-[#666666] tracking-[-0.32px] leading-relaxed">
              Enter your registered email address below and we will send you a link to reset your password.
            </p>
            {forgotError && (
              <div role="alert" className="p-3.5 rounded-[8px] bg-[#fff0ed] border border-[#ff3e00]/20 text-[#ff3e00] text-[13px] tracking-[-0.32px]">
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div role="status" className="p-3.5 rounded-[8px] bg-[#def6e4] border border-[#33c758]/20 text-[#33c758] text-[13px] tracking-[-0.32px]">
                {forgotSuccess}
              </div>
            )}
            <div>
              <label className="text-[12px] font-medium text-[#181925] tracking-[-0.32px] uppercase mb-1.5 block">Email Address</label>
              <Input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="border-[#e8e8e8] text-[#181925] placeholder:text-[#999999] rounded-[8px] focus:border-[#918df6] focus:ring-[#918df6]/20"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setShowForgotModal(false)} className="rounded-full border border-[#e8e8e8] text-[#666666] hover:bg-[#fafafa] font-medium text-[14px] px-5">
                Cancel
              </Button>
              <Button type="submit" loading={forgotLoading} disabled={forgotLoading} className="bg-[#918df6] hover:bg-[#807ce5] text-white rounded-full font-medium text-[14px] tracking-[-0.32px] px-6 shadow-[0_1px_1px_rgba(0,0,0,0.08)]">
                Send Reset Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
