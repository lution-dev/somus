import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { getDivisaoIcon } from '../../lib/icons'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { Check, ChevronDown } from 'lucide-react'
import type { SaidaVariavel, PaymentMethod } from '../../types'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'
import { formatCurrency } from '../../lib/calculations'
import { useShallow } from 'zustand/react/shallow'

interface Props {
  open: boolean
  onClose: () => void
  saidaVariavel: SaidaVariavel | null
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'pix',        label: 'Pix' },
  { value: 'debit',      label: 'Débito' },
  { value: 'credit',     label: 'Crédito' },
  { value: 'cash',       label: 'Dinheiro' },
  { value: 'auto_debit', label: 'Débito automático' },
  { value: 'boleto',     label: 'Boleto' },
]

export default function EditSaidaVariavelModal({ open, onClose, saidaVariavel }: Props) {
  const [description, setDescription]     = useState('')
  const amountInput                        = useCurrencyInput()
  const [paymentMethod, setPaymentMethod]  = useState<PaymentMethod | ''>('')
  const [pmOpen, setPmOpen]               = useState(false)
  const [date, setDate]                   = useState('')
  const [subcategory, setSubcategory]     = useState('')
  const [divisaoId, setDivisaoId]         = useState('')
  const [divisaoOpen, setDivisaoOpen]     = useState(false)

  const divisoes         = useAppStore(useShallow(s => s.divisoes))
  const editSaidaVariavel = useAppStore(s => s.editSaidaVariavel)

  // Pré-preenche os campos quando abre com um lançamento existente
  useEffect(() => {
    if (open && saidaVariavel) {
      setDescription(saidaVariavel.description)
      amountInput.setValue(saidaVariavel.amount)
      setPaymentMethod(saidaVariavel.paymentMethod)
      setDate(saidaVariavel.date)
      setSubcategory(saidaVariavel.subcategory ?? '')
      setDivisaoId(saidaVariavel.divisaoId)
      setPmOpen(false)
      setDivisaoOpen(false)
    }
  }, [open, saidaVariavel])

  const numAmount = amountInput.numericValue
  const isValid   = numAmount > 0 && description.trim() && paymentMethod && divisaoId

  function handleSave() {
    if (!isValid || !saidaVariavel || !paymentMethod) return
    editSaidaVariavel(saidaVariavel.id, {
      amount:      numAmount,
      description: description.trim(),
      date,
      category:    saidaVariavel.category,
      divisaoId:   divisaoId !== saidaVariavel.divisaoId ? divisaoId : undefined,
    })
    onClose()
  }

  const selectedDivisao = divisoes.find(d => d.id === divisaoId)
  const { Icon, color } = getDivisaoIcon(divisaoId || saidaVariavel?.divisaoId || '')
  const pmLabel = PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label ?? ''

  if (!saidaVariavel) return null

  return (
    <Dialog open={open} onClose={onClose} title="Editar Lançamento" size="md">

      {/* Descrição */}
      <div style={{ marginBottom: 12 }}>
        <Input
          label="Descrição"
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

      {/* Divisão */}
      <div style={{ marginBottom: 12, position: 'relative' }}>
        <label className="section-label" style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>
          Divisão
        </label>
        <button
          type="button"
          onClick={() => setDivisaoOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '10px 14px',
            fontSize: 14, fontFamily: 'var(--font-sans)',
            background: 'var(--color-bg-tertiary)',
            border: `1px solid ${selectedDivisao ? selectedDivisao.color + '60' : 'var(--color-border)'}`,
            borderRadius: 12, cursor: 'pointer',
            color: 'var(--color-text-primary)',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {selectedDivisao && (
              <div style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                background: `${color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={14} style={{ color }} />
              </div>
            )}
            <span style={{ fontWeight: selectedDivisao ? 600 : 400, color: selectedDivisao ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
              {selectedDivisao?.name ?? 'Escolha uma divisão'}
            </span>
          </div>
          <ChevronDown
            size={16}
            color="var(--color-text-tertiary)"
            style={{ transition: 'transform 150ms', transform: divisaoOpen ? 'rotate(180deg)' : 'none' }}
          />
        </button>
        {divisaoOpen && (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '100%',
            marginTop: 4, zIndex: 50,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {divisoes.map((d, i) => {
              const { Icon: DIcon, color: dColor } = getDivisaoIcon(d.id)
              const isSelected = d.id === divisaoId
              return (
                <button
                  key={d.id}
                  onClick={() => { setDivisaoId(d.id); setDivisaoOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '11px 14px',
                    fontSize: 14, fontFamily: 'var(--font-sans)',
                    background: isSelected ? `${dColor}15` : 'transparent',
                    border: 'none', cursor: 'pointer',
                    color: isSelected ? dColor : 'var(--color-text-primary)',
                    fontWeight: isSelected ? 600 : 400,
                    borderBottom: i < divisoes.length - 1 ? '1px solid var(--color-border)' : 'none',
                    textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: `${dColor}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <DIcon size={15} style={{ color: dColor }} />
                  </div>
                  <span style={{ flex: 1 }}>{d.name}</span>
                  {isSelected && <Check size={14} color={dColor} />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Forma de Pagamento */}
      <div style={{ marginBottom: 12, position: 'relative' }}>
        <label className="section-label" style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>
          Forma de Pagamento
        </label>
        <button
          type="button"
          onClick={() => setPmOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '10px 14px',
            fontSize: 16, fontFamily: 'var(--font-sans)',
            background: 'var(--color-bg-tertiary)',
            border: `1px solid ${paymentMethod ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
            borderRadius: 12, cursor: 'pointer',
            color: paymentMethod ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
            textAlign: 'left',
          }}
        >
          {pmLabel || 'Escolha uma forma'}
          <ChevronDown
            size={16}
            color="var(--color-text-tertiary)"
            style={{ transition: 'transform 150ms', transform: pmOpen ? 'rotate(180deg)' : 'none' }}
          />
        </button>
        {pmOpen && (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '100%',
            marginTop: 4, zIndex: 50,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {PAYMENT_METHODS.map((pm, i) => (
              <button
                key={pm.value}
                onClick={() => { setPaymentMethod(pm.value); setPmOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '11px 14px',
                  fontSize: 14, fontFamily: 'var(--font-sans)',
                  background: paymentMethod === pm.value ? 'rgba(59,130,246,0.1)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: paymentMethod === pm.value ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                  fontWeight: paymentMethod === pm.value ? 600 : 400,
                  borderBottom: i < PAYMENT_METHODS.length - 1 ? '1px solid var(--color-border)' : 'none',
                  textAlign: 'left',
                }}
              >
                {paymentMethod === pm.value && <Check size={14} color="var(--color-accent-primary)" />}
                {pm.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Data */}
      <div style={{ marginBottom: 12 }}>
        <Input
          label="Data do Pagamento"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {/* Subcategoria */}
      <div style={{ marginBottom: 16 }}>
        <Input
          label="Subcategoria (opcional)"
          placeholder="Ex: Supermercado, Farmácia..."
          value={subcategory}
          onChange={e => setSubcategory(e.target.value)}
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
