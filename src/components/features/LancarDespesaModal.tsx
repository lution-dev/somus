import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '../../stores/useAppStore'
import { formatCurrency } from '../../lib/calculations'
import { getDivisaoIcon } from '../../lib/icons'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { Check, ChevronDown, AlertCircle } from 'lucide-react'
import type { PaymentMethod } from '../../types'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'
import { todayBR } from '../../lib/months'

interface Props {
  open: boolean
  onClose: () => void
  /** Pre-selected divisao (divisão) */
  divisaoId: string
  divisaoName: string
  prefill?: {
    description?: string
    amount?: number
    paymentMethod?: string
    subcategory?: string
    date?: string
  }
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'pix', label: 'Pix' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'auto_debit', label: 'Débito automático' },
]

const DIVISAO_SUCCESS_COPY: Record<string, string> = {
  'cx-essencial':  'Consciência é o primeiro passo.',
  'cx-objetivos':  'Cada real conta no caminho ao objetivo.',
  'cx-dizimo':     'Dar com intenção faz toda a diferença.',
  'cx-educacao':   'Investimento em você. Vale cada centavo.',
  'cx-reserva':    'Seu futuro agradece.',
}

export default function LancarDespesaModal({ open, onClose, divisaoId, divisaoName, prefill }: Props) {
  const [description, setDescription] = useState('')
  const amountInput = useCurrencyInput()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('')
  const [pmOpen, setPmOpen] = useState(false)
  const [date, setDate] = useState(todayBR())
  const [subcategory, setSubcategory] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const currentUser = useAppStore(s => s.currentUser)
  const addSaidaVariavel = useAppStore(s => s.addSaidaVariavel)
  const { Icon, color } = getDivisaoIcon(divisaoId)

  // Reset on open
  useEffect(() => {
    if (open) {
      setDescription(prefill?.description ?? '')
      if (prefill?.amount) amountInput.setValue(prefill.amount)
      else amountInput.reset()
      setPaymentMethod((prefill?.paymentMethod as PaymentMethod | '') ?? '')
      setDate(prefill?.date ?? todayBR())
      setSubcategory(prefill?.subcategory ?? '')
      setSubmitted(false)
      setPmOpen(false)
    }
  }, [open])

  const numAmount = amountInput.numericValue
  const isValid = numAmount > 0 && description.trim() && paymentMethod

  function handleConfirm() {
    if (!isValid || !currentUser || !paymentMethod) return
    addSaidaVariavel({
      userId: currentUser.id,
      divisaoId,
      amount: numAmount,
      description: description.trim(),
      category: divisaoName,
      subcategory: subcategory.trim() || undefined,
      paymentMethod: paymentMethod as PaymentMethod,
      date,
    })
    setSubmitted(true)
    setTimeout(onClose, 1200)
  }

  const pmLabel = PAYMENT_METHODS.find(p => p.value === paymentMethod)?.label ?? ''

  return (
    <Dialog open={open} onClose={onClose} title="Lançar Despesa" size="md">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0' }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={32} color="var(--color-success)" strokeWidth={2.5} />
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>
              {date > todayBR() ? 'Despesa agendada!' : 'Despesa lançada!'}
            </p>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
              {date > todayBR() ? 'Ela aparecerá como pendente na data.' : 'Saldo da divisão atualizado'}
            </p>
            {date <= todayBR() && DIVISAO_SUCCESS_COPY[divisaoId] && (
              <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '2px 0 0', fontStyle: 'italic' }}>
                {DIVISAO_SUCCESS_COPY[divisaoId]}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Divisao badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: `${color}15`,
              border: `1px solid ${color}30`,
              borderRadius: 12, padding: '10px 14px',
              marginBottom: 16,
            }}>
              <Icon size={18} style={{ color }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{divisaoName}</span>
            </div>



            {/* Descrição */}
            <div style={{ marginBottom: 12 }}>
              <Input
                label="Descrição"
                placeholder="Ex: Conta de luz, Netflix..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '4px 0 0', textAlign: 'right' }}>Necessário</p>
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
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '4px 0 0', textAlign: 'right' }}>Necessário</p>
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
                {pmLabel || 'Escolha algo'}
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
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '4px 0 0', textAlign: 'right' }}>Necessário</p>
            </div>

            {/* Data */}
            <div style={{ marginBottom: 16 }}>
              <Input
                label="Data de Pagamento"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
              {date > todayBR() && (
                <p style={{
                  fontSize: 11,
                  color: 'var(--color-warning)',
                  margin: '4px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontWeight: 500
                }}>
                  <AlertCircle size={12} />
                  <span>Ficará salvo como agendamento para você confirmar no dia</span>
                </p>
              )}
            </div>



            {/* Subcategoria */}
            <div style={{ marginBottom: 16 }}>
              <Input
                label="Subcategoria"
                placeholder="Procure ou crie uma nova"
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
                onClick={handleConfirm}
              >
                Adicionar — {numAmount > 0 ? formatCurrency(numAmount) : 'R$ 0,00'}
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
            </DialogFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
