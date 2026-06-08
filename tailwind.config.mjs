import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}"],
  theme: {
    extend: {
      // Colors reference CSS variables so Tailwind utilities (bg-ink, text-accent, etc.)
      // automatically pick up the active theme. Note: opacity modifiers (bg-ink/50) won't
      // work — use color-mix() in CSS or explicit rgba vars instead.
      colors: {
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        "paper-3": "var(--paper-3)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        "ink-4": "var(--ink-4)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        "line-3": "var(--line-3)",
        accent: "var(--accent)",
        "accent-2": "var(--accent-2)",
        "accent-soft": "var(--accent-soft)",
        green: "var(--green)",
        warn: "var(--warn)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        lg: "var(--shadow-lg)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        container: "var(--container)",
        "container-wide": "var(--container-wide)",
        narrow: "920px",
      },
    },
  },
  plugins: [typography],
};
