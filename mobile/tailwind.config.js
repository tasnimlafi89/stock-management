/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        base100: "#ECEFF4",
        base200: "#E5E9F0",
        base300: "#D8DEE9",
        baseContent: "#2E3440",
        primary: "#5E81AC",
        primaryContent: "#ECEFF4",
        secondary: "#B48EAD",
        accent: "#8FBCBB",
        neutral: "#4C566A",
        success: "#A3BE8C",
        warning: "#EBCB8B",
        error: "#BF616A",
      },
    },
  },
  plugins: [],
}