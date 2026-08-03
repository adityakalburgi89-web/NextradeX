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
import authIllustration from "../assets/images/auth-illustration.jpg";
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
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-[#fafafa]">
          <Card className="w-full max-w-md overflow-hidden bg-white border border-[#e8e8e8] rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_16px_rgba(0,0,0,0.06)]">
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
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md overflow-hidden border border-transparent light:border-transparent">
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
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 bg-[#ebf5ff]">
        <Card className="w-full max-w-md bg-[#fafdff] rounded-[32px] p-8 border-0 shadow-none">
          <CardHeader className="pb-4 px-0 pt-0">
            {/* Login / Register toggle */}
            <div className="relative mb-6">
              <div className="flex items-center bg-[#f6f7f8] rounded-full p-1 border border-black/5 relative overflow-hidden">
                <div
                  className="absolute top-1 bottom-1 rounded-full bg-[#181d27]"
                  style={{
                    ...getToggleStyle(),
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "login"}
                  aria-controls="auth-form-panel"
                  id="auth-tab-login"
                  onClick={() => { setMode("login"); setFieldErrors({}); setTouched({}); }}
                  className={`flex-1 font-mono text-xs uppercase px-4 py-2.5 rounded-2xl relative z-10 transition-colors duration-300 ${
                    mode === "login"
                      ? "text-on-primary font-bold"
                      : "text-muted hover:text-on-dark light:hover:text-foreground"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "register"}
                  aria-controls="auth-form-panel"
                  id="auth-tab-register"
                  onClick={() => { setMode("register"); setFieldErrors({}); setTouched({}); }}
                  className={`flex-1 font-mono text-xs uppercase px-4 py-2.5 rounded-2xl relative z-10 transition-colors duration-300 ${
                    mode === "register"
                      ? "text-on-primary font-bold"
                      : "text-muted hover:text-on-dark light:hover:text-foreground"
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Animated title */}
            <div className="relative overflow-hidden h-8">
              <div
                className="transition-all duration-500 ease-out"
                style={{
                  transform: mode === 'login' ? 'translateY(0)' : 'translateY(-10px)',
                  opacity: mode === 'login' ? 1 : 0,
                }}
              >
                <CardTitle className="text-xl">{content.title}</CardTitle>
              </div>
              <div
                className="absolute top-0 left-0 right-0 transition-all duration-500 ease-out"
                style={{
                  transform: mode === 'register' ? 'translateY(0)' : 'translateY(10px)',
                  opacity: mode === 'register' ? 1 : 0,
                }}
              >
                <CardTitle className="text-xl">{content.title}</CardTitle>
              </div>
            </div>

            {/* Animated description */}
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

          <form
            id="auth-form-panel"
            role="tabpanel"
            aria-labelledby={mode === "login" ? "auth-tab-login" : "auth-tab-register"}
            onSubmit={handleSubmit}
            noValidate
          >
            <CardContent className="space-y-5 pb-5">
              {/* Top-level form error */}
              {error && (
                <div role="alert" aria-live="polite" className="flex items-start gap-2 p-3 rounded-2xl bg-trading-down/10 border border-trading-down/20 text-trading-down text-sm">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              {/* Username — always visible */}
              <div>
                <label htmlFor="auth-username" className="font-mono text-[10px] text-muted uppercase mb-2 block font-semibold">
                  Username <span className="text-trading-down" aria-hidden="true">*</span>
                </label>
                <div className="relative min-h-[56px]">
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
                    aria-describedby={fieldErrors.username ? "auth-username-error" : undefined}
                    placeholder="Username"
                    className={fieldErrors.username ? "border-trading-down focus-visible:border-trading-down focus-visible:ring-trading-down/20" : ""}
                  />
                </div>
                <FieldError id="auth-username-error" message={fieldErrors.username} />
              </div>

              {/* Register-only fields: First Name, Last Name, Email */}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label htmlFor="auth-firstName" className="font-mono text-[10px] text-muted uppercase mb-2 block font-semibold">
                        First Name <span className="text-trading-down" aria-hidden="true">*</span>
                      </label>
                      <div className="relative min-h-[56px]">
                        <Input
                          id="auth-firstName"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          autoComplete="given-name"
                          required={mode === "register"}
                          aria-required={mode === "register"}
                          aria-invalid={!!fieldErrors.firstName}
                          aria-describedby={fieldErrors.firstName ? "auth-firstName-error" : undefined}
                          placeholder="First name"
                          className={fieldErrors.firstName ? "border-trading-down focus-visible:border-trading-down focus-visible:ring-trading-down/20" : ""}
                        />
                      </div>
                      <FieldError id="auth-firstName-error" message={fieldErrors.firstName} />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label htmlFor="auth-lastName" className="font-mono text-[10px] text-muted uppercase mb-2 block font-semibold">
                        Last Name <span className="text-trading-down" aria-hidden="true">*</span>
                      </label>
                      <div className="relative min-h-[56px]">
                        <Input
                          id="auth-lastName"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          autoComplete="family-name"
                          required={mode === "register"}
                          aria-required={mode === "register"}
                          aria-invalid={!!fieldErrors.lastName}
                          aria-describedby={fieldErrors.lastName ? "auth-lastName-error" : undefined}
                          placeholder="Last name"
                          className={fieldErrors.lastName ? "border-trading-down focus-visible:border-trading-down focus-visible:ring-trading-down/20" : ""}
                        />
                      </div>
                      <FieldError id="auth-lastName-error" message={fieldErrors.lastName} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="auth-email" className="font-mono text-[10px] text-muted uppercase mb-2 block font-semibold">
                      Email Address <span className="text-trading-down" aria-hidden="true">*</span>
                    </label>
                    <div className="relative min-h-[56px]">
                      <Input
                        id="auth-email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="email"
                        required={mode === "register"}
                        aria-required={mode === "register"}
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? "auth-email-error" : undefined}
                        placeholder="Email address"
                        className={fieldErrors.email ? "border-trading-down focus-visible:border-trading-down focus-visible:ring-trading-down/20" : ""}
                      />
                    </div>
                    <FieldError id="auth-email-error" message={fieldErrors.email} />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="auth-password" className="font-mono text-[10px] text-muted uppercase mb-2 block font-semibold">
                  Password <span className="text-trading-down" aria-hidden="true">*</span>
                </label>
                <div className="relative min-h-[56px]">
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    required
                    aria-required="true"
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? "auth-password-error" : "auth-password-strength"}
                    placeholder="Password"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                    className={fieldErrors.password ? "border-trading-down focus-visible:border-trading-down focus-visible:ring-trading-down/20" : ""}
                  />
                </div>
                {/* Password strength meter — only in register mode */}
                <PasswordStrengthMeter
                  password={form.password}
                  show={mode === "register"}
                />
                <FieldError id="auth-password-error" message={fieldErrors.password} />
                {mode === "login" && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => { setForgotError(""); setForgotSuccess(""); setShowForgotModal(true); }}
                      className="text-xs font-mono text-primary hover:underline focus:outline-none"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-6">
              <Button
                type="submit"
                className="w-full font-mono font-bold"
                loading={loading}
                disabled={loading}
                aria-disabled={loading}
              >
                {content.button}
              </Button>
              <div className="relative flex items-center w-full my-2">
                <div className="flex-grow border-t border-fog" />
                <span className="flex-shrink mx-3 text-ash text-[10px] uppercase font-mono tracking-wider">or continue with</span>
                <div className="flex-grow border-t border-fog" />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={googleLogin}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-white border border-fog text-carbon text-xs font-medium hover:bg-mist transition-colors shadow-subtle-2 cursor-pointer"
                >
                  <img src={gmailIcon} alt="Google" className="w-4 h-4 object-contain" />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => toast.info("GitHub Login integration enabled.")}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-white border border-fog text-carbon text-xs font-medium hover:bg-mist transition-colors shadow-subtle-2 cursor-pointer"
                >
                  <img src={githubIcon} alt="GitHub" className="w-4 h-4 object-contain" />
                  <span>GitHub</span>
                </button>

                <button
                  type="button"
                  onClick={() => toast.info("X / Twitter Login integration enabled.")}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-full bg-white border border-fog text-carbon text-xs font-medium hover:bg-mist transition-colors shadow-subtle-2 cursor-pointer"
                >
                  <img src={xIcon} alt="X" className="w-4 h-4 object-contain" />
                  <span>X</span>
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>
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