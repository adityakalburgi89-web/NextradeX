import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, HelpCircle, Activity, DollarSign, Shield, Volume2, VolumeX } from "lucide-react";
import trixieAvatar from "../assets/Chatbot/trixie.png";
import trixieVideo from "../assets/Chatbot/Audio/Video/Cute_eye_blinking_animation_202605231326.mp4";
import { fetchAllPrices } from "../api";
import { formatCurrency, formatPercent } from "../lib/utils";

// Reduced motion hook
const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduced;
};

// Import audio assets for random chat replies
import bangSound from "../assets/Chatbot/Audio/bang-anime-wataten.mp3";
import cuteSound from "../assets/Chatbot/Audio/cute-anime-girl_OpABtug.mp3";
import giggleSound from "../assets/Chatbot/Audio/giggle_XuDecHl (1).mp3";
import ohCuteSound from "../assets/Chatbot/Audio/oh-cute-anime-girl-voice-sound-effect (1).mp3";

const replySounds = [bangSound, cuteSound, giggleSound, ohCuteSound];
const audioElements = replySounds.map((sound) => {
  const audio = new Audio(sound);
  audio.preload = "auto";
  return audio;
});

const playRandomSound = (isMuted) => {
  if (isMuted) return;
  try {
    const randomIndex = Math.floor(Math.random() * audioElements.length);
    const audio = audioElements[randomIndex];
    audio.currentTime = 0;
    audio.volume = 0.45; // comfortable volume
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Audio playback was blocked or failed:", err);
      });
    }
  } catch (err) {
    console.warn("Error playing audio:", err);
  }
};

