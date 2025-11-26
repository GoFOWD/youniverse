/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#005960', // Transformative Teal
          dark: '#004045',
          light: '#00737a',
        },
        sand: '#F5F0E6', // Warm Sand
        misty: '#E8ECEF', // Misty Gray
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url('https://grainy-gradients.vercel.app/noise.svg')", // Placeholder noise texture
      }
    },
  },
  plugins: [],
}
