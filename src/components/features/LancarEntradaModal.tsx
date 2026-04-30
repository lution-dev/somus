import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
}

export default function LancarEntradaModal({ open, onClose }: Props) {
  const [amount, setAmount]   = useState('')
  const [sourceId, setSourceId] = useState('')
  const [date, setDate]       = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote]       = useState('')
  const [editDist, setEditDist] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const incomeSources = useAppStore(useShallow(selectCurrentIncomeSources))
  const caixinhas     = useAppStore(useShallow(selectCurrentCaixinhas))
  const currentUser   = useAppStore(s => s.currentUser)
  const addEntrada    = useAppStore(s => s.addEntrada)

  const firstSourceId = useAppStore(s =>
    s.incomeSources.find(src => src.userId === (s.currentUser?.id ?? 'lucas'))?.id ?? ''
  )

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setAmount('')
      setSourceId(firstSourceId)
      setDate(new Date().toISOString().slice(0, 10))
      setNote('')
      setEditDist({})
      setSubmitted(false)
    }
  }, [open, firstSourceId])

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
  const isValid        = totalAmount > 0 && sourceId && diff < 0.05

  // Ícone dízimo
  const isDizimo = (name: string) =>
    name.toLowerCase().includes('dízimo') || name.toLowerCase().includes('dizimo')

  function handleConfirm() {
    if (!isValid || !currentUser) return
    const src = incomeSources.find(s => s.id === sourceId)
    addEntrada({
      userId:      currentUser.id,
      sourceId,
      sourceName:  src?.name ?? '',
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
            className="flex flex-col items-center gap-3 py-6"
          >
            <div className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.15)] flex items-center justify-center">
              <Check size={32} className="text-[var(--color-success)]" strokeWidth={2.5} />
            </div>
            <p className="text-lg font-bold text-[var(--color-success)]">Entrada lançada!</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Caixinhas atualizadas ✓</p>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Valor */}
            <div className="mb-3">
              <Input
                label="Valor recebido"
                prefix="R$"
                type="number"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={e => { setAmount(e.target.value); setEditDist({}) }}
                className="text-xl font-bold"
              />
            </div>

            {/* Fonte */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide block mb-1.5">
                Fonte de renda
              </label>
              <div className="flex flex-wrap gap-2">
                {incomeSources.map(src => (
                  <button
                    key={src.id}
                    onClick={() => setSourceId(src.id)}
                    className={[
                      'px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold border cursor-pointer transition-all duration-150',
                      sourceId === src.id
                        ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]',
                    ].join(' ')}
                  >
                    {src.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Data */}
            <div className="mb-4">
              <Input
                label="Data"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>

            {/* Preview distribuição */}
            {distribution.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                    Distribuição pelas caixinhas
                  </p>
                  {diff >= 0.05 && (
                    <Badge variant="warning" size="sm"><AlertTriangle size={10} className="mr-0.5" />Diferença: {formatCurrency(diff)}</Badge>
                  )}
                </div>
                <div className="bg-[var(--color-bg-tertiary)] rounded-[var(--radius-md)] overflow-hidden divide-y divide-[var(--color-border)]">
                  {distribution.map((item) => {
                    const isFirstDizimo = isDizimo(item.caixinhaName)
                    return (
                      <div
                        key={item.caixinhaId}
                        className={`flex items-center gap-3 px-3 py-2.5 ${isFirstDizimo ? 'bg-[rgba(245,158,11,0.08)]' : ''}`}
                      >
                        <span className="w-6 shrink-0 flex items-center justify-center">{(() => { const { Icon, color } = getCaixinhaIcon(item.caixinhaId); return <Icon size={14} style={{ color }} /> })()}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{item.caixinhaName}</p>
                            {isFirstDizimo && <Badge variant="warning" size="sm">Primeiro ✝</Badge>}
                          </div>
                          <p className="text-[10px] text-[var(--color-text-tertiary)]">{item.percentage}%</p>
                        </div>
                        {/* Editar valor */}
                        <input
                          type="number"
                          value={
                            editDist[item.caixinhaId] !== undefined
                              ? editDist[item.caixinhaId]
                              : item.amount.toFixed(2)
                          }
                          onChange={e =>
                            setEditDist(prev => ({ ...prev, [item.caixinhaId]: e.target.value }))
                          }
                          className="w-24 text-right text-sm font-bold bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-sm)] px-2 py-1 text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Nota */}
            <div className="mb-4">
              <Input
                label="Observação (opcional)"
                placeholder="Ex: bônus extra, freelance..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                disabled={!isValid}
                onClick={handleConfirm}
              >
                Confirmar — {totalAmount > 0 ? formatCurrency(totalAmount) : 'R$ 0,00'}
              </Button>
            </DialogFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  )
}
