import React from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { Lock, Key, Server, Bug, CheckCircle2 } from "lucide-react";

export default function SecurityCenterPage() {
  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              NexTradeX Security Center
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              We protect user accounts and simulated trading balances with strong encryption, automated shields, and continuous monitoring.
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            
            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Lock size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">1. Secure Account Protection</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Advanced encryption standards protect all login sessions and user password information.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Server size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">2. Automated Traffic Shield</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Smart limits automatically block suspicious bot activity and safeguard system connections from overload.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Key size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">3. Real-Time Data Security</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Encrypted data streams safely deliver price updates and account notifications directly to your screen.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Bug size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">4. Privacy & Safeguards</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Internal system details and private error data are safely isolated and never exposed to public view.
              </p>
            </div>

          </div>

          {/* Bug Bounty Banner */}
          <div className="p-10 rounded-[36px] bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20 space-y-5 shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={28} />
              <h3 className="text-2xl font-bold font-heading text-foreground">Responsible Security Reporting</h3>
            </div>
            <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed max-w-3xl">
              Found a potential vulnerability? We welcome reports from security researchers. Please contact <a href="mailto:security@nextradex.io" className="text-primary underline font-bold">security@nextradex.io</a>.
            </p>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
