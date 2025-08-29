const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

delete colors.lightBlue;
delete colors.warmGray;
delete colors.trueGray;
delete colors.coolGray;
delete colors.blueGray;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.scss"
  ],
  safelist: [
    "font-sans",
    "font-hindi", "font-telugu", "font-tamil", "font-kannada", "font-malayalam",
    "font-gujarati", "font-bengali", "font-punjabi", "font-odia", "font-urdu",
    "bg-background", "text-foreground", "border-border",
    "bg-blue-100", "text-black", "bg-gray-800", "text-white",
    "self-end", "self-start", "px-4", "py-2", "rounded-lg", "max-w-[70%]",
    "m-0", "p-0"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Open Sans"', '"Segoe UI"', 'system-ui', ...defaultTheme.fontFamily.sans],
        hindi: ['"Noto Sans Devanagari"', ...defaultTheme.fontFamily.sans],
        telugu: ['"Noto Sans Telugu"', ...defaultTheme.fontFamily.sans],
        tamil: ['"Noto Sans Tamil"', ...defaultTheme.fontFamily.sans],
        kannada: ['"Noto Sans Kannada"', ...defaultTheme.fontFamily.sans],
        malayalam: ['"Noto Sans Malayalam"', ...defaultTheme.fontFamily.sans],
        gujarati: ['"Noto Sans Gujarati"', ...defaultTheme.fontFamily.sans],
        bengali: ['"Noto Sans Bengali"', ...defaultTheme.fontFamily.sans],
        punjabi: ['"Noto Sans Gurmukhi"', ...defaultTheme.fontFamily.sans],
        odia: ['"Noto Sans Oriya"', ...defaultTheme.fontFamily.sans],
        urdu: ['"Noto Sans Arabic"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        gray: colors.neutral,
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        scroll: "scroll 40s linear infinite",
      },
      keyframes: {
        scroll: {
          to: {
            transform: "translate(calc(-50% - 0.5rem))",
          },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addBase }) {
      addBase({
        ":root": {
          "--border": "220 14% 96%",
          "--input": "220 14% 96%",
          "--ring": "220 14% 96%",
          "--background": "0 0% 100%",
          "--foreground": "222.2 47.4% 11.2%",
          "--sidebar-border": "220 14% 96%",
        },
        ".dark": {
          "--border": "220 14% 30%",
          "--input": "220 14% 30%",
          "--ring": "220 14% 30%",
          "--background": "222.2 47.4% 11.2%",
          "--foreground": "210 40% 98%",
          "--sidebar-border": "220 14% 30%",
        },
      });
    },
  ],
};
