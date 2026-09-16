import React, { useState } from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { Bell, ArrowRight, Tag, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const POSTS = [
  {
    id: 1,
    title: "NexTradeX Introduces Real-Time Order Notifications",
    category: "Platform Updates",
    summary: "Our high-speed message system guarantees sub-millisecond execution notifications for spot, margin, and futures orders.",
  },
  {
    id: 2,
    title: "Understanding Crypto Volatility & Risk Management",
    category: "Trading Guide",
    summary: "Learn how to calculate stop-loss boundaries, position sizing, and leverage control to trade practice crypto markets safely.",
  },
  {
    id: 3,
    title: "WebSocket & Security Shield Released",
    category: "Developer Platform",
    summary: "We have upgraded our system security with custom token checks and automated traffic limiters.",
  },
];

export default function BlogNewsPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Hero Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              NexTradeX Insights
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              Stay up to date with product releases, developer updates, and cryptocurrency market analysis.
            </p>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {POSTS.map((post) => (
              <div key={post.id} className="p-8 sm:p-10 rounded-[32px] border border-border bg-card hover:border-primary/50 transition-all space-y-6 flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="flex items-center text-xs text-foreground/60">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                      <Tag size={12} /> {post.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl font-heading leading-snug text-foreground pt-1">{post.title}</h3>
                  <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">{post.summary}</p>
                </div>
                <Link to="/learn/crypto-basics" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-4">
                  Read Article <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>

          {/* Newsletter Subscription */}
          <div className="p-10 sm:p-14 rounded-[36px] bg-card border border-border space-y-8 text-center max-w-3xl mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Bell size={26} />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">Subscribe to NexTradeX Newsletter</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed max-w-xl mx-auto">
                Get weekly market roundups, trading tutorials, and platform feature releases sent straight to your inbox.
              </p>
            </div>
            {subscribed ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 text-emerald-500 text-sm font-bold border border-emerald-500/20 flex items-center justify-center gap-2.5">
                <CheckCircle2 size={18} /> You are now subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto pt-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-5 py-3.5 text-xs sm:text-sm rounded-2xl bg-background border border-border text-foreground focus:border-primary focus:outline-none shadow-xs"
                />
                <button type="submit" className="px-7 py-3.5 text-xs sm:text-sm font-bold rounded-2xl bg-primary text-white hover:opacity-90 transition-opacity shadow-xs">
                  Subscribe
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
