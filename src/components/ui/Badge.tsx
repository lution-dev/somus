import type { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'lucas' | 'mirian' | 'couple'
type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  success: 'bg-[rgba(16,185,129,0.15)] text-[var(--color-success)] border border-[rgba(16,185,129,0.3)]',
  warning: 'bg-[rgba(245,158,11,0.15)] text-[var(--color-warning)] border border-[rgba(245,158,11,0.3)]',
  danger:  'bg-[rgba(239,68,68,0.15)] text-[var(--color-danger)] border border-[rgba(239,68,68,0.3)]',
  info:    'bg-[rgba(6,182,212,0.15)] text-[var(--color-info)] border border-[rgba(6,182,212,0.3)]',
  lucas:   'bg-[rgba(59,130,246,0.15)] text-[var(--color-accent-lucas)] border border-[rgba(59,130,246,0.3)]',
  mirian:  'bg-[rgba(236,72,153,0.15)] text-[var(--color-accent-mirian)] border border-[rgba(236,72,153,0.3)]',
  couple:  'bg-[rgba(139,92,246,0.15)] text-[var(--color-accent-couple)] border border-[rgba(139,92,246,0.3)]',
}

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-text-tertiary)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger:  'bg-[var(--color-danger)]',
  info:    'bg-[var(--color-info)]',
  lucas:   'bg-[var(--color-accent-lucas)]',
  mirian:  'bg-[var(--color-accent-mirian)]',
  couple:  'bg-[var(--color-accent-couple)]',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-1.5 py-0.5 rounded-[4px]',
  md: 'text-xs px-2.5 py-1 rounded-[var(--radius-sm)]',
}

export function Badge({ variant = 'default', size = 'md', dot = false, children, className = '', ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  )
}

export type { BadgeProps, BadgeVariant }
