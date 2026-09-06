import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import mascot1 from "../assets/images/Mascot/ChatGPT Image Sep 6, 2026, 03_39_58 PM_r1_c1.png";
import mascot2 from "../assets/images/Mascot/ChatGPT Image Sep 6, 2026, 03_39_58 PM_r1_c2.png";
import mascot3 from "../assets/images/Mascot/ChatGPT Image Sep 6, 2026, 03_39_58 PM_r1_c3.png";
import mascot4 from "../assets/images/Mascot/ChatGPT Image Sep 6, 2026, 03_39_58 PM_r2_c1.png";
import mascot5 from "../assets/images/Mascot/ChatGPT Image Sep 6, 2026, 03_39_58 PM_r2_c2.png";
import mascot6 from "../assets/images/Mascot/ChatGPT Image Sep 6, 2026, 03_39_58 PM_r2_c3.png";

export default function AstroBentoGrid() {
  const cards = [
    {
      id: "S/01",
      badge: "FLAGSHIP",
      title: "Practice spot trading.",
      description:
        "Execute spot orders across leading crypto assets with live streaming prices and zero financial exposure.",
      bgClass: "bg-[hsl(0,0%,98%)] text-[#181925]",
      badgeClass: "text-[#8574ff] font-bold",
      tagColor: "text-[#888888]",
      textColor: "text-[#181925]",
      descColor: "text-[#666666]",
      btnClass: "bg-black/5 hover:bg-black/10 text-carbon",
      mascot: mascot1,
      mascotPos: "absolute right-3 sm:right-6 top-12 sm:top-14 w-32 sm:w-40 md:w-44",
      textMaxW: "max-w-[55%] sm:max-w-[58%]",
      link: "/trade/spot",
      colSpan: "col-span-1 lg:col-span-4",
    },
    {
      id: "S/02",
      badge: null,
      title: "Try futures trading.",
      description:
        "Trade perpetual contracts with flexible leverage options, margin allocation, and protective risk controls.",
      bgClass: "bg-[#1E163B] text-white",
      badgeClass: "text-[#918DF6]",
      tagColor: "text-[#918DF6]",
      textColor: "text-white",
      descColor: "text-[#D5CEFD]",
      btnClass: "bg-white/15 hover:bg-white/25 text-white",
      mascot: mascot2,
      mascotPos: "absolute right-3 sm:right-6 top-12 sm:top-14 w-32 sm:w-40 md:w-44",
      textMaxW: "max-w-[55%] sm:max-w-[58%]",
      link: "/trade/futures",
      colSpan: "col-span-1 lg:col-span-4",
    },
    {
      id: "S/03",
      badge: null,
      title: "Live real-time prices.",
      description:
        "Stream sub-second market data updates across major asset pairs via high-throughput WebSocket infrastructure.",
      bgClass: "bg-[#918DF6] text-white",
      badgeClass: "text-white",
      tagColor: "text-[#1E163B]",
      textColor: "text-white",
      descColor: "text-[#F0EDFE]",
      btnClass: "bg-white/20 hover:bg-white/30 text-white",
      mascot: mascot3,
      mascotPos: "absolute right-3 sm:right-6 top-12 sm:top-14 w-32 sm:w-40 md:w-44",
      textMaxW: "max-w-[55%] sm:max-w-[58%]",
      link: "/markets",
      colSpan: "col-span-1 lg:col-span-4",
    },
    {
      id: "S/04",
      badge: null,
      title: "Free $100,000 wallet.",
      description:
        "Deploy $100,000 in virtual capital to test strategy performance, with instant 1-click balance replenishment.",
      bgClass: "bg-[#F7F7F7] text-[#181925]",
      badgeClass: "text-[#8574ff]",
      tagColor: "text-[#888888]",
      textColor: "text-[#181925]",
      descColor: "text-[#666666]",
      btnClass: "bg-black/5 hover:bg-black/10 text-carbon",
      mascot: mascot4,
      mascotPos: "absolute right-2 sm:right-5 bottom-2 sm:bottom-4 w-32 sm:w-40 md:w-44",
      textMaxW: "max-w-[58%] sm:max-w-[62%]",
      link: "/wallets",
      colSpan: "col-span-1 lg:col-span-4",
    },
    {
      id: "S/05",
      badge: null,
      title: "Track your progress.",
      description:
        "Analyze win rates, execution logs, and cumulative PnL performance through intuitive visual analytics dashboards.",
      bgClass: "bg-[#F7F7F7] text-[#181925]",
      badgeClass: "text-[#8574ff]",
      tagColor: "text-[#888888]",
      textColor: "text-[#181925]",
      descColor: "text-[#666666]",
      btnClass: "bg-black/5 hover:bg-black/10 text-carbon",
      mascot: null,
      mascotPos: "",
      textMaxW: "max-w-full",
      link: "/analytics",
      colSpan: "col-span-1 lg:col-span-3",
    },
    {
      id: "S/06",
      badge: "AVAILABLE NOW",
      title: "Smart AI assistant.",
      description:
        "Gain instant market clarity, strategic trade breakdowns, and real-time technical guidance whenever you need insight.",
      bgClass: "bg-[#F7F7F7] text-[#181925]",
      badgeClass: "text-[#8574ff] font-bold",
      tagColor: "text-[#888888]",
      textColor: "text-[#181925]",
      descColor: "text-[#666666]",
      btnClass: "bg-black/5 hover:bg-black/10 text-carbon",
      mascot: mascot6,
      mascotPos: "absolute right-2 sm:right-5 bottom-2 sm:bottom-4 w-32 sm:w-40 md:w-44",
      textMaxW: "max-w-[58%] sm:max-w-[65%]",
      link: "/trixie-explains",
      colSpan: "col-span-1 lg:col-span-5",
    },
  ];

  return (
    <section className="pt-32 sm:pt-48 pb-12 sm:pb-16 px-4 sm:px-8 max-w-[1280px] mx-auto font-openrunde">
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-14 sm:mb-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-carbon">
          Institutional Market Simulation Engine.
        </h2>
        <p className="text-carbon/75 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
          Execute spot orderbooks, simulate derivative positions, and analyze live liquidity flow with zero capital exposure.
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
            {/* Top Row: Index Tag (S/01) + Badge + Action Arrow Button */}
            <div className="flex items-center justify-between font-mono text-xs font-bold tracking-widest uppercase mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <span className={card.tagColor}>{card.id}</span>
                {card.badge && (
                  <span className={`text-[10px] tracking-wider uppercase font-semibold ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                )}
              </div>

              <Link
                to={card.link}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${card.btnClass}`}
              >
                <ArrowUpRight size={18} />
              </Link>
            </div>

            {/* Mascot Illustration */}
            {card.mascot && (
              <div className={`${card.mascotPos} pointer-events-none z-0`}>
                <img
                  src={card.mascot}
                  alt={card.title}
                  className="w-full max-h-36 sm:max-h-44 object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-108 select-none"
                />
              </div>
            )}

            {/* Bottom Title & Description */}
            <div className={`space-y-2.5 relative z-10 mt-auto ${card.textMaxW}`}>
              <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug ${card.textColor}`}>
                {card.title}
              </h3>

              <p className={`text-xs sm:text-sm leading-relaxed font-medium ${card.descColor}`}>
                {card.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
