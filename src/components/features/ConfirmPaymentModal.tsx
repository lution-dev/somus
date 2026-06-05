import { useState, useEffect } from 'react'
import { Dialog } from '../ui'
import { CalendarDays, CheckCircle2, DollarSign } from 'lucide-react'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'
import { formatCurrency } from '../../lib/calculations'

interface Props {
  open: boolean
  onClose: () => void
  /** Callback recebe a data e o valor confirmado (que pode ter sido editado) */
  onConfirm: (date: string, amount?: number) => void
  costName?: string
  title?: string
  dateLabel?: string
  /** Rótulo do campo de valor. Default: 'Valor recebido' */
  amountLabel?: string
  /** Valor original do lançamento pendente — quando passado, exibe campo de edição de valor */
  initialAmount?: number
}

export default function ConfirmPaymentModal({ open, onClose, onConfirm, costName, title, dateLabel, amountLabel, initialAmount }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(today)
  const amountInput = useCurrencyInput()

  // Reset sempre que abre
  useEffect(() => {
    if (open) {
      setSelectedDate(today)
      if (initialAmount !== undefined) {
        amountInput.setValue(initialAmount)
      }
    }
  }, [open])

  function handleConfirm() {
    const confirmedAmount = initialAmount !== undefined ? amountInput.numericValue : undefined
    onConfirm(selectedDate, confirmedAmount)
    onClose()
  }

  const hasAmount = initialAmount !== undefined
  const isValid = !hasAmount || amountInput.numericValue > 0

  return (
    <Dialog open={open} onClose={onClose} title={title ?? 'Confirmar pagamento'} size="sm">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Nome do lançamento */}
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

        {/* Campo de valor — só aparece quando initialAmount é passado */}
        {hasAmount && (
          <div>
            <label style={{
              fontSize: 13, fontWeight: 600,
              color: 'var(--color-text-secondary)',
              display: 'flex', alignItems: 'center', gap: 6,
              marginBottom: 8,
            }}>
              <DollarSign size={14} />
              {amountLabel ?? 'Valor recebido'}
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)',
                pointerEvents: 'none',
              }}>R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={amountInput.displayValue}
                onChange={amountInput.handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  fontSize: 20,
                  fontWeight: 700,
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 10,
                  background: 'var(--color-bg-tertiary)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-sans)',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
            {/* Hint se o valor mudou */}
            {amountInput.numericValue > 0 && amountInput.numericValue !== initialAmount && (
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '4px 0 0', textAlign: 'right' }}>
                Original: {formatCurrency(initialAmount!)}
              </p>
            )}
          </div>
        )}

        {/* Data */}
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

        {/* Ações */}
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
            disabled={!isValid}
            style={{
              flex: 1, padding: '11px 0',
              border: 'none',
              background: isValid ? 'var(--color-success)' : 'var(--color-bg-tertiary)',
              borderRadius: 10,
              color: isValid ? 'white' : 'var(--color-text-tertiary)',
              cursor: isValid ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-sans)',
              fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'opacity 150ms ease',
            }}
            onMouseEnter={e => isValid && (e.currentTarget.style.opacity = '0.88')}
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
