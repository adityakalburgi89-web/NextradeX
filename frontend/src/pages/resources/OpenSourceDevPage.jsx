import React, { useState } from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { Terminal, Cpu, GitBranch, ExternalLink, Check, Copy } from "lucide-react";
import { Link } from "react-router-dom";

export default function OpenSourceDevPage() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const snippets = [
    {
      title: "JavaScript / Node.js Integration",
      lang: "javascript",
      code: `import { NexTradeXClient } from '@nextradex/sdk';

const client = new NexTradeXClient({
  apiKey: process.env.NEXTRADEX_API_KEY,
  baseUrl: 'http://localhost:8080/api'
});

// Fetch live spot market price
const ticker = await client.getSpotTicker('BTCUSDT');
console.log('BTC Price:', ticker.price);`,
    },
    {
      title: "Python Integration",
      lang: "python",
      code: `from nextradex import NexTradeXClient

client = NexTradeXClient(api_key="your_api_key")

# Stream realtime prices
@client.on_price_update("BTCUSDT")
def handle_price(data):
    print(f"BTC Realtime Price: {data['price']}")

client.start_stream()`,
    },
  ];

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              Build on NexTradeX
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              Explore developer guides, open-source tools, live data feeds, and simple code examples for trading algorithms.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Terminal size={26} />
              </div>
              <h3 className="font-bold text-xl font-heading text-foreground pt-2">Trading APIs</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Connect your custom trading software to live market tickers, order execution, and account alerts.
              </p>
              <Link to="/api-docs" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-3">
                Open API Documentation <ExternalLink size={15} />
              </Link>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Cpu size={26} />
              </div>
              <h3 className="font-bold text-xl font-heading text-foreground pt-2">Modern Technology</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Built with reliable backend systems and real-time messaging for high-speed trading performance.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <GitBranch size={26} />
              </div>
              <h3 className="font-bold text-xl font-heading text-foreground pt-2">Open Source Tools</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Access free code samples, setup scripts, and developer tools to build custom trading features.
              </p>
            </div>
          </div>

          {/* Code Snippets Section */}
          <div className="space-y-8 pt-6">
            <h2 className="text-3xl font-bold font-heading text-foreground">Code Examples</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
              {snippets.map((snip, idx) => (
                <div key={idx} className="rounded-[32px] border border-border bg-card overflow-hidden shadow-xs">
                  <div className="p-5 px-8 border-b border-border bg-card flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{snip.title}</span>
                    <button
                      onClick={() => handleCopy(snip.code, idx)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-background border border-border text-foreground hover:border-primary transition-colors shadow-xs"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={14} className="text-emerald-500" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy Code
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-8 text-xs sm:text-sm font-mono text-foreground/90 overflow-x-auto bg-slate-950 text-slate-100 rounded-b-[32px] leading-relaxed">
                    <code>{snip.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
