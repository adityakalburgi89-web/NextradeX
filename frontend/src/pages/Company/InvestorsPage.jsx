import React from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { BarChart3, ShieldCheck, Users } from "lucide-react";

export default function InvestorsPage() {
  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              Investor Overview
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              NexTradeX is building simple, accessible practice trading infrastructure for retail traders and developers worldwide.
            </p>
          </div>

          {/* Growth Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <BarChart3 size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">1. Fast Execution Engine</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Reliable backend processing ensures trades, order cancellations, and price updates execute instantly.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Users size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">2. Risk-Free Practice Trading</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Practice trading with virtual test funds lets users learn crypto markets without financial risk.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">3. Account Security</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Industry-standard encryption, token isolation, and privacy safeguards protect user data.
              </p>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
