/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Jibam Pharmacy brand colors (from actual logo) ──────────────────
        // Primary: dark forest green
        primary: {
          DEFAULT: '#1B5E20',
          light:   '#2E7D32',
          dark:    '#0A3D0C',
          surface: '#E8F5E9',
        },
        // Accent: lime green (the swish element in the logo)
        accent: {
          DEFAULT: '#8BC34A',
          dark:    '#689F38',
          surface: '#F1F8E9',
        },
        // Keep navy/cyan aliases pointing to new brand for backward compat
        navy: {
          DEFAULT: '#1B5E20',
          light:   '#2E7D32',
          dark:    '#0A3D0C',
          surface: '#E8F5E9',
        },
        cyan: {
          DEFAULT: '#8BC34A',
          light:   '#AED581',
          dark:    '#689F38',
          surface: '#F1F8E9',
        },
        // Red cross from logo
        danger: '#D32F2F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      height: {
        dvh: '100dvh',
      },
      minHeight: {
        dvh: '100dvh',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    },
  ],
};
