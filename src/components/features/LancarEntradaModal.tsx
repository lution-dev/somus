import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore, selectCurrentDivisoes, selectCurrentIncomeSources, selectCurrentEntradas, calculateDistribution } from '../../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../../lib/calculations'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { getDivisaoIcon } from '../../lib/icons'
import { Check, AlertCircle, TrendingUp, Layers, ArrowLeft } from 'lucide-react'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'

interface Props {
  open: boolean
  onClose: () => void
  prefill?: { sourceName: string; amount: number; note?: string; date?: string }
}

type Step = 'intent' | 'renda' | 'divisao-pick' | 'divisao-form'

export default function LancarEntradaModal({ open, onClose, prefill }: Props) {
  const [step, setStep]               = useState<Step>('intent')
  const amountInput                   = useCurrencyInput()
  const [sourceId, setSourceId]       = useState('')
  const [sourceText, setSourceText]   = useState('')
  const [sourceFocused, setSourceFocused] = useState(false)
  const [date, setDate]               = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote]               = useState('')
  const [submitted, setSubmitted]     = useState(false)
  const [selectedDivisaoId, setSelectedDivisaoId] = useState('')
  const [descricao, setDescricao]     = useState('')

  const incomeSources        = useAppStore(useShallow(selectCurrentIncomeSources))
  const entradas             = useAppStore(useShallow(selectCurrentEntradas))
  const divisoes             = useAppStore(useShallow(selectCurrentDivisoes))
  const currentUser          = useAppStore(s => s.currentUser)
  const addEntrada           = useAppStore(s => s.addEntrada)

  const suggestedSources = useMemo(() => {
    const usedNames = Array.from(new Set(entradas.map(e => e.sourceName)))
    if (usedNames.length === 0) return incomeSources
    return usedNames.map(name => {
      const match = incomeSources.find(s => s.name.toLowerCase() === name.toLowerCase())
      return { id: match?.id ?? `used-${name}`, name, color: match?.color }
    })
  }, [entradas, incomeSources])

  useEffect(() => {
    if (!open) return
    if (prefill) {
      setStep('renda')
      amountInput.setValue(prefill.amount)
      setSourceText(prefill.sourceName)
      const match = incomeSources.find(s => s.name.toLowerCase() === prefill.sourceName.toLowerCase())
      setSourceId(match?.id ?? '')
      setNote(prefill.note ?? '')
    } else {
      setStep('intent')
      amountInput.reset()
      setSourceId(''); setSourceText(''); setNote('')
    }
    setDate(prefill?.date ?? new Date().toISOString().slice(0, 10))
    setSubmitted(false); setSourceFocused(false)
    setSelectedDivisaoId(''); setDescricao('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const filteredSources = useMemo(() => {
    const q = sourceText.toLowerCase()
    return q ? suggestedSources.filter(s => s.name.toLowerCase().includes(q)) : suggestedSources
  }, [sourceText, suggestedSources])

  function selectSource(src: { id: string; name: string }) {
    setSourceId(src.id); setSourceText(src.name); setSourceFocused(false)
  }
  function handleSourceChange(text: string) {
    setSourceText(text); setSourceId(''); setSourceFocused(true)
    const exact = suggestedSources.find(s => s.name.toLowerCase() === text.toLowerCase())
    if (exact) setSourceId(exact.id)
  }

  const distribution = useMemo(() => {
    if (!amountInput.numericValue || amountInput.numericValue <= 0) return []
    return calculateDistribution(amountInput.numericValue, divisoes)
  }, [amountInput.numericValue, divisoes])

  const total           = amountInput.numericValue
  const isRendaValid    = total > 0 && (sourceId || sourceText.trim())
  const isDivisaoValid  = total > 0 && selectedDivisaoId && descricao.trim()
  const selectedDivisao = divisoes.find(cx => cx.id === selectedDivisaoId)
  const today           = new Date().toISOString().slice(0, 10)

  function handleConfirmRenda() {
    if (!isRendaValid || !currentUser) return
    const src = suggestedSources.find(s => s.id === sourceId)
    addEntrada({
      userId: currentUser.id,
      sourceId: sourceId || `src-custom-${Date.now()}`,
      sourceName: src?.name ?? sourceText.trim(),
      amount: total, date, note: note || undefined, distribution,
    })
    setSubmitted(true); setTimeout(onClose, 1200)
  }

  function handleConfirmDivisao() {
    if (!isDivisaoValid || !currentUser) return
    addEntrada({
      userId:          currentUser.id,
      sourceId:        `src-direct-${Date.now()}`,
      sourceName:      descricao.trim(),
      amount:          total,
      date,
      note:            undefined,
      distribution:    [],
      kind:            'direct',
      targetDivisaoId: selectedDivisaoId,
    })
    setSubmitted(true); setTimeout(onClose, 1200)
  }

  const backBtn = (to: Step) => (
    <button
      onClick={() => setStep(to)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 13, marginBottom: 16, padding: 0 }}
    >
      <ArrowLeft size={14} /> Voltar
    </button>
  )

  const slideIn  = { opacity: 0, x: 24 }
  const visible  = { opacity: 1, x: 0 }
  const slideOut = { opacity: 0, x: -24 }

  const titleMap: Record<Step, string> = {
    intent: 'Nova Entrada',
    renda: 'Renda',
    'divisao-pick': 'Para qual divisão?',
    'divisao-form': selectedDivisao ? `Entrada em ${selectedDivisao.name}` : 'Entrada',
  }

  return (
    <Dialog open={open} onClose={onClose} title={submitted ? 'Nova Entrada' : titleMap[step]} size="md">
      <AnimatePresence mode="wait">

        {/* ── Sucesso ── */}
        {submitted && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '24px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={32} color="var(--color-success)" strokeWidth={2.5} />
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>
              {step === 'renda' && date > today ? 'Entrada agendada!' : 'Entrada lançada!'}
            </p>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
              {step === 'divisao-form'
                ? `Adicionado em ${selectedDivisao?.name}`
                : date > today ? 'Confirme quando o dinheiro chegar' : 'Divisões atualizadas'}
            </p>
          </motion.div>
        )}

        {/* ── Etapa 1: Intenção ── */}
        {!submitted && step === 'intent' && (
          <motion.div key="intent" initial={slideIn} animate={visible} exit={slideOut} transition={{ duration: 0.18 }}>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 16px', textAlign: 'center' }}>
              Como você quer registrar essa entrada?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Renda */}
              <IntentCard
                icon={<TrendingUp size={20} color="var(--color-accent-primary)" />}
                iconBg="rgba(59,130,246,0.12)"
                hoverBorder="rgba(59,130,246,0.5)"
                hoverBg="rgba(59,130,246,0.06)"
                title="Renda"
                desc="Distribui pelo % em todas as divisões"
                onClick={() => setStep('renda')}
              />
              {/* Divisão específica */}
              <IntentCard
                icon={<Layers size={20} color="var(--color-success)" />}
                iconBg="rgba(16,185,129,0.12)"
                hoverBorder="rgba(16,185,129,0.5)"
                hoverBg="rgba(16,185,129,0.06)"
                title="Para uma divisão"
                desc="Vai direto pra uma divisão específica"
                onClick={() => setStep('divisao-pick')}
              />
            </div>
          </motion.div>
        )}

        {/* ── Etapa 2b-1: Picker de divisão ── */}
        {!submitted && step === 'divisao-pick' && (
          <motion.div key="divisao-pick" initial={slideIn} animate={visible} exit={slideOut} transition={{ duration: 0.18 }}>
            {backBtn('intent')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {divisoes.map(cx => {
                const { Icon, color } = getDivisaoIcon(cx.id)
                return (
                  <button
                    key={cx.id}
                    onClick={() => { setSelectedDivisaoId(cx.id); setStep('divisao-form') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--color-border)', background: 'var(--color-bg-tertiary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left', width: '100%', transition: 'all 120ms ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = color + '60'; e.currentTarget.style.background = color + '10' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-tertiary)' }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '18' }}>
                      <Icon size={20} style={{ color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{cx.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>{formatCurrency(cx.balance)} disponível</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color, background: color + '15', padding: '2px 7px', borderRadius: 8, flexShrink: 0 }}>{cx.percentage}%</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── Etapa 2b-2: Formulário divisão específica ── */}
        {!submitted && step === 'divisao-form' && (
          <motion.div key="divisao-form" initial={slideIn} animate={visible} exit={slideOut} transition={{ duration: 0.18 }}>
            {backBtn('divisao-pick')}

            {/* Chip da divisão selecionada */}
            {selectedDivisao && (() => {
              const { Icon, color } = getDivisaoIcon(selectedDivisao.id)
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: color + '10', border: `1px solid ${color}30`, borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '20' }}>
                    <Icon size={17} style={{ color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{selectedDivisao.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0 }}>{formatCurrency(selectedDivisao.balance)} disponível</p>
                  </div>
                </div>
              )
            })()}

            <div style={{ marginBottom: 12 }}>
              <Input label="Valor" prefix="R$" inputMode="numeric" placeholder="0,00"
                value={amountInput.displayValue} onChange={amountInput.handleChange}
                style={{ fontSize: 20, fontWeight: 700 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <Input label="Descrição" placeholder="Ex: Parte Aluguel Mãe, Reembolso..."
                value={descricao} onChange={e => setDescricao(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Input label="Data" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="primary" size="md" fullWidth disabled={!isDivisaoValid} onClick={handleConfirmDivisao}>
                Confirmar — {total > 0 ? formatCurrency(total) : 'R$ 0,00'}
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
            </DialogFooter>
          </motion.div>
        )}

        {/* ── Etapa 2a: Renda (fluxo original) ── */}
        {!submitted && step === 'renda' && (
          <motion.div key="renda" initial={slideIn} animate={visible} exit={slideOut} transition={{ duration: 0.18 }}>
            {!prefill && backBtn('intent')}

            <div style={{ marginBottom: 12 }}>
              <Input label="Valor recebido" prefix="R$" inputMode="numeric" placeholder="0,00"
                value={amountInput.displayValue} onChange={amountInput.handleChange}
                style={{ fontSize: 20, fontWeight: 700 }} />
            </div>

            <div style={{ marginBottom: 12, position: 'relative' }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Fonte de renda</label>
              <input
                type="text" placeholder="Ex: Salário, Freelance..."
                value={sourceText}
                onChange={e => handleSourceChange(e.target.value)}
                onFocus={() => setSourceFocused(true)}
                onBlur={() => setTimeout(() => setSourceFocused(false), 150)}
                style={{ width: '100%', padding: '10px 14px', fontSize: 16, fontFamily: 'var(--font-sans)', background: 'var(--color-bg-tertiary)', border: `1px solid ${sourceId ? 'var(--color-accent-primary)' : 'var(--color-border)'}`, borderRadius: 12, color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' }}
              />
              {sourceFocused && filteredSources.length > 0 && (
                <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', marginTop: 4, zIndex: 50, background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                  {filteredSources.map(src => (
                    <button key={src.id} onMouseDown={e => { e.preventDefault(); selectSource(src) }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', fontSize: 14, fontFamily: 'var(--font-sans)', background: sourceId === src.id ? 'rgba(59,130,246,0.1)' : 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                      {src.color && <span style={{ width: 8, height: 8, borderRadius: '50%', background: src.color, flexShrink: 0 }} />}
                      {src.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <Input label="Data" type="date" value={date} onChange={e => setDate(e.target.value)} />
              {date > today && (
                <p style={{ fontSize: 11, color: 'var(--color-warning)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                  <AlertCircle size={12} />
                  <span>Ficará guardada como recebimento esperado para você confirmar no dia</span>
                </p>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <Input label="Observação (opcional)" placeholder="Ex: bônus extra, freelance..."
                value={note} onChange={e => setNote(e.target.value)} />
            </div>

            <DialogFooter>
              <Button variant="primary" size="md" fullWidth disabled={!isRendaValid} onClick={handleConfirmRenda}>
                Confirmar — {total > 0 ? formatCurrency(total) : 'R$ 0,00'}
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
            </DialogFooter>
          </motion.div>
        )}

      </AnimatePresence>
    </Dialog>
  )
}

// ── Intent Card ───────────────────────────────────────────────────────────────
function IntentCard({ icon, iconBg, hoverBorder, hoverBg, title, desc, onClick }: {
  icon: React.ReactNode; iconBg: string; hoverBorder: string; hoverBg: string
  title: string; desc: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: 16, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', background: 'var(--color-bg-tertiary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', textAlign: 'left', width: '100%', transition: 'all 150ms ease' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = hoverBorder; e.currentTarget.style.background = hoverBg }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-tertiary)' }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 3px' }}>{title}</p>
        <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>{desc}</p>
      </div>
    </button>
  )
}
