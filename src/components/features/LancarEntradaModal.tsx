import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore, selectCurrentCaixinhas, selectCurrentIncomeSources, calculateDistribution } from '../../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../../lib/calculations'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { Check } from 'lucide-react'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'

interface Props {
  open: boolean
  onClose: () => void
  prefill?: { sourceName: string; amount: number }
}

export default function LancarEntradaModal({ open, onClose, prefill }: Props) {
  const amountInput = useCurrencyInput()
  const [sourceId, setSourceId] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [sourceFocused, setSourceFocused] = useState(false)
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote]       = useState('')
  const [submitted, setSubmitted] = useState(false)

  const incomeSources = useAppStore(useShallow(selectCurrentIncomeSources))
  const caixinhas     = useAppStore(useShallow(selectCurrentCaixinhas))
  const currentUser   = useAppStore(s => s.currentUser)
  const addEntrada    = useAppStore(s => s.addEntrada)

  const firstSource = useAppStore(s =>
    s.incomeSources.find(src => src.userId === (s.currentUser?.id ?? ''))
  )

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      if (prefill) {
        amountInput.setValue(prefill.amount)
        setSourceText(prefill.sourceName)
        const match = incomeSources.find(s => s.name.toLowerCase() === prefill.sourceName.toLowerCase())
        setSourceId(match?.id ?? '')
      } else {
        amountInput.reset()
        setSourceId(firstSource?.id ?? '')
        setSourceText(firstSource?.name ?? '')
      }
      setDate(new Date().toISOString().slice(0, 10))
      setNote('')
      setSubmitted(false)
      setSourceFocused(false)
    }
  }, [open, firstSource?.id, firstSource?.name, prefill])

  // Filtered suggestions
  const filteredSources = useMemo(() => {
    if (!sourceText.trim()) return incomeSources
    const q = sourceText.toLowerCase()
    return incomeSources.filter(src => src.name.toLowerCase().includes(q))
  }, [sourceText, incomeSources])

  function selectSource(src: { id: string; name: string }) {
    setSourceId(src.id)
    setSourceText(src.name)
    setSourceFocused(false)
  }

  function handleSourceChange(text: string) {
    setSourceText(text)
    setSourceId('')  // clear selection when typing freely
    setSourceFocused(true)
    // Auto-match if exact
    const exact = incomeSources.find(s => s.name.toLowerCase() === text.toLowerCase())
    if (exact) setSourceId(exact.id)
  }

  // Distribuição automática
  const distribution = useMemo(() => {
    if (!amountInput.numericValue || amountInput.numericValue <= 0) return []
    return calculateDistribution(amountInput.numericValue, caixinhas)
  }, [amountInput.numericValue, caixinhas])

  const totalAmount = amountInput.numericValue
  const isValid     = totalAmount > 0 && (sourceId || sourceText.trim())



  function handleConfirm() {
    if (!isValid || !currentUser) return
    const src = incomeSources.find(s => s.id === sourceId)
    addEntrada({
      userId:      currentUser.id,
      sourceId:    sourceId || `src-custom-${Date.now()}`,
      sourceName:  src?.name ?? sourceText.trim(),
      amount:      totalAmount,
      date,
      note:        note || undefined,
      distribution,
    })
    setSubmitted(true)
    setTimeout(onClose, 1200)
  }

  return (
    <Dialog open={open} onClose={onClose} title="Lançar Entrada" size="md">
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
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-success)', margin: 0 }}>Entrada lançada!</p>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>Caixinhas atualizadas</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Valor */}
            <div style={{ marginBottom: 12 }}>
              <Input
                label="Valor recebido"
                prefix="R$"
                inputMode="numeric"
                placeholder="0,00"
                value={amountInput.displayValue}
                onChange={amountInput.handleChange}
                style={{ fontSize: 20, fontWeight: 700 }}
              />
            </div>

            {/* Fonte */}
            <div style={{ marginBottom: 12, position: 'relative' }}>
              <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>
                Fonte de renda
              </label>
              <input
                type="text"
                placeholder="Ex: Salário, Freelance..."
                value={sourceText}
                onChange={e => handleSourceChange(e.target.value)}
                onFocus={() => setSourceFocused(true)}
                onBlur={() => setTimeout(() => setSourceFocused(false), 150)}
                style={{
                  width: '100%', padding: '10px 14px',
                  fontSize: 16, fontFamily: 'var(--font-sans)',
                  background: 'var(--color-bg-tertiary)',
                  border: `1px solid ${sourceId ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                  borderRadius: 12,
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {/* Dropdown suggestions */}
              {sourceFocused && filteredSources.length > 0 && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, top: '100%',
                  marginTop: 4, zIndex: 50,
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 12, overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}>
                  {filteredSources.map(src => (
                    <button
                      key={src.id}
                      onMouseDown={e => { e.preventDefault(); selectSource(src) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        width: '100%', padding: '10px 14px',
                        fontSize: 14, fontFamily: 'var(--font-sans)',
                        background: sourceId === src.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                        border: 'none', cursor: 'pointer',
                        color: 'var(--color-text-primary)',
                        borderBottom: '1px solid var(--color-border)',
                        textAlign: 'left',
                      }}
                    >
                      {src.color && (
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: src.color, flexShrink: 0,
                        }} />
                      )}
                      {src.name}
                    </button>
                  ))}
                </div>
              )}
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


            {/* Nota */}
            <div style={{ marginBottom: 16 }}>
              <Input
                label="Observação (opcional)"
                placeholder="Ex: bônus extra, freelance..."
                value={note}
                onChange={e => setNote(e.target.value)}
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
                Confirmar — {totalAmount > 0 ? formatCurrency(totalAmount) : 'R$ 0,00'}
              </Button>
              <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
            </DialogFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
