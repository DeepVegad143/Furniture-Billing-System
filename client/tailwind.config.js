/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B2750',
          50: '#F0F3FA',
          100: '#DDE4F3',
          200: '#B8C6E6',
          700: '#2A3A73',
          800: '#1B2750',
          900: '#121B38',
          950: '#0B1124'
        },
        cream: {
          DEFAULT: '#FAF6EE',
          50: '#FFFFFF',
          100: '#FDFCF9',
          200: '#FAF6EE',
          300: '#F3ECE0',
          400: '#E7DCB'
        },
        wood: {
          DEFAULT: '#B5773A',
          50: '#FDF8F3',
          100: '#F7EBE0',
          200: '#ECCDB5',
          300: '#DFAC87',
          400: '#CA8B4F',
          500: '#B5773A',
          600: '#9E632D',
          700: '#7E4C20',
          800: '#5F3717'
        },
        status: {
          paid: '#10B981',
          paidBg: '#ECFDF5',
          partial: '#F59E0B',
          partialBg: '#FFFBEB',
          pending: '#EF4444',
          pendingBg: '#FEF2F2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
        gujarati: ['"Noto Sans Gujarati"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(27, 39, 80, 0.06), 0 2px 6px -1px rgba(27, 39, 80, 0.04)',
        'card': '0 8px 30px -4px rgba(27, 39, 80, 0.08)',
        'floating': '0 12px 35px -6px rgba(27, 39, 80, 0.15)'
      }
    },
  },
  plugins: [],
}
