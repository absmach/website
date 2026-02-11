/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070b12",
        panel: "#0f1520",
        slate: "#121a25",
        mist: "#a8b3c7",
        accent: "#2dd4ff",
        "electric-cyan": "#00d9ff",
        "flux-blue": "#5290e0",
        "flux-orange": "#f9a32a",
      },
      boxShadow: {
        soft: "0 12px 30px rgba(3, 8, 18, 0.35)",
        strong: "0 24px 60px rgba(3, 8, 18, 0.45)"
      },

      fontFamily: {
        "fluxmq-logo": ["Verdana", "Geneva", "sans-serif"],
      },


    }
  },

  plugins: [require("@tailwindcss/typography")],

};
