import React, { useContext } from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from "lucide-react";
import { ToastContext } from "./ToastProvider";

const ICONS = {
  success: <CheckCircle size={16} className="text-accent-green flex-shrink-0" />,
  error: <AlertOctagon size={16} className="text-trading-down flex-shrink-0" />,
  info: <Info size={16} className="text-info flex-shrink-0" />,
  warning: <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0" />,
};

const BORDER_COLORS = {
  success: "border-l-accent-green",
  error: "border-l-trading-down",
  info: "border-l-info",
  warning: "border-l-yellow-500",
};

const ToastContainer = () => {
  const { toasts, removeToast } = useContext(ToastContext);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 bg-surface border border-transparent border-l-4 ${BORDER_COLORS[t.type] || "border-l-muted"} rounded-xl px-4 py-3 min-w-[280px] max-w-sm shadow-elevation-lg`}
        >
          <div className="mt-0.5">{ICONS[t.type]}</div>
          <p className="text-sm text-foreground font-body flex-1">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="text-muted hover:text-foreground transition-colors focus-ring rounded p-0.5 flex-shrink-0"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;