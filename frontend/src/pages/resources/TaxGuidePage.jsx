import React from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { Calculator, Download, FileText, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function TaxGuidePage() {
  return (
    <PageTransition>
      <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-10 lg:px-16 bg-background text-foreground">
        <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
          
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8 mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15] text-foreground">
              Crypto Tax & Reporting Basics
            </h1>
            <p className="text-foreground/80 text-base sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
              Understand how trading activity, cost basis calculation, and transaction downloads work.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <FileText size={26} />
              </div>
              <h3 className="font-bold text-xl font-heading text-foreground pt-2">1. Capital Gains & Losses</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Exchanging cryptocurrency for traditional currency or trading between digital assets creates a reportable tax event.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Calculator size={26} />
              </div>
              <h3 className="font-bold text-xl font-heading text-foreground pt-2">2. Cost Basis Tracking</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Cost basis is the original purchase price of an asset plus transaction fees, used to determine profit or loss.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[32px] border border-border bg-card space-y-5 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Download size={26} />
              </div>
              <h3 className="font-bold text-xl font-heading text-foreground pt-2">3. One-Click History Export</h3>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                Download your full trading activity report directly from your account page anytime.
              </p>
              <Link to="/orders" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-primary hover:underline pt-3">
                Go to Orders History <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <div className="p-10 sm:p-12 rounded-[36px] bg-card border border-border space-y-8 shadow-xs">
            <div className="flex items-center gap-3">
              <HelpCircle className="text-primary" size={28} />
              <h3 className="text-2xl font-bold font-heading text-foreground">Frequently Asked Questions</h3>
            </div>
            <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-foreground/75 divide-y divide-border/60">
              <div className="pt-2">
                <h4 className="font-bold text-foreground text-base mb-2">Is practice paper trading taxable?</h4>
                <p className="text-foreground/75 leading-relaxed">No. Practice paper trading uses virtual test balances and creates zero real-world tax liabilities.</p>
              </div>
              <div className="pt-6">
                <h4 className="font-bold text-foreground text-base mb-2">Can I download my transaction history?</h4>
                <p className="text-foreground/75 leading-relaxed">Yes, you can export your activity history as a standard document file whenever you need it.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
