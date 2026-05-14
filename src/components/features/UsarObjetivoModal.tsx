import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { formatCurrency } from '../../lib/calculations'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'
import { Wallet } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  objetivoName: string
  currentAmount: number
  onConfirm: (amount: number, description: string, date: string) => void
}

export default function UsarObjetivoModal({ open, onClose, objetivoName, currentAmount, onConfirm }: Props) {
  const amountInput = useCurrencyInput()
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    if (open) {
      amountInput.setValue(currentAmount)
      setDescription(`Utilização: ${objetivoName}`)
      setDate(new Date().toISOString().slice(0, 10))
    }
  }, [open])

  const numAmount = amountInput.numericValue
  const remainingAfter = currentAmount - numAmount
  const isValid = numAmount > 0 && numAmount <= currentAmount && description.trim() !== ''

  return (
    <Dialog open={open} onClose={onClose} title="Usar esse valor" size="md">
      {/* Patrimônio disponível */}
      <div style={{
        background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)',
        borderRadius: 12, padding: '10px 14px', marginBottom: 20,
      }}>
        <p style={{ fontSize: 11, color: 'var(--color-accent-couple)', margin: '0 0 2px', fontWeight: 500, letterSpacing: '0.02em' }}>
          Patrimônio construído
        </p>
        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
          {formatCurrency(currentAmount)}
        </p>
      </div>

      {/* Valor a usar */}
      <div style={{ marginBottom: 16 }}>
        <Input
          prefix="R$"
          label="Valor a utilizar"
          inputMode="numeric"
          placeholder="0,00"
          value={amountInput.displayValue}
          onChange={amountInput.handleChange}
          style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-accent-couple)' }}
        />
        {numAmount > currentAmount && (
          <p style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4 }}>
            Valor maior que o patrimônio disponível.
          </p>
        )}
      </div>

      {/* Descrição */}
      <div style={{ marginBottom: 16 }}>
        <Input
          label="Descrição"
          placeholder="Ex: Contratação do buffet, Entrada do apartamento..."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      {/* Data */}
      <div style={{ marginBottom: 20 }}>
        <Input
          label="Data"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {/* Preview do restante */}
      {remainingAfter > 0 && numAmount > 0 && numAmount < currentAmount && (
        <div style={{
          background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: 12, padding: '10px 14px', marginBottom: 20,
        }}>
          <p style={{ fontSize: 12, color: '#10B981', margin: 0, fontWeight: 500 }}>
            Parte do patrimônio ainda continua evoluindo: {formatCurrency(remainingAfter)}
          </p>
        </div>
      )}

      <DialogFooter>
        <Button
          variant="primary"
          size="md"
          fullWidth
          disabled={!isValid}
          onClick={() => { if (isValid) { onConfirm(numAmount, description.trim(), date); onClose() } }}
        >
          <Wallet size={15} />
          {isValid ? `Confirmar — ${formatCurrency(numAmount)}` : 'Confirmar utilização'}
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
      </DialogFooter>
    </Dialog>
  )
}
