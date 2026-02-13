/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Typography - Heebo only
      fontFamily: {
        'heading': ['Heebo', 'system-ui', '-apple-system', 'sans-serif'],
        'body': ['Heebo', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // Neutral Monochrome + Neon Green (NO blue tint)
      colors: {
        // 1. The Brand Green (Neon/Matrix)
        'brand-green': {
          DEFAULT: '#00FF99',
          glow: '#00E676',
          dim: 'rgba(0, 255, 153, 0.1)',
        },
        'primary': {
          DEFAULT: '#00FF99',
          light: '#66FFB8',
          dark: '#00E676',
        },

        // 2. The Neutral Greys (NO BLUE TINT)
        'bg-main': '#0A0A0A',
        'bg-surface': '#1A1A1A',
        'bg-highlight': '#262626',
        'border-subtle': '#333333',
        'border-medium': '#4D4D4D',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0B0B0',

        // Legacy aliases (for Tailwind class compat)
        'midnight': '#0A0A0A',
        'off-white': '#1A1A1A',
        'text-heading': '#FFFFFF',
        'text-body': '#B0B0B0',
        'surface': '#262626',
        'border': '#333333',
      },
      // Spacing
      spacing: {
        'section': '6rem',
        'section-lg': '8rem',
      },
      // Gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00FF99 0%, #00E676 100%)',
        'gradient-primary-alt': 'linear-gradient(135deg, #00FF99 0%, #66FFB8 100%)',
      },
      // Animated Mesh Gradient
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
      },
      animation: {
        blob: 'blob 7s infinite',
      },
      animationDelay: {
        2000: '2000ms',
        4000: '4000ms',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
