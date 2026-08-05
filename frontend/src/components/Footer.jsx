import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe as GlobeIcon, Shield, Zap, Check } from "lucide-react";
import logoIcon from "../assets/images/Logo.png";
import { Globe } from "./ui/globe";
import gmailIcon from "../assets/Icons/Gmail_icon_svg.webp";
import xIcon from "../assets/Icons/x.com_icon.png";
import linkedinIcon from "../assets/Icons/LinkedIn_icon.svg.png";
import githubIcon from "../assets/Icons/github_icon.png";

export default function Footer() {
  const linkHeaderClass = "font-openrunde text-xs font-bold uppercase tracking-wider text-carbon mb-3";
  const linkClass = "block text-[13px] font-openrunde text-[#555555] hover:text-carbon transition-colors py-1 tracking-[-0.2px]";

  return (
    <footer className="w-full bg-white text-carbon font-openrunde border-t border-[#e8e8e8] pt-14 pb-0 overflow-hidden relative">
      <div className="max-w-[1240px] mx-auto px-6 space-y-12 relative z-10">

        {/* 2. Top Header Brand Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b border-[#e8e8e8] gap-4">
          <div className="flex items-center gap-2.5">
            <img src={logoIcon} alt="NexTradeX Logo" className="h-7 w-auto" />
            <span className="font-openrunde font-bold text-lg text-carbon tracking-[-0.31px]">
              NexTrade<span className="text-[#8574ff]">X</span>
            </span>
          </div>
        </div>

        {/* 3. Comprehensive Categorized Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-8 text-left">
          
          {/* Column 1: Company */}
          <div>
            <h4 className={linkHeaderClass}>Company</h4>
            <nav className="space-y-0.5">
              <Link to="/about" className={linkClass}>About</Link>
              <Link to="/careers" className={linkClass}>Careers</Link>
              <Link to="/referral" className={linkClass}>Affiliates</Link>
              <Link to="/404" className={linkClass}>Blog</Link>
              <Link to="/404" className={linkClass}>Press</Link>
              <Link to="/404" className={linkClass}>Security</Link>
              <Link to="/404" className={linkClass}>Investors</Link>
              <Link to="/404" className={linkClass}>Vendors</Link>
              <Link to="/privacy" className={linkClass}>Legal & privacy</Link>
              <Link to="/privacy" className={linkClass}>Cookie policy</Link>
              <Link to="/404" className={linkClass}>Cookie preferences</Link>
              <Link to="/contract-specs" className={linkClass}>Digital Asset Disclosures</Link>
            </nav>
          </div>

          {/* Column 2: Learn */}
          <div>
            <h4 className={linkHeaderClass}>Learn</h4>
            <nav className="space-y-0.5">
              <Link to="/markets" className={linkClass}>Explore crypto</Link>
              <Link to="/markets" className={linkClass}>Explore stocks</Link>
              <Link to="/analytics" className={linkClass}>Market statistics</Link>
              <Link to="/404" className={linkClass}>NexTradeX Bytes newsletter</Link>
              <Link to="/user-guide" className={linkClass}>Crypto basics</Link>
              <Link to="/user-guide" className={linkClass}>Tips & tutorials</Link>
              <Link to="/trixie-explains" className={linkClass}>Crypto glossary</Link>
              <Link to="/markets" className={linkClass}>Market updates</Link>
              <Link to="/trixie-explains" className={linkClass}>What is Bitcoin?</Link>
              <Link to="/trixie-explains" className={linkClass}>What is crypto?</Link>
              <Link to="/trixie-explains" className={linkClass}>What is a blockchain?</Link>
              <Link to="/wallets" className={linkClass}>How to set up a wallet?</Link>
              <Link to="/wallets" className={linkClass}>How to send crypto?</Link>
              <Link to="/404" className={linkClass}>Taxes</Link>
            </nav>
          </div>

          {/* Column 3: Individuals & Businesses */}
          <div className="space-y-6">
            <div>
              <h4 className={linkHeaderClass}>Individuals</h4>
              <nav className="space-y-0.5">
                <Link to="/trade/spot" className={linkClass}>Buy & sell</Link>
                <Link to="/404" className={linkClass}>Base App</Link>
                <Link to="/auth" className={linkClass}>NexTradeX One</Link>
                <Link to="/404" className={linkClass}>Debit Card</Link>
              </nav>
            </div>

            <div>
              <h4 className={linkHeaderClass}>Businesses</h4>
              <nav className="space-y-0.5">
                <Link to="/markets" className={linkClass}>Asset Listings</Link>
                <Link to="/funding" className={linkClass}>Payments</Link>
                <Link to="/404" className={linkClass}>Token Manager</Link>
              </nav>
            </div>
          </div>

          {/* Column 4: Developers */}
          <div>
            <h4 className={linkHeaderClass}>Developers</h4>
            <nav className="space-y-0.5">
              <Link to="/api-docs" className={linkClass}>Developer Platform</Link>
              <Link to="/404" className={linkClass}>Base</Link>
              <Link to="/wallets" className={linkClass}>Server Wallets</Link>
              <Link to="/wallets" className={linkClass}>Embedded Wallets</Link>
              <Link to="/wallets" className={linkClass}>Smart Wallets</Link>
              <Link to="/funding" className={linkClass}>Onramp & Offramp</Link>
              <Link to="/404" className={linkClass}>x402</Link>
              <Link to="/api-docs" className={linkClass}>Trade API</Link>
              <Link to="/404" className={linkClass}>Paymaster</Link>
              <Link to="/404" className={linkClass}>OnchainKit</Link>
            </nav>
          </div>

          {/* Column 5: Institutions */}
          <div>
            <h4 className={linkHeaderClass}>Institutions</h4>
            <nav className="space-y-0.5">
              <Link to="/sub-accounts" className={linkClass}>Prime</Link>
              <Link to="/earn" className={linkClass}>Staking</Link>
              <Link to="/trade/spot" className={linkClass}>Exchange</Link>
              <Link to="/trade/futures" className={linkClass}>International Exchange</Link>
              <Link to="/trade/futures" className={linkClass}>Derivatives Exchange</Link>
              <Link to="/404" className={linkClass}>Verified Pools</Link>
            </nav>
          </div>

          {/* Column 6: Support */}
          <div>
            <h4 className={linkHeaderClass}>Support</h4>
            <nav className="space-y-0.5">
              <Link to="/support" className={linkClass}>Help center</Link>
              <Link to="/support" className={linkClass}>Contact us</Link>
              <Link to="/auth" className={linkClass}>Create account</Link>
              <Link to="/profile" className={linkClass}>ID verification</Link>
              <Link to="/profile" className={linkClass}>Account information</Link>
              <Link to="/funding" className={linkClass}>Payment methods</Link>
              <Link to="/profile" className={linkClass}>Account access</Link>
              <Link to="/markets" className={linkClass}>Supported crypto</Link>
              <Link to="/support" className={linkClass}>Status</Link>
            </nav>
          </div>

          {/* Column 7: Market Prices & Socials */}
          <div>
            <h4 className={linkHeaderClass}>Prices & Markets</h4>
            <nav className="space-y-0.5">
              <Link to="/markets" className={linkClass}>Asset prices</Link>
              <Link to="/markets" className={linkClass}>Bitcoin price</Link>
              <Link to="/markets" className={linkClass}>Ethereum price</Link>
              <Link to="/markets" className={linkClass}>Solana price</Link>
              <Link to="/markets" className={linkClass}>XRP price</Link>
              <Link to="/markets" className={linkClass}>Stock prices</Link>
            </nav>

            <div className="pt-6">
              <h4 className={linkHeaderClass}>Socials</h4>
              <div className="flex flex-wrap gap-2.5 pt-1">
                <a
                  href="mailto:adityakalburgi89@gmail.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#f4f4f6] hover:bg-[#e8e8ee] transition-all transform hover:scale-110 flex items-center justify-center p-2 border border-[#e2e2e8] shadow-xs"
                  title="Gmail"
                >
                  <img src={gmailIcon} alt="Gmail" className="w-full h-full object-contain" />
                </a>
                <a
                  href="https://x.com/AdityaKalb4818"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#f4f4f6] hover:bg-[#e8e8ee] transition-all transform hover:scale-110 flex items-center justify-center p-2 border border-[#e2e2e8] shadow-xs"
                  title="X (Twitter)"
                >
                  <img src={xIcon} alt="X" className="w-full h-full object-contain" />
                </a>
                <a
                  href="https://www.linkedin.com/in/aditya-kalburgi-080b5b267/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#f4f4f6] hover:bg-[#e8e8ee] transition-all transform hover:scale-110 flex items-center justify-center p-2 border border-[#e2e2e8] shadow-xs"
                  title="LinkedIn"
                >
                  <img src={linkedinIcon} alt="LinkedIn" className="w-full h-full object-contain" />
                </a>
                <a
                  href="https://github.com/aditykalburgi"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-full bg-[#f4f4f6] hover:bg-[#e8e8ee] transition-all transform hover:scale-110 flex items-center justify-center p-2 border border-[#e2e2e8] shadow-xs"
                  title="GitHub"
                >
                  <img src={githubIcon} alt="GitHub" className="w-full h-full object-contain" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* 4. Bottom Copyright & Terms Strip */}
        <div className="pt-8 border-t border-[#e8e8e8] flex flex-col sm:flex-row items-center justify-between text-xs text-[#777777] gap-3">
          <p>© 2026 NexTradeX Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-carbon transition-colors">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-carbon transition-colors">Terms & Conditions</Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-carbon transition-colors">Cookie Preferences</Link>
          </div>
        </div>

      </div>

      {/* 5. Bottom 3D Globe Canvas Emerging Smoothly from Horizon */}
      <div className="w-full relative flex justify-center items-end mt-10 overflow-hidden h-[260px] sm:h-[340px] pointer-events-auto">
        <div className="absolute top-4 w-[500px] h-[500px] sm:w-[650px] sm:h-[650px] flex items-center justify-center">
          <Globe className="w-full h-full" />
        </div>
      </div>
    </footer>
  );
}
