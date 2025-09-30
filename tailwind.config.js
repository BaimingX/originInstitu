/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#3B82F6',
        'primary-blue-hover': '#2563EB',
        'success-green': '#10B981',
        'error-red': '#EF4444',
        'warning-yellow': '#F59E0B',
        'gray-text': '#6B7280',
        'light-gray': '#F3F4F6',
      }
    },
  },
  plugins: [],
} 