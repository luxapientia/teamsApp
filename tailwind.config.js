/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'ms-blue': '#0078D4',
        'ms-blue-dark': '#106EBE',
        'ms-green': '#28A745',
        'ms-yellow': '#FFC107',
        'ms-red': '#D13438',
      },
      fontFamily: {
        'segoe': ['"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'ms': '0 1.6px 3.6px 0 rgba(0,0,0,0.132), 0 0.3px 0.9px 0 rgba(0,0,0,0.108)',
      },
    },
  },
  plugins: [],
}; 