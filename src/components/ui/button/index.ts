import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: '',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'border',
        ghost: '',
        link: 'underline-offset-4 hover:underline',
      },
      type: {
        primary: '',
        success: '',
        info: '',
        warning: '',
        error: '',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        tiny: 'h-6 rounded-sm px-2 has-[>svg]:px-1.5 text-xs',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-sm',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4 text-lg',
        icon: 'size-9',
        'icon-tiny': 'size-6',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    compoundVariants: [
      // solid
      {
        variant: 'default',
        type: 'primary',
        class: 'bg-primary text-primary-foreground hover:bg-primary/90',
      },
      {
        variant: 'default',
        type: 'success',
        class: 'bg-success text-success-foreground hover:bg-success/90',
      },
      { variant: 'default', type: 'info', class: 'bg-info text-info-foreground hover:bg-info/90' },
      {
        variant: 'default',
        type: 'warning',
        class: 'bg-warning text-warning-foreground hover:bg-warning/90',
      },
      {
        variant: 'default',
        type: 'error',
        class: 'bg-error text-error-foreground hover:bg-error/90',
      },

      // outline
      {
        variant: 'outline',
        type: 'primary',
        class:
          'text-primary border-primary/30 hover:bg-primary/10 hover:text-primary focus-visible:ring-primary/20 dark:focus-visible:ring-primary/30',
      },
      {
        variant: 'outline',
        type: 'success',
        class:
          'text-success border-success/35 hover:bg-success/10 hover:text-success focus-visible:ring-success/20 dark:focus-visible:ring-success/30',
      },
      {
        variant: 'outline',
        type: 'info',
        class:
          'text-info border-info/35 hover:bg-info/10 hover:text-info focus-visible:ring-info/20 dark:focus-visible:ring-info/30',
      },
      {
        variant: 'outline',
        type: 'warning',
        class:
          'text-warning border-warning/35 hover:bg-warning/12 hover:text-warning focus-visible:ring-warning/20 dark:focus-visible:ring-warning/30',
      },
      {
        variant: 'outline',
        type: 'error',
        class:
          'text-error border-error/35 hover:bg-error/10 hover:text-error focus-visible:ring-error/20 dark:focus-visible:ring-error/30',
      },

      // soft/secondary: use visible tinted background
      {
        variant: 'secondary',
        type: 'primary',
        class:
          'bg-primary/16 text-primary border-primary/18 hover:bg-primary/24 focus-visible:ring-primary/20 dark:bg-primary/24 dark:border-primary/20 dark:hover:bg-primary/32',
      },
      {
        variant: 'secondary',
        type: 'success',
        class:
          'bg-success/16 text-success border-success/18 hover:bg-success/24 focus-visible:ring-success/20 dark:bg-success/24 dark:border-success/20 dark:hover:bg-success/32',
      },
      {
        variant: 'secondary',
        type: 'info',
        class:
          'bg-info/16 text-info border-info/18 hover:bg-info/24 focus-visible:ring-info/20 dark:bg-info/24 dark:border-info/20 dark:hover:bg-info/32',
      },
      {
        variant: 'secondary',
        type: 'warning',
        class:
          'bg-warning/16 text-warning border-warning/18 hover:bg-warning/24 focus-visible:ring-warning/20 dark:bg-warning/24 dark:border-warning/20 dark:hover:bg-warning/32',
      },
      {
        variant: 'secondary',
        type: 'error',
        class:
          'bg-error/16 text-error border-error/18 hover:bg-error/24 focus-visible:ring-error/20 dark:bg-error/24 dark:border-error/20 dark:hover:bg-error/32',
      },

      // ghost: keep background clean; only hover tint
      {
        variant: 'ghost',
        type: 'primary',
        class: 'text-primary hover:bg-primary/12 hover:text-primary',
      },
      {
        variant: 'ghost',
        type: 'success',
        class: 'text-success hover:bg-success/12 hover:text-success',
      },
      { variant: 'ghost', type: 'info', class: 'text-info hover:bg-info/12 hover:text-info' },
      {
        variant: 'ghost',
        type: 'warning',
        class: 'text-warning hover:bg-warning/12 hover:text-warning',
      },
      { variant: 'ghost', type: 'error', class: 'text-error hover:bg-error/12 hover:text-error' },

      // link
      { variant: 'link', type: 'primary', class: 'text-primary' },
      { variant: 'link', type: 'success', class: 'text-success' },
      { variant: 'link', type: 'info', class: 'text-info' },
      { variant: 'link', type: 'warning', class: 'text-warning' },
      { variant: 'link', type: 'error', class: 'text-error' },
    ],
    defaultVariants: {
      variant: 'default',
      type: 'primary',
      size: 'default',
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
