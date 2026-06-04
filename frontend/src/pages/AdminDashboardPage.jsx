import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageTransition } from "../components/ui/PageTransition";
import { ShieldCheck, Users, Activity, Settings, RefreshCw, BarChart2 } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export default function AdminDashboardPage() {
  const [volatility, setVolatility] = useState("0.02");
  const [fundingRate, setFundingRate] = useState("0.0001");
  const [matchingSpeed, setMatchingSpeed] = useState("Fast (10ms)");
  const [vaultReserves, setVaultReserves] = useState("1248592932");

  const [message, setMessage] = useState("");

  const handleApply = (e) => {
    e.preventDefault();
    setMessage("Simulated parameters updated in mock memory vaults successfully");
    setTimeout(() => setMessage(""), 3000);
  };

  const triggerEvent = (event) => {
    setMessage(`Artificial Market Event Triggered: ${event}`);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="border-b border-hairline-on-dark pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white font-heading">Admin control Center</h1>
          <p className="text-sm text-muted">Configure paper matching metrics, simulate artificial market jumps, and manage virtual backing reserves.</p>
        </div>

        {/* Global Admin Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="bg-surface-card-dark border border-hairline-on-dark p-5 flex flex-col justify-between">
            <div className="text-muted mb-2 font-mono text-[10px] uppercase">Matching Engine Status</div>
            <div>
              <span className="text-3xl font-bold text-trading-up font-mono block flex items-center gap-2">
                <ShieldCheck size={28} />
                ONLINE
              </span>
              <span className="text-xs text-muted font-mono">100% simulated capacity</span>
            </div>
          </Card>

          <Card className="bg-surface-card-dark border border-hairline-on-dark p-5 flex flex-col justify-between">
            <div className="text-muted mb-2 font-mono text-[10px] uppercase">Active User accounts</div>
            <div>
              <span className="text-3xl font-bold text-white font-mono block flex items-center gap-2">
                <Users size={28} className="text-primary" />
                12,842
              </span>
              <span className="text-xs text-trading-up font-semibold font-mono">98% health rating</span>
            </div>
          </Card>

          <Card className="bg-surface-card-dark border border-hairline-on-dark p-5 flex flex-col justify-between">
            <div className="text-muted mb-2 font-mono text-[10px] uppercase">Reserves Backing Cap</div>
            <div>
              <span className="text-3xl font-bold text-white font-mono block flex items-center gap-2">
                <BarChart2 size={28} className="text-primary" />
                {formatCurrency(Number(vaultReserves))}
              </span>
              <span className="text-xs text-muted font-mono">Fully locked in simulated storage</span>
            </div>
          </Card>
        </div>

        {/* Admin settings splits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Engine Parameters */}
          <div className="lg:col-span-8">
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden shadow-elevation-md">
              <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-4 px-5">
                <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Settings size={16} className="text-primary" />
                  Engine Parameter overrides
                </CardTitle>
                <CardDescription className="text-xs text-muted">Directly manipulate tick updates and lot boundaries for simulation environments.</CardDescription>
              </CardHeader>

              <form onSubmit={handleApply}>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">Mock Tick Volatility</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={volatility}
                        onChange={(e) => setVolatility(e.target.value)}
                        className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">Futures Funding Rate</label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={fundingRate}
                        onChange={(e) => setFundingRate(e.target.value)}
                        className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">Mock Storage Vault Reserves ($)</label>
                      <Input
                        type="number"
                        value={vaultReserves}
                        onChange={(e) => setVaultReserves(e.target.value)}
                        className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5 block">Order Matching Frequency</label>
                      <Input
                        value={matchingSpeed}
                        onChange={(e) => setMatchingSpeed(e.target.value)}
                        className="bg-canvas-dark border-hairline-on-dark font-mono text-sm text-white w-full rounded-md"
                      />
                    </div>
                  </div>

                  {message && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-trading-up/10 border border-trading-up/20 animate-slide-down">
                      <p className="text-trading-up text-xs font-mono">{message}</p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="border-t border-hairline-on-dark bg-canvas-dark/20 py-3 px-5 flex justify-end">
                  <Button type="submit" className="font-mono text-xs font-bold uppercase py-2.5 px-4 rounded-md">
                    Apply Parameters
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Event Triggers */}
          <div className="lg:col-span-4">
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden p-6 shadow-elevation-md h-full flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-primary" />
                  Manual simulation events
                </h3>
                <p className="text-xs text-muted mb-6 leading-relaxed">Artificially pump or dump current market indicators to stress test margin leverage liquidations.</p>
                
                <div className="space-y-3">
                  <Button
                    variant="tradingUp"
                    onClick={() => triggerEvent("Pump All Pairs +5%")}
                    className="w-full text-xs font-mono uppercase font-bold py-3 flex items-center justify-center gap-2"
                  >
                    Pump Market +5%
                  </Button>
                  <Button
                    variant="tradingDown"
                    onClick={() => triggerEvent("Dump All Pairs -5%")}
                    className="w-full text-xs font-mono uppercase font-bold py-3 flex items-center justify-center gap-2"
                  >
                    Dump Market -5%
                  </Button>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-hairline-on-dark flex justify-between items-center text-[10px] font-mono text-muted">
                <span>Platform environment</span>
                <span className="text-primary font-bold">DEVELOPMENT / SIMULATED</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
