import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5e72e4",
          dark: "#4a5ad9",
          light: "#7d8cee",
        },
        secondary: "#8898aa",
        accent: "#fb6340",
        success: "#2dce89",
        info: "#11cdef",
        warning: "#ffc107",
        error: "#f5365c",
        light: "#f5f7fa",
        dark: "#32325d",
        app: "#f5f7fa",
      },
      backgroundColor: {
        app: "#f5f7fa",
      },
      boxShadow: {
        app: "0 4px 12px rgba(0, 0, 0, 0.1)",
        'app-sm': "0 2px 4px rgba(0, 0, 0, 0.05)",
        'app-lg': "0 8px 16px rgba(0, 0, 0, 0.12)",
        'app-inner': "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        app: "10px",
        'app-sm': "5px",
        'app-lg': "15px",
        'app-full': "9999px",
      },
      spacing: {
        'app-xs': '0.25rem',
        'app-sm': '0.5rem',
        'app-md': '1rem',
        'app-lg': '1.5rem',
        'app-xl': '2rem',
      },
      fontSize: {
        'app-xs': ['0.75rem', { lineHeight: '1rem' }],
        'app-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'app-base': ['1rem', { lineHeight: '1.5rem' }],
        'app-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'app-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'app-2xl': ['1.5rem', { lineHeight: '2rem' }],
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease forwards",
        slideUp: "slideUp 0.5s ease forwards",
        pulse: "pulse 2s infinite",
        spin: "spin 1s linear infinite",
        bounce: "bounce 1s ease-in-out infinite",
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
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(-5%)" },
          "50%": { transform: "translateY(0)" },
        },
      },
      transitionTimingFunction: {
        app: "all 0.3s ease",
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
    },
  },
  plugins: [],
};

export default config; 