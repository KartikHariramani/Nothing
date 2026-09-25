/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#9e0418",
        "primary-container": "#c1272d",
        "on-primary": "#ffffff",
        "on-primary-container": "#ffdbd8",
        "primary-fixed": "#ffdad7",
        "primary-fixed-dim": "#ffb3ae",
        "brand-red-500": "#C1272D",
        "brand-red-600": "#A61E24",
        "brand-red-100": "#F8D7D7",
        "brand-red-50": "#FDECEC",
        "trust-blue-700": "#0F2E5A",
        "trust-blue-500": "#1E4C8A",
        "secondary": "#445e8d",
        "secondary-container": "#afcaff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#3a5482",
        "secondary-fixed": "#d7e3ff",
        "secondary-fixed-dim": "#adc7fc",
        "surface": "#f9f9ff",
        "surface-white": "#FFFFFF",
        "surface-dim": "#d3daef",
        "surface-bright": "#f9f9ff",
        "surface-variant": "#dce2f7",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f3ff",
        "surface-container": "#e9edff",
        "surface-container-high": "#e1e8fd",
        "surface-container-highest": "#dce2f7",
        "neutral-900": "#111827",
        "neutral-600": "#4B5563",
        "neutral-200": "#E5E7EB",
        "neutral-50": "#F9FAFB",
        "success-600": "#16A34A",
        "success-50": "#F0FDF4",
        "warning-600": "#D97706",
        "warning-50": "#FFFBEB",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "md": "0.5rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      fontFamily: {
        "display": ["Poppins", "sans-serif"],
        "headline": ["Poppins", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "mono": ["IBM Plex Mono", "monospace"],
        "code": ["IBM Plex Mono", "monospace"]
      },
      boxShadow: {
        "card": "0 1px 3px 0 rgba(15, 46, 90, 0.05), 0 1px 2px -1px rgba(15, 46, 90, 0.03)",
        "card-hover": "0 4px 6px -1px rgba(15, 46, 90, 0.08), 0 2px 4px -2px rgba(15, 46, 90, 0.04)",
        "modal": "0 20px 25px -5px rgba(15, 46, 90, 0.12), 0 8px 10px -6px rgba(15, 46, 90, 0.06)"
      }
    },
  },
  plugins: [],
}
