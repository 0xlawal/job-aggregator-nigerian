/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066CC',
        action: '#00B050',
        dark: '#1A1A2E',
      },
    },
  },
  plugins: [],
}