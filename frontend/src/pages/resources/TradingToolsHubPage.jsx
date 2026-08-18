import React from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { Bot, RefreshCw, Users, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function TradingToolsHubPage() {
  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              Smart Trading Tools
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              Automate recurring investments, convert assets instantly, follow top traders, and discover popular market trends.
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            
            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 hover:border-primary/50 transition-all shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Bot size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">Automated Investment Bot</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Set up recurring automatic purchases (Daily, Weekly, Monthly) to build your long-term crypto portfolio steadily.
              </p>
              <Link to="/orders" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-3">
                Manage Investment Schedules <ArrowRight size={15} />
              </Link>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 hover:border-primary/50 transition-all shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <RefreshCw size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">Instant Asset Convert</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Convert between BTC, ETH, USDT, SOL, and XRP with instant balance updates and zero extra conversion fees.
              </p>
              <Link to="/trade/spot" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-3">
                Open Spot Trade <ArrowRight size={15} />
              </Link>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 hover:border-primary/50 transition-all shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Users size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">Copy Trading & Leaderboards</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Follow top performing traders, view win rates, and mirror successful strategies automatically.
              </p>
              <Link to="/analytics" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-3">
                View Leaderboard Analytics <ArrowRight size={15} />
              </Link>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 hover:border-primary/50 transition-all shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Sparkles size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">NexTradeX Market Radar</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Discover trending market assets, new token listings, and real-time market sentiment updates.
              </p>
              <Link to="/markets" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-3">
                Explore Market Radar <ArrowRight size={15} />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </PageTransition>
  );
}
