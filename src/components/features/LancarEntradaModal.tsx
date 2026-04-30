import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore, selectCurrentCaixinhas, selectCurrentIncomeSources, calculateDistribution } from '../../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../../lib/calculations'
import { getCaixinhaIcon } from '../../lib/icons'
import { Dialog, DialogFooter, Button, Input, Badge } from '../ui'
import type { CaixinhaDistributionItem } from '../../types'
import { Check, AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  prefill?: { sourceName: string; amount: number }
}

export default function LancarEntradaModal({ open, onClose, prefill }: Props) {
  const [amount, setAmount]   = useState('')
  const [sourceId, setSourceId] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [sourceFocused, setSourceFocused] = useState(false)
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote]       = useState('')
  const [editDist, setEditDist] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const incomeSources = useAppStore(useShallow(selectCurrentIncomeSources))
  const caixinhas     = useAppStore(useShallow(selectCurrentCaixinhas))
  const currentUser   = useAppStore(s => s.currentUser)
  const addEntrada    = useAppStore(s => s.addEntrada)

  const firstSource = useAppStore(s =>
    s.incomeSources.find(src => src.userId === (s.currentUser?.id ?? 'lucas'))
  )

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      if (prefill) {
        setAmount(String(prefill.amount))
        setSourceText(prefill.sourceName)
        // Try to match existing source
        const match = incomeSources.find(s => s.name.toLowerCase() === prefill.sourceName.toLowerCase())
        setSourceId(match?.id ?? '')
      } else {
        setAmount('')
        setSourceId(firstSource?.id ?? '')
        setSourceText(firstSource?.name ?? '')
      }
      setDate(new Date().toISOString().slice(0, 10))
      setNote('')
      setEditDist({})
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
  const autoDistribution: CaixinhaDistributionItem[] = useMemo(() => {
    const num = parseFloat(amount.replace(',', '.'))
    if (!num || isNaN(num) || num <= 0) return []
    return calculateDistribution(num, caixinhas)
  }, [amount, caixinhas])

  // Distribuição editada pelo usuário (ou auto)
  const distribution: CaixinhaDistributionItem[] = useMemo(() =>
    autoDistribution.map(item => ({
      ...item,
      amount: editDist[item.caixinhaId] !== undefined
        ? parseFloat(editDist[item.caixinhaId].replace(',', '.')) || 0
        : item.amount,
    })),
    [autoDistribution, editDist]
  )

  const totalAllocated = distribution.reduce((s, d) => s + d.amount, 0)
  const totalAmount    = parseFloat(amount.replace(',', '.')) || 0
  const diff           = Math.abs(totalAllocated - totalAmount)
  const isValid        = totalAmount > 0 && (sourceId || sourceText.trim()) && diff < 0.05

  const isDizimo = (name: string) =>
    name.toLowerCase().includes('dízimo') || name.toLowerCase().includes('dizimo')

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
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={e => { setAmount(e.target.value); setEditDist({}) }}
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

            {/* Preview distribuição — hide when prefilled (quick launch) */}
            {!prefill && distribution.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p className="section-label" style={{ margin: 0 }}>
                    Distribuição pelas caixinhas
                  </p>
                  {diff >= 0.05 && (
                    <Badge variant="warning" size="sm"><AlertTriangle size={10} style={{ marginRight: 2 }} />Diferença: {formatCurrency(diff)}</Badge>
                  )}
                </div>
                <div style={{
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-card)',
                  overflow: 'hidden',
                }}>
                  {distribution.map((item, i) => {
                    const isFirstDizimo = isDizimo(item.caixinhaName)
                    const { Icon, color } = getCaixinhaIcon(item.caixinhaId)
                    return (
                      <div
                        key={item.caixinhaId}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px',
                          background: isFirstDizimo ? 'rgba(245,158,11,0.08)' : 'transparent',
                          borderBottom: i < distribution.length - 1 ? '1px solid var(--color-border)' : 'none',
                        }}
                      >
                        <span style={{ width: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={14} style={{ color }} />
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.caixinhaName}</p>
                            {isFirstDizimo && <Badge variant="warning" size="sm">Primeiro ✝</Badge>}
                          </div>
                          <p style={{ fontSize: 10, color: 'var(--color-text-tertiary)', margin: 0 }}>{item.percentage}%</p>
                        </div>
                        <input
                          type="number"
                          placeholder="0,00"
                          value={
                            editDist[item.caixinhaId] !== undefined
                              ? editDist[item.caixinhaId]
                              : item.amount.toFixed(2)
                          }
                          onChange={e =>
                            setEditDist(prev => ({ ...prev, [item.caixinhaId]: e.target.value }))
                          }
                          style={{
                            width: 96, textAlign: 'right',
                            fontSize: 16, fontWeight: 700,
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 8, padding: '4px 8px',
                            color: 'var(--color-text-primary)',
                            fontFamily: 'var(--font-sans)',
                            outline: 'none',
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

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
