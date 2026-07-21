import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { LogOut } from "lucide-react";

import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import MarketsPage from "./pages/MarketsPage";
import SpotTradingPage from "./pages/SpotTradingPage";
import FuturesTradingPage from "./pages/FuturesTradingPage";
import OptionsTradingPage from "./pages/OptionsTradingPage";
import MarginTradingPage from "./pages/MarginTradingPage";
import PortfolioAnalyticsPage from "./pages/PortfolioAnalyticsPage";

import WalletsPage from "./pages/WalletsPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import CareersPage from "./pages/CareersPage";
import AboutPage from "./pages/Company/AboutPage";
import TermsPage from "./pages/Company/TermsPage";
import PrivacyPage from "./pages/Company/PrivacyPage";
import ContractSpecsPage from "./pages/Information/ContractSpecsPage";
import TradingFeesPage from "./pages/Information/TradingFeesPage";
import SettlementPricesPage from "./pages/Information/SettlementPricesPage";
import TrixieExplainsPage from "./pages/Information/TrixieExplainsPage";
import APIDocsPage from "./pages/resources/APIDocsPage";
import SupportPage from "./pages/support/SupportPage";
import UserGuidePage from "./pages/resources/UserGuidePage";
import ReferralPage from "./pages/resources/ReferralPage";
import EarnPage from "./pages/EarnPage";
import FundingPage from "./pages/FundingPage";
import SubAccountsPage from "./pages/SubAccountsPage";
import { hasAuthToken, clearAuthToken, fetchUserProfile, logoutUser } from "./api";
import Chatbot from "./components/Chatbot";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SearchModal from "./components/SearchModal";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import SkipNav from "./components/SkipNav";
import { ToastProvider } from "./components/Toast/ToastProvider";
import ToastContainer from "./components/Toast/ToastContainer";

function App() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = hasAuthToken();
      if (token) {
        try {
          const res = await fetchUserProfile();
          if (res?.data) {
            setUser(res.data);
            setIsLoggedIn(true);
          }
        } catch (err) {
          if (err.status === 401 || err.status === 403) {
            clearAuthToken();
            setIsLoggedIn(false);
          } else {
            console.error("[App] Failed to fetch user profile:", err.message);
          }
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setIsLoggedIn(false);
    setUser(null);
    setShowLogoutConfirm(false);
    navigate("/auth");
  };

  const triggerLogoutConfirm = () => {
    setShowLogoutConfirm(true);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden font-body">
        {/* Accessibility Skip Nav */}
        <SkipNav />

        {/* Navigation */}
        <Navbar
          theme={theme}
          isLoggedIn={isLoggedIn}
          user={user}
          setSearchOpen={setSearchOpen}
          triggerLogoutConfirm={triggerLogoutConfirm}
        />

        <ErrorBoundary>
          <div id="main-content" className="relative z-10 w-full">
            <Routes>
              <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<ProtectedRoute isLoggedIn={isLoggedIn}><DashboardPage /></ProtectedRoute>} />
              <Route path="/markets" element={<MarketsPage />} />
              <Route path="/trade/spot" element={<SpotTradingPage />} />
              <Route path="/trade/futures" element={<FuturesTradingPage />} />
              <Route path="/trade/options" element={<OptionsTradingPage />} />
              <Route path="/trade/margin" element={<MarginTradingPage />} />
              <Route path="/analytics" element={<ProtectedRoute isLoggedIn={isLoggedIn}><PortfolioAnalyticsPage /></ProtectedRoute>} />

              <Route path="/wallets" element={<ProtectedRoute isLoggedIn={isLoggedIn}><WalletsPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute isLoggedIn={isLoggedIn}><OrdersPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute isLoggedIn={isLoggedIn}><ProfilePage /></ProtectedRoute>} />
              <Route path="/earn" element={<ProtectedRoute isLoggedIn={isLoggedIn}><EarnPage /></ProtectedRoute>} />
              <Route path="/funding" element={<ProtectedRoute isLoggedIn={isLoggedIn}><FundingPage /></ProtectedRoute>} />
              <Route path="/sub-accounts" element={<ProtectedRoute isLoggedIn={isLoggedIn}><SubAccountsPage /></ProtectedRoute>} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/contract-specs" element={<ContractSpecsPage />} />
              <Route path="/trading-fees" element={<TradingFeesPage />} />
              <Route path="/settlement-prices" element={<SettlementPricesPage />} />
              <Route path="/trixie-explains" element={<TrixieExplainsPage />} />
              <Route path="/api-docs" element={<APIDocsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/user-guide" element={<UserGuidePage />} />
              <Route path="/referral" element={<ReferralPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </ErrorBoundary>

        {/* Search Modal */}
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} query={searchQuery} setQuery={setSearchQuery} isLoggedIn={isLoggedIn} />

        {/* Custom Logout Confirmation Modal */}
        <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
          <DialogContent className="bg-background p-6 rounded-[32px] max-w-sm w-full shadow-neo-hover text-center space-y-5 text-foreground">
            <DialogHeader className="space-y-0">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-trading-down/10 p-3 text-trading-down">
                  <LogOut size={24} />
                </div>
              </div>
              <DialogTitle className="font-heading text-lg font-bold text-foreground text-center">Confirm Logout</DialogTitle>
            </DialogHeader>

            <p className="text-xs text-muted font-sans -mt-2">
              Are you sure you want to log out of NexTradeX? All active sessions on this device will be ended.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 bg-background text-foreground rounded-2xl text-xs font-bold transition-all shadow-neo-sm hover:shadow-neo active:shadow-neo-inset-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-trading-down hover:bg-trading-down/80 text-white rounded-2xl text-xs font-bold transition-all shadow-neo-sm"
              >
                Logout
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Floating Chatbot Assistant Trixie */}
        <Chatbot />

        {/* Footer */}
        <Footer />
      </div>
      <ToastContainer />
    </ToastProvider>
  );
}

export default App;
