import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/images/Logo.png";
import { Search, ChevronDown, LogOut, Menu, X, ArrowRight } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";

export default function Navbar({ theme, isLoggedIn, user, setSearchOpen, triggerLogoutConfirm }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-4 left-0 right-0 z-[9999] w-full px-4 max-w-[1200px] mx-auto pointer-events-none flex justify-center">
      <div className="bg-[#141522] border border-white/10 rounded-full px-3.5 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.25)] flex items-center justify-between pointer-events-auto backdrop-blur-xl w-full max-w-fit gap-4 sm:gap-6">
        
        {/* Left: NexTradeX Brand Logo */}
        <Link to="/" className="flex items-center text-white no-underline group mr-1 sm:mr-2" title="NexTradeX Home">
          <img src={Logo} alt="NexTradeX Logo" className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform" />
        </Link>

        {/* Center: Trading Nav Items */}
        <nav className="hidden md:flex items-center gap-5 font-openrunde font-medium text-xs sm:text-sm tracking-[-0.2px]">
          
          {/* Features / Trading Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 py-1 px-2.5 rounded-full text-white/85 hover:text-white hover:bg-white/10 transition-colors focus:outline-none cursor-pointer">
              <span>Features</span>
              <ChevronDown size={13} className="text-white/60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="z-50 min-w-[190px] rounded-[18px] bg-[#141522] p-2 shadow-2xl border border-white/10 text-white">
              <DropdownMenuItem asChild>
                <Link to="/trixie-explains" className="block px-3 py-2 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-xl">
                  ✨ Audio & Telemetry AI
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/trade/spot" className="block px-3 py-2 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-xl">
                  📈 Spot Order Terminal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/trade/futures" className="block px-3 py-2 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-xl">
                  ⚡ High-Leverage Futures
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/markets"
            className={`py-1 px-2.5 rounded-full transition-colors ${isActive('/markets') ? 'text-white font-semibold bg-white/15' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
          >
            Markets
          </Link>

          <Link
            to="/trade/spot"
            className={`py-1 px-2.5 rounded-full transition-colors ${isActive('/trade/spot') ? 'text-white font-semibold bg-white/15' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
          >
            Spot
          </Link>

          <Link
            to="/trade/futures"
            className={`py-1 px-2.5 rounded-full transition-colors ${isActive('/trade/futures') ? 'text-white font-semibold bg-white/15' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
          >
            Futures
          </Link>

          <Link
            to="/support"
            className={`py-1 px-2.5 rounded-full transition-colors ${isActive('/support') ? 'text-white font-semibold bg-white/15' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
          >
            Docs
          </Link>
        </nav>

        {/* Right Actions: Search + Login / Register Pill */}
        <div className="flex items-center gap-3 sm:gap-4 pl-1 sm:pl-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Search"
          >
            <Search size={15} />
          </button>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white font-openrunde text-xs font-medium border border-white/10 hover:bg-white/20 transition-colors">
                  <div className="w-5 h-5 rounded-full bg-[#918df6] text-white flex items-center justify-center font-bold text-[10px]">
                    {user?.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span>{user?.username}</span>
                  <ChevronDown size={12} className="text-white/60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 min-w-[180px] rounded-[18px] bg-[#141522] p-2 shadow-2xl border border-white/10 text-white">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="block px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-xl font-medium">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="block px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-xl font-medium">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wallets" className="block px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-xl font-medium">Wallets</Link>
                </DropdownMenuItem>
                <button
                  onClick={triggerLogoutConfirm}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[#ff3e00] hover:bg-[#ff3e00]/10 rounded-xl font-medium mt-1"
                >
                  <LogOut size={14} /> Log out
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/auth?mode=login"
                className="text-xs sm:text-sm font-medium text-white/85 hover:text-white transition-colors px-1"
              >
                Login
              </Link>
              <Link
                to="/auth?mode=register"
                className="bg-[#918df6] hover:bg-[#807ce5] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-1.5 rounded-full transition-all transform hover:scale-105 shadow-md flex items-center gap-1"
              >
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#181925] border border-white/10 rounded-[24px] mt-2 p-4 space-y-2 shadow-2xl pointer-events-auto text-white w-full max-w-sm">
          <Link to="/trixie-explains" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-xl">Features</Link>
          <Link to="/markets" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-xl">Pricing</Link>
          <Link to="/trade/spot" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-xl">Blog</Link>
          <Link to="/support" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-xl">Docs</Link>
        </div>
      )}
    </header>
  );
}
