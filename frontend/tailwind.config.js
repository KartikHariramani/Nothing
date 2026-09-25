/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', 
          600: '#B91C1C', // Deep red (Primary) as requested
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#450a0a',
          950: '#450a0a',
        },
        navy: {
          800: '#1F2937', // Dark navy/charcoal as requested
          900: '#111827', // Dark navy/charcoal as requested
          950: '#030712',
        },
        background: '#F8FAFC',
        success: '#16A34A',
        warning: '#D97706',
        error: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'drop-fall': 'drop-fall 3s cubic-bezier(0.5, 0, 1, 1) infinite',
        'ripple-expand': 'ripple-expand 3s ease-out infinite',
        'fade-in': 'fade-in 1s ease-out forwards',
        'slide-up': 'slide-up 0.8s ease-out forwards',
      },
      keyframes: {
        'drop-fall': {
          '0%': { transform: 'translateY(-100px) scale(0)', opacity: '0' },
          '20%': { transform: 'translateY(-80px) scale(1)', opacity: '1' },
          '80%': { transform: 'translateY(150px) scale(1)', opacity: '1' },
          '85%': { transform: 'translateY(160px) scale(0.3)', opacity: '0' },
          '100%': { transform: 'translateY(160px) scale(0)', opacity: '0' },
        },
        'ripple-expand': {
          '0%, 80%': { transform: 'scale(0)', opacity: '0', borderWidth: '4px' },
          '85%': { transform: 'scale(1)', opacity: '1', borderWidth: '4px' },
          '100%': { transform: 'scale(3)', opacity: '0', borderWidth: '1px' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
