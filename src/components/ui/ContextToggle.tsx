import { motion } from 'framer-motion'

type Context = 'personal' | 'couple'

interface ContextToggleProps {
  value: Context
  onChange: (ctx: Context) => void
  className?: string
}

const options: { value: Context; label: string; color: string }[] = [
  { value: 'personal', label: 'Pessoal', color: 'var(--color-accent-lucas)' },
  { value: 'couple',   label: 'Casal',   color: 'var(--color-accent-couple)' },
]

export function ContextToggle({ value, onChange, className = '' }: ContextToggleProps) {
  return (
    <div
      className={`relative inline-flex items-center bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-full)] p-0.5 ${className}`}
      role="group"
      aria-label="Contexto financeiro"
    >
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className="relative z-10 px-4 py-1.5 text-sm font-semibold rounded-full cursor-pointer transition-colors duration-200 select-none"
            style={{ color: active ? '#fff' : 'var(--color-text-tertiary)' }}
          >
            {active && (
              <motion.span
                layoutId="context-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: opt.color }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export type { ContextToggleProps, Context }
