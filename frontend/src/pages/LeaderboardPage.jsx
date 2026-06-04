import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { PageTransition } from "../components/ui/PageTransition";
import { Award, TrendingUp, ShieldCheck } from "lucide-react";
import { formatCurrency, formatPercent } from "../lib/utils";

const mockLeaderboard = [
  { rank: 1, name: "AlphaQuant", roi: 1.485, pnl: 48590.20, badge: "Master Quant", tone: "up" },
  { rank: 2, name: "BullRunRider", roi: 0.984, pnl: 32049.50, badge: "Leverage King", tone: "up" },
  { rank: 3, name: "VolatilityViper", roi: 0.742, pnl: 24890.10, badge: "Arbitrage God", tone: "up" },
  { rank: 4, name: "Aditya (You)", roi: 0.084, pnl: 8420.00, badge: "Pro Simulated Trader", tone: "up" },
  { rank: 5, name: "ScalpPro", roi: 0.052, pnl: 5204.40, badge: "Micro Scalper", tone: "up" },
  { rank: 6, name: "HedgeWizard", roi: 0.038, pnl: 3840.10, badge: "Risk Neutralizer", tone: "up" },
  { rank: 7, name: "OptionNinja", roi: -0.012, pnl: -1204.00, badge: "Theta Decay Enthusiast", tone: "down" },
];

export default function LeaderboardPage() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="border-b border-hairline-on-dark pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Trading Leaderboard</h1>
          <p className="text-sm text-muted">Test your performance against simulated top global traders inside the NexTradeX virtual terminal.</p>
        </div>

        {/* Global Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="bg-surface-card-dark border border-hairline-on-dark p-5 flex flex-col justify-between">
            <div className="text-muted mb-2 font-mono text-[10px] uppercase">Your competitive Rank</div>
            <div>
              <span className="text-3xl font-bold text-primary font-mono block">#4</span>
              <span className="text-xs text-muted font-mono">Top 5% of active paper accounts</span>
            </div>
          </Card>

          <Card className="bg-surface-card-dark border border-hairline-on-dark p-5 flex flex-col justify-between">
            <div className="text-muted mb-2 font-mono text-[10px] uppercase">Simulated competitors</div>
            <div>
              <span className="text-3xl font-bold text-white font-mono block">12,842</span>
              <span className="text-xs text-trading-up font-semibold font-mono">312 active sessions</span>
            </div>
          </Card>

          <Card className="bg-surface-card-dark border border-hairline-on-dark p-5 flex flex-col justify-between">
            <div className="text-muted mb-2 font-mono text-[10px] uppercase">Platform Competition status</div>
            <div>
              <span className="text-3xl font-bold text-trading-up font-mono block flex items-center gap-1.5">
                <ShieldCheck size={28} className="text-trading-up" />
                ACTIVE
              </span>
              <span className="text-xs text-muted font-mono">End of round Settlement: 24h</span>
            </div>
          </Card>
        </div>

        {/* Leaderboard Rankings card */}
        <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md overflow-hidden">
          <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-4 px-5">
            <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Top Competitor ROI Leaderboard</CardTitle>
            <CardDescription className="text-xs text-muted">Ranks calculated dynamically based on total paper return allocations.</CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-hairline-on-dark text-[10px] font-bold text-muted uppercase tracking-wider font-mono bg-canvas-dark/10">
                    <th className="py-4 px-5 text-center w-16">Rank</th>
                    <th className="py-4 px-5">Trader Nickname</th>
                    <th className="py-4 px-5">Reward Badge</th>
                    <th className="py-4 px-5 text-right">Cumulative ROI %</th>
                    <th className="py-4 px-5 text-right">Realized PnL (USDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-on-dark font-mono text-xs">
                  {mockLeaderboard.map((player) => {
                    const isUser = player.name.includes("You");
                    return (
                      <tr
                        key={player.rank}
                        className={`transition-colors ${isUser ? "bg-primary/[0.04] hover:bg-primary/[0.08]" : "hover:bg-canvas-dark/25"}`}
                      >
                        <td className="py-4 px-5 text-center font-bold">
                          {player.rank === 1 ? (
                            <span className="inline-flex w-6 h-6 rounded-full bg-primary/20 text-primary items-center justify-center font-extrabold text-xs">1</span>
                          ) : player.rank === 2 ? (
                            <span className="inline-flex w-6 h-6 rounded-full bg-slate-300/20 text-slate-300 items-center justify-center font-extrabold text-xs">2</span>
                          ) : player.rank === 3 ? (
                            <span className="inline-flex w-6 h-6 rounded-full bg-amber-600/20 text-amber-600 items-center justify-center font-extrabold text-xs">3</span>
                          ) : (
                            player.rank
                          )}
                        </td>
                        <td className={`py-4 px-5 font-semibold ${isUser ? "text-primary font-bold" : "text-white"}`}>
                          {player.name}
                        </td>
                        <td className="py-4 px-5 text-muted flex items-center gap-1.5">
                          <Award size={14} className="text-primary" />
                          {player.badge}
                        </td>
                        <td className={`py-4 px-5 text-right font-bold text-sm ${player.tone === "up" ? "text-trading-up" : "text-trading-down"}`}>
                          {player.roi > 0 ? "+" : ""}{formatPercent(player.roi)}
                        </td>
                        <td className={`py-4 px-5 text-right font-bold font-mono ${player.tone === "up" ? "text-trading-up" : "text-trading-down"}`}>
                          {player.pnl > 0 ? "+" : ""}{formatCurrency(player.pnl)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
