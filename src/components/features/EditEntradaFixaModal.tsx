import { useState, useEffect } from 'react'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { formatCurrency } from '../../lib/calculations'
import type { EntradaFixa } from '../../types'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'
import { Repeat2, AlertCircle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onSave: (updates: Partial<EntradaFixa>) => void
  entradaFixa: EntradaFixa | null
}

export default function EditEntradaFixaModal({ open, onClose, onSave, entradaFixa }: Props) {
  const [name, setName]         = useState('')
  const amountInput             = useCurrencyInput()
  const [dueDay, setDueDay]     = useState('')
  const [isVariable, setIsVariable] = useState(false)

  const accentColor = '#8B5CF6'

  useEffect(() => {
    if (open && entradaFixa) {
      setName(entradaFixa.name)
      amountInput.setValue(entradaFixa.amount > 0 ? entradaFixa.amount : 0)
      setDueDay(String(entradaFixa.dueDay))
      setIsVariable(entradaFixa.isVariable ?? false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entradaFixa])

  const numAmount = amountInput.numericValue
  const numDay    = parseInt(dueDay) || 0

  const isValid =
    name.trim() !== '' &&
    numDay >= 1 && numDay <= 31 &&
    (isVariable || numAmount > 0)

  function handleSave() {
    if (!isValid) return
    onSave({
      name:       name.trim(),
      amount:     isVariable ? 0 : numAmount,
      dueDay:     numDay,
      isVariable: isVariable || undefined,
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="Editar Renda Fixa" size="md">

      {/* ── Toggle: Valor Variável ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${isVariable ? 'rgba(245,158,11,0.3)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-card)',
        padding: '12px 14px',
        marginBottom: 20,
        transition: 'border-color 200ms ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: isVariable ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertCircle size={16} color={isVariable ? '#F59E0B' : 'var(--color-text-tertiary)'} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: isVariable ? '#F59E0B' : 'var(--color-text-primary)', margin: 0 }}>
              Valor variável
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
              {isVariable ? 'O valor será informado ao confirmar o recebimento' : 'Valor fixo mensal'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVariable(v => !v)}
          aria-label="Alternar valor variável"
          style={{
            width: 44, height: 26, borderRadius: 13, flexShrink: 0,
            background: isVariable ? '#F59E0B' : 'rgba(255,255,255,0.15)',
            border: 'none', cursor: 'pointer', padding: 3,
            display: 'flex', alignItems: 'center',
            justifyContent: isVariable ? 'flex-end' : 'flex-start',
            transition: 'background 200ms ease',
          }}
        >
          <span style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', display: 'block',
          }} />
        </button>
      </div>

      {/* ── Nome ── */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Fonte de renda
        </label>
        <Input
          placeholder="Ex: Salário, Freelance, Aluguel..."
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      {/* ── Dia de recebimento ── */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Dia esperado de recebimento
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number" min={1} max={31} value={dueDay}
            onChange={e => setDueDay(e.target.value)}
            style={{
              width: 72, padding: '10px 12px', fontSize: 16, fontWeight: 700,
              fontFamily: 'var(--font-sans)', textAlign: 'center',
              background: 'var(--color-bg-tertiary)',
              border: `1px solid ${numDay >= 1 && numDay <= 31 ? accentColor + '50' : 'var(--color-border)'}`,
              borderRadius: 10, color: 'var(--color-text-primary)', outline: 'none',
            }}
          />
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>de cada mês</span>
        </div>
      </div>

      {/* ── Valor (hidden if variable) ── */}
      {!isVariable && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Valor esperado
          </label>
          <Input
            prefix="R$"
            inputMode="numeric"
            placeholder="0,00"
            value={amountInput.displayValue}
            onChange={amountInput.handleChange}
            style={{ fontSize: 18, fontWeight: 700 }}
          />
        </div>
      )}

      <DialogFooter>
        <Button
          variant="primary"
          size="md"
          fullWidth
          disabled={!isValid}
          onClick={handleSave}
          style={isValid ? { background: accentColor } : undefined}
        >
          <Repeat2 size={15} />
          {!isVariable && numAmount > 0 ? `Salvar — ${formatCurrency(numAmount)}/mês` : 'Salvar'}
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
      </DialogFooter>
    </Dialog>
  )
}
