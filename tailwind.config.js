/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        paper: '#f8fafc',
        accent: '#0ea5e9',
        accentSoft: '#e0f2fe',
      },
      keyframes: {
        monthFade: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        monthFade: 'monthFade 300ms ease',
      },
      boxShadow: {
        panel: '0 20px 45px rgba(2, 6, 23, 0.1)',
      },
    },
  },
  plugins: [],
}
