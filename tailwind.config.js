/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B0B0B',
          secondary: '#111111',
        },
        accent: {
          DEFAULT: '#22c55e',
          hover: '#16a34a',
        },
        text: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.6)',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium-glow': '0 0 50px rgba(34, 197, 94, 0.1)',
      }
    },
  },
  plugins: [],
}
