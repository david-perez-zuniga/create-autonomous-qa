// @ts-check
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["InterVariable", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        background: {
          DEFAULT: "#0b1026",
          secondary: "#0f172a",
        },
        primary: {
          DEFAULT: "#4f46e5",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#22d3ee",
        },
      },
      boxShadow: {
        glow: "0 0 80px -40px rgba(79, 70, 229, 0.45)",
      },
      backgroundImage: {
        "grid-dark":
          "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
