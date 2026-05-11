import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'lucas' | 'mirian' | 'couple'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  primary:   { background: 'var(--color-accent-primary)', color: '#fff' },
  secondary: { background: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' },
  ghost:     { background: 'transparent', color: 'var(--color-text-secondary)' },
  danger:    { background: 'var(--color-danger)', color: '#fff' },
  lucas:     { background: 'var(--color-lucas)', color: '#fff' },
  mirian:    { background: 'var(--color-mirian)', color: '#fff' },
  couple:    { background: 'var(--color-accent-couple)', color: '#fff' },
}

const SIZE_STYLES: Record<Size, React.CSSProperties> = {
  sm:   { height: 32, padding: '0 12px', fontSize: 12, borderRadius: 'var(--radius-badge)' },
  md:   { height: 40, padding: '0 20px', fontSize: 14, borderRadius: 'var(--radius-button)' },
  lg:   { height: 48, padding: '0 28px', fontSize: 16, borderRadius: 'var(--radius-card)' },
  icon: { height: 40, width: 40, padding: 0, borderRadius: 'var(--radius-button)' },
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, fullWidth = false, children, disabled, className = '', style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={className}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontWeight: 600,
          fontFamily: variant === 'primary' ? 'var(--font-display)' : 'var(--font-sans)',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          border: 'none',
          opacity: disabled || loading ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
          transition: 'background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
          ...VARIANT_STYLES[variant],
          ...SIZE_STYLES[size],
          ...style,
        }}
        {...props}
      >
        {loading && (
          <svg
            style={{ animation: 'spin 1s linear infinite', height: 16, width: 16, flexShrink: 0 }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps, Variant as ButtonVariant, Size as ButtonSize }
