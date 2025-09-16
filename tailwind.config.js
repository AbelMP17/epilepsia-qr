/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emergency: {
          50:  "#fff1f2",
          100: "#ffe4e6",
          500: "#ef4444", // rojo CTA
          600: "#dc2626",
          700: "#b91c1c"
        }
      }
    },
  },
  plugins: [],
}
