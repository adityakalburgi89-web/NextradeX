import React from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { Coins, Zap, Shield, ExternalLink, ArrowRight, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export default function BitcoinGuidePage() {
  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              What is Bitcoin (BTC)?
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              Explore the story, fixed supply economics, network security, and instant payment technology behind Bitcoin.
            </p>
          </div>

          {/* Core Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Coins size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">Fixed Supply & Digital Gold</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Bitcoin has a strict maximum limit of 21 million coins. New coin creation automatically slows down over time.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Shield size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">Global Network Security</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Independent computers around the world continuously verify transactions to ensure maximum security and uptime.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Zap size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">Fast Payment Layer</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Modern network upgrades allow instant, low-cost microtransactions across global borders.
              </p>
            </div>
          </div>

          {/* External Market Tracking Banner */}
          <div className="p-10 sm:p-12 rounded-[36px] bg-card border border-border space-y-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-primary font-bold text-base">
                <Activity size={20} /> Real-Time CoinGecko Market Data
              </div>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed max-w-2xl">
                Track live global market prices, trading volume, and historical price charts for Bitcoin.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <Link to="/markets" className="px-6 py-3.5 rounded-2xl bg-primary text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xs">
                View Markets <ArrowRight size={15} className="text-white" />
              </Link>
              <a
                href="https://www.coingecko.com/en/coins/bitcoin"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-2xl border border-border bg-card text-foreground text-xs sm:text-sm font-bold hover:border-primary/50 hover:text-primary transition-colors flex items-center gap-2 shadow-xs"
              >
                CoinGecko Chart <ExternalLink size={15} />
              </a>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
