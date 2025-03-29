import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5e72e4",
          dark: "#4a5ad9",
        },
        secondary: "#8898aa",
        accent: "#fb6340",
        success: "#2dce89",
        info: "#11cdef",
        light: "#f5f7fa",
        dark: "#32325d",
        app: "#f5f7fa",
      },
      backgroundColor: {
        app: "#f5f7fa",
      },
      boxShadow: {
        app: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        app: "10px",
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease forwards",
        slideUp: "slideUp 0.5s ease forwards",
        pulse: "pulse 2s infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        pulse: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
      transitionTimingFunction: {
        app: "all 0.3s ease",
      },
    },
  },
  plugins: [],
};

export default config; 