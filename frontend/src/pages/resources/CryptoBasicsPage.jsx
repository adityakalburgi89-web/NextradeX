import React, { useState } from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { Search, ShieldCheck, Zap, Cpu, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const GLOSSARY_ITEMS = [
  { term: "Blockchain", category: "Core Technology", definition: "A secure digital record book that keeps track of transactions across a network of computers." },
  { term: "Bitcoin (BTC)", category: "Cryptocurrency", definition: "The first digital currency, created in 2009 for fast, borderless online payments." },
  { term: "Ethereum (ETH)", category: "Smart Contracts", definition: "A popular blockchain platform that supports automatic digital contracts and decentralized apps." },
  { term: "Smart Contract", category: "Core Technology", definition: "A digital agreement that automatically runs when specified conditions are met." },
  { term: "Proof of Work (PoW)", category: "Consensus", definition: "A system where computers solve mathematical puzzles to approve transactions and secure the network." },
  { term: "Proof of Stake (PoS)", category: "Consensus", definition: "An eco-friendly network system where users lock up coins to validate transactions." },
  { term: "DeFi (Decentralized Finance)", category: "Financial Technology", definition: "Digital financial services like trading, lending, and borrowing without traditional banks." },
  { term: "Order Book", category: "Trading", definition: "A live list showing current buy and sell prices requested by traders in the market." },
  { term: "Stop-Loss Order", category: "Risk Management", definition: "An automatic safety setting that sells an asset if its price drops to a level you choose." },
  { term: "Leverage", category: "Trading", definition: "Using virtual borrowed funds to open larger trading positions." },
  { term: "Hot Wallet", category: "Security", definition: "A digital wallet connected to the internet for quick daily trading access." },
  { term: "Cold Wallet", category: "Security", definition: "An offline hardware device used to safely store cryptocurrency away from internet threats." },
  { term: "Gas Fee", category: "Ethereum", definition: "The small fee required to complete transactions on the Ethereum network." },
  { term: "Liquidity", category: "Trading", definition: "How easily an asset can be bought or sold quickly without changing its market price." },
  { term: "Market Cap", category: "Analytics", definition: "The total market value of a cryptocurrency calculated by multiplying total coins by current price." },
];

export default function CryptoBasicsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Core Technology", "Cryptocurrency", "Smart Contracts", "Consensus", "Trading", "Security"];

  const filteredItems = GLOSSARY_ITEMS.filter((item) => {
    const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) || item.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Hero Banner */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              What is Cryptocurrency?
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              Learn the basics of digital currencies, blockchain technology, and simple trading concepts.
            </p>
          </div>

          {/* Quick Explainer Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card shadow-xs hover:border-primary/50 transition-all space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Cpu size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">1. How Blockchain Works</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">
                Blockchains record transactions in secure digital blocks verified by computers around the world.
              </p>
              <Link to="/trixie-explains" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-4">
                Watch Explainer Videos <ArrowRight size={15} />
              </Link>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card shadow-xs hover:border-primary/50 transition-all space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Zap size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">2. What is Bitcoin?</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">
                Bitcoin is a digital currency with a fixed limit of 21 million coins, built for fast global payments.
              </p>
              <Link to="/markets" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-4">
                Explore BTC Price Chart <ArrowRight size={15} />
              </Link>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card shadow-xs hover:border-primary/50 transition-all space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">3. Wallet & Key Safety</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">
                Your wallet address is like an account number for receiving funds, while your private key is your secret password.
              </p>
              <Link to="/security" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-4">
                Learn Security Best Practices <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Interactive Crypto Glossary */}
          <div className="space-y-10 sm:space-y-12 pt-12 sm:pt-16 border-t border-border">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold font-heading text-foreground">Crypto Terms Glossary</h2>
                <p className="text-sm text-foreground/75">Search essential terms explained in simple language.</p>
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-96">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/50 pointer-events-none z-10 flex items-center justify-center">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search terms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 sm:pl-14 pr-4 py-3.5 text-sm rounded-2xl bg-card border border-border text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none shadow-xs transition-colors"
                />
              </div>
            </div>

            {/* Category Filter Pills with text-white on active */}
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-w-[64px] px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all inline-flex items-center justify-center ${
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-sm"
                      : "bg-card border border-border text-foreground hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Glossary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
              {filteredItems.map((item, idx) => (
                <div key={idx} className="p-6 sm:p-7 rounded-3xl border border-border bg-card hover:border-primary/50 transition-all space-y-4 shadow-xs">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-bold text-base text-foreground">{item.term}</h4>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">{item.definition}</p>
                </div>
              ))}
            </div>
            {filteredItems.length === 0 && (
              <div className="text-center py-16 text-sm text-foreground/70">No terms match "{search}".</div>
            )}
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
