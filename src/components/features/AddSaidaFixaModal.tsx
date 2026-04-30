import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { formatCurrency } from '../../lib/calculations'
import { getCaixinhaIcon } from '../../lib/icons'

interface Props {
  open: boolean
  onClose: () => void
  caixinhaId: string
  caixinhaName: string
}

export default function AddSaidaFixaModal({ open, onClose, caixinhaId, caixinhaName }: Props) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('')

  const currentUser = useAppStore(s => s.currentUser)
  const addSaidaFixa = useAppStore(s => s.addSaidaFixa)
  const { Icon, color } = getCaixinhaIcon(caixinhaId)

  useEffect(() => {
    if (open) {
      setName('')
      setAmount('')
      setDueDay('')
    }
  }, [open])

  const numAmount = parseFloat(amount.replace(',', '.')) || 0
  const numDay = parseInt(dueDay) || 0
  const isValid = numAmount > 0 && name.trim() && numDay >= 1 && numDay <= 31

  function handleConfirm() {
    if (!isValid || !currentUser) return
    addSaidaFixa({
      userId: currentUser.id,
      name: name.trim(),
      amount: numAmount,
      dueDay: numDay,
      paymentMethod: 'pix',
      caixinhaId,
      autoDebit: false,
      paidDates: [],
      category: caixinhaName,
      color,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="Novo Custo Fixo" size="md">
      {/* Caixinha badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        borderRadius: 12, padding: '10px 14px',
        marginBottom: 16,
      }}>
        <Icon size={18} style={{ color }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{caixinhaName}</span>
      </div>

      {/* Nome */}
      <div style={{ marginBottom: 12 }}>
        <Input
          label="Nome da conta"
          placeholder="Ex: Netflix, Seguro, Luz..."
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
          onClick={handleConfirm}
        >
          Adicionar — {numAmount > 0 ? formatCurrency(numAmount) : 'R$ 0,00'}
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
      </DialogFooter>
    </Dialog>
  )
}
