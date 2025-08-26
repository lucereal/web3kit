"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const switchVariants = cva(
  "peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80",
        success: "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-input focus-visible:border-green-500 focus-visible:ring-green-500/50 dark:data-[state=unchecked]:bg-input/80",
        warning: "data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-input focus-visible:border-yellow-500 focus-visible:ring-yellow-500/50 dark:data-[state=unchecked]:bg-input/80",
        danger: "data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-input focus-visible:border-red-500 focus-visible:ring-red-500/50 dark:data-[state=unchecked]:bg-input/80",
        purple: "data-[state=checked]:bg-purple-500 data-[state=unchecked]:bg-input focus-visible:border-purple-500 focus-visible:ring-purple-500/50 dark:data-[state=unchecked]:bg-input/80",
        pine: "data-[state=checked]:bg-input-ash data-[state=unchecked]:bg-input-ash focus-visible:border-ring focus-visible:ring-ring/50",
      },
      size: {
        sm: "h-[1rem] w-7",
        default: "h-[1.15rem] w-8",
        lg: "h-[1.5rem] w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const switchThumbVariants = cva(
  "pointer-events-none block rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
  {
    variants: {
      variant: {
        default: "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground",
        success: "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-white",
        warning: "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-white",
        danger: "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-white",
        purple: "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-white",
        pine: "bg-pine-green dark:data-[state=unchecked]:bg-pine-green dark:data-[state=checked]:bg-black",
      },
      size: {
        sm: "size-3",
        default: "size-4",
        lg: "size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

function Switch({
  className,
  variant,
  size,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants({ variant, size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(switchThumbVariants({ variant, size }))}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
