import { useState, useEffect } from 'react'
import { Dialog } from '../ui'
import { CalendarDays, CheckCircle2 } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (date: string) => void
  costName?: string
  title?: string
  dateLabel?: string
}

export default function ConfirmPaymentModal({ open, onClose, onConfirm, costName, title, dateLabel }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(today)

  // Reset to today whenever the modal opens
  useEffect(() => {
    if (open) setSelectedDate(today)
  }, [open])

  function handleConfirm() {
    onConfirm(selectedDate)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title={title ?? 'Confirmar pagamento'} size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Cost name */}
        {costName && (
          <div style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: 12,
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <CheckCircle2 size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              {costName}
            </p>
          </div>
        )}

        {/* Date field */}
        <div>
          <label style={{
            fontSize: 13, fontWeight: 600,
            color: 'var(--color-text-secondary)',
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 8,
          }}>
            <CalendarDays size={14} />
            {dateLabel ?? 'Quando você pagou?'}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 15,
              fontWeight: 600,
              border: '1.5px solid var(--color-border)',
              borderRadius: 10,
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
              outline: 'none',
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px 0',
              border: '1px solid var(--color-border)',
              background: 'transparent',
              borderRadius: 10,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 14, fontWeight: 600,
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-tertiary)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1, padding: '11px 0',
              border: 'none',
              background: 'var(--color-success)',
              borderRadius: 10,
              color: 'white',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'opacity 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <CheckCircle2 size={16} />
            Confirmar
          </button>
        </div>
      </div>
    </Dialog>
  )
}
