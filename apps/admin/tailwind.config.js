/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3B82F6',
          DEFAULT: '#1E3A8A',
          dark: '#1E3A8A',
        },
        secondary: {
          light: '#F59E0B',
          DEFAULT: '#D97706',
          dark: '#B45309',
        }
      },
    },
  },
  plugins: [],
}
