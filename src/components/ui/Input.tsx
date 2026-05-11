import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  prefix?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leftIcon, rightIcon, prefix, className = '', id, style, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            className="section-label"
            style={{ marginBottom: 0 }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {prefix && (
            <span style={{
              position: 'absolute', left: 14,
              color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500,
              pointerEvents: 'none', userSelect: 'none',
            }}>
              {prefix}
            </span>
          )}
          {leftIcon && !prefix && (
            <span style={{ position: 'absolute', left: 12, color: 'var(--color-text-tertiary)', pointerEvents: 'none' }}>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={className}
            autoComplete="off"
            style={{
              width: '100%', height: 44,
              background: 'rgba(14, 22, 42, 0.72)', /* glass surface — App Design System */
              border: `1px solid ${error ? 'var(--color-danger)' : 'var(--surface-border)'}`,
              borderRadius: 'var(--radius-input)',    /* 14px — App Design System */
              fontSize: 16, color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-sans)',
              paddingLeft: leftIcon || prefix ? 40 : 16,
              paddingRight: rightIcon ? 40 : 16,
              outline: 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              ...style,
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'var(--somus-blue)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = error ? 'var(--color-danger)' : 'var(--surface-border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            {...props}
          />
          {rightIcon && (
            <span style={{ position: 'absolute', right: 12, color: 'var(--color-text-tertiary)', pointerEvents: 'none' }}>
              {rightIcon}
            </span>
          )}
        </div>
        {(error || hint) && (
          <p style={{ fontSize: 12, color: error ? 'var(--color-danger)' : 'var(--color-text-tertiary)', margin: 0 }}>
            {error || hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }
