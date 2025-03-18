module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0078D4", // Blue - Primary buttons and highlights
          approved: "#28A745", // Green - Approved statuses
          submitted: "#FFC107", // Yellow - Submitted
          notApproved: "#D13438", // Red - Not Approved
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}; 