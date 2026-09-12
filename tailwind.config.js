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
          bg: '#040b14',
          panel: '#091524',
          panelHover: '#0d1e33',
          border: '#1a3655',
          borderHover: '#254b75',
          text: '#e2f1ff',
          textMuted: '#8da9c4',
          accent: '#00f2fe',
          accentDim: '#00f2fe22',
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