import React, { useState, useEffect, useRef } from "react";
import { PageTransition } from "../components/ui/PageTransition";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Users, UserPlus, Key, ShieldCheck } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export default function SubAccountsPage() {
  const [subAccounts, setSubAccounts] = useState([
    { id: 1, email: "bot_trading_01@nextrade.sim", name: "Algotrade Scalper", balance: 25000, state: "ACTIVE", apiKeys: 2 },
    { id: 2, email: "trixie_backtest@nextrade.sim", name: "Backtest Sandbox", balance: 5000, state: "ACTIVE", apiKeys: 1 }
  ]);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newBalance, setNewBalance] = useState("");
  const [message, setMessage] = useState("");

  const timeoutsRef = useRef([]);
  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    const newAcc = {
      id: Date.now(),
      email: newEmail,
      name: newName,
      balance: Number(newBalance || 0),
      state: "ACTIVE",
      apiKeys: 0
    };

    setSubAccounts([...subAccounts, newAcc]);
    setMessage(`Sub-account "${newName}" created and delegated $${Number(newBalance || 0).toLocaleString()} successfully!`);
    setNewEmail("");
    setNewName("");
    setNewBalance("");
    timeoutsRef.current.push(setTimeout(() => setMessage(""), 4000));
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 text-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading">Sub-Accounts Corporate Manager</h1>
          <p className="text-sm text-muted">Provision virtual trading sub-accounts, delegate mock capital, oversee API access tokens, and enforce risk caps.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Sub Accounts Table */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden shadow-elevation-md">
              <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-4 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold uppercase tracking-wider font-heading">Active Sub-Accounts</CardTitle>
                  <CardDescription className="text-xs text-muted">Manage allocations and monitor state metrics for simulated agents.</CardDescription>
                </div>
                <span className="text-[10px] font-mono font-semibold text-muted bg-canvas-dark px-2.5 py-1 rounded border border-hairline-on-dark">
                  PROVISIONED AGENTS: {subAccounts.length}
                </span>
              </CardHeader>
              <CardContent className="p-0">
                {subAccounts.length === 0 ? (
                  <div className="py-12 text-center text-muted font-mono text-xs">
                    No sub-accounts provisioned yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-hairline-on-dark text-[10px] font-bold text-muted uppercase tracking-wider font-mono bg-canvas-dark/10">
                          <th className="py-4 px-6">Sub-Account Details</th>
                          <th className="py-4 px-6 text-right">Delegated Balance</th>
                          <th className="py-4 px-6 text-center">API Keys</th>
                          <th className="py-4 px-6 text-center">Status</th>
                          <th className="py-4 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-hairline-on-dark font-mono text-xs">
                        {subAccounts.map((acc) => (
                          <tr key={acc.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-white">{acc.name}</div>
                              <div className="text-[10px] text-muted">{acc.email}</div>
                            </td>
                            <td className="py-4 px-6 text-right font-bold text-primary">
                              ${acc.balance.toLocaleString()}
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="bg-canvas-dark px-2 py-0.5 rounded border border-hairline-on-dark text-[10px]">
                                {acc.apiKeys} Active
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className="bg-trading-up/10 text-trading-up px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                                {acc.state}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center flex items-center justify-center gap-2">
                              <Button variant="outline" size="sm" className="text-[10px] h-7 px-2 border-hairline-on-dark">
                                <Key size={10} className="mr-1" /> API
                              </Button>
                              <Button variant="outline" size="sm" className="text-[10px] h-7 px-2 border-hairline-on-dark text-trading-down hover:bg-trading-down hover:text-white">
                                Freeze
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Provision New Sub-Account Panel */}
          <div className="lg:col-span-4">
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md overflow-hidden">
              <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-4 px-6">
                <CardTitle className="text-base font-bold uppercase tracking-wider font-heading">Provision Agent</CardTitle>
                <CardDescription className="text-xs text-muted">Delegate virtual funds and security boundaries to a new trading agent.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-muted uppercase font-mono mb-1.5">Agent User Tag (Email)</label>
                    <Input
                      type="email"
                      placeholder="e.g. agent_name@nextrade.sim"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                      className="bg-canvas-dark border-hairline-on-dark text-white rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted uppercase font-mono mb-1.5">Agent Label Name</label>
                    <Input
                      placeholder="e.g. Bot Scalper v4"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                      className="bg-canvas-dark border-hairline-on-dark text-white rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-muted uppercase font-mono mb-1.5">Initial Capital Delegation (USDT)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 50000"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="bg-canvas-dark border-hairline-on-dark text-white font-mono rounded-lg text-xs"
                    />
                  </div>

                  {message && (
                    <div className="p-2.5 rounded-lg bg-trading-up/10 border border-trading-up/20 text-center animate-slide-down">
                      <span className="text-xs text-trading-up font-semibold text-center">{message}</span>
                    </div>
                  )}

                  <Button 
                    type="submit"
                    className="w-full font-mono text-xs uppercase py-3 font-bold"
                  >
                    Provision Agent
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
