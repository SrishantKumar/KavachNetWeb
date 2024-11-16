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
          light: '#ff4d4d',
          DEFAULT: '#ff0000',
          dark: '#cc0000',
        },
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-logo': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        glow: {
          '0%, 100%': {
            'box-shadow': '0 0 20px rgba(255, 0, 0, 0.5)',
          },
          '50%': {
            'box-shadow': '0 0 30px rgba(255, 0, 0, 0.7)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 0, 0, 0.5)',
        'glow-lg': '0 0 30px rgba(255, 0, 0, 0.7)',
      },
      dropShadow: {
        'glow': [
          '0 0 10px rgba(255, 0, 0, 0.35)',
          '0 0 20px rgba(255, 0, 0, 0.2)',
          '0 0 30px rgba(255, 0, 0, 0.1)',
        ],
      },
    },
  },
  plugins: [],
}