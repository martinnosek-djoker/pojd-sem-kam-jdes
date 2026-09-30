import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        bg: "#FBF3E7",
        surface: "#FFFFFF",
        "surface-tint": "#FBF3E9",
        "surface-2": "#F5EDE1",
        ink: "#2E2019",
        "ink-mid": "#8A6A56",
        terracotta: {
          DEFAULT: "#C1572E",
          dark: "#9C4224",
        },
        "text-muted": "#8A7565",
        hairline: "rgba(46,32,25,0.12)",
      },
      fontFamily: {
        serif: ["var(--font-lora)", "serif"],
        sans: ["var(--font-work-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