// Rich Markdown Text Formatting Parser
function formatMessageText(text) {
  if (!text) return "";
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    let content = line;
    
    // Handle list item
    const isList = content.startsWith("• ") || content.startsWith("•");
    if (isList) {
      content = content.replace(/^•\s*/, "");
    }
    
    // Parse bold **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    // Parse inline code `code`
    const codeRegex = /`(.*?)`/g;
    
    let parts = [content];
    
    // Process bold
    parts = parts.flatMap(part => {
      if (typeof part !== 'string') return part;
      const bits = [];
      let lastIndex = 0;
      boldRegex.lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          bits.push(part.substring(lastIndex, match.index));
        }
        bits.push(<strong key={match.index} className="text-primary font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < part.length) {
        bits.push(part.substring(lastIndex));
      }
      return bits;
    });

    // Process inline code
    parts = parts.flatMap((part, pIdx) => {
      if (typeof part !== 'string') return part;
      const bits = [];
      let lastIndex = 0;
      codeRegex.lastIndex = 0;
      let match;
      while ((match = codeRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          bits.push(part.substring(lastIndex, match.index));
        }
        bits.push(
          <code key={match.index} className="bg-background px-1.5 py-0.5 rounded font-mono text-[10px] text-primary font-semibold border border-transparent mx-0.5">
            {match[1]}
          </code>
        );
        lastIndex = codeRegex.lastIndex;
      }
      if (lastIndex < part.length) {
        bits.push(part.substring(lastIndex));
      }
      return bits;
    });

    if (isList) {
      return (
        <div key={idx} className="flex items-start gap-1.5 my-1 pl-2">
          <span className="text-primary mt-1.5 flex-shrink-0 size-1.5 rounded-full bg-primary" />
          <span className="text-foreground">{parts}</span>
        </div>
      );
    }

    return <p key={idx} className={line.trim() === "" ? "h-2" : "my-0.5 text-foreground"}>{parts}</p>;
  });
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  // Persistent mute state
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem("trixie_chatbot_muted") === "true");

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "trixie",
      text: "Hi there! I'm Trixie, your official NexTradeX simulated trading virtual copilot. \n\nI can fetch live simulated prices, verify virtual reserves, and help you navigate our spot, futures, and options terminals. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem("trixie_chatbot_muted", String(next));
      return next;
    });
  };

  const handleVideoEnded = () => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch((err) => {
          console.warn("Video replay failed:", err);
        });
      } else {
        videoRef.current.currentTime = 0;
        videoRef.current.pause();
      }
    }
  };

  useEffect(() => {
    if (!isOpen && isHovered && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Video play failed on hover/mount:", err);
      });
    }
  }, [isOpen, isHovered]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleQuickAction = (actionText, actionQuery) => {
    submitQuery(actionText, actionQuery);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    submitQuery(inputVal, inputVal);
    setInputVal("");
  };

  const submitQuery = async (displayText, queryText) => {
    // Add user message
    const userMsg = {
      id: Math.random().toString(),
      sender: "user",
      text: displayText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);

    // Set typing indicator
    setIsTyping(true);

    // Simulate response delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let reply = "";
    const cleanQuery = queryText.toLowerCase().trim();

    try {
      if (cleanQuery.includes("price") || cleanQuery.includes("btc") || cleanQuery.includes("eth") || cleanQuery.includes("sol") || cleanQuery.includes("ltc") || cleanQuery.includes("link") || cleanQuery.includes("market") || cleanQuery.includes("rate")) {
        const response = await fetchAllPrices();
        const coins = response?.data || [];
        if (coins.length > 0) {
          reply = "**Live Simulated Prices**:\n\n";
          coins.forEach((coin) => {
            const isUp = Number(coin.percentChange24h) >= 0;
            const trend = isUp ? "+" : "";
            reply += `• **${coin.symbol}**: \`${formatCurrency(coin.currentPrice)}\`  (${trend}${formatPercent(coin.percentChange24h)})\n`;
          });
          reply += "\n*Note: These are mock prices streaming from the simulated backend engine.*";
        } else {
          reply = "I tried to query the price server, but it seems to be updating. Please try checking prices again in a few seconds!";
        }
      } else if (cleanQuery.includes("reserve") || cleanQuery.includes("safu") || cleanQuery.includes("fund") || cleanQuery.includes("backing") || cleanQuery.includes("proof")) {
        reply = "**Proof of Reserves (SAFU)**\n\nNexTradeX operates strictly as a virtual trading simulation. All paper balances ($1.24B mock assets allocated) are backed **100% 1:1 on our simulated ledgers**.\n\nAll funds are locked in centralized mock storage vaults with absolute tick execution guarantees! Your simulation is fully secure.";
      } else if (cleanQuery.includes("fee") || cleanQuery.includes("cost") || cleanQuery.includes("slippage") || cleanQuery.includes("spread")) {
        reply = "**Trading Fees & Slippage**\n\nGood news! NexTradeX features **0% simulated trading execution fees** across all products:\n\n• **Spot**: 0% fees, instant depth routing.\n• **Futures**: 0% maker/taker fees, full margin offset benefits.\n• **Options**: 0% contract expiry settlement charges.\n\nExperience high-frequency paper trading without standard overhead fees!";
      } else if (cleanQuery.includes("option") || cleanQuery.includes("future") || cleanQuery.includes("spot") || cleanQuery.includes("terminal") || cleanQuery.includes("trade")) {
        reply = "**Supported Simulated Terminals**:\n\n1. **Spot Trading** - Practice routing immediate mock orders against simulated order books.\n2. **Futures Trading** - Take leveraged synthetic positions with full cross/isolated margin rules.\n3. **Options Trading** - Build complex options combinations with our interactive options chain editor.";
      } else if (cleanQuery.includes("who") || cleanQuery.includes("name") || cleanQuery.includes("trixie") || cleanQuery.includes("creator")) {
        reply = "I'm **Trixie**! Your official NexTradeX paper-trading virtual companion.\n\nI was created by the NexTradeX engineering team to stream real-time price feeds, explain trading terminal mechanics, and assist simulated users.";
      } else if (cleanQuery.includes("hello") || cleanQuery.includes("hi") || cleanQuery.includes("hey") || cleanQuery.includes("greetings")) {
        reply = "Hello! Great to see you in the terminal. How can I help you trade, chart, or inspect our mock ledger reserves?";
      } else {
        reply = "I'm not fully sure how to answer that specific query. However, I can help you with:\n\n• **Simulated Live Prices**: Type 'price'\n• **Reserves Status**: Type 'safu' or 'reserves'\n• **Execution Fees**: Type 'fees'\n• **Trading Terminals**: Type 'options' or 'futures'\n\nWhat would you like to explore?";
      }
    } catch (err) {
      reply = "Oops! I encountered a small error communicating with the price engine. Let's try again in a moment.";
    }

    const trixieMsg = {
      id: Math.random().toString(),
      sender: "trixie",
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, trixieMsg]);
    setIsTyping(false);
    playRandomSound(isMuted);
  };

  return (
    <>
      {/* Floating Chat Trigger Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        
        {/* Glow backdrop ring (Antigravity vibe) */}
        {!isOpen && (
          <div className={`absolute inset-[-4px] rounded-full bg-primary/10 blur-[8px] ${prefersReducedMotion ? '' : 'animate-pulse'} pointer-events-none`} aria-hidden="true" />
        )}

        {/* Tooltip speech bubble */}
        {!isOpen && (
          <div
            className={`absolute bottom-24 right-2 glass-panel text-foreground border border-transparent px-3.5 py-2 rounded-xl text-xs font-semibold shadow-elevation-md transition-all duration-300 pointer-events-none whitespace-nowrap flex items-center gap-1.5 ${
              isHovered
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-2 scale-95"
            }`}
            aria-hidden="true"
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-trading-up ${prefersReducedMotion ? '' : 'animate-pulse'}`}></span>
            <span>Chat with Trixie!</span>
            <div className="absolute bottom-[-5px] right-8 w-2 h-2 glass-panel border-r border-b border-transparent transform rotate-45"></div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => {
            setIsHovered(true);
            if (videoRef.current) {
              videoRef.current.play().catch((err) => {
                console.warn("Video play failed on hover:", err);
              });
            }
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
          className={`size-20 rounded-full flex items-center justify-center bg-primary hover:bg-primary-active text-on-primary transition-all duration-300 shadow-glow-primary hover:shadow-glow-primary-hover hover:scale-110 active:scale-95 border-2 border-background focus:outline-none relative`}
        >
          {isOpen ? (
            <X size={32} className={prefersReducedMotion ? 'text-foreground' : 'animate-scale-in text-foreground'} aria-hidden="true" />
          ) : (
            <div className="relative size-full rounded-full overflow-hidden flex items-center justify-center p-1 border border-primary/30">
              <video
                ref={videoRef}
                src={trixieVideo}
                muted
                playsInline
                onEnded={handleVideoEnded}
                className="size-full object-cover rounded-full"
              />
            </div>
          )}
        </button>
      </div>

      {/* Sleek Glassmorphic Chat Panel Card */}
      {isOpen && (
        <div 
          role="dialog" 
          aria-label="Trixie chatbot" 
          aria-modal="false"
          className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[520px] z-50 flex flex-col glass-panel rounded-2xl shadow-elevation-lg overflow-hidden ${prefersReducedMotion ? '' : 'animate-fade-in-fast'} font-sans select-text border border-transparent`}>
        
          
          {/* Header */}
          <div className="bg-background/40 border-b border-transparent px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center relative overflow-hidden">
                <video
                  src={trixieVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-heading text-xs font-bold text-foreground flex items-center gap-1.5">
                  Trixie <span className="text-[9px] font-bold bg-primary/15 text-primary px-1 rounded uppercase font-mono">Copilot</span>
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`${prefersReducedMotion ? '' : 'animate-ping'} absolute inline-flex h-full w-full rounded-full bg-trading-up opacity-75`}></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-trading-up"></span>
                  </span>
                  <span className="text-[9px] text-muted font-mono uppercase">Online & Ready</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center">
              {/* Volume Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded hover:bg-background transition-colors text-muted hover:text-foreground mr-1.5"
                title={isMuted ? "Unmute Voice Replies" : "Mute Voice Replies"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded hover:bg-background transition-colors text-muted hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/15 flex flex-col scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                  }`}
              >
                {msg.sender === "trixie" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5 shadow-sm">
                    <img src={trixieAvatar} alt="Trixie" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs font-sans leading-relaxed whitespace-pre-wrap shadow-elevation-sm ${msg.sender === "user"
                      ? "bg-gradient-to-r from-primary to-primary-active text-on-primary font-bold rounded-tr-sm hover:brightness-105 transition-all"
                      : "bg-background backdrop-blur-md border border-transparent text-foreground rounded-tl-sm"
                      }`}
                  >
                    {msg.sender === "trixie" ? formatMessageText(msg.text) : msg.text}
                  </div>
                  <span className={`text-[8px] text-muted font-mono ${msg.sender === "user" ? "self-end" : "self-start pl-1"
                    }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Pulsing Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[80%] self-start">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                  <img src={trixieAvatar} alt="Trixie" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="rounded-2xl px-4 py-3 bg-background backdrop-blur-md border border-transparent rounded-tl-sm flex items-center gap-1.5 h-[34px] shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Panel */}
          <div className="px-4 py-2.5 border-t border-transparent bg-background/25 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
            <button
              type="button"
              onClick={() => handleQuickAction("Check Prices", "price")}
              className="px-3 py-1.5 text-[9px] font-mono rounded-full border border-transparent bg-background/[0.02] backdrop-blur-md text-muted hover:text-primary hover:border-primary/45 hover:bg-primary/5 transition-all font-bold cursor-pointer shadow-sm"
            >
              Live Prices
            </button>
            <button
              type="button"
              onClick={() => handleQuickAction("Verify Safu", "safu")}
              className="px-3 py-1.5 text-[9px] font-mono rounded-full border border-transparent bg-background/[0.02] backdrop-blur-md text-muted hover:text-primary hover:border-primary/45 hover:bg-primary/5 transition-all font-bold cursor-pointer shadow-sm"
            >
              Reserves SAFU
            </button>
            <button
              type="button"
              onClick={() => handleQuickAction("Cost and Fees?", "fees")}
              className="px-3 py-1.5 text-[9px] font-mono rounded-full border border-transparent bg-background/[0.02] backdrop-blur-md text-muted hover:text-primary hover:border-primary/45 hover:bg-primary/5 transition-all font-bold cursor-pointer shadow-sm"
            >
              Spot/Futures Fees
            </button>
          </div>

          {/* Input Chat Footer */}
          <form onSubmit={handleSend} className="p-3 border-t border-transparent flex gap-2 bg-background/35 backdrop-blur-md">
            <input
              type="text"
              placeholder="Ask Trixie..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-4 py-2.5 h-10 bg-background/65 border border-transparent rounded-xl text-xs font-mono text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary/60 transition-all shadow-inner"
            />
            <button
              type="submit"
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-active text-on-primary transition-all duration-300 shadow-glow-primary hover:scale-105 active:scale-95 focus:outline-none"
            >
              <Send size={14} className="text-foreground" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
