import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/Logo.png";
import { Search, User, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";

export default function Navbar({ theme, isLoggedIn, user, setSearchOpen, triggerLogoutConfirm }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#ebf5ff]/90 backdrop-blur-md transition-all">
      <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-3 text-[#0a0d12] no-underline">
          <img src={Logo} alt="NexTradeX Logo" className="h-10 w-auto object-contain" />
          <span className="font-['Inter'] font-bold text-xl tracking-tight text-[#0a0d12]">
            NexTrade<span className="text-[#0069e0]">X</span>
          </span>
        </Link>

        {/* Center: Ghost Nav Links (Plain typography on canvas) */}
        <nav className="hidden md:flex items-center gap-8 font-['Geist'] font-medium text-base text-[#0a0d12]">
          <Link to="/markets" className="ghost-nav-link">Markets</Link>
          <Link to="/trade/spot" className="ghost-nav-link">Spot Trade</Link>
          <Link to="/trade/futures" className="ghost-nav-link">Futures</Link>
          <Link to="/trixie-explains" className="ghost-nav-link">Features</Link>
          <Link to="/support" className="ghost-nav-link">Support</Link>
        </nav>

        {/* Right Actions: Search + Dark CTA Pill */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2.5 rounded-full text-[#535862] hover:text-[#0a0d12] transition-colors"
            title="Search"
          >
            <Search size={20} />
          </button>

          {isLoggedIn ? (
            <DropdownMenu onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full bg-[#fafdff] px-4 py-2 text-[#0a0d12] font-['Geist'] text-sm font-medium border border-black/5 hover:border-black/10">
                  <div className="w-6 h-6 rounded-full bg-[#0069e0] text-white flex items-center justify-center font-bold text-xs">
                    {user?.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span>{user?.username}</span>
                  <ChevronDown size={14} className="text-[#93979f]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 min-w-[200px] rounded-[24px] bg-[#fafdff] p-3 shadow-lg border border-black/5">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-[#0a0d12] hover:bg-[#f6f7f8] rounded-xl font-medium">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-[#0a0d12] hover:bg-[#f6f7f8] rounded-xl font-medium">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wallets" className="block px-4 py-2 text-sm text-[#0a0d12] hover:bg-[#f6f7f8] rounded-xl font-medium">Wallets</Link>
                </DropdownMenuItem>
                <button
                  onClick={triggerLogoutConfirm}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-[#e05263] hover:bg-[#f6f7f8] rounded-xl font-medium mt-1"
                >
                  <LogOut size={14} /> Log out
                </button>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="btn-primary-genie">
              Sign up
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#0a0d12]"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#fafdff] border-t border-black/5 px-6 py-6 space-y-4">
          <Link to="/markets" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-[#0a0d12]">Markets</Link>
          <Link to="/trade/spot" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-[#0a0d12]">Spot Trade</Link>
          <Link to="/trade/futures" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-[#0a0d12]">Futures</Link>
          <Link to="/support" onClick={() => setMobileMenuOpen(false)} className="block text-lg font-medium text-[#0a0d12]">Support</Link>
        </div>
      )}
    </header>
  );
}
