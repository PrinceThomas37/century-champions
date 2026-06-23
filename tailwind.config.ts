import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Century Champions adventure palette
        steel: {
          50: "#f4f6f8",
          100: "#e3e8ee",
          700: "#334155",
          900: "#0f172a",
        },
        treasure: {
          gold: "#f4b740",
          deep: "#b9821a",
        },
        champion: {
          DEFAULT: "#0ea5a4",
          dark: "#0b7d7c",
        },
      },
      keyframes: {
        "chest-pop": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fill-grow": {
          from: { width: "0%" },
          to: { width: "var(--target-width)" },
        },
      },
      animation: {
        "chest-pop": "chest-pop 0.6s ease-out",
        "fill-grow": "fill-grow 0.8s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
