/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/renderer.tsx",
      "./src/renderer/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }