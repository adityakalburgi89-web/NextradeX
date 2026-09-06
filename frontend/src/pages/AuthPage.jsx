import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { loginUser, registerUser, googleLogin, githubLogin, xLogin, exchangeOAuthCode, completeProfile, forgotPassword, resetPassword } from "../api";
import { useToast } from "../hooks/useToast";
import authTrainHills from "../assets/images/auth-train-hills.jpg";
import Logo from "../assets/images/Logo.png";

const initialForm = { username: "", email: "", password: "", firstName: "", lastName: "" };
const profileSetupForm = { username: "", firstName: "", lastName: "" };

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
    label: "Weak",
    colorText: "text-red-500",
    bars: [
      { color: "bg-red-500", active: true },
      { color: "bg-slate-200", active: false },
      { color: "bg-slate-200", active: false },
    ],
  },
  medium: {
    label: "Medium",
    colorText: "text-amber-500",
    bars: [
      { color: "bg-amber-500", active: true },
      { color: "bg-amber-500", active: true },
      { color: "bg-slate-200", active: false },
    ],
  },
  strong: {
    label: "Strong",
    colorText: "text-emerald-500",
    bars: [
      { color: "bg-emerald-500", active: true },
      { color: "bg-emerald-500", active: true },
      { color: "bg-emerald-500", active: true },
    ],
  },
};

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-red-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
      <AlertCircle size={12} className="shrink-0" />
      <span>{message}</span>
    </p>
  );
}

