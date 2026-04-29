import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import type { MotionProps } from 'framer-motion'

type CardVariant = 'default' | 'glass' | 'elevated' | 'lucas' | 'mirian' | 'couple'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  pressable?: boolean
  motionProps?: MotionProps
}

const variantStyles: Record<CardVariant, string> = {
  default:  'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
  glass:    'glass',
  elevated: 'bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-[var(--shadow-md)]',
  lucas:    'bg-[var(--color-bg-secondary)] border border-[rgba(59,130,246,0.3)] shadow-[0_0_20px_rgba(59,130,246,0.12)]',
  mirian:   'bg-[var(--color-bg-secondary)] border border-[rgba(236,72,153,0.3)] shadow-[0_0_20px_rgba(236,72,153,0.12)]',
  couple:   'bg-[var(--color-bg-secondary)] border border-[rgba(139,92,246,0.3)] shadow-[0_0_20px_rgba(139,92,246,0.12)]',
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', pressable = false, children, className = '', motionProps, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={pressable ? { scale: 1.01, y: -2 } : undefined}
        whileTap={pressable ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className={[
          'rounded-[var(--radius-lg)] overflow-hidden',
          pressable ? 'cursor-pointer' : '',
          variantStyles[variant],
          className,
        ].join(' ')}
        {...motionProps}
        {...(props as any)}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 pb-0 ${className}`} {...props}>{children}</div>
)

const CardBody = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 ${className}`} {...props}>{children}</div>
)

const CardFooter = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 pt-0 flex items-center gap-2 ${className}`} {...props}>{children}</div>
)

export { Card, CardHeader, CardBody, CardFooter }
export type { CardProps, CardVariant }
