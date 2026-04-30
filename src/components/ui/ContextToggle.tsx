type Context = 'personal' | 'couple'

interface ContextToggleProps {
  value: Context
  onChange: (ctx: Context) => void
  className?: string
  style?: React.CSSProperties
}

const options: { value: Context; label: string }[] = [
  { value: 'personal', label: 'Pessoal' },
  { value: 'couple',   label: 'Casal' },
]

export function ContextToggle({ value, onChange, className = '', style }: ContextToggleProps) {
  return (
    <div
      className={className}
      role="group"
      aria-label="Contexto financeiro"
      style={{
        display: 'inline-flex', alignItems: 'center',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 999, padding: 2,
        ...style,
      }}
    >
      {options.map((opt) => {
        const active = value === opt.value
        const activeColor = opt.value === 'personal' ? 'var(--color-accent-primary)' : 'var(--color-accent-couple)'
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            style={{
              padding: '6px 16px',
              fontSize: 13, fontWeight: 600,
              borderRadius: 999, cursor: 'pointer',
              border: 'none', fontFamily: 'var(--font-sans)',
              background: active ? activeColor : 'transparent',
              color: active ? '#fff' : 'var(--color-text-tertiary)',
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export type { ContextToggleProps, Context }
