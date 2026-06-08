import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/Button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Search, Sun, Moon, User, ChevronDown, Layers, LogOut, X, Menu } from "lucide-react";
import TradeDropdown from "./TradeDropdown";
import NavLink from "./NavLink";

export default function Navbar({ theme, toggleTheme, isLoggedIn, user, setSearchOpen, triggerLogoutConfirm }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className={`sticky top-0 z-50 h-16 border-b transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-canvas-dark border-hairline-on-dark text-white' 
          : 'bg-canvas-light border-hairline-on-light text-ink'
      } flex items-center`}>
        <div className="flex items-center justify-between px-6 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-heading font-bold text-xl tracking-tight flex items-center gap-1 hover:opacity-90 transition-opacity">
              <span className="text-primary">NexTradeX</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-muted hover:text-primary"
              title="Search"
            >
              <Search size={18} />
            </button>

            {/* Desktop Nav — moved to right side */}
            <div className="hidden md:flex items-center gap-6 font-mono text-xs tracking-wider">
              <TradeDropdown theme={theme} />
              <NavLink to="/markets">Markets</NavLink>
            </div>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 focus-visible:outline-none ${
                      theme === 'dark' 
                        ? 'bg-surface-card-dark border-hairline-on-dark hover:bg-surface-elevated-dark' 
                        : 'bg-white border-hairline-on-light hover:bg-surface-soft-light'
                    }`}
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
                  className={`rounded-xl shadow-elevation-lg py-2 min-w-[180px] border z-50 ${
                    theme === 'dark'
                      ? 'bg-surface-card-dark border-hairline-on-dark text-white'
                      : 'bg-white border-hairline-on-light text-ink'
                  }`}
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-xs w-full hover:bg-white/[0.04] hover:text-primary transition-colors font-semibold cursor-pointer"
                    >
                      <User size={14} />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/wallets"
                      className="flex items-center gap-3 px-4 py-2 text-xs w-full hover:bg-white/[0.04] hover:text-primary transition-colors font-semibold cursor-pointer"
                    >
                      <Layers size={14} />
                      Wallets
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className={`my-1 border-t ${theme === 'dark' ? 'border-hairline-on-dark' : 'border-hairline-on-light'}`} />
                  <DropdownMenuItem asChild>
                    <button
                      onClick={triggerLogoutConfirm}
                      className="flex items-center gap-3 px-4 py-2 text-xs w-full text-left hover:bg-white/[0.04] hover:text-trading-down transition-colors font-semibold cursor-pointer"
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
              className="p-2 rounded-lg hover:bg-white/[0.06] transition-all duration-300 text-muted hover:text-primary group"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="relative w-[18px] h-[18px]">
                <Sun 
                  size={18} 
                  className={`absolute inset-0 transition-all duration-500 ${
                    theme === 'dark' 
                      ? 'opacity-100 rotate-0 scale-100 text-primary' 
                      : 'opacity-0 rotate-180 scale-0'
                  }`}
                />
                <Moon 
                  size={18} 
                  className={`absolute inset-0 transition-all duration-500 ${
                    theme === 'light' 
                      ? 'opacity-100 rotate-0 scale-100 text-primary' 
                      : 'opacity-0 -rotate-180 scale-0'
                  }`}
                />
              </div>
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t animate-slide-down ${
          theme === 'dark' ? 'bg-canvas-dark border-hairline-on-dark text-white' : 'bg-canvas-light border-hairline-on-light text-ink'
        }`}>
          <div className="px-6 py-4 space-y-1 font-mono text-sm">
            <Link to="/trade/spot" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Spot Trading</Link>
            <Link to="/trade/futures" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Futures Trading</Link>
            <Link to="/trade/options" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Options Trading</Link>
            <div className={`h-[1px] my-3 ${theme === 'dark' ? 'bg-hairline-on-dark' : 'bg-hairline-on-light'}`} />
            <Link to="/markets" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Markets</Link>
            {isLoggedIn && (
              <>
                <Link to="/wallets" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Wallets</Link>
                <Link to="/orders" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
                <Link to="/analytics" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Analytics</Link>
              </>
            )}
            {isLoggedIn ? (
              <>
                <div className={`h-[1px] my-3 ${theme === 'dark' ? 'bg-hairline-on-dark' : 'bg-hairline-on-light'}`} />
                <Link to="/profile" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <button onClick={() => { triggerLogoutConfirm(); setMobileMenuOpen(false); }} className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-trading-down transition-colors w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <div className={`h-[1px] my-3 ${theme === 'dark' ? 'bg-hairline-on-dark' : 'bg-hairline-on-light'}`} />
                <Link to="/auth?mode=login" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                <Link to="/auth?mode=register" className="block py-3 px-3 rounded-lg hover:bg-white/[0.04] text-muted hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
