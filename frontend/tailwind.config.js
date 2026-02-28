/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#030304',
        surface: '#0F1115',
        foreground: '#FFFFFF',
        muted: '#94A3B8',
        border: '#1E293B',
        primary: '#F7931A',
        secondary: '#EA580C',
        tertiary: '#FFD600',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px -5px rgba(234, 88, 12, 0.5)',
        'glow-primary-hover': '0 0 30px -5px rgba(247, 147, 26, 0.6)',
        'glow-tertiary': '0 0 20px rgba(255, 214, 0, 0.3)',
        'card-hover': '0 0 30px -10px rgba(247, 147, 26, 0.2)',
        'card-elevation': '0 0 50px -10px rgba(247, 147, 26, 0.1)',
        'input-focus': '0 10px 20px -10px rgba(247, 147, 26, 0.3)',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'spin-slow': 'spin 10s linear infinite',
        'spin-reverse-slow': 'spin 15s linear infinite reverse',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
