/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // Apple/Big Tech Typography
      fontFamily: {
        'heading': ['Heebo', 'system-ui', '-apple-system', 'sans-serif'],
        'body': ['Assistant', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // Light Mode Color Palette - Premium Apple Aesthetic
      colors: {
        'primary': {
          DEFAULT: '#0071E3', // Royal Blue - Apple's actionable blue
          light: '#0077ED',
          dark: '#0066CC',
        },
        'midnight': '#050507',
        'off-white': '#F5F5F7',
        'text-heading': '#1D1D1F',
        'text-body': '#86868B',
      },
      // Big Tech Spacing
      spacing: {
        'section': '6rem', // py-24
        'section-lg': '8rem', // py-32
      },
      // Gradient for buttons and accents
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-primary-alt': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      // Animated Mesh Gradient - Aurora effect
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
    // חשוב: לא להחיל Tailwind preflight על כל האתר (כבר יש לנו MUI + CSS גלובלי)
    preflight: false,
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};


