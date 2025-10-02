/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './apps/**/*.{js,ts,jsx,tsx,mdx}',
    './libs/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        vazir: ['Vazirmatn', 'ui-sans-serif', 'system-ui'],
        sans: ['Vazirmatn', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-from-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    function({ addUtilities, addBase }) {
      // RTL utilities
      addUtilities({
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
        '.rtl\\:rotate-180': {
          '[dir="rtl"] &': {
            transform: 'rotate(180deg)',
          },
        },
        '.rtl\\:scale-x-\\[-1\\]': {
          '[dir="rtl"] &': {
            transform: 'scaleX(-1)',
          },
        },
        '.rtl\\:right-0': {
          '[dir="rtl"] &': {
            right: '0',
          },
        },
        '.rtl\\:left-0': {
          '[dir="rtl"] &': {
            left: '0',
          },
        },
        '.rtl\\:text-right': {
          '[dir="rtl"] &': {
            textAlign: 'right',
          },
        },
        '.rtl\\:text-left': {
          '[dir="rtl"] &': {
            textAlign: 'left',
          },
        },
        '.rtl\\:mr-2': {
          '[dir="rtl"] &': {
            marginRight: '0.5rem',
          },
        },
        '.rtl\\:ml-2': {
          '[dir="rtl"] &': {
            marginLeft: '0.5rem',
          },
        },
        '.rtl\\:pr-4': {
          '[dir="rtl"] &': {
            paddingRight: '1rem',
          },
        },
        '.rtl\\:pl-4': {
          '[dir="rtl"] &': {
            paddingLeft: '1rem',
          },
        },
      });

      // Base styles for RTL
      addBase({
        '[dir="rtl"]': {
          fontFamily: 'Vazirmatn, ui-sans-serif, system-ui',
        },
        '[dir="rtl"] input[type="text"], [dir="rtl"] input[type="email"], [dir="rtl"] input[type="password"], [dir="rtl"] textarea': {
          textAlign: 'right',
        },
        '[dir="rtl"] .prose': {
          textAlign: 'right',
        },
      });
    },
  ],
};