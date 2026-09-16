import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { motion } from "motion/react";
import { PageTransition } from "../components/ui/PageTransition";

export default function NotFoundPage() {
  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-16 bg-background text-foreground">
        <motion.div 
          className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="relative text-[8rem] md:text-[12rem] font-black leading-none text-foreground select-none">
            <span className="animate-pulse opacity-10 absolute -inset-1 blur-lg text-primary">404</span>
            <span style={{ textShadow: '2px 0 red, -2px 0 blue' }}>404</span>
          </h1>

          <div className="space-y-4 max-w-md pt-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
              Page Not Found
            </h2>
            <p className="text-foreground/75 text-base sm:text-lg leading-relaxed">
              The page or route you requested could not be found or requires login.
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-primary text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 shadow-xs"
            >
              <LayoutGrid size={16} className="text-white" /> Return to Dashboard
            </Link>
            <Link 
              to="/" 
              className="w-full sm:w-auto group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-border text-foreground hover:border-primary/50 hover:text-primary transition-colors text-xs sm:text-sm font-bold"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Go Home
            </Link>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
