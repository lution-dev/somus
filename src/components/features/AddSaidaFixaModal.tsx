import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { formatCurrency } from '../../lib/calculations'
import { getDivisaoIcon } from '../../lib/icons'
import type { PaymentMethod, BillingCycle } from '../../types'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'

interface Props {
  open: boolean
  onClose: () => void
  divisaoId: string
  divisaoName: string
}

const PAYMENT_OPTIONS: { key: PaymentMethod; label: string }[] = [
  { key: 'pix', label: 'Pix' },
  { key: 'boleto', label: 'Boleto' },
  { key: 'credit', label: 'Cartão Crédito' },
  { key: 'auto_debit', label: 'Débito Automático' },
]

export default function AddSaidaFixaModal({ open, onClose, divisaoId, divisaoName }: Props) {
  const [name, setName] = useState('')
  const amountInput = useCurrencyInput()
  const [dueDay, setDueDay] = useState('')
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('month')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [isVariable, setIsVariable] = useState(false)

  const currentUser = useAppStore(s => s.currentUser)
  const addSaidaFixa = useAppStore(s => s.addSaidaFixa)
  const { color } = getDivisaoIcon(divisaoId)

  useEffect(() => {
    if (open) {
      setName('')
      amountInput.reset()
      setDueDay('')
      setBillingCycle('month')
      setPaymentMethod('pix')
      setIsVariable(false)
    }
  }, [open])

  const numAmount = amountInput.numericValue
  const numDay = parseInt(dueDay) || 0

  // Normalize to monthly — if billed yearly, divide by 12
  const monthlyAmount = billingCycle === 'year' ? numAmount / 12 : numAmount

  const isValid =
    name.trim() !== '' &&
    numDay >= 1 && numDay <= 31 &&
    (isVariable || numAmount > 0)

  function handleConfirm() {
    if (!isValid || !currentUser) return
    addSaidaFixa({
      userId: currentUser.id,
      name: name.trim(),
      amount: isVariable ? 0 : monthlyAmount,
      dueDay: numDay,
      paymentMethod,
      divisaoId,
      autoDebit: paymentMethod === 'auto_debit',
      paidDates: [],
      category: divisaoName,
      color,
      isVariable,
      billingCycle,
    })
    onClose()
  }

  // ── Shared chip style helpers ────────────────────────────────────────────────
  function chipStyle(active: boolean) {
    return {
      padding: '7px 16px',
      borderRadius: 20,
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
    <Dialog open={open} onClose={onClose} title="Adicionar Custo Fixo" size="md">

      {/* ── Toggle: Valor Variável ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '12px 14px',
        marginBottom: 20,
      }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            Valor Variável?
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
            {isVariable ? 'O valor não contabilizará no total' : 'Valor fixo mensal confirmado'}
          </p>
        </div>
        {/* Toggle switch */}
        <button
          id="toggle-valor-variavel"
          onClick={() => setIsVariable(v => !v)}
          aria-label="Alternar valor variável"
          style={{
            width: 44, height: 26, borderRadius: 13, flexShrink: 0,
            background: isVariable ? color : 'rgba(255,255,255,0.15)',
            border: 'none', cursor: 'pointer', padding: 3,
            display: 'flex', alignItems: 'center',
            justifyContent: isVariable ? 'flex-end' : 'flex-start',
            transition: 'background 200ms ease',
          }}
        >
          <span style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            display: 'block',
          }} />
        </button>
      </div>

      {/* ── Nome do custo ── */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Custo Fixo</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Necessário</p>
        </div>
        <Input
          placeholder="Nome do Custo"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      {/* ── Cobrado por ── */}
      <div style={{ marginBottom: 4, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Cobrado por</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Necessário</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['month', 'year'] as BillingCycle[]).map(cycle => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              style={chipStyle(billingCycle === cycle)}
            >
              {cycle === 'month' ? 'Mês' : 'Ano'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Dia da Recorrência ── */}
      <div style={{ marginBottom: 4, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Dia da Recorrência</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Necessário</p>
        </div>
        <Input
          type="number"
          inputMode="numeric"
          placeholder={`Todo dia ${numDay > 0 ? numDay : '5'}`}
          value={dueDay}
          onChange={e => setDueDay(e.target.value)}
        />
      </div>

      {/* ── Valor (hidden if variable) ── */}
      {!isVariable && (
        <div style={{ marginBottom: 4, marginTop: 16 }}>
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
            style={{ fontSize: 18, fontWeight: 700 }}
          />
          {billingCycle === 'year' && numAmount > 0 && (
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6 }}>
              ≈ {formatCurrency(numAmount / 12)}/mês
            </p>
          )}
        </div>
      )}

      {/* ── Forma de Pagamento ── */}
      <div style={{ marginTop: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Forma de Pagamento</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Necessário</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PAYMENT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setPaymentMethod(opt.key)}
              style={chipStyle(paymentMethod === opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="md"
          fullWidth
          disabled={!isValid}
          onClick={handleConfirm}
          style={isValid ? { background: color } : undefined}
        >
          {!isVariable && numAmount > 0
            ? `Enviar — ${formatCurrency(monthlyAmount)}/mês`
            : 'Enviar'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
