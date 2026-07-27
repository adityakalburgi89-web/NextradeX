import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import logoIcon from "../assets/images/Logo.png";

export default function Footer() {
  const linkClass = "block text-sm font-['Geist'] text-[#535862] hover:text-[#0a0d12] transition-colors py-1";

  return (
    <footer className="w-full bg-[#ebf5ff] pt-20 pb-16">
      <div className="max-w-[1200px] mx-auto px-6 space-y-20">

        {/* Wide Centered CTA Block */}
        <div className="card-genie text-center py-16 px-8 max-w-[1100px] mx-auto space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#cce7ff] text-[#0069e0] text-xs font-['Geist'] font-medium">
            Start creating today
          </span>
          <h2 className="font-['Inter'] text-4xl md:text-5xl font-medium text-[#0a0d12] tracking-tight max-w-2xl mx-auto">
            Ready to experience daylight-studio trading?
          </h2>
          <p className="font-['Geist'] text-base text-[#535862] max-w-xl mx-auto">
            Join thousands of traders building strategies with confident typography, zero visual noise, and real-time execution.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth" className="btn-primary-genie text-base px-8 py-3.5">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/markets" className="ghost-nav-link text-base">
              Explore Markets
            </Link>
          </div>
        </div>

        {/* 4-Column Link Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pt-8 border-t border-black/5">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoIcon} alt="Logo" className="h-7 w-auto" />
              <span className="font-['Inter'] font-medium text-lg text-[#0a0d12]">GenieStudio</span>
            </div>
            <p className="font-['Geist'] text-sm text-[#93979f] leading-relaxed">
              Soft daylight notebook UI for modern finance and algorithmic paper trading.
            </p>
          </div>

          <div>
            <h4 className="font-['Geist'] text-sm font-semibold text-[#0a0d12] mb-4">Product</h4>
            <nav className="space-y-1">
              <Link to="/markets" className={linkClass}>Markets</Link>
              <Link to="/trade/spot" className={linkClass}>Spot Trading</Link>
              <Link to="/trade/futures" className={linkClass}>Futures Trading</Link>
              <Link to="/trade/options" className={linkClass}>Options</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-['Geist'] text-sm font-semibold text-[#0a0d12] mb-4">Resources</h4>
            <nav className="space-y-1">
              <Link to="/user-guide" className={linkClass}>User Guide</Link>
              <Link to="/api-docs" className={linkClass}>API Docs</Link>
              <Link to="/trixie-explains" className={linkClass}>Trixie Explains</Link>
              <Link to="/support" className={linkClass}>Support Center</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-['Geist'] text-sm font-semibold text-[#0a0d12] mb-4">Company</h4>
            <nav className="space-y-1">
              <Link to="/about" className={linkClass}>About Us</Link>
              <Link to="/careers" className={linkClass}>Careers</Link>
              <Link to="/terms" className={linkClass}>Terms of Service</Link>
              <Link to="/privacy" className={linkClass}>Privacy Policy</Link>
            </nav>
          </div>

          <div>
            <h4 className="font-['Geist'] text-sm font-semibold text-[#0a0d12] mb-4">Socials</h4>
            <nav className="space-y-1">
              <a href="https://x.com/AdityaKalb4818" target="_blank" rel="noreferrer" className={linkClass}>X (Twitter)</a>
              <a href="https://www.linkedin.com/in/aditya-kalburgi-080b5b267/" target="_blank" rel="noreferrer" className={linkClass}>LinkedIn</a>
              <a href="https://github.com/aditykalburgi" target="_blank" rel="noreferrer" className={linkClass}>GitHub</a>
            </nav>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs font-['Geist'] text-[#93979f]">
          <p>© {new Date().getFullYear()} GenieStudio / NexTradeX. Engineered with restraint.</p>
          <p>Theme: Soft Daylight Notebook (#ebf5ff)</p>
        </div>
      </div>
    </footer>
  );
}
