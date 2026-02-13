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
        'body': ['Heebo', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // Dark Mode Color Palette - Automation/Tech Aesthetic
      colors: {
        'primary': {
          DEFAULT: '#00E676',
          light: '#00FF99',
          dark: '#00C853',
        },
        'midnight': '#111111',
        'off-white': '#1A1A1A',
        'text-heading': '#FFFFFF',
        'text-body': '#E0E0E0',
        'surface': '#1E1E1E',
        'border': '#424242',
      },
      // Big Tech Spacing
      spacing: {
        'section': '6rem', // py-24
        'section-lg': '8rem', // py-32
      },
      // Gradient for buttons and accents
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00E676 0%, #00C853 100%)',
        'gradient-primary-alt': 'linear-gradient(135deg, #00E676 0%, #69F0AE 100%)',
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


