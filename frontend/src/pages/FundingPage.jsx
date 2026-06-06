import React, { useState, useEffect, useRef } from "react";
import { PageTransition } from "../components/ui/PageTransition";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { FileText, ArrowRightLeft, Download, Upload } from "lucide-react";
import { formatCurrency } from "../lib/utils";

export default function FundingPage() {
  const [transfers, setTransfers] = useState([
    { id: 1, type: "DEPOSIT", symbol: "USDT", amount: 100000, date: "2026-06-02 12:44", status: "COMPLETED", txHash: "0x8fa3...b8e9" },
    { id: 2, type: "TRANSFER", symbol: "BTC", amount: 0.05, date: "2026-06-01 10:15", status: "COMPLETED", txHash: "Spot to Margin" },
    { id: 3, type: "WITHDRAW", symbol: "ETH", amount: 1.25, date: "2026-05-30 08:30", status: "COMPLETED", txHash: "0x3e1d...9c2a" }
  ]);
  const [transferForm, setTransferForm] = useState({
    from: "Spot",
    to: "Futures",
    symbol: "USDT",
    amount: ""
  });
  const [message, setMessage] = useState("");

  const timeoutsRef = useRef([]);
  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!transferForm.amount || Number(transferForm.amount) <= 0) return;

    const newTransfer = {
      id: Date.now(),
      type: "TRANSFER",
      symbol: transferForm.symbol,
      amount: Number(transferForm.amount),
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "COMPLETED",
      txHash: `${transferForm.from} to ${transferForm.to}`
    };

    setTransfers([newTransfer, ...transfers]);
    setMessage(`Transferred ${transferForm.amount} ${transferForm.symbol} from ${transferForm.from} to ${transferForm.to}!`);
    setTransferForm({ ...transferForm, amount: "" });
    timeoutsRef.current.push(setTimeout(() => setMessage(""), 4000));
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 text-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-heading">Funding Ledger</h1>
          <p className="text-sm text-muted">Manage deposit channels, initiate internal balance transfers, and audit simulated transaction records.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Transfer Form Panel */}
          <div className="lg:col-span-4">
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl shadow-elevation-md overflow-hidden">
              <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-4 px-6">
                <CardTitle className="text-base font-bold uppercase tracking-wider font-heading">Internal Transfer</CardTitle>
                <CardDescription className="text-xs text-muted">Instantly move mock assets between Spot, Margin, and Futures wallets.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-muted uppercase font-mono mb-1.5">From Account</label>
                      <select
                        value={transferForm.from}
                        onChange={(e) => setTransferForm({ ...transferForm, from: e.target.value })}
                        className="w-full bg-canvas-dark border border-hairline-on-dark rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                      >
                        <option value="Spot">Spot Wallet</option>
                        <option value="Margin">Margin Wallet</option>
                        <option value="Futures">Futures Wallet</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted uppercase font-mono mb-1.5">To Account</label>
                      <select
                        value={transferForm.to}
                        onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })}
                        className="w-full bg-canvas-dark border border-hairline-on-dark rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                      >
                        <option value="Futures">Futures Wallet</option>
                        <option value="Spot">Spot Wallet</option>
                        <option value="Margin">Margin Wallet</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-muted uppercase font-mono mb-1.5">Asset Token</label>
                      <select
                        value={transferForm.symbol}
                        onChange={(e) => setTransferForm({ ...transferForm, symbol: e.target.value })}
                        className="w-full bg-canvas-dark border border-hairline-on-dark rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-primary"
                      >
                        <option value="USDT">USDT - Tether</option>
                        <option value="BTC">BTC - Bitcoin</option>
                        <option value="ETH">ETH - Ethereum</option>
                        <option value="BNB">BNB - Binance Coin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-muted uppercase font-mono mb-1.5">Amount</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={transferForm.amount}
                        onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                        required
                        className="bg-canvas-dark border-hairline-on-dark text-white font-mono text-xs rounded-lg"
                      />
                    </div>
                  </div>

                  {message && (
                    <div className="p-2.5 rounded-lg bg-trading-up/10 border border-trading-up/20 text-center animate-slide-down">
                      <span className="text-xs text-trading-up font-semibold">{message}</span>
                    </div>
                  )}

                  <Button 
                    type="submit"
                    className="w-full font-mono text-xs uppercase py-3 font-bold"
                  >
                    Confirm Transfer
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Funding Ledger Audit Feed */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-surface-card-dark border border-hairline-on-dark rounded-xl overflow-hidden shadow-elevation-md">
              <CardHeader className="border-b border-hairline-on-dark bg-canvas-dark/20 py-4 px-6 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold uppercase tracking-wider font-heading">Ledger Auditing History</CardTitle>
                  <CardDescription className="text-xs text-muted">Complete records of deposits, internal balance transfers, and withdrawals.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="text-[10px] h-8 px-2 border-hairline-on-dark">
                    <Download size={12} className="mr-1" /> EXPORT CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-hairline-on-dark text-[10px] font-bold text-muted uppercase tracking-wider font-mono bg-canvas-dark/10">
                        <th className="py-4 px-6">Transaction ID</th>
                        <th className="py-4 px-6">Type</th>
                        <th className="py-4 px-6 text-right">Amount</th>
                        <th className="py-4 px-6 text-right">Reference / Hash</th>
                        <th className="py-4 px-6 text-right">Timestamp</th>
                        <th className="py-4 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-on-dark font-mono text-xs">
                      {transfers.map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-6 text-muted">TX-{tx.id}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              tx.type === "DEPOSIT" ? "bg-trading-up/10 text-trading-up" :
                              tx.type === "WITHDRAW" ? "bg-trading-down/10 text-trading-down" :
                              "bg-primary/10 text-primary"
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-semibold">
                            {tx.type === "DEPOSIT" ? "+" : tx.type === "WITHDRAW" ? "-" : ""}
                            {tx.amount.toLocaleString()} {tx.symbol}
                          </td>
                          <td className="py-4 px-6 text-right text-muted text-[10px]">{tx.txHash}</td>
                          <td className="py-4 px-6 text-right text-muted">{tx.date}</td>
                          <td className="py-4 px-6 text-center">
                            <span className="text-trading-up font-bold">● {tx.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
