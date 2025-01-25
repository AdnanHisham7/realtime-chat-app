/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ], 
  theme: {
    extend: {
      fontSize: {
        'xxs': '0.625rem', // 10px
      },
      colors: {
        customGreen: {
          DEFAULT: '#209039', // Base green color
        },
      },
    },
  },
  plugins: [],
}