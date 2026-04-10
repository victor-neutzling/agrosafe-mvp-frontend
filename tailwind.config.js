/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        status: {
          success: '#16a34a',
          warning: '#f59e0b',
          danger: '#dc2626',
          neutral: '#64748b'
        }
      }
    }
  },
  plugins: []
}