function PasswordStrengthMeter({ password, show }) {
  if (!show || !password) return null;
  const strength = getPasswordStrength(password);
  const meta = STRENGTH_METER[strength];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-500">Password strength:</span>
        <span className={`font-medium ${meta.colorText}`}>{meta.label}</span>
      </div>
      <div className="flex items-center gap-1.5 h-1">
        {meta.bars.map((bar, i) => (
          <div
            key={i}
            className={`h-full flex-1 rounded-full transition-colors duration-300 ${
              bar.active ? bar.color : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [mode, setMode] = useState(() => {
    if (location.pathname === "/register") return "register";
    const params = new URLSearchParams(window.location.search);
    return params.get("mode") === "register" ? "register" : "login";
  });

  const [form, setForm] = useState(initialForm);
  const [setupForm, setSetupForm] = useState(profileSetupForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [, setTouched] = useState({});

  useEffect(() => {
    if (location.pathname === "/register") {
      setMode("register");
    } else if (location.pathname === "/login") {
      setMode("login");
    } else {
      const params = new URLSearchParams(location.search);
      const modeParam = params.get("mode");
      if (modeParam === "register") setMode("register");
      if (modeParam === "login") setMode("login");
    }
  }, [location.pathname, location.search]);

  // Forgot Password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");

  // Reset Password states
  const [urlResetToken, setUrlResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const setup = params.get("setup");
    const errorParam = params.get("error");
    const resetTokenParam = params.get("resetToken");

    if (resetTokenParam) {
      setUrlResetToken(resetTokenParam);
    }

    if (code) {
      window.history.replaceState({}, document.title, "/auth");
      exchangeOAuthCode(code)
        .then((response) => {
          if (setup === "true" || response?.data?.needsProfileSetup) {
            setNeedsSetup(true);
          } else {
            window.location.href = "/";
          }
        })
        .catch(() => setError("Authentication failed. Please try again."));
    }

    if (errorParam) {
      setError(
        errorParam === "email_exists"
          ? "This email already has an account. Sign in normally before linking Google."
          : "Authentication failed. Please try again."
      );
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
      setForgotSuccess(`If an account exists for ${forgotEmail}, a password reset link has been sent.`);
      toast?.success("Password reset email sent! Check your inbox.");
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
      toast?.success("Password reset successfully! You can now log in.");
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldValidators = {
      username: (val) => validateUsername(val),
      email: (val) => validateEmail(val),
      password: (val) => (mode === "register" ? validatePasswordRegister(val) : validatePasswordLogin(val)),
      firstName: (val) => (mode === "register" && !val?.trim() ? "First name is required" : null),
      lastName: (val) => (mode === "register" && !val?.trim() ? "Last name is required" : null),
    };
    const validator = fieldValidators[name];
    const err = validator ? validator(value) : null;
    setFieldErrors((prev) => ({
      ...prev,
      ...(err ? { [name]: err } : {}),
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (mode === "login") {
      const uVal = form.username?.trim();
      if (!uVal) {
        errors.username = "Email or username is required";
      }
      const pErr = validatePasswordLogin(form.password);
      if (pErr) errors.password = pErr;
    } else {
      const uErr = validateUsername(form.username);
      if (uErr) errors.username = uErr;
      const eErr = validateEmail(form.email);
      if (eErr) errors.email = eErr;
      const pErr = validatePasswordRegister(form.password);
      if (pErr) errors.password = pErr;
      if (!form.firstName?.trim()) errors.firstName = "First name is required";
      if (!form.lastName?.trim()) errors.lastName = "Last name is required";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

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
      setForm(initialForm);
      setFieldErrors({});
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    const errors = {};
    const uErr = validateUsername(setupForm.username);
    if (uErr) errors.username = uErr;
    if (!setupForm.firstName?.trim()) errors.firstName = "First name is required";
    if (!setupForm.lastName?.trim()) errors.lastName = "Last name is required";

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

  // 1. PASSWORD RESET VIEW
  if (urlResetToken) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row text-slate-900">
        {/* LEFT PANEL: Train on Hills Image */}
        <div className="relative w-full lg:w-1/2 h-44 sm:h-56 lg:h-auto lg:min-h-screen overflow-hidden select-none bg-slate-50 flex items-center justify-center">
          <img
            src={authTrainHills}
            alt="Dreamy train on flower hills"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* RIGHT PANEL: Reset Password Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between pt-10 sm:pt-14 lg:pt-16 pb-6 sm:pb-8 px-6 sm:px-10 lg:px-12 min-h-[calc(100vh-176px)] lg:min-h-screen overflow-y-auto bg-white font-openrunde">
          <div className="w-full max-w-md mx-auto mb-6 flex items-center">
            <Link to="/" className="inline-block group">
              <img src={Logo} alt="NexTradeX" className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
          </div>

          <div className="max-w-md w-full mx-auto my-auto py-2 font-openrunde">
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight mb-1.5">Set New Password</h1>
            <p className="text-slate-500 text-sm mb-6">Enter a strong new password for your account.</p>

            {resetSuccess ? (
              <div className="space-y-4 text-center py-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm">
                  Password Updated Successfully!
                </div>
                <p className="text-slate-500 text-sm">Your password has been reset. You can now sign in with your new password.</p>
                <button
                  type="button"
                  onClick={() => { setUrlResetToken(""); navigate("/auth"); }}
                  className="w-full h-11 rounded-xl font-semibold text-sm text-zinc-950 bg-[#f59e0b] hover:bg-[#e69107] transition-all shadow-md mt-2"
                >
                  Proceed to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                {error && (
                  <div role="alert" className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 chars)"
                      required
                      className="w-full h-11 bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={newPassword} show={true} />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  style={{ height: "46px", minHeight: "46px" }}
                  className="w-full h-[46px] min-h-[46px] rounded-xl font-semibold text-sm text-zinc-950 bg-[#f59e0b] hover:bg-[#e69107] transition-all shadow-md shadow-amber-500/10 mt-2 flex items-center justify-center gap-2"
                >
                  {resetLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. PROFILE SETUP VIEW
  if (needsSetup) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row text-slate-900">
        <div className="relative w-full lg:w-1/2 h-44 sm:h-56 lg:h-auto lg:min-h-screen overflow-hidden select-none bg-slate-50 flex items-center justify-center">
          <img
            src={authTrainHills}
            alt="Dreamy train on flower hills"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-between pt-10 sm:pt-14 lg:pt-16 pb-6 sm:pb-8 px-6 sm:px-10 lg:px-12 min-h-[calc(100vh-176px)] lg:min-h-screen overflow-y-auto bg-white">
          <div className="w-full max-w-md mx-auto mb-6 flex items-center">
            <Link to="/" className="inline-block group">
              <img src={Logo} alt="NexTradeX" className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
          </div>

          <div className="max-w-md w-full mx-auto my-auto py-2">
            <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight mb-1.5">Complete Your Profile</h1>
            <p className="text-slate-500 text-sm mb-6">Choose a unique username and name to complete registration.</p>

            <form onSubmit={handleSetupSubmit} className="space-y-4">
              {error && (
                <div role="alert" className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Username</label>
                <input
                  type="text"
                  name="username"
                  value={setupForm.username}
                  onChange={handleSetupChange}
                  placeholder="Choose a username"
                  required
                  className="w-full h-11 bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <FieldError id="setup-username-error" message={fieldErrors.username} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={setupForm.firstName}
                    onChange={handleSetupChange}
                    placeholder="First name"
                    required
                    className="w-full h-11 bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                  <FieldError id="setup-firstName-error" message={fieldErrors.firstName} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={setupForm.lastName}
                    onChange={handleSetupChange}
                    placeholder="Last name"
                    required
                    className="w-full h-11 bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                  <FieldError id="setup-lastName-error" message={fieldErrors.lastName} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ height: "46px", minHeight: "46px" }}
                className="w-full h-[46px] min-h-[46px] rounded-xl font-semibold text-sm text-zinc-950 bg-[#f59e0b] hover:bg-[#e69107] transition-all shadow-md shadow-amber-500/10 mt-2"
              >
                {loading ? "Saving..." : "Complete Setup"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN SPLIT LOGIN & SIGN UP PAGE
  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row text-slate-900">
      
      {/* LEFT PANEL: Dreamy Train On Flower Hills Artwork */}
      <div className="relative w-full lg:w-1/2 h-44 sm:h-56 lg:h-auto lg:min-h-screen overflow-hidden select-none bg-slate-50 flex items-center justify-center">
        <img
          src={authTrainHills}
          alt="Train on flower hills"
          className="w-full h-full object-cover object-center scale-100 transition-transform duration-700 hover:scale-105"
        />
        {/* Soft edge blend gradient on right edge on desktop */}
        <div className="hidden lg:block absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* RIGHT PANEL: Crisp White Auth Panel with Balanced Padding & Margins */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between pt-10 sm:pt-14 lg:pt-16 pb-6 sm:pb-8 px-6 sm:px-10 lg:px-12 min-h-[calc(100vh-176px)] lg:min-h-screen overflow-y-auto bg-white font-openrunde">
        
        {/* Center Container: Main Form Card */}
        <div className="max-w-md w-full mx-auto my-auto py-2 font-openrunde">
          
          {/* Logo Header Block */}
          <div className="mb-6 text-center flex justify-center">
            <Link to="/" className="inline-block group">
              <img src={Logo} alt="NexTradeX Logo" className="h-14 sm:h-16 md:h-[68px] w-auto object-contain transition-transform group-hover:scale-105 mx-auto" />
            </Link>
          </div>

          {/* Segmented Tab Switch [ Sign in | Create account ] */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80 mb-5">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => {
                setMode("login");
                setFieldErrors({});
                setError("");
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => {
                setMode("register");
                setFieldErrors({});
                setError("");
              }}
              className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                mode === "register"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Create account
            </button>
          </div>

          {/* Form Error Banner */}
          {error && (
            <div role="alert" className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm mb-4">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5 sm:space-y-4">
            
            {/* Registration-only: First & Last Name */}
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Senku"
                    required
                    className={`w-full h-11 bg-slate-50/80 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all ${
                      fieldErrors.firstName ? "border-red-400 bg-red-50/30" : "border-slate-200"
                    }`}
                  />
                  <FieldError id="auth-firstName-error" message={fieldErrors.firstName} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="The Code"
                    required
                    className={`w-full h-11 bg-slate-50/80 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all ${
                      fieldErrors.lastName ? "border-red-400 bg-red-50/30" : "border-slate-200"
                    }`}
                  />
                  <FieldError id="auth-lastName-error" message={fieldErrors.lastName} />
                </div>
              </div>
            )}

            {/* Registration-only: Username */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="senku the legend"
                  required
                  className={`w-full h-11 bg-slate-50/80 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all ${
                    fieldErrors.username ? "border-red-400 bg-red-50/30" : "border-slate-200"
                  }`}
                />
                <FieldError id="auth-reg-username-error" message={fieldErrors.username} />
              </div>
            )}

            {/* Email Field */}
            {mode === "login" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@company.com"
                  autoComplete="username"
                  required
                  className={`w-full h-11 bg-slate-50/80 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all ${
                    fieldErrors.username ? "border-red-400 bg-red-50/30" : "border-slate-200"
                  }`}
                />
                <FieldError id="auth-login-username-error" message={fieldErrors.username} />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                  className={`w-full h-11 bg-slate-50/80 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all ${
                    fieldErrors.email ? "border-red-400 bg-red-50/30" : "border-slate-200"
                  }`}
                />
                <FieldError id="auth-reg-email-error" message={fieldErrors.email} />
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  required
                  className={`w-full h-11 bg-slate-50/80 border rounded-xl px-3.5 py-2.5 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all ${
                    fieldErrors.password ? "border-red-400 bg-red-50/30" : "border-slate-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrengthMeter password={form.password} show={mode === "register"} />
              <FieldError id="auth-password-error" message={fieldErrors.password} />

              {/* Forgot Password Link in Amber */}
              {mode === "login" && (
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotError("");
                      setForgotSuccess("");
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-semibold text-amber-600 hover:text-amber-500 transition-colors focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {/* Primary Action Button (Warm amber) */}
            <button
              type="submit"
              disabled={loading}
              style={{ height: "46px", minHeight: "46px" }}
              className="w-full h-[46px] min-h-[46px] mt-4 rounded-xl font-semibold text-sm sm:text-base text-zinc-950 bg-[#f59e0b] hover:bg-[#e69107] active:scale-[0.99] transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    width="18"
                    height="18"
                    style={{ width: "18px", height: "18px" }}
                    className="animate-spin text-zinc-950"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : mode === "login" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Divider "or" */}
          <div className="relative flex items-center my-4 sm:my-5">
            <div className="flex-grow border-t border-slate-200" />
            <span className="px-3 text-xs text-slate-400 font-medium">or</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-2.5">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={googleLogin}
              style={{ height: "44px", minHeight: "44px" }}
              className="w-full h-[44px] min-h-[44px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <svg
                width="18"
                height="18"
                className="shrink-0"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* GitHub OAuth Button */}
            <button
              type="button"
              onClick={githubLogin}
              style={{ height: "44px", minHeight: "44px" }}
              className="w-full h-[44px] min-h-[44px] rounded-xl border border-slate-200 bg-[#181717] hover:bg-[#2b2a2a] text-white text-sm font-medium flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <svg
                width="18"
                height="18"
                className="shrink-0 fill-current text-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Continue with GitHub</span>
            </button>

            {/* X (Twitter) OAuth Button */}
            <button
              type="button"
              onClick={xLogin}
              style={{ height: "44px", minHeight: "44px" }}
              className="w-full h-[44px] min-h-[44px] rounded-xl border border-slate-200 bg-black hover:bg-slate-900 text-white text-sm font-medium flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <svg
                width="16"
                height="16"
                className="shrink-0 fill-current text-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>Continue with X</span>
            </button>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal Dialog (Clean White Theme) */}
      <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
        <DialogContent className="max-w-md bg-white border border-slate-200 text-slate-900 rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
              Forgot Password
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotSubmit} className="space-y-4 pt-2">
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Enter your registered email address below and we will send you a secure link to reset your password.
            </p>

            {forgotError && (
              <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                {forgotSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs sm:text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={forgotLoading}
                className="px-5 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#e69107] text-zinc-950 text-xs sm:text-sm font-semibold transition-all shadow-md disabled:opacity-60"
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
