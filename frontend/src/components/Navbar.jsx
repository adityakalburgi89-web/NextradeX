import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/Logo.png";
import { Button } from "./ui/Button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Search, Sun, Moon, User, ChevronDown, Layers, LogOut, X, Menu } from "lucide-react";
import TradeDropdown from "./TradeDropdown";
import NavLink from "./NavLink";

export default function Navbar({ theme, toggleTheme, isLoggedIn, user, setSearchOpen, triggerLogoutConfirm }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Escape key closes mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Focus management for mobile menu
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      // Focus the first focusable element in the menu
      const focusable = mobileMenuRef.current.querySelector('a, button');
      if (focusable) {
        focusable.focus();
      }
    } else if (!mobileMenuOpen && hamburgerRef.current) {
      // Restore focus to hamburger button when menu closes
      hamburgerRef.current.focus();
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="sticky top-0 z-50 h-16 bg-background text-foreground shadow-neo-sm transition-all duration-300 flex items-center">
        <div className="flex items-center justify-between px-6 w-full max-w-none">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-heading font-bold text-xl flex items-center gap-1 hover:opacity-90 transition-opacity">
              <img src={Logo} alt="NexTradeX Logo" className="h-12 sm:h-14 w-auto object-contain" />
              <span className="text-foreground hidden sm:inline">
                NexTrade<span className="text-primary">X</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-muted shadow-neo-sm transition-all hover:text-primary hover:shadow-neo active:shadow-neo-inset-sm"
              title="Search"
            >
              <Search size={18} />
            </button>

            {/* Desktop Nav — moved to right side */}
            <div className="hidden md:flex items-center gap-6 font-mono text-xs">
              <TradeDropdown theme={theme} />
              <NavLink to="/markets">Markets</NavLink>
            </div>

            {isLoggedIn ? (
              <DropdownMenu onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex min-h-11 items-center gap-2 rounded-2xl bg-background px-3 py-1.5 shadow-neo-sm transition-all duration-300 hover:shadow-neo focus-visible:outline-none"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <User size={12} className="text-on-primary" />
                    </div>
                    <span className="font-mono text-xs font-semibold hidden sm:inline">{user?.username}</span>
                    <ChevronDown size={12} className="text-muted" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-50 min-w-[180px] rounded-[24px] bg-background py-2 text-foreground shadow-neo"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-xs w-full hover:bg-background hover:text-primary transition-colors font-semibold cursor-pointer"
                    >
                      <User size={14} />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/wallets"
                      className="flex items-center gap-3 px-4 py-2 text-xs w-full hover:bg-background hover:text-primary transition-colors font-semibold cursor-pointer"
                    >
                      <Layers size={14} />
                      Wallets
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild>
                    <button
                      onClick={triggerLogoutConfirm}
                      className="flex items-center gap-3 px-4 py-2 text-xs w-full text-left hover:bg-background hover:text-trading-down transition-colors font-semibold cursor-pointer"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="tertiaryText" className="hidden sm:inline-flex text-xs" asChild>
                  <Link to="/auth?mode=login">Log In</Link>
                </Button>
                <Button className="hidden sm:inline-flex text-xs h-9" asChild>
                  <Link to="/auth?mode=register">Sign Up</Link>
                </Button>
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-muted shadow-neo-sm transition-all duration-300 hover:text-primary hover:shadow-neo active:shadow-neo-inset-sm group"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="relative w-[18px] h-[18px]">
                <Sun
                  size={18}
                  className={`absolute inset-0 transition-all duration-500 ${theme === 'dark'
                    ? 'opacity-100 rotate-0 scale-100 text-primary'
                    : 'opacity-0 rotate-180 scale-0'
                    }`}
                />
                <Moon
                  size={18}
                  className={`absolute inset-0 transition-all duration-500 ${theme === 'light'
                    ? 'opacity-100 rotate-0 scale-100 text-primary'
                    : 'opacity-0 -rotate-180 scale-0'
                    }`}
                />
              </div>
            </button>

            {/* Mobile hamburger */}
            <button
              ref={hamburgerRef}
              className="md:hidden flex h-12 w-12 items-center justify-center rounded-2xl text-muted shadow-neo-sm transition-all hover:text-primary hover:shadow-neo active:shadow-neo-inset-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="md:hidden animate-slide-down bg-background text-foreground shadow-neo">
          <div className="flex justify-end px-4 pt-3">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-muted shadow-neo-sm transition-all hover:text-primary hover:shadow-neo"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-6 py-4 space-y-1 font-mono text-sm">
            <Link to="/trade/spot" className="block py-3 px-3 rounded-2xl hover:bg-background text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Spot Trading</Link>
            <Link to="/trade/futures" className="block py-3 px-3 rounded-2xl hover:bg-background text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Futures Trading</Link>
            <Link to="/trade/options" className="block py-3 px-3 rounded-2xl hover:bg-background text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Options Trading</Link>
            <div className="glow-line my-3" />
            <Link to="/markets" className="block py-3 px-3 rounded-2xl hover:bg-background text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Markets</Link>
            {isLoggedIn && (
              <>
                <Link to="/wallets" className="block py-3 px-3 rounded-2xl hover:bg-background text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Wallets</Link>
                <Link to="/orders" className="block py-3 px-3 rounded-2xl hover:bg-background text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
                <Link to="/analytics" className="block py-3 px-3 rounded-2xl hover:bg-background text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Analytics</Link>
              </>
            )}
            {isLoggedIn ? (
              <>
                <div className="glow-line my-3" />
                <Link to="/profile" className="block py-3 px-3 rounded-2xl hover:bg-background text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <button onClick={() => { triggerLogoutConfirm(); setMobileMenuOpen(false); }} className="block py-3 px-3 rounded-2xl hover:bg-background text-muted hover:text-trading-down transition-colors w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <div className="glow-line my-3" />
                <Link to="/auth?mode=login" className="block py-3 px-3 rounded-2xl hover:bg-background text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                <Link to="/auth?mode=register" className="block py-3 px-3 rounded-2xl hover:bg-background text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
