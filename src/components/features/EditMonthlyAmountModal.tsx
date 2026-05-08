import { useEffect } from 'react'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { formatCurrency, getEffectiveAmount } from '../../lib/calculations'
import { getDivisaoIcon } from '../../lib/icons'
import type { SaidaFixa } from '../../types'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'

interface Props {
  open: boolean
  onClose: () => void
  saidaFixa: SaidaFixa | null
  yearMonth: string  // 'YYYY-MM'
  onSave: (yearMonth: string, amount: number) => void
}

function getMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())
}

export default function EditMonthlyAmountModal({ open, onClose, saidaFixa, yearMonth, onSave }: Props) {
  const amountInput = useCurrencyInput()

  const { color } = getDivisaoIcon(saidaFixa?.divisaoId ?? 'cx-essencial')

  useEffect(() => {
    if (open && saidaFixa) {
      const currentValue = getEffectiveAmount(saidaFixa, yearMonth)
      amountInput.setValue(currentValue)
    }
  }, [open, saidaFixa, yearMonth])

  const numAmount = amountInput.numericValue
  const monthLabel = getMonthLabel(yearMonth)
  const baseAmount = saidaFixa?.amount ?? 0
  const hasOverride = saidaFixa?.monthlyAmountOverrides?.[yearMonth] !== undefined

  function handleSave() {
    if (numAmount < 0) return
    onSave(yearMonth, numAmount)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title={`Valor de ${monthLabel}`} size="sm">

      {/* Context info */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '10px 14px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: saidaFixa?.color || color,
          boxShadow: `0 0 8px ${saidaFixa?.color || color}`,
          flexShrink: 0,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            {saidaFixa?.name}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '1px 0 0' }}>
            Valor base: {formatCurrency(baseAmount)}
            {baseAmount === 0 && ' (variável)'}
          </p>
        </div>
        {hasOverride && (
          <span style={{
            fontSize: 10, fontWeight: 700,
            background: 'rgba(245,158,11,0.12)',
            color: 'var(--color-warning)',
            padding: '2px 8px', borderRadius: 6,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            Editado
          </span>
        )}
      </div>

      {/* Valor field */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            Valor real de {monthLabel.split(' ')[0]}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Somente este mês</p>
        </div>
        <Input
          prefix="R$"
          inputMode="numeric"
          placeholder="0,00"
          value={amountInput.displayValue}
          onChange={amountInput.handleChange}
          style={{ fontSize: 22, fontWeight: 700 }}
          autoFocus
        />
      </div>

      {/* Note */}
      <p style={{
        fontSize: 12,
        color: 'var(--color-text-tertiary)',
        margin: '0 0 20px',
        lineHeight: 1.5,
      }}>
        Este valor é usado apenas para este mês. O custo fixo base de{' '}
        <strong style={{ color: 'var(--color-text-secondary)' }}>{formatCurrency(baseAmount)}</strong>{' '}
        não será alterado.
      </p>

      <DialogFooter>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleSave}
          style={{ background: color }}
        >
          Salvar {numAmount > 0 ? `— ${formatCurrency(numAmount)}` : ''}
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
      </DialogFooter>
    </Dialog>
  )
}
