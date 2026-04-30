import { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'

type CardVariant = 'default' | 'lucas' | 'mirian' | 'couple'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  pressable?: boolean
}

const BORDER_COLORS: Record<CardVariant, string> = {
  default: 'var(--color-border)',
  lucas:   'rgba(59,130,246,0.3)',
  mirian:  'rgba(236,72,153,0.3)',
  couple:  'rgba(139,92,246,0.3)',
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', pressable = false, children, className = '', style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`card ${pressable ? 'card-interactive' : ''} ${className}`}
        style={{
          borderColor: BORDER_COLORS[variant],
          cursor: pressable ? 'pointer' : undefined,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={className} style={{ padding: '16px 16px 0' }} {...props}>{children}</div>
)

const CardBody = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={className} style={{ padding: 16 }} {...props}>{children}</div>
)

const CardFooter = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={className} style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', gap: 8 }} {...props}>{children}</div>
)

export { Card, CardHeader, CardBody, CardFooter }
export type { CardProps, CardVariant }
