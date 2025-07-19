module.exports = {
  content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Используем класс вместо медиа-запроса
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'base': '1rem', // Теперь это будет 14px, так как html font-size = 14px
      }
    }
  },
  plugins: [require('tailwindcss-primeui')]
};