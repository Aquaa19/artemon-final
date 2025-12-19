// Filename: tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1', // Indigo 500
          hover: '#4f46e5',   // Indigo 600
          light: '#e0e7ff',   // Indigo 100
        },
        secondary: {
          DEFAULT: '#f59e0b', // Amber 500
          hover: '#d97706',   // Amber 600
          light: '#fef3c7',   // Amber 100
        },
        accent: {
          DEFAULT: '#ec4899', // Pink 500
          hover: '#db2777',   // Pink 600
          light: '#fce7f3',   // Pink 100
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f9fafb',   // Gray 50
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.3)',
      }
    },
  },
  plugins: [],
}