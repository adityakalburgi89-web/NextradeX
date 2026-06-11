import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutGrid, SearchX } from "lucide-react";
import { motion } from "framer-motion";

const FloatingSymbol = ({ icon, top, left, delay }) => (
  <motion.div
    animate={{ y: [0, -10, 0], opacity: [0.25, 0.6, 0.25] }}
    transition={{ duration: 3, delay, repeat: Infinity }}
    className="absolute rounded-full bg-background px-4 py-2 font-mono text-sm font-bold text-muted shadow-neo-sm"
    style={{ top, left }}
  >
    {icon}
  </motion.div>
);

export default function NotFoundPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-background px-6 py-24 text-foreground">
      <FloatingSymbol icon="BTC" top="18%" left="10%" delay={0} />
      <FloatingSymbol icon="ETH" top="68%" left="78%" delay={0.7} />
      <FloatingSymbol icon="SOL" top="12%" left="72%" delay={1.2} />

      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] bg-background p-8 shadow-neo"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-background text-primary shadow-neo-inset-deep">
            <SearchX size={42} strokeWidth={1.75} />
          </div>

          <p className="mb-3 font-mono text-xs font-bold uppercase text-primary">Error 404</p>
          <h1 className="font-display text-6xl font-extrabold leading-none text-foreground sm:text-7xl">
            Page Not Found
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted">
            The route you requested is not available in the NexTradeX simulation workspace.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-neo transition-all hover:-translate-y-0.5 hover:bg-primary-active hover:shadow-neo-hover active:translate-y-0.5"
            >
              <LayoutGrid size={18} />
              Return to Dashboard
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-background px-6 py-3 text-sm font-bold text-muted shadow-neo-sm transition-all hover:text-primary hover:shadow-neo"
            >
              <ArrowLeft size={16} />
              Go Home
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
