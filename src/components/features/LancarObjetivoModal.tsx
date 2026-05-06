import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { formatCurrency } from '../../lib/calculations'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { ObjetivoMovement } from '../../types'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'

type MovType = 'deposit' | 'withdraw'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (mv: Omit<ObjetivoMovement, 'id'>) => void
  title?: string
  initialType?: MovType
  initialAmount?: number
  initialDescription?: string
  initialDate?: string
}

export default function LancarObjetivoModal({
  open,
  onClose,
  onSave,
  title = 'Lançar Pagamento',
  initialType = 'deposit',
  initialAmount = 0,
  initialDescription = '',
  initialDate = '',
}: Props) {
  const [type, setType] = useState<MovType>('deposit')
  const amountInput = useCurrencyInput()
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    if (open) {
      setType(initialType)
      if (initialAmount > 0) amountInput.setValue(initialAmount)
      else amountInput.reset()
      setDescription(initialDescription)
      setDate(initialDate || new Date().toISOString().slice(0, 10))
    }
  }, [open, initialType, initialAmount, initialDescription, initialDate])

  const numAmount = amountInput.numericValue
  const isValid = numAmount > 0 && description.trim() !== ''

  const isDeposit = type === 'deposit'
  const typeColor = isDeposit ? 'var(--color-success)' : 'var(--color-danger)'
  const typeColorHex = isDeposit ? '#10B981' : '#EF4444'

  function handleSave() {
    if (!isValid) return
    onSave({
      date,
      amount: numAmount,
      description: description.trim(),
      type,
    })
    onClose()
  }

  function chipStyle(active: boolean, color: string) {
    return {
      flex: 1,
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: 6,
      padding: '10px 12px',
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 600 as const,
      fontFamily: 'var(--font-sans)',
      cursor: 'pointer' as const,
      border: `1.5px solid ${active ? color : 'var(--color-border)'}`,
      background: active ? `${color}18` : 'transparent',
      color: active ? color : 'var(--color-text-secondary)',
      transition: 'all 150ms ease',
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={title} size="md">

      {/* ── Tipo de lançamento ── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 10px' }}>
          Tipo
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setType('deposit')}
            style={chipStyle(isDeposit, '#10B981')}
          >
            <ArrowUpRight size={15} />
            Depósito
          </button>
          <button
            onClick={() => setType('withdraw')}
            style={chipStyle(!isDeposit, '#EF4444')}
          >
            <ArrowDownRight size={15} />
            Retirada
          </button>
        </div>
      </div>

      {/* ── Valor ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Valor</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Necessário</p>
        </div>
        <Input
          prefix="R$"
          inputMode="numeric"
          placeholder="0,00"
          value={amountInput.displayValue}
          onChange={amountInput.handleChange}
          style={{ fontSize: 22, fontWeight: 700, color: typeColor }}
        />
        {numAmount > 0 && (
          <p style={{ fontSize: 12, color: typeColor, marginTop: 6 }}>
            {isDeposit ? '+' : '−'}{formatCurrency(numAmount)}
          </p>
        )}
      </div>

      {/* ── Descrição ── */}
      <div style={{ marginBottom: 16 }}>
        <Input
          label="Descrição"
          placeholder={isDeposit ? 'Ex: Transferência do mês, Bônus...' : 'Ex: Gasto emergencial...'}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      {/* ── Data ── */}
      <div style={{ marginBottom: 20 }}>
        <Input
          label="Data"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <DialogFooter>
        <Button
          variant="primary"
          size="md"
          fullWidth
          disabled={!isValid}
          onClick={handleSave}
          style={isValid ? { background: typeColorHex } : undefined}
        >
          {isValid
            ? `${isDeposit ? 'Depositar' : 'Retirar'} — ${formatCurrency(numAmount)}`
            : 'Confirmar Lançamento'
          }
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>
          Cancelar
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
