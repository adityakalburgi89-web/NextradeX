import React, { useState } from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { Save, CheckCircle2 } from "lucide-react";

export default function CookiePolicyPage() {
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: true,
    functional: true,
    marketing: false,
  });

  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    if (key === "essential") return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-5xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              Cookie Policy & Preferences
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              We use cookies to keep your login session secure, remember your preferences, and improve website speed.
            </p>
          </div>

          {/* Preferences Form */}
          <div className="p-8 sm:p-12 rounded-[36px] border border-border bg-card space-y-10 shadow-xs">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-heading text-foreground">Manage Consent Preferences</h2>
              <p className="text-xs sm:text-sm text-foreground/70">Choose which optional cookies you allow us to use.</p>
            </div>

            <div className="space-y-8 divide-y divide-border/60">
              
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-1.5 max-w-xl">
                  <div className="font-bold text-base text-foreground flex items-center gap-2.5">
                    Essential Cookies <span className="text-[10px] px-3 py-1 rounded-full bg-primary/10 text-primary font-bold uppercase border border-primary/20">Required</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                    Necessary for core website security, account login sessions, and live price updates.
                  </p>
                </div>
                <input type="checkbox" checked disabled className="w-5 h-5 accent-primary cursor-not-allowed opacity-70" />
              </div>

              <div className="flex items-center justify-between pt-8">
                <div className="space-y-1.5 max-w-xl">
                  <div className="font-bold text-base text-foreground">Analytics Cookies</div>
                  <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                    Help us analyze anonymous site traffic to improve page load speed and navigation.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => handleToggle("analytics")}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-8">
                <div className="space-y-1.5 max-w-xl">
                  <div className="font-bold text-base text-foreground">Preference Cookies</div>
                  <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                    Remember your display choices such as Dark or Light theme mode.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={() => handleToggle("functional")}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-8">
                <div className="space-y-1.5 max-w-xl">
                  <div className="font-bold text-base text-foreground">Referral Cookies</div>
                  <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                    Used to accurately credit referral rewards when users sign up via partner links.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => handleToggle("marketing")}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>

            </div>

            <div className="pt-6 flex items-center justify-between">
              <button
                onClick={handleSave}
                className="px-7 py-3.5 rounded-2xl bg-primary text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-xs"
              >
                <Save size={16} className="text-white" /> Save Preferences
              </button>
              {saved && (
                <span className="text-xs sm:text-sm font-semibold text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Preferences Saved!
                </span>
              )}
            </div>

          </div>

        </div>
      </div>
    </PageTransition>
  );
}
