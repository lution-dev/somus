import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'lucas' | 'mirian' | 'couple'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] text-white shadow-[var(--shadow-glow-blue)] hover:shadow-[0_0_28px_rgba(59,130,246,0.45)]',
  secondary: 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border border-[var(--color-border)]',
  ghost:     'bg-transparent hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
  danger:    'bg-[var(--color-danger)] hover:bg-red-400 text-white',
  lucas:     'bg-[var(--color-accent-lucas)] hover:bg-blue-400 text-white shadow-[var(--shadow-glow-blue)]',
  mirian:    'bg-[var(--color-accent-mirian)] hover:bg-pink-400 text-white shadow-[var(--shadow-glow-pink)]',
  couple:    'bg-gradient-to-r from-[var(--color-accent-lucas)] to-[var(--color-accent-mirian)] hover:opacity-90 text-white shadow-[var(--shadow-glow-purple)]',
}

const sizeStyles: Record<Size, string> = {
  sm:   'h-8 px-3 text-xs rounded-[var(--radius-sm)]',
  md:   'h-10 px-5 text-sm rounded-[var(--radius-md)]',
  lg:   'h-12 px-7 text-base rounded-[var(--radius-lg)]',
  icon: 'h-10 w-10 rounded-[var(--radius-md)] p-0 flex items-center justify-center',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, fullWidth = false, children, disabled, className = '', ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        disabled={disabled || loading}
        className={[
          'relative inline-flex items-center justify-center gap-2 font-semibold cursor-pointer select-none',
          'transition-all duration-[var(--transition-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
        {...(props as any)}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps, Variant as ButtonVariant, Size as ButtonSize }
