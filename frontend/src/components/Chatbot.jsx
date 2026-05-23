import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, HelpCircle, Activity, DollarSign, Shield } from "lucide-react";
import trixieAvatar from "../assets/Chatbot/trixie.png";
import trixieVideo from "../assets/Chatbot/Audio/Video/Cute_eye_blinking_animation_202605231326.mp4";
import { fetchAllPrices } from "../api";
import { formatCurrency, formatPercent } from "../lib/utils";

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

const playRandomSound = () => {
  try {
    const randomIndex = Math.floor(Math.random() * audioElements.length);
    const audio = audioElements[randomIndex];
    audio.currentTime = 0;
    audio.volume = 1.0;
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

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
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
    playRandomSound();
  };

  return (
    <>
      {/* Floating Chat Trigger Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`size-20 rounded-full flex items-center justify-center bg-primary hover:bg-primary-active text-on-primary transition-all duration-300 shadow-glow-primary hover:scale-105 active:scale-95 border-2 border-background focus:outline-none relative`}
        >
          {isOpen ? (
            <X size={32} className="animate-scale-in text-ink" />
          ) : (
            <div className="relative size-full rounded-full overflow-hidden flex items-center justify-center p-1.5">
              <video
                src={trixieVideo}
                autoPlay
                loop
                muted
                playsInline
                className="size-full object-cover rounded-full"
              />
            </div>
          )}
        </button>
      </div>

      {/* Sleek Chat Panel Card */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] z-50 flex flex-col bg-surface-card-dark rounded-2xl shadow-elevation-lg overflow-hidden border border-hairline-on-dark animate-fade-in-fast font-sans select-text">
          {/* Header */}
          <div className="bg-canvas-dark border-b border-hairline-on-dark px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center relative overflow-hidden">
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
                <h4 className="font-heading text-xs font-bold text-white flex items-center gap-1.5">
                  Trixie <span className="text-[10px] font-normal text-trading-up font-mono">Copilot</span>
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-muted">
                  <span>Online & ready</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-white/5 transition-colors text-muted hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-canvas-dark/20 flex flex-col scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                  }`}
              >
                {msg.sender === "trixie" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5">
                    <img src={trixieAvatar} alt="Trixie" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs font-sans leading-relaxed whitespace-pre-wrap ${msg.sender === "user"
                      ? "bg-primary text-on-primary font-semibold rounded-tr-sm"
                      : "bg-surface-elevated-dark border border-hairline-on-dark text-foreground rounded-tl-sm"
                      }`}
                  >
                    {msg.text}
                  </div>
                  <span className={`text-[9px] text-muted font-mono tracking-wide ${msg.sender === "user" ? "self-end" : "self-start pl-1"
                    }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Pulsing Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[80%] self-start">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src={trixieAvatar} alt="Trixie" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="rounded-2xl px-4 py-3 bg-surface-elevated-dark border border-hairline-on-dark rounded-tl-sm flex items-center gap-1.5 h-[34px]">
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
          <div className="px-4 py-2 border-t border-hairline-on-dark bg-canvas-dark/30 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
            <button
              onClick={() => handleQuickAction("Check Prices", "price")}
              className="px-2.5 py-1 text-[10px] font-mono rounded-full border border-hairline-on-dark bg-surface-card-dark text-muted hover:text-primary hover:border-primary/30 transition-all font-semibold"
            >
              Live Prices
            </button>
            <button
              onClick={() => handleQuickAction("Verify Safu", "safu")}
              className="px-2.5 py-1 text-[10px] font-mono rounded-full border border-hairline-on-dark bg-surface-card-dark text-muted hover:text-primary hover:border-primary/30 transition-all font-semibold"
            >
              Reserves SAFU
            </button>
            <button
              onClick={() => handleQuickAction("Cost and Fees?", "fees")}
              className="px-2.5 py-1 text-[10px] font-mono rounded-full border border-hairline-on-dark bg-surface-card-dark text-muted hover:text-primary hover:border-primary/30 transition-all font-semibold"
            >
              Spot/Futures Fees
            </button>
          </div>

          {/* Input Chat Footer */}
          <form onSubmit={handleSend} className="p-3 border-t border-hairline-on-dark flex gap-2 bg-canvas-dark/40">
            <input
              type="text"
              placeholder="Ask Trixie..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-4 py-2.5 h-10 bg-[#15191e] border border-hairline-on-dark rounded-lg text-xs font-mono text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-all"
            />
            <button
              type="submit"
              className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary hover:bg-primary-active text-on-primary transition-colors focus:outline-none shadow-glow-primary active:scale-95"
            >
              <Send size={14} className="text-ink" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
