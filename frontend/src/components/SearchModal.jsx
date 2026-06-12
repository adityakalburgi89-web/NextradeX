import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Search, ChevronDown } from "lucide-react";

export default function SearchModal({ open, onClose, query, setQuery, isLoggedIn }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Focus the search input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Escape key closes the modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const searchResults = [
    { label: "Markets", path: "/markets", description: "View all markets" },
    { label: "Spot Trading", path: "/trade/spot", description: "Trade spot pairs" },
    { label: "Futures Trading", path: "/trade/futures", description: "Trade futures contracts" },
    { label: "Options Trading", path: "/trade/options", description: "Trade options" },
    isLoggedIn && { label: "Wallets", path: "/wallets", description: "Manage your wallets" },
    isLoggedIn && { label: "Orders", path: "/orders", description: "View order history" },
    isLoggedIn && { label: "Profile", path: "/profile", description: "Your profile" },
    { label: "Careers", path: "/careers", description: "Join our team" },
    { label: "API Docs", path: "/api-docs", description: "API documentation" },
    { label: "Support", path: "/support", description: "Get help" },
    { label: "User Guide", path: "/user-guide", description: "Learn how to trade" },
    { label: "Referral Program", path: "/referral", description: "Earn rewards" },
  ].filter(Boolean)
   .filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
    setQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent 
        className="max-w-xl w-full bg-background border-transparent rounded-2xl p-0 overflow-hidden shadow-2xl text-foreground [&>button]:top-2 [&>button]:h-8 [&>button]:w-8"
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <DialogHeader className="p-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="flex items-center gap-3 pl-4 pr-16 py-3.5 border-b border-muted/15 focus-within:border-primary/35 transition-all duration-300">
            <Search size={18} className="text-muted" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages..."
              className="flex-1 bg-transparent text-foreground placeholder-muted outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            />
          </div>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto">
          {query && searchResults.length === 0 ? (
            <div className="p-4 text-center text-muted text-sm">No results found</div>
          ) : (
            <div className="py-2">
              {searchResults.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(item.path)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-background transition-colors text-left"
                >
                  <div>
                    <div className="text-foreground text-sm font-medium">{item.label}</div>
                    <div className="text-muted text-xs">{item.description}</div>
                  </div>
                  <ChevronDown size={16} className="text-muted rotate-[-90deg]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
