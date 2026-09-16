import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X, ArrowUpRight, ArrowDownRight, Layers } from "lucide-react";
import UniversalCoinIcon from "../lib/coinIcons";
import { getAuthToken } from "../api";

const CoinIcon = UniversalCoinIcon;

export default function OrderToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return undefined;

    // Connect to Spring Boot WebSocket STOMP endpoint
    const socketUrl = process.env.REACT_APP_API_BASE_URL
      ? `${process.env.REACT_APP_API_BASE_URL.replace(/\/$/, "")}/ws`
      : "http://localhost:8080/api/ws";

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      debug: () => {}, // silent
    });

    client.onConnect = () => {
      client.subscribe("/user/queue/orders", (message) => {
        try {
          const orderEvent = JSON.parse(message.body);
          addToast(orderEvent);
        } catch (e) {
          console.error("Error parsing STOMP order message", e);
        }
      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  const addToast = (event) => {
    const id = Date.now() + Math.random();
    const newToast = { id, event };
    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 max-w-sm w-full pointer-events-none font-openrunde">
      <AnimatePresence>
        {toasts.map(({ id, event }) => {
          const isBuy = event.side?.toUpperCase() === "BUY";
          const symbolBase = (event.symbol || "BTCUSDT").replace("USDT", "");
          const formattedQty = Number(event.quantity || 0).toLocaleString(undefined, { maximumFractionDigits: 6 });
          const formattedPrice = Number(event.price || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className="pointer-events-auto bg-white border border-[#e8e8e8] text-[#181925] rounded-[20px] p-4 shadow-[0_12px_36px_rgba(0,0,0,0.08)] relative overflow-hidden flex items-start gap-3.5 group font-openrunde"
            >
              {/* Top indicator bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isBuy ? "bg-[#33c758]" : "bg-[#ff3e00]"
                }`}
              />

              {/* Coin Icon */}
              <div className="relative mt-1 flex-shrink-0">
                <CoinIcon symbol={event.symbol || "BTCUSDT"} size="w-10 h-10" />
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold shadow-xs ${
                    isBuy ? "bg-[#33c758] text-white" : "bg-[#ff3e00] text-white"
                  }`}
                >
                  {isBuy ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-extrabold tracking-tight uppercase px-2 py-0.5 rounded-full ${
                      isBuy ? "bg-[#def6e4] text-[#33c758]" : "bg-[#fff0f0] text-[#ff3e00]"
                    }`}>
                      {event.orderType || "MARKET"} {event.side || (isBuy ? "BUY" : "SELL")}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#f5f5f5] text-[#181925]">
                      {symbolBase}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#999999] font-mono font-medium">
                    {new Date(event.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="text-sm font-bold text-[#181925] mt-1.5 flex items-baseline gap-1.5 tracking-[-0.32px]">
                  <span>{formattedQty} {symbolBase}</span>
                  <span className="text-xs text-[#666666] font-medium">@ ${formattedPrice}</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#33c758] mt-1">
                  <CheckCircle2 size={12} className="text-[#33c758]" />
                  <span>Real-time via LavinMQ Engine</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(id)}
                className="text-[#999999] hover:text-[#181925] transition-colors p-1 rounded-full hover:bg-[#f5f5f5] cursor-pointer"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
