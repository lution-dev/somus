import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { formatCurrency } from '../../lib/calculations'
import type { SaidaFixa } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (updates: Partial<SaidaFixa>) => void
  saidaFixa: SaidaFixa | null
}

export default function EditSaidaFixaModal({ open, onClose, onSave, saidaFixa }: Props) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('')

  useEffect(() => {
    if (open && saidaFixa) {
      setName(saidaFixa.name)
      setAmount(String(saidaFixa.amount))
      setDueDay(String(saidaFixa.dueDay))
    }
  }, [open, saidaFixa])

  const numAmount = parseFloat(amount.replace(',', '.')) || 0
  const numDay = parseInt(dueDay) || 0
  const isValid = numAmount > 0 && name.trim() && numDay >= 1 && numDay <= 31

  function handleSave() {
    if (!isValid) return
    onSave({
      name: name.trim(),
      amount: numAmount,
      dueDay: numDay,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="Editar Custo Fixo" size="md">
      {/* Nome */}
      <div style={{ marginBottom: 12 }}>
        <Input
          label="Nome"
          placeholder="Ex: Aluguel, Netflix, Seguro..."
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      {/* Valor */}
      <div style={{ marginBottom: 12 }}>
        <Input
          label="Valor mensal"
          prefix="R$"
          type="number"
          inputMode="decimal"
          placeholder="0,00"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ fontSize: 20, fontWeight: 700 }}
        />
      </div>

      {/* Dia de vencimento */}
      <div style={{ marginBottom: 16 }}>
        <Input
          label="Dia de vencimento"
          type="number"
          inputMode="numeric"
          placeholder="1-31"
          value={dueDay}
          onChange={e => setDueDay(e.target.value)}
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
