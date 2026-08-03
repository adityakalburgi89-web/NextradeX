import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import logoIcon from "../assets/images/Logo.png";

export default function Footer() {
  const linkClass = "block text-sm font-openrunde text-graphite hover:text-carbon transition-colors py-1.5 tracking-[-0.32px]";

  return (
    <footer className="w-full bg-white border-t border-fog pt-16 pb-12">
      <div className="max-w-[1200px] mx-auto px-6 space-y-16">

        {/* Wide Centered CTA Block */}
        <div className="bg-linen border border-fog rounded-[24px] text-center py-12 px-6 max-w-[1000px] mx-auto space-y-4">
          <span className="announcement-chip">
            <span className="tag-new">NEW</span>
            <span className="text-carbon">Start paper trading today</span>
          </span>
          <h2 className="font-openrunde text-3xl md:text-4xl font-medium text-carbon tracking-[-0.61px] max-w-2xl mx-auto">
            Ready to experience engineered paper trading?
          </h2>
          <p className="font-openrunde text-base text-graphite max-w-xl mx-auto tracking-[-0.32px]">
            Join thousands of traders building strategies with confident execution, real-time telemetry, and zero financial risk.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth" className="btn-primary-lavender">
              <span>Get Started Free</span>
              <ArrowRight size={14} />
            </Link>
            <Link to="/markets" className="btn-ghost">
              Explore Markets
            </Link>
          </div>
        </div>

        {/* 4-Column Link Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pt-8 border-t border-fog">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <img src={logoIcon} alt="NexTradeX Logo" className="h-6 w-auto" />
              <span className="font-openrunde font-semibold text-base text-carbon tracking-[-0.31px]">
                NexTrade<span className="text-lavender">X</span>
              </span>
            </div>
            <p className="font-openrunde text-xs text-ash leading-relaxed tracking-[-0.32px]">
              High-performance paper trading platform for modern spot, futures, and derivatives simulation.
            </p>
          </div>

          <div>
            <h4 className="font-openrunde text-sm font-semibold text-carbon mb-3 tracking-[-0.32px]">Product</h4>
            <nav className="space-y-0.5">
              <Link to="/markets" className={linkClass}>Markets</Link>
              <Link to="/trade/spot" className={linkClass}>Spot Trading</Link>
              <Link to="/trade/futures" className={linkClass}>Futures Trading</Link>
              <Link to="/trade/options" className={linkClass}>Options</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-openrunde text-sm font-semibold text-carbon mb-3 tracking-[-0.32px]">Resources</h4>
            <nav className="space-y-0.5">
              <Link to="/user-guide" className={linkClass}>User Guide</Link>
              <Link to="/api-docs" className={linkClass}>API Docs</Link>
              <Link to="/trixie-explains" className={linkClass}>Trixie Explains</Link>
              <Link to="/support" className={linkClass}>Support Center</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-openrunde text-sm font-semibold text-carbon mb-3 tracking-[-0.32px]">Company</h4>
            <nav className="space-y-0.5">
              <Link to="/about" className={linkClass}>About Us</Link>
              <Link to="/careers" className={linkClass}>Careers</Link>
              <Link to="/terms" className={linkClass}>Terms of Service</Link>
              <Link to="/privacy" className={linkClass}>Privacy Policy</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-openrunde text-sm font-semibold text-carbon mb-3 tracking-[-0.32px]">Socials</h4>
            <nav className="space-y-0.5">
              <a href="https://x.com/AdityaKalb4818" target="_blank" rel="noreferrer" className={linkClass}>X (Twitter)</a>
              <a href="https://www.linkedin.com/in/aditya-kalburgi-080b5b267/" target="_blank" rel="noreferrer" className={linkClass}>LinkedIn</a>
              <a href="https://github.com/aditykalburgi" target="_blank" rel="noreferrer" className={linkClass}>GitHub</a>
            </nav>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs font-openrunde text-ash border-t border-fog">
          <p>© {new Date().getFullYear()} NexTradeX. All rights reserved.</p>
          <p>NexTradeX Blueprint Engine v1.0</p>
        </div>
      </div>
    </footer>
  );
}
