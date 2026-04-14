import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LayoutGrid, ArrowLeft } from 'lucide-react';

const NexTradeX404 = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 100, damping: 30 });
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const moveX = (clientX - window.innerWidth / 2) / 25;
    const moveY = (clientY - window.innerHeight / 2) / 25;
    x.set(moveX);
    y.set(moveY);
    setMousePos({ x: clientX, y: clientY });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-[#0b0f14] flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-[#ff7a00]/30"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150"></div>
        <div className="absolute inset-0" style={{ 
          backgroundImage: `linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}></div>
      </div>

      <motion.div style={{ x: springX, y: springY }} className="absolute inset-0 pointer-events-none">
        <FloatingSymbol icon="BTC" top="20%" left="15%" delay={0} />
        <FloatingSymbol icon="ETH" top="65%" left="80%" delay={1} />
        <FloatingSymbol icon="SOL" top="10%" left="70%" delay={2} />
        <FloatingLine top="40%" />
      </motion.div>

      <div 
        className="pointer-events-none absolute transition-opacity duration-500 rounded-full blur-[120px]"
        style={{
          left: mousePos.x - 150,
          top: mousePos.y - 150,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,122,0,0.15) 0%, transparent 70%)'
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-[#ff7a00] blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
          <motion.div 
            animate={{ rotateY: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 relative preserve-3d"
          >
            <div className="absolute inset-0 rounded-full border-2 border-[#ff7a00] shadow-[0_0_20px_#ff7a00] bg-[#0b0f14] flex items-center justify-center">
              <span className="text-[#ff7a00] font-bold text-3xl">N</span>
            </div>
          </motion.div>
        </div>

        <h1 className="relative text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter text-white">
          <span className="animate-pulse opacity-10 absolute -inset-1 blur-lg text-[#ff7a00]">404</span>
          <span className="glitch-text" data-text="404">404</span>
        </h1>

        <div className="space-y-4 max-w-md">
          <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
            Lost in the blockchain.
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed font-light">
            The transaction you are looking for has been pruned or never existed. 
            Redirecting to a secure node.
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-6 items-center">
          <button className="group relative px-8 py-4 bg-[#ff7a00] rounded-xl font-bold text-black overflow-hidden hover:scale-105 active:scale-95 transition-all">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-2">
               <LayoutGrid size={18} /> Return to Dashboard
            </span>
          </button>

          <a href="/" className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium border-b border-transparent group-hover:border-white transition-all">Go Home</span>
          </a>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-0 w-full flex justify-center gap-12 text-[10px] uppercase tracking-[0.2em] text-gray-600 font-mono">
        <div className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500 rounded-full animate-ping" /> Node Status: Active</div>
        <div>Lat: 12ms</div>
        <div>Uptime: 99.99%</div>
      </div>

      <style>{`
        .glitch-text {
          position: relative;
          animation: glitch 3s infinite;
        }
        @keyframes glitch {
          0% { text-shadow: 2px 0 red, -2px 0 blue; }
          2% { text-shadow: 5px 0 red, -5px 0 blue; }
          4% { text-shadow: -2px 0 red, 2px 0 blue; }
          100% { text-shadow: none; }
        }
        .preserve-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
};

const FloatingSymbol = ({ icon, top, left, delay }) => (
  <motion.div 
    animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
    transition={{ duration: 5, delay, repeat: Infinity }}
    className="absolute text-white font-mono text-xl font-bold opacity-20"
    style={{ top, left }}
  >
    {icon}
  </motion.div>
);

const FloatingLine = ({ top }) => (
  <div className="absolute w-full h-[1px] opacity-10 bg-gradient-to-r from-transparent via-[#7b61ff] to-transparent" style={{ top }}>
    <motion.div 
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="w-40 h-full bg-[#00f0ff] shadow-[0_0_15px_#00f0ff]"
    />
  </div>
);

export default NexTradeX404;