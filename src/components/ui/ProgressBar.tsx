import { motion } from 'framer-motion'

type ProgressVariant = 'default' | 'lucas' | 'mirian' | 'couple' | 'success' | 'warning' | 'danger'

interface ProgressBarProps {
  value: number        // 0-100
  max?: number
  variant?: ProgressVariant
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  animated?: boolean
  className?: string
}

const trackHeight = { sm: 'h-1', md: 'h-2', lg: 'h-3' }

const fillGradients: Record<ProgressVariant, string> = {
  default: 'from-[var(--color-accent)] to-[var(--color-accent-light)]',
  lucas:   'from-[var(--color-accent-lucas)] to-blue-400',
  mirian:  'from-[var(--color-accent-mirian)] to-pink-400',
  couple:  'from-[var(--color-accent-lucas)] to-[var(--color-accent-mirian)]',
  success: 'from-[var(--color-success)] to-emerald-400',
  warning: 'from-[var(--color-warning)] to-amber-400',
  danger:  'from-[var(--color-danger)] to-red-400',
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>}
          {showLabel && (
            <span className="text-xs font-semibold text-[var(--color-text-primary)] ml-auto">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden ${trackHeight[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${fillGradients[variant]}`}
          initial={animated ? { width: '0%' } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </div>
    </div>
  )
}

export type { ProgressBarProps }
