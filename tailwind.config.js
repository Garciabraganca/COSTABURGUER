/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', './styles/**/*.{css,scss}'],
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#39ff14',
          cyan: '#00eaff',
          pink: '#ff4ecd'
        }
      },
      boxShadow: {
        'neon-glow': '0 10px 40px rgba(57, 255, 20, 0.25)',
        'neon-cyan': '0 10px 40px rgba(0, 234, 255, 0.25)',
        'neon-pink': '0 10px 40px rgba(255, 78, 205, 0.25)'
      }
    }
  },
  plugins: [],
};
