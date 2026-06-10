import React from "react";
import { cn } from "../lib/utils";

export default function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon ? (
        <div className="mb-4 text-muted">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      ) : (
        <div className="w-12 h-12 mb-4 rounded-full bg-white/[0.04]" />
      )}
      <h3 className="text-lg font-semibold text-white font-heading mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm mb-6 font-body">{description}</p>
      )}
      {action && actionLabel && (
        <button
          onClick={action}
          className="mt-2 px-5 py-2 text-xs font-bold font-mono uppercase rounded-lg bg-primary text-on-primary shadow-glow-primary hover:opacity-90 transition-opacity"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}