import { useEffect, useState } from 'react'

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

function getFillClass(variant: Variant, pct: number): string {
  if (variant === 'success') return 'progress-fill--success'
  if (variant === 'warning') return 'progress-fill--warning'
  if (variant === 'danger')  return 'progress-fill--danger'
  if (variant === 'couple')  return 'progress-fill--couple'
  if (variant === 'lucas')   return 'progress-fill--lucas'
  if (variant === 'mirian')  return 'progress-fill--mirian'
  if (pct >= 100) return 'progress-fill--success'
  if (pct >= 50)  return 'progress-fill--primary'
  return 'progress-fill--warning'
}

export function ProgressBar({
  value, max = 100, variant = 'default',
  size = 'md', showLabel = false, label,
  className = '',
}: ProgressBarProps) {
  const target = Math.min(100, Math.max(0, (value / max) * 100))
  const heights: Record<string, number> = { sm: 4, md: 6, lg: 8 }
  const h = heights[size] ?? 4

  // Animate from 0 → target on mount (brand: calm, smooth, 0.7s)
  const [displayPct, setDisplayPct] = useState(0)
  useEffect(() => {
    // Small delay so the element is in the DOM before animating
    const raf = requestAnimationFrame(() => setDisplayPct(target))
    return () => cancelAnimationFrame(raf)
  }, [target])

  return (
    <div className={className} style={{ width: '100%' }}>
      {(showLabel || label) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          {label && (
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</span>
          )}
          {showLabel && (
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', marginLeft: 'auto' }}>
              {Math.round(target)}%
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
        {/* Fill — width transitions from 0 → target (0.7s ease-out, brand: calm) */}
        <div
          className={`progress-fill ${getFillClass(variant, target)}`}
          style={{
            width: `${displayPct}%`,
            transition: 'width 0.70s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  )
}

export type { ProgressBarProps }
