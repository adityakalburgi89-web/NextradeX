import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/Logo.png";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Menu01Icon,
  Cancel01Icon,
  ArrowDown01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { MAIN_NAV_ITEMS } from "./navbar/navData";
import NavItem from "./navbar/NavItem";
import MegaMenu from "./navbar/MegaMenu";
import MobileNavigation from "./navbar/MobileNavigation";
import "./navbar/navbar.css";

/**
 * Senior React Cryptocurrency Exchange Mega-Menu Navbar
 * Using official Stroke-Rounded Hugeicons (@hugeicons/react and @hugeicons/core-free-icons).
 */
export default function Navbar({
  theme,
  isLoggedIn,
  user,
  setSearchOpen,
  triggerLogoutConfirm,
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseEnterItem = (menuId) => {
    clearHoverTimeout();
    setActiveMenu(menuId);
  };

  const handleMouseLeaveItem = () => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  const handleItemClick = (item) => {
    if (item.type === "megamenu") {
      setActiveMenu((prev) => (prev === item.id ? null : item.id));
    } else {
      setActiveMenu(null);
    }
  };

  const handleCloseMenu = () => {
    setActiveMenu(null);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveMenu(null);
        setUserDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveMenu(null);
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      clearHoverTimeout();
    };
  }, []);

  const currentActiveData = MAIN_NAV_ITEMS.find((item) => item.id === activeMenu)?.data;

  return (
    <header className="crypto-header">
      <div className="crypto-navbar" ref={navRef}>
        <Link to="/" className="crypto-nav-logo" onClick={handleCloseMenu}>
          <img src={Logo} alt="NexTradeX Logo" className="crypto-logo-img" />
        </Link>

        <nav aria-label="Main Navigation">
          <ul className="crypto-nav-menu" role="menubar">
            {MAIN_NAV_ITEMS.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isOpen={activeMenu === item.id}
                onMouseEnter={() =>
                  item.type === "megamenu" && handleMouseEnterItem(item.id)
                }
                onMouseLeave={handleMouseLeaveItem}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </ul>
        </nav>

        {activeMenu && currentActiveData && (
          <MegaMenu
            menuId={activeMenu}
            data={currentActiveData}
            onMouseEnter={clearHoverTimeout}
            onMouseLeave={handleMouseLeaveItem}
            onItemClick={handleCloseMenu}
          />
        )}

        <div className="crypto-nav-actions">
          <button
            type="button"
            className="crypto-search-btn"
            onClick={() => {
              setActiveMenu(null);
              setSearchOpen(true);
            }}
            title="Search"
          >
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </button>

          {isLoggedIn ? (
            <div
              className="relative"
              onMouseEnter={() => setUserDropdownOpen(true)}
              onMouseLeave={() => setUserDropdownOpen(false)}
            >
              <button
                type="button"
                className="crypto-user-pill"
                title={user?.username || "Account"}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="crypto-user-avatar">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <HugeiconsIcon icon={ArrowDown01Icon} size={12} />
              </button>

              {userDropdownOpen && (
                <div className="crypto-user-dropdown-menu">
                  <Link to="/dashboard" onClick={handleCloseMenu} className="crypto-megamenu-item">Dashboard</Link>
                  <Link to="/profile" onClick={handleCloseMenu} className="crypto-megamenu-item">Profile</Link>
                  <Link to="/wallets" onClick={handleCloseMenu} className="crypto-megamenu-item">Wallets</Link>
                </div>
              )}
            </div>
          ) : (
            <div className="crypto-auth-group">
              <Link to="/auth?mode=login" className="crypto-login-link" onClick={handleCloseMenu}>Login</Link>
              <Link to="/auth?mode=register" className="crypto-register-btn" onClick={handleCloseMenu}>Register</Link>
            </div>
          )}

          <button
            type="button"
            className="crypto-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <HugeiconsIcon icon={mobileMenuOpen ? Cancel01Icon : Menu01Icon} size={18} />
          </button>
        </div>
      </div>

      <MobileNavigation
        open={mobileMenuOpen}
        navItems={MAIN_NAV_ITEMS}
        onClose={handleCloseMenu}
        setSearchOpen={setSearchOpen}
        isLoggedIn={isLoggedIn}
        user={user}
        triggerLogoutConfirm={triggerLogoutConfirm}
      />
    </header>
  );
}
