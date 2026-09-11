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
        rail: {
          bg: '#0a0f14',
          panel: '#111820',
          panelHover: '#161f2b',
          border: '#1e2a38',
          borderHover: '#2a3d4f',
          text: '#e8edf2',
          textMuted: '#7a8d9c',
          accent: '#00d4aa',
          accentDim: '#00d4aa22',
          warning: '#ffb800',
          danger: '#ff4d4f',
          info: '#1890ff',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'panel': '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03)',
        'panel-hover': '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,170,0.15)',
      },
    },
  },
  plugins: [],
}