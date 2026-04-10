import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[0_0_0_0_#c96442,0_0_0_1px_#c96442] hover:bg-[#b85a3c]',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/25',
        outline:
          'border border-border bg-card text-foreground shadow-[var(--shadow-ring-warm)] hover:bg-accent hover:text-accent-foreground dark:bg-card/80',
        secondary:
          'bg-secondary text-secondary-foreground shadow-[0_0_0_0_transparent,0_0_0_1px_#d1cfc5] hover:bg-[#e0ddd2] dark:shadow-[var(--shadow-ring-warm)]',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-[#3d3d3a] underline-offset-4 hover:underline hover:text-primary',
      },
      size: {
        default: 'h-9 px-3 py-2 pl-2 has-[>svg]:px-3 has-[>svg]:pl-2',
        sm: 'h-8 gap-1.5 rounded-md px-3 py-2 pl-2 has-[>svg]:px-2.5',
        lg: 'h-11 rounded-md px-4 py-2 pl-3 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
