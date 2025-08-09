import { cn } from "./utils"
import { commonStyles } from "./design-tokens"

// Helper functions for consistent styling
export const styleHelpers = {
  // Card variants
  card: {
    default: (className?: string) => cn(commonStyles.card, className),
    hover: (className?: string) => cn(commonStyles.card, commonStyles.cardHover, className),
    glow: (className?: string) => cn(
      commonStyles.card, 
      commonStyles.cardHover,
      "gradient-glow pink-glow-hover",
      className
    ),
  },

  // Text variants
  text: {
    heading: (size: 'sm' | 'md' | 'lg' = 'md', className?: string) => cn(
      commonStyles.text.heading,
      {
        'text-sm': size === 'sm',
        'text-base': size === 'md',
        'text-lg': size === 'lg',
      },
      className
    ),
    body: (className?: string) => cn(commonStyles.text.body, className),
    accent: (className?: string) => cn(commonStyles.text.accent, className),
    secondary: (className?: string) => cn(commonStyles.text.secondary, className),
  },

  // Layout helpers
  layout: {
    grid: (cols: number = 3, className?: string) => cn(
      'grid gap-4',
      {
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': cols === 3,
        'grid-cols-1 sm:grid-cols-2': cols === 2,
        'grid-cols-1': cols === 1,
      },
      className
    ),
    flex: {
      center: (className?: string) => cn('flex items-center justify-center', className),
      between: (className?: string) => cn('flex items-center justify-between', className),
      col: (className?: string) => cn('flex flex-col', className),
    },
  },

  // Interactive states
  interactive: {
    button: (variant: 'default' | 'pink' | 'outline' = 'default', className?: string) => cn(
      commonStyles.button.base,
      commonStyles.button.sizes.md,
      {
        'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
        'pink-gradient-button': variant === 'pink',
        'border bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
      },
      className
    ),
  },
} as const

// Semantic color classes for consistent usage
export const semanticColors = {
  price: 'pink-text-bordered font-bold',
  seller: 'text-blue-accent-muted',
  inactive: 'text-blue-accent',
  owned: 'bg-pink-accent text-pink-accent-foreground border-pink-accent-border',
  metadata: 'text-blue-accent',
  pinkAccent: 'text-pink-accent',
  pinkAccentBordered: 'pink-text-bordered',
  pinkIconBordered: 'pink-icon-bordered',
} as const
