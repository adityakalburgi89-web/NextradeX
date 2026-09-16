import React, { useState } from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { Layers, ShieldCheck, CheckCircle2, Send, FileCode } from "lucide-react";

export default function AssetListingsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    projectName: "",
    tokenSymbol: "",
    contractAddress: "",
    contactEmail: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              List Your Token on NexTradeX
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              Submit your cryptocurrency project for listing on our spot trading orderbook and practice markets.
            </p>
          </div>

          {/* Criteria Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">1. Security Verification</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Smart contract code must be reviewed by a recognized security auditor with zero high-risk security flaws.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <FileCode size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">2. Token Information</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Clear circulating supply details, project documentation, and verified token contract addresses.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Layers size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">3. Active Project</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Demonstrated user community interest, clear project whitepaper, and ongoing developer updates.
              </p>
            </div>
          </div>

          {/* Listing Form */}
          <div className="p-10 sm:p-12 rounded-[36px] border border-border bg-card space-y-8 shadow-xs max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold font-heading text-center text-foreground">Submit Listing Application</h3>
            
            {submitted ? (
              <div className="p-8 rounded-3xl bg-emerald-500/10 text-emerald-500 text-sm font-bold border border-emerald-500/20 text-center space-y-3">
                <CheckCircle2 size={32} className="mx-auto" />
                <p className="text-base font-bold">Application Received Successfully!</p>
                <p className="text-xs sm:text-sm text-foreground/75 font-normal">Our team will review your submission details within 3-5 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-foreground">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NexTradeX Token"
                    value={form.projectName}
                    onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                    className="w-full px-5 py-3.5 text-xs sm:text-sm rounded-2xl bg-background border border-border text-foreground focus:border-primary focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-foreground">Token Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NTX"
                    value={form.tokenSymbol}
                    onChange={(e) => setForm({ ...form, tokenSymbol: e.target.value })}
                    className="w-full px-5 py-3.5 text-xs sm:text-sm rounded-2xl bg-background border border-border text-foreground focus:border-primary focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-foreground">Contract Address</label>
                  <input
                    type="text"
                    required
                    placeholder="0x..."
                    value={form.contractAddress}
                    onChange={(e) => setForm({ ...form, contractAddress: e.target.value })}
                    className="w-full px-5 py-3.5 text-xs sm:text-sm rounded-2xl bg-background border border-border text-foreground focus:border-primary focus:outline-none font-mono shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold mb-2 text-foreground">Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="team@yourproject.io"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="w-full px-5 py-3.5 text-xs sm:text-sm rounded-2xl bg-background border border-border text-foreground focus:border-primary focus:outline-none shadow-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-primary text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2.5 shadow-xs pt-3"
                >
                  <Send size={16} className="text-white" /> Submit Token Application
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
