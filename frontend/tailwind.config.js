/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#070b15',
          card: '#0e1626',
          border: '#1e293d',
          hover: '#172338',
          cyan: '#06b6d4',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          critical: '#dc2626',
        },
      },
      boxShadow: {
        'cyber-glow': '0 0 20px rgba(6, 182, 212, 0.2)',
        'cyber-red': '0 0 20px rgba(239, 68, 68, 0.25)',
        'cyber-green': '0 0 20px rgba(16, 185, 129, 0.25)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
