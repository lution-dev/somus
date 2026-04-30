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

/**
 * Returns the correct fill color based on completion percentage.
 * ≥100%: green, 50–99%: blue, <50%: amber.
 * If a specific variant is given (couple, mirian, etc.), it overrides auto-detection.
 */
function getFillClass(variant: Variant, pct: number): string {
  if (variant === 'couple')  return 'progress-fill--couple'
  if (variant === 'mirian')  return 'progress-fill--mirian'
  if (variant === 'danger')  return 'progress-fill--warning' // <50% items get amber

  // Auto-detect by percentage
  if (pct >= 100) return 'progress-fill--success'
  if (pct >= 50)  return 'progress-fill--primary'
  return 'progress-fill--warning'
}

export function ProgressBar({
  value, max = 100, variant = 'default',
  size = 'md', showLabel = false, label,
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const heights: Record<string, number> = { sm: 4, md: 6, lg: 8 }
  const h = heights[size] ?? 4

  return (
    <div className={className} style={{ width: '100%' }}>
      {(showLabel || label) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          {label && (
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</span>
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
        className="progress-track"
        style={{ height: h }}
      >
        {/* Fill */}
        <div
          className={`progress-fill ${getFillClass(variant, pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export type { ProgressBarProps }
