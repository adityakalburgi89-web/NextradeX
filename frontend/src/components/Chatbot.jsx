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

// Import audio asset for chat reply sound
import popClickSound from "../assets/Chatbot/Audio/pop-click.wav";

const chatAudio = new Audio(popClickSound);
chatAudio.preload = "auto";

const playChatSound = () => {
  const isMuted = localStorage.getItem("trixie_chatbot_muted") === "true";
  if (isMuted) return;
  try {
    if (chatAudio.readyState > 0) {
      chatAudio.currentTime = 0;
    }
    chatAudio.volume = 0.45; // comfortable volume
    const playPromise = chatAudio.play();
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
        bits.push(<strong key={match.index} className="text-[#6C63FF] font-extrabold">{match[1]}</strong>);
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
          <code key={match.index} className="bg-[#E0E5EC] shadow-[inset_2px_2px_4px_rgb(163,177,198,0.5),inset_-2px_-2px_4px_rgba(255,255,255,0.5)] px-1.5 py-0.5 rounded font-mono text-[10px] text-[#6C63FF] font-semibold mx-0.5 border-none">
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
        <div key={idx} className="flex items-start gap-1.5 my-1.5 pl-2">
          <span className="mt-1.5 flex-shrink-0 size-1.5 rounded-full bg-[#6C63FF]" />
          <span className="text-[#3D4852] font-medium font-sans text-xs">{parts}</span>
        </div>
      );
    }

    return <p key={idx} className={line.trim() === "" ? "h-2" : "my-1 text-[#3D4852] font-medium font-sans text-xs"}>{parts}</p>;
  });
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  // Persistent mute state
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem("trixie_chatbot_muted") === "true");

  // Unlock audio once on the first user interaction (safari/chrome mobile support)
  useEffect(() => {
    const unlock = () => {
      const isMuted = localStorage.getItem("trixie_chatbot_muted") === "true";
      if (!isMuted) {
        try {
          chatAudio.muted = true;
          chatAudio.play()
            .then(() => {
              chatAudio.pause();
              chatAudio.muted = false;
            })
            .catch(() => {
              chatAudio.muted = false;
            });
        } catch (e) {
          // ignore
        }
      }
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock);
    window.addEventListener("touchstart", unlock);
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

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
  const lastSentTimeRef = useRef(0);

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
    // Rate limit check (1.5 seconds cooldown to prevent spamming)
    const now = Date.now();
    if (now - lastSentTimeRef.current < 1500) {
      const rateLimitMsg = {
        id: Math.random().toString(),
        sender: "trixie",
        text: "**Please slow down!** Wait a moment before sending another message.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, rateLimitMsg]);
      return;
    }
    lastSentTimeRef.current = now;

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
    playChatSound();
  };

  return (
    <>
      {/* Floating Chat Trigger Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        
        {/* Glow backdrop ring (Antigravity vibe) */}
        {!isOpen && (
          <div className={`absolute inset-[-4px] rounded-full bg-[#6C63FF]/10 blur-[8px] ${prefersReducedMotion ? '' : 'animate-pulse'} pointer-events-none`} aria-hidden="true" />
        )}

        {/* Tooltip speech bubble */}
        {!isOpen && (
          <div
            className={`absolute bottom-24 right-2 bg-[#E0E5EC] text-[#3D4852] px-3.5 py-2 rounded-xl text-xs font-semibold shadow-[5px_5px_10px_rgb(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] transition-all duration-300 pointer-events-none whitespace-nowrap flex items-center gap-1.5 ${
              isHovered
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-2 scale-95"
            }`}
            aria-hidden="true"
          >
            <span>Chat with Trixie!</span>
            <div className="absolute bottom-[-5px] right-8 w-2.5 h-2.5 bg-[#E0E5EC] border-r border-b border-transparent transform rotate-45"></div>
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
          className="size-20 rounded-full flex items-center justify-center bg-[#E0E5EC] text-[#3D4852] transition-all duration-300 shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgb(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] hover:scale-105 active:shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0E5EC] relative"
        >
          {isOpen ? (
            <X size={32} className={prefersReducedMotion ? 'text-[#3D4852]' : 'animate-scale-in text-[#3D4852]'} aria-hidden="true" />
          ) : (
            <div className="relative w-[70px] h-[70px] rounded-full overflow-hidden flex items-center justify-center p-1 bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgb(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)]">
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
          className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[520px] z-50 flex flex-col bg-[#E0E5EC] rounded-[32px] shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] overflow-hidden ${prefersReducedMotion ? '' : 'animate-fade-in-fast'} font-sans select-text`}>
        
          {/* Header */}
          <div className="bg-transparent px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] flex items-center justify-center p-0.5 overflow-hidden">
                <video
                  src={trixieVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-[42px] h-[42px] object-cover rounded-full"
                />
              </div>
              <div>
                <h4 className="font-heading text-xs font-extrabold text-[#3D4852] flex items-center gap-1.5">
                  Trixie <span className="text-[9px] font-bold bg-[#6C63FF]/15 text-[#6C63FF] px-1.5 py-0.5 rounded-full uppercase font-mono">Copilot</span>
                </h4>
              </div>
            </div>
            
            <div className="flex items-center">
              {/* Volume Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-xl bg-[#E0E5EC] text-[#6B7280] hover:text-[#3D4852] transition-all duration-300 shadow-[3px_3px_6px_rgb(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.5)] hover:shadow-inner mr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
                title={isMuted ? "Unmute Voice Replies" : "Mute Voice Replies"}
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-[#E0E5EC] text-[#6B7280] hover:text-[#3D4852] transition-all duration-300 shadow-[3px_3px_6px_rgb(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.5)] hover:shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF]"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 mx-4 my-1 space-y-4 bg-[#E0E5EC] shadow-[inset_5px_5px_10px_rgb(163,177,198,0.6),inset_-5px_-5px_10px_rgba(255,255,255,0.5)] rounded-[24px] flex flex-col scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                  }`}
              >
                {msg.sender === "trixie" && (
                  <div className="w-8 h-8 rounded-full bg-[#E0E5EC] shadow-[3px_3px_6px_rgb(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.5)] flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                    <img src={trixieAvatar} alt="Trixie" className="w-[26px] h-[26px] object-cover rounded-full" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs font-sans leading-relaxed whitespace-pre-wrap ${msg.sender === "user"
                      ? "bg-[#6C63FF] text-white font-bold rounded-tr-sm shadow-[4px_4px_8px_rgba(108,99,255,0.4)] hover:brightness-105 transition-all"
                      : "bg-[#E0E5EC] text-[#3D4852] rounded-tl-sm shadow-[3px_3px_6px_rgb(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.5)]"
                      }`}
                  >
                    {msg.sender === "trixie" ? formatMessageText(msg.text) : msg.text}
                  </div>
                  <span className={`text-[8px] text-[#6B7280] font-mono ${msg.sender === "user" ? "self-end" : "self-start pl-1"
                    }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Pulsing Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[80%] self-start">
                <div className="w-8 h-8 rounded-full bg-[#E0E5EC] shadow-[3px_3px_6px_rgb(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.5)] flex items-center justify-center overflow-hidden flex-shrink-0 mt-0.5">
                  <img src={trixieAvatar} alt="Trixie" className="w-[26px] h-[26px] object-cover rounded-full" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="rounded-2xl px-4 py-3 bg-[#E0E5EC] shadow-[3px_3px_6px_rgb(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.5)] rounded-tl-sm flex items-center gap-1.5 h-[34px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Panel */}
          <div className="px-6 py-2 flex gap-2.5 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth bg-transparent">
            <button
              type="button"
              disabled={isTyping}
              onClick={() => handleQuickAction("Check Prices", "price")}
              className="px-3 py-1.5 text-[9px] font-mono rounded-full bg-[#E0E5EC] text-[#3D4852] shadow-[3px_3px_6px_rgb(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.5)] hover:shadow-inner active:scale-95 transition-all duration-300 font-extrabold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Live Prices
            </button>
            <button
              type="button"
              disabled={isTyping}
              onClick={() => handleQuickAction("Verify Safu", "safu")}
              className="px-3 py-1.5 text-[9px] font-mono rounded-full bg-[#E0E5EC] text-[#3D4852] shadow-[3px_3px_6px_rgb(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.5)] hover:shadow-inner active:scale-95 transition-all duration-300 font-extrabold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reserves SAFU
            </button>
            <button
              type="button"
              disabled={isTyping}
              onClick={() => handleQuickAction("Cost and Fees?", "fees")}
              className="px-3 py-1.5 text-[9px] font-mono rounded-full bg-[#E0E5EC] text-[#3D4852] shadow-[3px_3px_6px_rgb(163,177,198,0.5),-3px_-3px_6px_rgba(255,255,255,0.5)] hover:shadow-inner active:scale-95 transition-all duration-300 font-extrabold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Spot/Futures Fees
            </button>
          </div>

          {/* Input Chat Footer */}
          <form onSubmit={handleSend} className="p-4 flex gap-3 bg-transparent items-center">
            <input
              type="text"
              placeholder={isTyping ? "Trixie is typing..." : "Ask Trixie..."}
              disabled={isTyping}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-4 py-2.5 h-11 bg-[#E0E5EC] text-xs font-mono text-[#3D4852] placeholder-[#6B7280]/60 rounded-2xl shadow-[inset_4px_4px_8px_rgb(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] focus:shadow-[inset_6px_6px_12px_rgb(163,177,198,0.7),inset_-6px_-6px_12px_rgba(255,255,255,0.6)] outline-none border-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0E5EC] disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isTyping || !inputVal.trim()}
              className="h-11 w-11 flex items-center justify-center rounded-2xl bg-[#6C63FF] text-white transition-all duration-300 shadow-[4px_4px_8px_rgba(108,99,255,0.4)] hover:translate-y-[-1px] active:translate-y-[0.5px] active:shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C63FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E0E5EC] disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <Send size={16} className="text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
