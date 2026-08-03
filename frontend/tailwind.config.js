const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class", "class"],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        surface: "#ffffff",
        "surface-elevated": "#ffffff",
        "surface-linen": "#fafafa",
        "surface-mist": "#f5f5f5",
        foreground: "#181925",
        muted: "#999999",
        border: "#e8e8e8",

        /* Visitors — White Engineering Blueprint Color Tokens */
        carbon: "#181925",
        "paper-white": "#ffffff",
        linen: "#fafafa",
        mist: "#f5f5f5",
        fog: "#e8e8e8",
        ash: "#999999",
        graphite: "#666666",
        lavender: "#918df6",
        iris: "#9580ff",
        mint: "#33c758",
        "mint-wash": "#def6e4",
        amber: "#ffa600",
        sky: "#2c78fc",
        magenta: "#d6409f",
        ember: "#ff3e00",

        primary: "#918df6",
        secondary: "#9580ff",
        "trading-up": "#33c758",
        "trading-down": "#ff3e00",
      },
      fontFamily: {
        openrunde: ['OpenRunde', 'Inter', 'DM Sans', 'sans-serif'],
        display: ['OpenRunde', 'Inter', 'sans-serif'],
        heading: ['OpenRunde', 'Inter', 'sans-serif'],
        body: ['OpenRunde', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        subtle: "rgba(0, 0, 0, 0.08) 0px 1px 1px 1px, rgba(0, 0, 0, 0.06) 0px 0px 0px 0.5px",
        "subtle-2": "rgba(0, 0, 0, 0.08) 0px 1px 1px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px",
        "subtle-3": "rgba(0, 0, 0, 0.06) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 8px 16px 0px, rgba(0, 0, 0, 0.02) 0px 0px 0px 1px",
        "neo-sm": "rgba(0, 0, 0, 0.08) 0px 1px 1px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px",
        "neo-hover": "rgba(0, 0, 0, 0.06) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 8px 16px 0px",
      },
      borderRadius: {
        tags: "9999px",
        cards: "16px",
        images: "8px",
        inputs: "8px",
        tables: "24px",
        buttons: "9999px",
        pill: "9999px",
      },
      spacing: {
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        20: "20px",
        24: "24px",
        32: "32px",
        48: "48px",
        64: "64px",
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("light", ".light &");
    }),
  ],
};
