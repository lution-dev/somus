import type { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'lucas' | 'mirian' | 'couple'
type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
}

const VARIANT_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  default: { background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' },
  success: { background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)' },
  warning: { background: 'rgba(245,158,11,0.15)', color: 'var(--color-warning)' },
  danger:  { background: 'rgba(239,68,68,0.15)',  color: 'var(--color-danger)' },
  info:    { background: 'rgba(96,165,250,0.15)',  color: 'var(--color-accent-electric)' },
  lucas:   { background: 'rgba(59,130,246,0.15)',  color: 'var(--color-lucas)' },
  mirian:  { background: 'rgba(236,72,153,0.15)',  color: 'var(--color-mirian)' },
  couple:  { background: 'rgba(139,92,246,0.15)',  color: 'var(--color-accent-couple)' },
}

const DOT_COLORS: Record<BadgeVariant, string> = {
  default: 'var(--color-text-tertiary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger:  'var(--color-danger)',
  info:    'var(--color-accent-electric)',
  lucas:   'var(--color-lucas)',
  mirian:  'var(--color-mirian)',
  couple:  'var(--color-accent-couple)',
}

export function Badge({ variant = 'default', size = 'md', dot = false, children, className = '', style, ...props }: BadgeProps) {
  const sizeStyles: React.CSSProperties = size === 'sm'
    ? { fontSize: 10, padding: '2px 6px' }
    : { fontSize: 12, padding: '3px 8px' }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontWeight: 500, borderRadius: 'var(--radius-badge)',
        ...VARIANT_STYLES[variant],
        ...sizeStyles,
        ...style,
      }}
      {...props}
    >
      {dot && (
        <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: DOT_COLORS[variant] }} />
      )}
      {children}
    </span>
  )
}

export type { BadgeProps, BadgeVariant }
