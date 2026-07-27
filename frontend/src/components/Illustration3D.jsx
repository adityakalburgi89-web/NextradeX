import React from "react";

/**
 * NexTradeX 3D Illustrations Component
 * Render whimsical, soft, dimensional 3D objects with soft pastel washes
 * and iris-blue accent shapes on transparent background.
 */
export const Illustration3D = ({ type = "cloud", className = "", size = 120 }) => {
  switch (type) {
    case "hero-cloud":
      return (
        <div className={`relative inline-flex items-center justify-center animate-float-genie ${className}`}>
          <svg width={size * 1.5} height={size} viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#eaf4ff" />
                <stop offset="100%" stopColor="#cce7ff" />
              </linearGradient>
              <linearGradient id="irisAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="11.43%" stopColor="#479dff" />
                <stop offset="78.2%" stopColor="#0069e0" />
              </linearGradient>
              <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#044590" floodOpacity="0.08" />
              </filter>
            </defs>
            {/* Soft Cloud Base */}
            <g filter="url(#softShadow)">
              <path
                d="M70 160 C40 160 20 135 20 105 C20 75 45 55 75 55 C90 35 120 20 155 20 C200 20 235 50 245 85 C270 85 290 105 290 130 C290 155 270 160 245 160 Z"
                fill="url(#cloudGrad)"
              />
              <path
                d="M70 160 C40 160 20 135 20 105 C20 75 45 55 75 55 C90 35 120 20 155 20 C200 20 235 50 245 85 C270 85 290 105 290 130 C290 155 270 160 245 160 Z"
                fill="none"
                stroke="#ffffff"
                strokeWidth="4"
              />
            </g>
            {/* Iris Accent 3D Sphere */}
            <circle cx="230" cy="65" r="24" fill="url(#irisAccent)" filter="url(#softShadow)" />
            {/* Whimsical 3D Pastel Crayon / Spark */}
            <rect x="90" y="110" width="140" height="24" rx="12" fill="#ffd1b8" transform="rotate(-8 160 120)" />
            {/* Smiling Face Strokes */}
            <circle cx="120" cy="90" r="4" fill="#535862" />
            <circle cx="160" cy="90" r="4" fill="#535862" />
            <path d="M 130 105 Q 140 115 150 105" stroke="#535862" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      );

    case "crayon-smile":
      return (
        <div className={`relative inline-flex items-center justify-center animate-float-genie-delayed ${className}`}>
          <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="crayonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffd1b8" />
                <stop offset="100%" stopColor="#ffb088" />
              </linearGradient>
              <filter id="tileShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#044590" floodOpacity="0.06" />
              </filter>
            </defs>
            <g filter="url(#tileShadow)">
              <rect x="30" y="50" width="100" height="48" rx="24" fill="url(#crayonGrad)" />
              <path d="M 30 74 L 10 74 L 30 50 Z" fill="#0069e0" />
              <circle cx="65" cy="70" r="3.5" fill="#0a0d12" />
              <circle cx="95" cy="70" r="3.5" fill="#0a0d12" />
              <path d="M 72 82 Q 80 88 88 82" stroke="#0a0d12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          </svg>
        </div>
      );

    case "envelope-star":
      return (
        <div className={`relative inline-flex items-center justify-center animate-float-genie ${className}`}>
          <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="envGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f1e6ff" />
                <stop offset="100%" stopColor="#e4ccff" />
              </linearGradient>
            </defs>
            <rect x="25" y="40" width="110" height="80" rx="20" fill="url(#envGrad)" />
            <path d="M 30 45 L 80 85 L 130 45" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="120" cy="35" r="14" fill="#0069e0" />
          </svg>
        </div>
      );

    case "flower-smile":
    default:
      return (
        <div className={`relative inline-flex items-center justify-center animate-float-genie-delayed ${className}`}>
          <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80" cy="50" r="22" fill="#d3f6e3" />
            <circle cx="110" cy="80" r="22" fill="#d3f6e3" />
            <circle cx="80" cy="110" r="22" fill="#d3f6e3" />
            <circle cx="50" cy="80" r="22" fill="#d3f6e3" />
            <circle cx="80" cy="80" r="24" fill="#fff2be" />
            <circle cx="73" cy="76" r="3" fill="#0a0d12" />
            <circle cx="87" cy="76" r="3" fill="#0a0d12" />
            <path d="M 74 85 Q 80 90 86 85" stroke="#0a0d12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      );
  }
};

export default Illustration3D;
