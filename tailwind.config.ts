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
          DEFAULT: "#7163DE",
          dark: "#5B4FC5",
          light: "#9B90F2",
          50: "#F5F3FF",
          100: "#E9E4FF",
          200: "#D9D1FF",
          300: "#BEB4FF",
          400: "#9285F4",
          500: "#7163DE",
          600: "#5A4CC5",
          700: "#4A3BAF",
          800: "#3B2F8A",
          900: "#2C246B",
        },
        secondary: "#8898aa",
        accent: "#36D6AE",
        success: "#36D6AE",
        info: "#63C5FD",
        warning: "#FFBB38",
        error: "#FF6A7A",
        light: "#F8FAFC",
        dark: "#32325d",
        app: "#F8FAFC",
        category: {
          purple: "#7163DE",
          blue: "#63C5FD",
          green: "#36D6AE",
          red: "#FF6A7A",
          orange: "#FFBB38",
          pink: "#F178B6",
        },
      },
      backgroundColor: {
        app: "#F8FAFC",
      },
      boxShadow: {
        app: "0 8px 24px rgba(0, 0, 0, 0.05)",
        'app-sm': "0 4px 12px rgba(0, 0, 0, 0.03)",
        'app-lg': "0 16px 40px rgba(0, 0, 0, 0.08)",
        'app-inner': "inset 0 2px 4px rgba(0, 0, 0, 0.02)",
        'button': "0 4px 10px rgba(113, 99, 222, 0.25)",
        'card': "0 10px 25px rgba(0, 0, 0, 0.03)",
      },
      borderRadius: {
        app: "24px",
        'app-sm': "16px",
        'app-lg': "32px",
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
        'timer': ['2.5rem', { lineHeight: '2.5rem', fontWeight: '700' }],
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
        app: "cubic-bezier(0.4, 0, 0.2, 1)",
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