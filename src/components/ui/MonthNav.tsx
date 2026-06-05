import { ChevronLeft, ChevronRight } from 'lucide-react'
import { shiftMonth, monthLabel } from '../../lib/months'

interface MonthNavProps {
  month: string
  today: string
  onChange: (m: string) => void
  showLabel?: boolean
}

export default function MonthNav({ month, today, onChange, showLabel = true }: MonthNavProps) {
  const isCurrentMonth = month === today
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button
        onClick={() => onChange(shiftMonth(month, -1))}
        style={{
          width: 28, height: 28, borderRadius: 8, border: 'none',
          background: 'rgba(255,255,255,0.06)', cursor: 'pointer',
          color: 'var(--color-text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Mês anterior"
      >
        <ChevronLeft size={15} />
      </button>
      {showLabel && (
        <span style={{
          fontSize: 13, fontWeight: 600,
          color: 'var(--color-text-primary)',
          minWidth: 72, textAlign: 'center',
        }}>
          {monthLabel(month)}
        </span>
      )}
      <button
        onClick={() => !isCurrentMonth && onChange(shiftMonth(month, 1))}
        style={{
          width: 28, height: 28, borderRadius: 8, border: 'none',
          background: isCurrentMonth ? 'transparent' : 'rgba(255,255,255,0.06)',
          cursor: isCurrentMonth ? 'default' : 'pointer',
          color: isCurrentMonth ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        aria-disabled={isCurrentMonth}
        aria-label="Próximo mês"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  )
}
