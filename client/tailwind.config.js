// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ], 
  darkMode: 'class', // Add this line
  theme: {
    extend: {
      fontSize: {
        'xxs': '0.625rem',
        '3xs': '0.525rem',
      },
      colors: {
        customGreen: {
          DEFAULT: '#209039',
        },
        customGray:{
          DEFAULT:'#171717'
        },
        lightGray:{
          DEFAULT:'#313131'
        },
        midGray:{
          DEFAULT:'#282828'
        },
        averageGray:{
          DEFAULT:'#202020'
        }
        // 282828, 202020
      },
    },
  },
  plugins: [],
}