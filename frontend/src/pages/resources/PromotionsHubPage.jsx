import React from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { Gift, Award, Users, Share2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PromotionsHubPage() {
  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              Rewards & Events
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              Earn fee discounts, achievement badges, referral rewards, and community perks as you trade.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            
            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Gift size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">1. Trading Rewards & Badges</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Complete practice trading milestones to unlock special profile badges and community rewards.
              </p>
              <Link to="/referral" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-3">
                View Rewards Program <ArrowRight size={15} />
              </Link>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Share2 size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">2. Referral Program</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Invite friends to join NexTradeX with your custom link and earn commission rewards on their trading activity.
              </p>
              <Link to="/referral" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-3">
                Get Referral Link <ArrowRight size={15} />
              </Link>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Award size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">3. Trading Competitions</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Participate in zero-risk practice trading challenges and compete on global leaderboards.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Users size={26} />
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground pt-2">4. Community & Partners</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Connect with our trader community, join live educational sessions, and explore partnership opportunities.
              </p>
              <Link to="/support" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-3">
                Contact Partnership Team <ArrowRight size={15} />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </PageTransition>
  );
}
