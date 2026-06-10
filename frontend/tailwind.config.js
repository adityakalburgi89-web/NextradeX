const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: ['class', "class"],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			surface: 'var(--surface)',
  			'surface-elevated': 'var(--surface-elevated)',
  			'surface-glass': 'var(--surface-glass)',
  			foreground: 'var(--foreground)',
  			muted: 'var(--muted)',
  			border: 'var(--border)',
  			primary: '#fcd535',
  			'primary-active': '#f0b90b',
  			'primary-disabled': '#3a3a1f',
  			ink: '#181a20',
  			body: '#eaecef',
  			'body-on-light': '#181a20',
  			'muted-strong': '#929aa5',
  			'hairline-on-light': '#eaecef',
  			'hairline-on-dark': '#2b3139',
  			'border-strong': '#cdd1d6',
  			'canvas-light': '#ffffff',
  			'canvas-dark': '#0b0e11',
  			'surface-card-dark': '#1e2329',
  			'surface-elevated-dark': '#2b3139',
  			'surface-soft-light': '#fafafa',
  			'surface-strong-light': '#f5f5f5',
  			'on-primary': '#181a20',
  			'on-dark': '#ffffff',
  			'trading-up': '#0ecb81',
  			'trading-down': '#f6465d',
  			'accent-turquoise': '#2dbdb6',
  			info: '#3b82f6',
  			'info-ring': '#3b82f6',
  			'accent-green': '#0ecb81',
  			'accent-red': '#f6465d'
  		},
  		fontFamily: {
  			heading: [
  				'BinanceNova',
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'sans-serif'
  			],
  			body: [
  				'BinanceNova',
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'sans-serif'
  			],
  			mono: [
  				'BinancePlex',
  				'IBM Plex Sans"',
  				'JetBrains Mono"',
  				'monospace'
  			]
  		},
  		boxShadow: {
  			'glow-primary': '0 0 20px -5px rgba(252, 213, 53, 0.4)',
  			'glow-primary-hover': '0 0 30px -5px rgba(240, 185, 11, 0.5)',
  			'glow-soft': '0 0 40px -10px rgba(252, 213, 53, 0.1)',
  			'card-hover': '0 0 30px -10px rgba(252, 213, 53, 0.15)',
  			'card-elevation': '0 0 50px -10px rgba(252, 213, 53, 0.08)',
  			'input-focus': '0 0 0 2px rgba(59, 130, 246, 0.5)',
  			'elevation-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.05)',
  			'elevation-md': '0 8px 24px -8px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255, 255, 255, 0.05)',
  			'elevation-lg': '0 16px 48px -12px rgba(0, 0, 0, 0.7), 0 0 1px rgba(255, 255, 255, 0.05)',
  			'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
  		},
  		borderRadius: {
  			xs: '2px',
  			sm: '4px',
  			md: '6px',
  			lg: '8px',
  			xl: '12px',
  			pill: '9999px',
  			full: '9999px'
  		},
  		spacing: {
  			xxs: '4px',
  			xs: '8px',
  			sm: '12px',
  			md: '16px',
  			lg: '24px',
  			xl: '32px',
  			xxl: '48px',
  			section: '80px'
  		},
  		backdropBlur: {
  			xs: '2px',
  			'2xl': '40px',
  			'3xl': '64px'
  		},
  		animation: {
  			float: 'float 8s ease-in-out infinite',
  			'float-slow': 'float 12s ease-in-out infinite',
  			'spin-slow': 'spin 10s linear infinite',
  			'spin-reverse-slow': 'spin 15s linear infinite reverse',
  			'fade-in': 'fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'fade-in-fast': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
  			'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  			'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  			'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  			shimmer: 'shimmer 2s linear infinite',
  			'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
  			drift: 'drift 20s ease-in-out infinite',
  			'gradient-shift': 'gradientShift 6s ease-in-out infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		keyframes: {
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-20px)'
  				}
  			},
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideDown: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			},
  			pulseGlow: {
  				'0%, 100%': {
  					opacity: '0.4'
  				},
  				'50%': {
  					opacity: '0.8'
  				}
  			},
  			drift: {
  				'0%, 100%': {
  					transform: 'translate(0, 0)'
  				},
  				'25%': {
  					transform: 'translate(30px, -20px)'
  				},
  				'50%': {
  					transform: 'translate(-20px, 15px)'
  				},
  				'75%': {
  					transform: 'translate(15px, 25px)'
  				}
  			},
  			gradientShift: {
  				'0%, 100%': {
  					backgroundPosition: '0% 50%'
  				},
  				'50%': {
  					backgroundPosition: '100% 50%'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		transitionTimingFunction: {
  			'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  			smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  			spring: 'cubic-bezier(0.16, 1, 0.3, 1)'
  		}
  	}
  },
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('light', '.light &');
    }),
  ],
}
