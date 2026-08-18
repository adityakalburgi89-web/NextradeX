import React from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function StakingInfoPage() {
  const POOLS = [
    { asset: "Ethereum (ETH)", apy: "Variable", lockPeriod: "Flexible", icon: "ETH" },
    { asset: "Solana (SOL)", apy: "Variable", lockPeriod: "7 Days", icon: "SOL" },
    { asset: "Cardano (ADA)", apy: "Variable", lockPeriod: "Flexible", icon: "ADA" },
    { asset: "Polkadot (DOT)", apy: "Variable", lockPeriod: "14 Days", icon: "DOT" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              Institutional & Retail Staking
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              Earn staking yields by participating in Proof of Stake (PoS) network validation with secure node infrastructure.
            </p>
          </div>

          {/* Staking Pools Table / Grid */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold font-heading text-foreground">Supported Staking Pools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {POOLS.map((pool, idx) => (
                <div key={idx} className="p-8 rounded-[32px] border border-border bg-card space-y-5 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {pool.icon}
                    </div>
                    <h3 className="font-bold text-lg font-heading text-foreground pt-1">{pool.asset}</h3>
                    <div className="flex items-baseline gap-1.5 text-emerald-500">
                      <span className="text-2xl font-extrabold font-heading">{pool.apy}</span>
                      <span className="text-xs font-semibold">EST. YIELD</span>
                    </div>
                    <p className="text-xs text-foreground/60">Unlocking: {pool.lockPeriod}</p>
                  </div>
                  <Link to="/earn" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-3">
                    View Earn Dashboard <ArrowRight size={15} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Security Banner */}
          <div className="p-10 sm:p-12 rounded-[36px] bg-card border border-border space-y-5 shadow-xs">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-emerald-500" size={28} />
              <h3 className="text-2xl font-bold font-heading text-foreground">Slashing Protection & Validator Safety</h3>
            </div>
            <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed max-w-4xl">
              Our validator node architecture operates with multi-region failover configurations and uptime monitoring to ensure staked balances remain safe.
            </p>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
