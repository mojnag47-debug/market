/**
 * NextGen Marketplace - Comprehensive Design System
 * Enterprise-grade design tokens, theme, and styling foundation
 * سیستم طراحی جامع مارکت‌پلیس نکست‌جن
 */

export const designTokens = {
  // Color System - Modern, accessible color palette
  colors: {
    // Brand Colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Main brand color
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    },
    secondary: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
      950: '#4a044e'
    },
    // Semantic Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a'
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    // Neutral Colors
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
      1000: '#000000'
    },
    // Persian-inspired accent colors
    persian: {
      gold: '#d4af37',
      turquoise: '#40e0d0',
      saffron: '#f4c430',
      ruby: '#e0115f',
      emerald: '#50c878'
    }
  },

  // Typography System
  typography: {
    fontFamily: {
      sans: ['Inter', 'Vazirmatn', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      serif: ['Playfair Display', 'Noto Serif', 'Georgia', 'serif'],
      mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      display: ['Montserrat', 'Inter', 'sans-serif'],
      persian: ['Vazirmatn', 'Tahoma', 'sans-serif']
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }], // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
      base: ['1rem', { lineHeight: '1.5rem' }], // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }], // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }], // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
      '5xl': ['3rem', { lineHeight: '1' }], // 48px
      '6xl': ['3.75rem', { lineHeight: '1' }], // 60px
      '7xl': ['4.5rem', { lineHeight: '1' }], // 72px
      '8xl': ['6rem', { lineHeight: '1' }], // 96px
      '9xl': ['8rem', { lineHeight: '1' }] // 128px
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900'
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    }
  },

  // Spacing System
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem', // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem', // 12px
    3.5: '0.875rem', // 14px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    7: '1.75rem', // 28px
    8: '2rem', // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    11: '2.75rem', // 44px
    12: '3rem', // 48px
    14: '3.5rem', // 56px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    28: '7rem', // 112px
    32: '8rem', // 128px
    36: '9rem', // 144px
    40: '10rem', // 160px
    44: '11rem', // 176px
    48: '12rem', // 192px
    52: '13rem', // 208px
    56: '14rem', // 224px
    60: '15rem', // 240px
    64: '16rem', // 256px
    72: '18rem', // 288px
    80: '20rem', // 320px
    96: '24rem' // 384px
  },

  // Border Radius System
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px'
  },

  // Shadow System
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000'
  },

  // Breakpoints for responsive design
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    '3xl': '1920px'
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  },

  // Animation and transition tokens
  animation: {
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms'
    },
    timingFunction: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px',
        xl: '56px'
      },
      padding: {
        sm: '8px 16px',
        md: '12px 24px',
        lg: '16px 32px',
        xl: '20px 40px'
      }
    },
    input: {
      height: {
        sm: '32px',
        md: '40px',
        lg: '48px'
      },
      borderWidth: '1px',
      focusRingWidth: '2px',
      focusRingOffset: '2px'
    },
    card: {
      padding: {
        sm: '16px',
        md: '24px',
        lg: '32px'
      }
    }
  }
};

// Theme configuration
export const lightTheme = {
  name: 'light',
  colors: {
    ...designTokens.colors,
    // Semantic mappings for light theme
    background: designTokens.colors.neutral[0],
    foreground: designTokens.colors.neutral[900],
    surface: designTokens.colors.neutral[50],
    surfaceVariant: designTokens.colors.neutral[100],
    border: designTokens.colors.neutral[200],
    borderHover: designTokens.colors.neutral[300],
    text: {
      primary: designTokens.colors.neutral[900],
      secondary: designTokens.colors.neutral[600],
      tertiary: designTokens.colors.neutral[500],
      disabled: designTokens.colors.neutral[400],
      inverse: designTokens.colors.neutral[50]
    }
  },
  elevation: {
    0: 'none',
    1: designTokens.boxShadow.sm,
    2: designTokens.boxShadow.DEFAULT,
    3: designTokens.boxShadow.md,
    4: designTokens.boxShadow.lg,
    5: designTokens.boxShadow.xl
  }
};

export const darkTheme = {
  name: 'dark',
  colors: {
    ...designTokens.colors,
    // Semantic mappings for dark theme
    background: designTokens.colors.neutral[900],
    foreground: designTokens.colors.neutral[100],
    surface: designTokens.colors.neutral[800],
    surfaceVariant: designTokens.colors.neutral[700],
    border: designTokens.colors.neutral[700],
    borderHover: designTokens.colors.neutral[600],
    text: {
      primary: designTokens.colors.neutral[100],
      secondary: designTokens.colors.neutral[300],
      tertiary: designTokens.colors.neutral[400],
      disabled: designTokens.colors.neutral[500],
      inverse: designTokens.colors.neutral[900]
    }
  },
  elevation: {
    0: 'none',
    1: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    2: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
    3: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    4: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
    5: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)'
  }
};

// Utility functions for design system
export const generateColorScale = (baseColor: string, steps = 11) => {
  // Implementation for generating color scales
  return {};
};

export const getResponsiveValue = (
  values: Record<string, any>,
  breakpoint: string
) => {
  const breakpoints = Object.keys(designTokens.breakpoints);
  const currentIndex = breakpoints.indexOf(breakpoint);
  
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpoints[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return values.base || values[breakpoints[0]];
};

// CSS-in-JS utilities
export const createGlobalStyles = (theme: typeof lightTheme) => `
  :root {
    --color-primary: ${theme.colors.primary[500]};
    --color-background: ${theme.colors.background};
    --color-foreground: ${theme.colors.foreground};
    --color-surface: ${theme.colors.surface};
    --color-border: ${theme.colors.border};
    --color-text-primary: ${theme.colors.text.primary};
    --color-text-secondary: ${theme.colors.text.secondary};
    
    --font-sans: ${designTokens.typography.fontFamily.sans.join(', ')};
    --font-serif: ${designTokens.typography.fontFamily.serif.join(', ')};
    --font-mono: ${designTokens.typography.fontFamily.mono.join(', ')};
    
    --shadow-sm: ${theme.elevation[1]};
    --shadow-md: ${theme.elevation[3]};
    --shadow-lg: ${theme.elevation[4]};
    
    --transition-fast: ${designTokens.animation.duration[150]};
    --transition-normal: ${designTokens.animation.duration[300]};
    --transition-slow: ${designTokens.animation.duration[500]};
  }
  
  * {
    box-sizing: border-box;
  }
  
  html {
    scroll-behavior: smooth;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: var(--font-sans);
    background-color: var(--color-background);
    color: var(--color-text-primary);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  
  /* Focus styles for accessibility */
  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  
  /* RTL support for Persian/Arabic */
  [dir="rtl"] {
    font-family: var(--font-persian);
  }
  
  /* Reduced motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    :root {
      --color-border: ${theme.colors.neutral[900]};
    }
  }
  
  /* Print styles */
  @media print {
    * {
      background: transparent !important;
      color: black !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
  }
`;

export default designTokens;