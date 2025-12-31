/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',    // Changed to match index.css
          hover: '#1d4ed8',      // Changed to match index.css
          light: '#eff6ff',      // Changed to match index.css
          500: '#2563eb',        // Add this for stroke-primary
        },
        secondary: {
          DEFAULT: '#f59e0b',
          hover: '#d97706',
          light: '#fffbeb',
        },
        accent: {
          DEFAULT: '#ec4899',
          hover: '#db2777',
          light: '#fdf2f8',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafb',
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
        'glow': '0 0 15px rgba(37, 99, 235, 0.3)', // Updated to match blue
      },
      // Add stroke colors
      stroke: {
        primary: '#2563eb',
        'primary-light': '#eff6ff',
      },
      // Add fill colors if needed
      fill: {
        primary: '#2563eb',
      }
    },
  },
  plugins: [],
}