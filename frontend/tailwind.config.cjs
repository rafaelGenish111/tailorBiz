/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  corePlugins: {
    // חשוב: לא להחיל Tailwind preflight על כל האתר (כבר יש לנו MUI + CSS גלובלי)
    preflight: false,
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};


