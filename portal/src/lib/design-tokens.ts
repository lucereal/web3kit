// Design tokens for consistent styling
export const designTokens = {
  colors: {
    primary: {
      DEFAULT: 'hsl(var(--primary))',
      foreground: 'hsl(var(--primary-foreground))',
    },
    pink: {
      DEFAULT: 'hsl(var(--pink-accent))',
      foreground: 'hsl(var(--pink-accent-foreground))',
      muted: 'hsl(var(--pink-accent-muted))',
    },
    blue: {
      DEFAULT: 'hsl(var(--blue-accent))',
      foreground: 'hsl(var(--blue-accent-foreground))',
      muted: 'hsl(var(--blue-accent-muted))',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadows: {
    glow: '0 0 20px -5px var(--pink-accent)',
    card: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    elevated: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
} as const

// Commonly used class combinations
export const commonStyles = {
  card: 'bg-card text-card-foreground rounded-lg border shadow-sm',
  cardHover: 'transition-all duration-300 hover:shadow-elevated hover:-translate-y-1',
  button: {
    base: 'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all',
    sizes: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4',
      lg: 'h-10 px-6',
    },
  },
  text: {
    heading: 'font-semibold tracking-tight',
    body: 'text-muted-foreground',
    accent: 'text-pink-accent font-medium',
    secondary: 'text-blue-accent-muted text-sm',
  },
} as const
