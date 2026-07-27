const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class", "class"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-sky-tint)",
        surface: "var(--color-bone-white)",
        "surface-elevated": "var(--color-paper-white)",
        "surface-glass": "rgba(235, 245, 255, 0.85)",
        foreground: "var(--color-ink)",
        muted: "var(--color-fog)",
        border: "transparent",
        
        /* Geniestudio Tokens */
        "sky-tint": "#ebf5ff",
        "paper-white": "#ffffff",
        "bone-white": "#fafdff",
        "mist-gray": "#f6f7f8",
        ink: "#0a0d12",
        charcoal: "#181d27",
        graphite: "#535862",
        fog: "#93979f",
        "slate-shadow": "#3b3d41",
        "iris-blue": "#0069e0",
        "sky-blue": "#0099ff",
        "lavender-wash": "#f1e6ff",
        "mint-wash": "#d3f6e3",
        "powder-blue": "#cce7ff",
        "solar-gradient": "#fff2be",
        "violet-gradient": "#e4ccff",
        "aqua-gradient": "#c2e9ff",
        "peach-gradient": "#ffd1b8",
        
        primary: "#181d27",
        secondary: "#0069e0",
        "trading-up": "#13A978",
        "trading-down": "#E05263",
      },
      fontFamily: {
        aeonik: [
          '"Inter"',
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: [
          '"Inter"',
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        heading: [
          '"Inter"',
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        geist: [
          '"Geist"',
          '"Inter"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        body: [
          '"Geist"',
          '"Inter"',
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      boxShadow: {
        "genie-cta": "0 1px 2px rgba(10, 13, 18, 0.8), 0 0 0 1px #0a0d12",
        "genie-lg": "rgba(4, 69, 144, 0.08) 0px 14px 20px 4px",
        "genie-subtle": "rgba(10, 13, 18, 0.06) 0px 4px 12px 0px",
        neo: "0 1px 2px rgba(10, 13, 18, 0.8), 0 0 0 1px #0a0d12",
        "neo-hover": "rgba(4, 69, 144, 0.08) 0px 14px 20px 4px",
      },
      borderRadius: {
        tags: "9999px",
        cards: "32px",
        images: "24px",
        inputs: "16px",
        buttons: "32px",
        cardsSmall: "16px",
        buttonsPill: "9999px",
        "3xl": "32px",
        pill: "9999px",
      },
      spacing: {
        8: "8px",
        16: "16px",
        24: "24px",
        32: "32px",
        40: "40px",
        48: "48px",
        56: "56px",
        64: "64px",
        80: "80px",
        88: "88px",
        120: "120px",
        160: "160px",
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("light", ".light &");
    }),
  ],
};
