import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Clock3, LayoutGrid, Wrench } from "lucide-react";
import { PageTransition } from "../components/ui/PageTransition";
import footerBg from "../assets/images/footer-bg.png";

const metrics = [
  ["Status", "Maintenance"],
  ["Contracts", "Paused"],
  ["Uptime", "99.99%"],
];

export default function OptionsTradingPage() {
  return (
    <PageTransition>
      <main
        className="relative min-h-[85vh] overflow-hidden px-6 py-20 text-foreground bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${footerBg})` }}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] bg-background p-8 shadow-neo md:p-12"
          >
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-background text-primary shadow-neo-inset-deep">
              <Wrench size={34} strokeWidth={1.75} />
            </div>
            <p className="mb-4 font-mono text-xs font-bold uppercase text-primary">Options Desk</p>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-foreground md:text-6xl">
              Currently Out of Service
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              Options trading is undergoing scheduled upgrades. Spot, futures, margin, wallets, and market data remain available.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/dashboard"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-neo transition-all hover:-translate-y-0.5 hover:bg-primary-active hover:shadow-neo-hover active:translate-y-0.5"
              >
                <LayoutGrid size={18} />
                Return to Dashboard
              </Link>
              <Link
                to="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-background px-6 py-3 text-sm font-bold text-muted shadow-neo-sm transition-all hover:text-primary hover:shadow-neo"
              >
                <ArrowLeft size={16} />
                Go Home
              </Link>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[32px] bg-background p-6 shadow-neo"
          >
            <div className="rounded-[28px] bg-background p-6 shadow-neo-inset-deep">
              <div className="mx-auto mb-8 flex aspect-square max-w-[280px] items-center justify-center rounded-full bg-background shadow-neo">
                <div className="flex h-36 w-36 items-center justify-center rounded-full bg-background text-primary shadow-neo-inset-deep">
                  <Clock3 size={60} strokeWidth={1.5} />
                </div>
              </div>

              <div className="grid gap-3">
                {metrics.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-2xl bg-background px-4 py-3 shadow-neo-sm">
                    <span className="text-xs font-bold uppercase text-muted">{label}</span>
                    <span className="text-sm font-bold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </div>
      </main>
    </PageTransition>
  );
}
