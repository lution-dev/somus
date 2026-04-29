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
  ({ label, hint, error, leftIcon, rightIcon, prefix, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3.5 text-[var(--color-text-secondary)] text-sm font-medium pointer-events-none select-none">
              {prefix}
            </span>
          )}
          {leftIcon && !prefix && (
            <span className="absolute left-3 text-[var(--color-text-tertiary)] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full h-11 bg-[var(--color-bg-secondary)] border rounded-[var(--radius-md)]',
              'text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]',
              'transition-all duration-[var(--transition-fast)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1 focus:ring-offset-[var(--color-bg-primary)]',
              error
                ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
              leftIcon || prefix ? 'pl-10' : 'pl-4',
              rightIcon ? 'pr-10' : 'pr-4',
              className,
            ].join(' ')}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[var(--color-text-tertiary)] pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {(error || hint) && (
          <p className={`text-xs ${error ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-tertiary)]'}`}>
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
