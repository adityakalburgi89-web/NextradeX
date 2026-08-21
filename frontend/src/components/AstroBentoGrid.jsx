import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function AstroBentoGrid() {
  const cards = [
    {
      id: "S/01",
      badge: "FLAGSHIP",
      title: "Practice spot trading.",
      description:
        "Buy and sell top cryptocurrencies with live prices. Try out trading strategies without risking any real money.",
      bgClass: "bg-[#E6E9EE] text-[#1A1A1A]",
      badgeClass: "text-[#666666]",
      tagColor: "text-[#666666]",
      link: "/trade/spot",
      colSpan: "col-span-1 lg:col-span-4",
    },
    {
      id: "S/02",
      badge: null,
      title: "Try futures trading.",
      description:
        "Predict whether prices go up or down. Learn leverage and protective order limits safely.",
      bgClass: "bg-[#0A0A0C] text-white",
      badgeClass: "text-white font-bold",
      tagColor: "text-white font-bold",
      link: "/trade/futures",
      colSpan: "col-span-1 lg:col-span-4",
    },
    {
      id: "S/03",
      badge: null,
      title: "Live real-time prices.",
      description:
        "Prices update instantly as the market moves, giving you a realistic trading experience every second.",
      bgClass: "bg-[#C4EB46] text-[#141B03]",
      badgeClass: "text-[#475C07]",
      tagColor: "text-[#475C07]",
      link: "/markets",
      colSpan: "col-span-1 lg:col-span-4",
    },
    {
      id: "S/04",
      badge: null,
      title: "Free $100,000 wallet.",
      description:
        "Start practice trading with $100,000 in virtual funds. Reset your balance anytime with just one click.",
      bgClass: "bg-[#D2C4E6] text-[#241738]",
      badgeClass: "text-[#5C457D]",
      tagColor: "text-[#5C457D]",
      link: "/wallets",
      colSpan: "col-span-1 lg:col-span-4",
    },
    {
      id: "S/05",
      badge: null,
      title: "Track your progress.",
      description:
        "See your win rate, profits, and trading history in simple charts to build your confidence over time.",
      bgClass: "bg-[#E8EDF2] text-[#171D24]",
      badgeClass: "text-[#5A6878]",
      tagColor: "text-[#5A6878]",
      link: "/analytics",
      colSpan: "col-span-1 lg:col-span-3",
    },
    {
      id: "S/06",
      badge: "AVAILABLE NOW",
      title: "Smart AI assistant.",
      description:
        "Get instant help, simple market breakdowns, and friendly advice whenever you need guidance.",
      bgClass: "bg-[#D4DDD2] text-[#192418]",
      badgeClass: "text-[#485D45]",
      tagColor: "text-[#485D45]",
      link: "/trixie-explains",
      colSpan: "col-span-1 lg:col-span-5",
    },
  ];

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-8 max-w-[1280px] mx-auto font-sans">
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-14 sm:mb-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-carbon">
          Simple, Powerful Crypto Practice.
        </h2>
        <p className="text-carbon/75 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
          Learn, practice, and test crypto trading with real live prices and zero financial risk.
        </p>
      </div>

      {/* Astro-Style Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className={`${card.colSpan} ${card.bgClass} rounded-[30px] p-7 sm:p-9 flex flex-col justify-between min-h-[260px] sm:min-h-[290px] relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-sm border border-black/5 group cursor-pointer`}
          >
            {/* Top Row: Index Tag (S/01) + Badge (FLAGSHIP / AVAILABLE NOW) */}
            <div className="flex items-center justify-between font-mono text-xs font-bold tracking-widest uppercase mb-8">
              <span className={card.tagColor}>{card.id}</span>
              {card.badge && (
                <span className={`text-[10px] tracking-wider uppercase font-semibold ${card.badgeClass}`}>
                  {card.badge}
                </span>
              )}
            </div>

            {/* Middle / Bottom Content */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between gap-4">
                <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight ${card.id === "S/02" ? "text-white" : ""}`}>
                  {card.title}
                </h3>
                <Link
                  to={card.link}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                    card.id === "S/02" ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 dark:bg-white/10"
                  }`}
                >
                  <ArrowUpRight size={18} />
                </Link>
              </div>

              <p className={`text-xs sm:text-sm leading-relaxed max-w-xl font-medium ${card.id === "S/02" ? "text-white" : "opacity-85"}`}>
                {card.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
