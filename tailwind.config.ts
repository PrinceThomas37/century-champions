import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Century Steel Profiles — corporate / industrial identity
        century: {
          red: "#E11B22",
          redDark: "#B0141A",
          redSoft: "#FBE9E9",
        },
        ink: {
          DEFAULT: "#111315",
          900: "#0C0D0F",
          800: "#17191C",
          700: "#22262A",
        },
        steel: {
          50: "#F6F7F8",
          100: "#ECEEF0",
          200: "#DCE0E4",
          300: "#C2C8CE",
          400: "#9AA1A9",
          500: "#6E757D",
          600: "#525960",
          700: "#3A3F45",
          800: "#24282C",
          900: "#15171A",
        },
      },
      fontFamily: {
        // Strong, neutral industrial stack — no external font dependency.
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,19,21,0.04), 0 8px 24px rgba(17,19,21,0.06)",
        panel: "0 1px 0 rgba(17,19,21,0.06)",
      },
      borderRadius: {
        xl: "0.625rem",
        "2xl": "0.875rem",
      },
      keyframes: {
        "chest-pop": {
          "0%": { transform: "scale(0.7)", opacity: "0" },
          "60%": { transform: "scale(1.12)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "rise": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "chest-pop": "chest-pop 0.55s ease-out",
        "rise": "rise 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
