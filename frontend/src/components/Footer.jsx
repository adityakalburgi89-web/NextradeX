import React from "react";
import { Link } from "react-router-dom";
import { Globe } from "lucide-react";

import linkedInIcon from "../assets/Icons/LinkedIn_icon.svg.png";
import githubIcon from "../assets/Icons/github_icon.png";
import gmailIcon from "../assets/Icons/Gmail_icon_svg.webp";
import logoIcon from "../assets/images/Logo.png";

export default function Footer() {
  const linkClass = "block py-3 md:py-1.5 text-xs font-semibold text-muted transition-colors duration-200 hover:text-primary";
  return (
    <footer className="relative z-10 bg-background py-16 text-foreground">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 rounded-[32px] bg-background p-8 shadow-neo">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center mb-4">
              <span className="font-heading font-bold text-lg text-foreground">
                NexTrade<span className="text-primary">X</span>
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-[200px]">
              NexTradeX is a paper trading simulation platform for educational purposes. No real assets are traded.
            </p>
          </div>

          {/* About */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase text-foreground mb-4">About</h4>
            <nav className="space-y-1">
              <Link to="/about" className={linkClass}>About Us</Link>
              <Link to="/careers" className={linkClass}>Careers</Link>
              <Link to="/" className={linkClass}>Press</Link>
              <Link to="/" className={linkClass}>Community</Link>
            </nav>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase text-foreground mb-4">Products</h4>
            <nav className="space-y-1">
              <Link to="/trade/spot" className={linkClass}>Spot Trading</Link>
              <Link to="/trade/futures" className={linkClass}>Futures Trading</Link>
              <Link to="/trade/options" className={linkClass}>Options Trading</Link>
              <Link to="/markets" className={linkClass}>Markets Board</Link>
            </nav>
          </div>

          {/* Service */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase text-foreground mb-4">Service</h4>
            <nav className="space-y-1">
              <Link to="/support" className={linkClass}>Support Center</Link>
              <Link to="/user-guide" className={linkClass}>User Guide</Link>
              <Link to="/api-docs" className={linkClass}>API Docs</Link>
              <Link to="/bug-bounty" className={linkClass}>Bug Bounty</Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase text-foreground mb-4">Legal</h4>
            <nav className="space-y-1">
              <Link to="/terms" className={linkClass}>Terms of Service</Link>
              <Link to="/privacy" className={linkClass}>Privacy Policy</Link>
              <Link to="/settlement-prices" className={linkClass}>Settlement Prices</Link>
              <Link to="/trading-fees" className={linkClass}>Trading Fees</Link>
            </nav>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-heading text-xs font-bold uppercase text-foreground mb-4">Socials</h4>
            <nav className="space-y-3">
              <a href="https://x.com/AdityaKalb4818" target="_blank" rel="noopener noreferrer" aria-label="Follow NexTradeX on X (Twitter)" className="flex items-center gap-3 py-2 md:py-0 text-xs font-semibold text-muted hover:text-primary transition-colors duration-200">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X (Twitter)</span>
              </a>
              <a href="https://www.linkedin.com/in/aditya-kalburgi-080b5b267/" target="_blank" rel="noopener noreferrer" aria-label="Connect with NexTradeX on LinkedIn" className="flex items-center gap-3 py-2 md:py-0 text-xs font-semibold text-muted hover:text-primary transition-colors duration-200">
                <img src={linkedInIcon} alt="" className="w-4 h-4 object-contain" aria-hidden="true" /> <span>LinkedIn</span>
              </a>
              <a href="mailto:contact@nextradex.sim" aria-label="Email NexTradeX" className="flex items-center gap-3 py-2 md:py-0 text-xs font-semibold text-muted hover:text-primary transition-colors duration-200">
                <img src={gmailIcon} alt="" className="w-4 h-4 object-contain" aria-hidden="true" /> <span>Email</span>
              </a>
              <a href="https://github.com/aditykalburgi" target="_blank" rel="noopener noreferrer" aria-label="View NexTradeX on GitHub" className="flex items-center gap-3 py-2 md:py-0 text-xs font-semibold text-muted hover:text-primary transition-colors duration-200">
                <img src={githubIcon} alt="" className="w-4 h-4 object-contain brightness-0 contrast-50" aria-hidden="true" /> <span>GitHub</span>
              </a>
              <a href="https://portfolio-zeta-two-0s3z3wko1s.vercel.app/" target="_blank" rel="noopener noreferrer" aria-label="Visit Aditya's Portfolio Website" className="flex items-center gap-3 py-2 md:py-0 text-xs font-semibold text-muted hover:text-primary transition-colors duration-200">
                <div className="w-4 h-4 relative flex items-center justify-center" aria-hidden="true">
                  <img src={logoIcon} alt="" className="absolute w-10 h-10 max-w-none object-contain" />
                </div>
                <span>Portfolio</span>
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
