import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { formatCurrency } from '../../lib/calculations'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (updates: { description: string; amount: number; date: string }) => void
  initialDescription: string
  initialAmount: number
  initialDate: string
  title?: string
}

export default function EditMovementModal({
  open, onClose, onSave,
  initialDescription, initialAmount, initialDate,
  title = 'Editar Lançamento',
}: Props) {
  const [description, setDescription] = useState('')
  const amountInput = useCurrencyInput()
  const [date, setDate] = useState('')

  useEffect(() => {
    if (open) {
      setDescription(initialDescription)
      amountInput.setValue(Math.abs(initialAmount))
      setDate(initialDate)
    }
  }, [open, initialDescription, initialAmount, initialDate])

  const numAmount = amountInput.numericValue
  const isValid = numAmount > 0 && description.trim()
  const isExpense = initialAmount < 0

  function handleSave() {
    if (!isValid) return
    onSave({
      description: description.trim(),
      amount: isExpense ? -numAmount : numAmount,
      date,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title={title} size="md">
      {/* Descrição */}
      <div style={{ marginBottom: 12 }}>
        <Input
          label="Descrição"
          placeholder="Ex: Salário, Depósito, Compra..."
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      {/* Valor */}
      <div style={{ marginBottom: 12 }}>
        <Input
          label="Valor"
          prefix="R$"
          inputMode="numeric"
          placeholder="0,00"
          value={amountInput.displayValue}
          onChange={amountInput.handleChange}
          style={{ fontSize: 20, fontWeight: 700 }}
        />
      </div>

      {/* Data */}
      <div style={{ marginBottom: 16 }}>
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
        >
          Salvar — {numAmount > 0 ? formatCurrency(numAmount) : 'R$ 0,00'}
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
      </DialogFooter>
    </Dialog>
  )
}
