import React from "react";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";
import xIcon from "../assets/Icons/x.com_icon.png";
import linkedInIcon from "../assets/Icons/LinkedIn_icon.svg.png";
import githubIcon from "../assets/Icons/github_icon.png";
import gmailIcon from "../assets/Icons/Gmail_icon_svg.webp";

export default function Footer() {
  const linkClass = "text-xs font-semibold text-[#707a8a] hover:text-[#f0b90b] transition-colors duration-200 block py-1.5";
  return (
    <footer className="relative z-10 bg-[#fafafa] border-t border-[#eaecef] py-16 text-[#181a20]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center mb-4">
              <span className="font-heading font-bold text-lg tracking-tight text-[#181a20]">
                NexTrade<span className="text-[#fcd535]">X</span>
              </span>
            </div>
            <p className="text-xs text-[#707a8a] leading-relaxed max-w-[200px]">
              NexTradeX is a paper trading simulation platform for educational purposes. No real assets are traded.
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-[#181a20] mb-4">About</h4>
            <nav className="space-y-1">
              <Link to="/about" className={linkClass}>About Us</Link>
              <Link to="/careers" className={linkClass}>Careers</Link>
              <Link to="/" className={linkClass}>Press</Link>
              <Link to="/" className={linkClass}>Community</Link>
            </nav>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-[#181a20] mb-4">Products</h4>
            <nav className="space-y-1">
              <Link to="/trade/spot" className={linkClass}>Spot Trading</Link>
              <Link to="/trade/futures" className={linkClass}>Futures Trading</Link>
              <Link to="/trade/options" className={linkClass}>Options Trading</Link>
              <Link to="/markets" className={linkClass}>Markets Board</Link>
            </nav>
          </div>

          {/* Service */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-[#181a20] mb-4">Service</h4>
            <nav className="space-y-1">
              <Link to="/support" className={linkClass}>Support Center</Link>
              <Link to="/user-guide" className={linkClass}>User Guide</Link>
              <Link to="/api-docs" className={linkClass}>API Docs</Link>
              <Link to="/bug-bounty" className={linkClass}>Bug Bounty</Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-[#181a20] mb-4">Legal</h4>
            <nav className="space-y-1">
              <Link to="/terms" className={linkClass}>Terms of Service</Link>
              <Link to="/privacy" className={linkClass}>Privacy Policy</Link>
              <Link to="/settlement-prices" className={linkClass}>Settlement Prices</Link>
              <Link to="/trading-fees" className={linkClass}>Trading Fees</Link>
            </nav>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-[#181a20] mb-4">Socials</h4>
            <nav className="space-y-3">
              <a href="https://x.com/AdityaKalb4818" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-semibold text-[#707a8a] hover:text-[#f0b90b] transition-colors duration-200">
                <img src={xIcon} alt="X" className="w-4 h-4 object-contain" /> <span>X (Twitter)</span>
              </a>
              <a href="https://www.linkedin.com/in/aditya-kalburgi-080b5b267/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-semibold text-[#707a8a] hover:text-[#f0b90b] transition-colors duration-200">
                <img src={linkedInIcon} alt="LinkedIn" className="w-4 h-4 object-contain" /> <span>LinkedIn</span>
              </a>
              <a href="mailto:contact@nextradex.sim" className="flex items-center gap-3 text-xs font-semibold text-[#707a8a] hover:text-[#f0b90b] transition-colors duration-200">
                <img src={gmailIcon} alt="Email" className="w-4 h-4 object-contain" /> <span>Email</span>
              </a>
              <a href="https://github.com/aditykalburgi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-semibold text-[#707a8a] hover:text-[#f0b90b] transition-colors duration-200">
                <img src={githubIcon} alt="GitHub" className="w-4 h-4 object-contain brightness-0 contrast-50" /> <span>GitHub</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="glow-line mt-12 mb-8" />
        <p className="text-center text-xs text-muted">
          NexTradeX &copy; {new Date().getFullYear()}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
