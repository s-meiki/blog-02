import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F2F4F6",
          100: "#E1E5EA",
          200: "#BEC6D0",
          300: "#99A6B8",
          400: "#73859E",
          500: "#4B647F",
          600: "#364C63",
          700: "#283949",
          800: "#1A2631",
          900: "#0E141C",
        },
        neutral: {
          50: "#F6F4F0",
          100: "#E7E2DA",
          200: "#D8CEC1",
          300: "#C3B7A4",
          400: "#A99479",
          500: "#8A755A",
          600: "#705C44",
          700: "#574634",
          800: "#3A2F23",
          900: "#241C15",
        },
        accent: {
          100: "#F9F1DF",
          200: "#F0DDB4",
          300: "#E5C789",
          400: "#D9AD5F",
          500: "#C7923B",
          600: "#A47328",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-sans)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-noto-serif)", "var(--font-inter)", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },
      maxWidth: {
        container: "1200px",
        content: "768px",
      },
      boxShadow: {
        soft: "0 18px 40px -22px rgba(26,38,49,0.28)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.4)",
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [typography],
};

export default config;
