import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#F7F9FA",
        surface: "#FFFFFF",
        foreground: "#172B3A",
        primary: {
          DEFAULT: "#087F8C",
          foreground: "#FFFFFF",
          50: "#EFFBFC",
          100: "#DDF5F7",
          200: "#BDEBF0",
          300: "#8EDBE3",
          400: "#45C2CF",
          500: "#087F8C",
          600: "#066A75",
          700: "#05545D",
          800: "#04424A",
          900: "#03353B",
        },
        secondary: {
          DEFAULT: "#17324D",
          foreground: "#FFFFFF",
          50: "#F1F5F9",
          100: "#E2E8F0",
          200: "#C8D4DF",
          300: "#98AFC3",
          400: "#5D82A2",
          500: "#17324D",
          600: "#13283E",
          700: "#0F2032",
          800: "#0B1724",
          900: "#070E17",
        },
        accent: {
          DEFAULT: "#DDF5ED",
          foreground: "#0B4A3B",
          hover: "#CCECE2",
        },
        muted: {
          DEFAULT: "#F1F5F8",
          foreground: "#667784",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#172B3A",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#172B3A",
        },
        success: {
          DEFAULT: "#21865B",
          foreground: "#FFFFFF",
          50: "#F0FAF5",
          100: "#DCF4E9",
        },
        warning: {
          DEFAULT: "#E9A23B",
          foreground: "#FFFFFF",
          50: "#FEF9F0",
          100: "#FDF2DD",
        },
        error: {
          DEFAULT: "#D9534F",
          foreground: "#FFFFFF",
          50: "#FCF3F2",
          100: "#F9E4E3",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(23, 43, 58, 0.05), 0 1px 2px -1px rgba(23, 43, 58, 0.05)",
        card: "0 2px 8px -2px rgba(23, 43, 58, 0.08), 0 1px 4px -1px rgba(23, 43, 58, 0.04)",
        elevated: "0 10px 25px -5px rgba(23, 43, 58, 0.1), 0 8px 10px -6px rgba(23, 43, 58, 0.05)",
        focus: "0 0 0 3px rgba(8, 127, 140, 0.25)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
