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
          navy: '#0F172A',
          royal: '#1E40AF',
          sky: '#38BDF8',
          softgray: '#F8FAFC',
        }
      }
    },
  },
  plugins: [],
}
