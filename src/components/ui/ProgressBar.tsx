import { motion } from 'framer-motion'

type Variant = 'default' | 'lucas' | 'mirian' | 'couple' | 'success' | 'warning' | 'danger'

interface ProgressBarProps {
  value: number
  max?: number
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  animated?: boolean
  className?: string
}

const HEIGHTS: Record<'sm' | 'md' | 'lg', number> = { sm: 6, md: 8, lg: 10 }

const GRADIENTS: Record<Variant, string> = {
  default: 'linear-gradient(90deg, #5B9CF6, #93C5FD)',
  lucas:   'linear-gradient(90deg, #5B9CF6, #93C5FD)',
  mirian:  'linear-gradient(90deg, #EC4899, #F9A8D4)',
  couple:  'linear-gradient(90deg, #5B9CF6, #8B5CF6, #EC4899)',
  success: 'linear-gradient(90deg, #10B981, #34D399)',
  warning: 'linear-gradient(90deg, #F59E0B, #FCD34D)',
  danger:  'linear-gradient(90deg, #EF4444, #F87171)',
}

export function ProgressBar({
  value, max = 100, variant = 'default',
  size = 'md', showLabel = false, label,
  animated = true, className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const h   = HEIGHTS[size]

  return (
    <div className={className} style={{ width: '100%' }}>
      {(showLabel || label) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          {label && (
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
          )}
          {showLabel && (
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginLeft: 'auto' }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      {/* Track */}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        style={{
          width: '100%',
          height: h,
          borderRadius: 99,
          background: 'var(--color-bg-tertiary)',
          overflow: 'hidden',
          display: 'block',
        }}
      >
        {/* Fill */}
        <motion.div
          initial={animated ? { width: '0%' } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            height: '100%',
            borderRadius: 99,
            background: GRADIENTS[variant],
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}

export type { ProgressBarProps }
