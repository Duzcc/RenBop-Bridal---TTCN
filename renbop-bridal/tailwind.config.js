/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Color Palette
        ivory: "#FDFCF0",           // Main background - warm, soft ivory
        charcoal: "#121212",        // Primary text - deep charcoal
        champagne: "#C5A059",       // Accent/CTA - champagne gold

        // Supporting Colors
        "charcoal-light": "#2A2A2A", // Secondary text
        "ivory-dark": "#F5F4E8",     // Subtle backgrounds
        "champagne-light": "#D4B76F", // Hover states
        "champagne-dark": "#B39048",  // Active states

        // Functional (keep for compatibility)
        white: "#FFFFFF",
        black: "#000000",

        // Extended Gray Palette
        gray: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },
      },
      fontFamily: {
        // Serif for headings - elegant, formal
        serif: ['"Cormorant Garamond"', 'Georgia', '"Times New Roman"', 'serif'],

        // Sans-serif for body - clean, readable
        sans: ['"Montserrat"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],

        // Optional: Display font for hero sections
        display: ['"Playfair Display"', 'serif'],
      },
      fontSize: {
        // Refined type scale
        'xs': ['0.75rem', { lineHeight: '1.5' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.6' }],     // 14px
        'base': ['1rem', { lineHeight: '1.75' }],      // 16px
        'lg': ['1.125rem', { lineHeight: '1.75' }],    // 18px
        'xl': ['1.25rem', { lineHeight: '1.75' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '1.5' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '1.4' }],    // 30px
        '4xl': ['2.25rem', { lineHeight: '1.3' }],     // 36px
        '5xl': ['3rem', { lineHeight: '1.2' }],        // 48px
        '6xl': ['3.75rem', { lineHeight: '1.1' }],     // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],        // 72px
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.15em',  // For luxury all-caps headings
      },
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
        '34': '8.5rem',   // 136px
      },
      maxWidth: {
        'container': '1280px',
        'wide': '1440px',
        'narrow': '960px',
        'text': '720px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
