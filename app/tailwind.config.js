/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Pacing indicator colors
        'ahead': '#22c55e',
        'ontime': '#eab308',
        'behind': '#ef4444',
      }
    },
  },
  plugins: [],
}

