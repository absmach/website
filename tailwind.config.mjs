/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f6f4ee",
        "paper-2": "#ecebe5",
        "paper-3": "#e2e0d8",
        ink: "#14161a",
        "ink-2": "#383a40",
        "ink-3": "#6c6e73",
        "ink-4": "#a4a6ac",
        line: "#1a1c20",
        "line-2": "#c9c7be",
        "line-3": "#dedcd4",
        accent: "#2547ff",
        "accent-2": "#ff7a4a",
        "accent-soft": "#e7eaff",
        green: "#1f6b3a",
        warn: "#b46010",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(20,22,26,0.04)",
        DEFAULT:
          "0 4px 14px rgba(20,22,26,0.06), 0 1px 2px rgba(20,22,26,0.04)",
        lg: "0 18px 60px -20px rgba(20,22,26,0.18), 0 4px 14px rgba(20,22,26,0.06)",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "14px",
      },
      fontFamily: {
        sans: ["Montserrat", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      maxWidth: {
        container: "1200px",
        "container-wide": "1320px",
        narrow: "920px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
