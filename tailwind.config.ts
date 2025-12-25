import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFFFFF",
        accent: "#FF33E7",
        purple: "#8907E6",
        background: "#F1F5F9",
        surface: "#FFFFFF",
        border: "#E2E8F0",
        text: {
          main: "#1E293B",
          muted: "#64748B"
        }
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px"
      }
    }
  },
  plugins: []
};

export default config;

