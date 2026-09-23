/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Brand scale driven by CSS custom properties (see globals.css :root for defaults and
        // lib/themes.js for the full palette list) so the palette switcher can reskin the whole
        // app at runtime without a rebuild. Falls back to the Navy & Sky values if a var is
        // somehow missing, so there's never an unstyled flash.
        primary: {
          DEFAULT: "rgb(var(--color-primary, 13 27 110) / <alpha-value>)",
          50: "rgb(var(--color-primary-50, 238 241 250) / <alpha-value>)",
          100: "rgb(var(--color-primary-100, 220 225 245) / <alpha-value>)",
          200: "rgb(var(--color-primary-200, 179 192 232) / <alpha-value>)",
          300: "rgb(var(--color-primary-300, 132 151 214) / <alpha-value>)",
          400: "rgb(var(--color-primary-400, 90 112 196) / <alpha-value>)",
          500: "rgb(var(--color-primary-500, 42 69 168) / <alpha-value>)",
          600: "rgb(var(--color-primary-600, 13 27 110) / <alpha-value>)",
          700: "rgb(var(--color-primary-700, 10 21 84) / <alpha-value>)",
          800: "rgb(var(--color-primary-800, 8 17 63) / <alpha-value>)",
          900: "rgb(var(--color-primary-900, 6 12 46) / <alpha-value>)",
          950: "rgb(var(--color-primary-950, 3 6 26) / <alpha-value>)",
          light: "rgb(var(--color-primary-light, 30 58 138) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--color-accent, 41 171 226) / <alpha-value>)",
          50: "rgb(var(--color-accent-50, 235 248 253) / <alpha-value>)",
          100: "rgb(var(--color-accent-100, 210 239 251) / <alpha-value>)",
          200: "rgb(var(--color-accent-200, 166 223 247) / <alpha-value>)",
          300: "rgb(var(--color-accent-300, 121 207 243) / <alpha-value>)",
          400: "rgb(var(--color-accent-400, 77 190 238) / <alpha-value>)",
          500: "rgb(var(--color-accent-500, 41 171 226) / <alpha-value>)",
          600: "rgb(var(--color-accent-600, 28 143 194) / <alpha-value>)",
          700: "rgb(var(--color-accent-700, 21 112 154) / <alpha-value>)",
          800: "rgb(var(--color-accent-800, 15 84 115) / <alpha-value>)",
          900: "rgb(var(--color-accent-900, 10 59 82) / <alpha-value>)",
        },
        // White sidebar — navy/accent are used only for the active item and logo mark,
        // not as a fill, to keep the overall panel light per design direction.
        sidebar: {
          DEFAULT: "#FFFFFF",
          hover: "#F1F5F9",
          active: "rgb(var(--color-primary-50, 238 241 250) / <alpha-value>)",
          border: "#E2E8F0",
          foreground: "#111827",
          muted: "#64748B",
        },
        surface: {
          DEFAULT: "#ffffff",
          subtle: "#F5F7FB",
          dark: "#0A1130",
          "dark-subtle": "#111B45",
        },
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        // Nudge the neutral gray scale toward the spec's slate-based text/border colors
        // (200 = Borders #E2E8F0, 500 = Secondary Text #64748B) — every gray-* class
        // across the app inherits these automatically.
        gray: {
          100: "#F1F5F9",
          200: "#E2E8F0",
          500: "#64748B",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(13, 27, 110, 0.04), 0 1px 6px -1px rgba(13, 27, 110, 0.07)",
        "card-hover": "0 8px 20px -4px rgba(13, 27, 110, 0.12), 0 2px 8px -2px rgba(13, 27, 110, 0.08)",
      },
      borderRadius: {
        xl: "0.625rem",
        "2xl": "0.75rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "dash-flow": {
          to: { strokeDashoffset: -16 },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "dash-flow": "dash-flow 1s linear infinite",
      },
    },
  },
  plugins: [],
};
