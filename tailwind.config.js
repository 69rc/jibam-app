/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0D1B5E',
          light: '#1A2E8A',
          dark: '#080F3A',
          surface: '#E8ECF8',
        },
        cyan: {
          DEFAULT: '#00AEEF',
          light: '#33C0F3',
          dark: '#0090CC',
          surface: '#E0F5FD',
        },
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
    // Inline scrollbar-hide plugin (no extra npm package needed)
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      });
    },
  ],
};
