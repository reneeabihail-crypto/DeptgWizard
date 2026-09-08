/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          bg: '#0A0E14',
          panel: '#131722',
          elevated: '#1C2130',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(62, 214, 255, 0.08)',
        },
        cyan: {
          glow: '#3ED6FF',
          DEFAULT: '#3ED6FF',
          dim: '#238ca7',
        },
        amber: {
          glow: '#FFB454',
          DEFAULT: '#FFB454',
        },
        signal: {
          green: '#4ADE80',
          coral: '#FF6B6B',
        },
        telemetry: {
          text: '#E8EBF0',
          muted: '#8B93A7',
          dim: '#555E70',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(62, 214, 255, 0.25)',
        'cyan-sm': '0 0 10px rgba(62, 214, 255, 0.2)',
        'amber-glow': '0 0 20px rgba(255, 180, 84, 0.25)',
        'coral-glow': '0 0 20px rgba(255, 107, 107, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 6s linear infinite',
        'radar': 'radar 2s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
};
