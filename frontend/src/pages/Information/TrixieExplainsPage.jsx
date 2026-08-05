import React, { useState, useEffect, useRef } from "react";
import { PageTransition } from "../../components/ui/PageTransition";
import { Play } from "lucide-react";
import { motion } from "motion/react";

// Platform Videos
import vidAboutCrypto from "../../assets/videos/Platfrom Video/AboutCrypto.mp4";
import vidCryptoTrading from "../../assets/videos/Platfrom Video/CryptoTrading.mp4";
import vidHowPriceWorks from "../../assets/videos/Platfrom Video/HowPriceWorks.mp4";
import vidHowToTrade from "../../assets/videos/Platfrom Video/HowToTrade.mp4";
import vidExplainer from "../../assets/videos/Platfrom Video/NexTradeX_explainer_video_animation_202606090201.mp4";
import vidRiskManagement from "../../assets/videos/Platfrom Video/RiskManagment.mp4";
import vidTraders from "../../assets/videos/Platfrom Video/Traders.mp4";
import vidTradingRisk from "../../assets/videos/Platfrom Video/TradingRisk.mp4";

// Framer Motion Animation Variants for a Pro UX Look
const fadeInUpSpring = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 55,
      damping: 14,
      mass: 0.9
    }
  }
};

export default function TrixieExplainsPage() {
  const [activeVideo, setActiveVideo] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setIsPlaying(shouldAutoplay);
  }, [activeVideo, shouldAutoplay]);

  // Reduced motion hook
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const platformVideos = [
    { src: vidExplainer, title: "NexTradeX Overview", desc: "A complete walkthrough of the NexTradeX simulated trading platform and its core features." },
    { src: vidAboutCrypto, title: "About Cryptocurrency", desc: "Understand what cryptocurrency is, how blockchain works, and why it matters for traders." },
    { src: vidCryptoTrading, title: "Crypto Trading Basics", desc: "Learn the fundamentals of buying, selling, and managing crypto positions on an exchange." },
    { src: vidHowPriceWorks, title: "How Price Works", desc: "Discover how supply and demand, order books, and market makers drive asset prices." },
    { src: vidHowToTrade, title: "How To Trade", desc: "Step-by-step guide to placing spot, margin, and futures orders on NexTradeX." },
    { src: vidRiskManagement, title: "Risk Management", desc: "Essential strategies for stop-losses, position sizing, and protecting your capital." },
    { src: vidTraders, title: "Meet The Traders", desc: "Explore different trader profiles — scalpers, swing traders, and long-term holders." },
    { src: vidTradingRisk, title: "Understanding Trading Risk", desc: "A deep dive into volatility, leverage risk, and how to trade responsibly." },
  ];

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-80px)] py-16 bg-background text-foreground animate-fadeIn">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <motion.div
            variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUpSpring}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <span className="font-mono text-xs text-primary uppercase mb-4 block font-semibold">Learn &amp; Explore</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">Trixie Explains</h1>
            <p className="text-muted text-sm md:text-base max-w-xl mx-auto font-sans">
              Your AI trading guide breaks down concepts, strategies, and platform features — one video at a time.
            </p>
          </motion.div>

          {/* Featured player + full sidebar */}
          <motion.div
            variants={prefersReducedMotion ? { hidden: { opacity: 0 }, visible: { opacity: 1 } } : fadeInUpSpring}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main player */}
            <div className="lg:col-span-2 bg-background border border-transparent/10 rounded-2xl overflow-hidden shadow-elevation-md">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <video
                  ref={videoRef}
                  key={platformVideos[activeVideo].src}
                  src={platformVideos[activeVideo].src}
                  controls
                  autoPlay={shouldAutoplay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  className="absolute inset-0 w-full h-full object-cover bg-black"
                />
                {!isPlaying && (
                  <div
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.play().catch((err) => console.error(err));
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/45 cursor-pointer group transition-all duration-300 z-10"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md border border-primary/40 flex items-center justify-center text-primary shadow-glow-primary group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
                      <Play size={28} className="text-primary fill-primary ml-1" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className="font-heading text-xl font-bold text-foreground mb-2">{platformVideos[activeVideo].title}</h2>
                <p className="text-muted text-sm font-sans leading-relaxed">{platformVideos[activeVideo].desc}</p>
              </div>
            </div>

            {/* Sidebar — all videos */}
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
              <h3 className="font-heading text-sm font-bold uppercase text-foreground mb-1 tracking-wider px-1">All Explainer Videos</h3>
              {platformVideos.map((v, idx) => {
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveVideo(idx);
                      setShouldAutoplay(true);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 group flex-shrink-0 ${
                      activeVideo === idx
                        ? "border-primary/60 bg-primary/10"
                        : "border-transparent bg-background/50 hover:bg-background-hover hover:border-primary/30"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        activeVideo === idx ? "bg-primary text-black" : "bg-background border border-transparent/10 group-hover:bg-primary/20"
                      } transition-colors`}
                    >
                      <Play size={16} className={activeVideo === idx ? "text-black fill-black" : "text-primary fill-primary"} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground font-heading truncate">{v.title}</p>
                      <p className="text-[10px] text-muted font-sans truncate mt-0.5">{v.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
