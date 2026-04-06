/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#165DFF',
        paper: {
          50: '#FAF9F7',
          100: '#F5F3EF',
          200: '#E8E4DC',
          300: '#D4CFC3',
        },
        ink: {
          700: '#4A4A4A',
          800: '#2D2D2D',
          900: '#1A1A1A',
        },
        accent: {
          gold: '#B8860B',
          bronze: '#8B7355',
          jade: '#5B8A72',
        },
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'SimSun-ExtB', 'MingLiU-ExtB', 'HanaMinA', 'HanaMinB', 'Source Han Serif SC', 'Source Han Serif CN', 'serif'],
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'paper': '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
        'paper-md': '0 4px 6px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.06)',
        'paper-lg': '0 10px 15px rgba(0,0,0,0.04), 0 4px 6px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}
