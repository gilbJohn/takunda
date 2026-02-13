import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
      },
    },
    fontFamily: {
      sans: ["var(--font-sans)", "system-ui", "sans-serif"],
    },
    extend: {
      keyframes: {
        "success-pop": {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
          "70%": { transform: "scale(0.98)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "success-flash": {
          "0%": { boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.7)" },
          "70%": { boxShadow: "0 0 0 20px rgba(34, 197, 94, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(34, 197, 94, 0)" },
        },
        "wrong-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-8px)" },
          "40%": { transform: "translateX(8px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        "correct-glow": {
          "0%": { boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.4)" },
          "50%": { boxShadow: "0 0 20px 4px rgba(34, 197, 94, 0.5)" },
          "100%": { boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.3)" },
        },
      },
      animation: {
        "success-pop": "success-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "success-flash": "success-flash 0.6s ease-out",
        "wrong-shake": "wrong-shake 0.4s ease-in-out",
        "correct-glow": "correct-glow 0.6s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
