import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, selectCurrentSaidasFixas, selectCurrentEntradas } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, isPaidThisMonth, getDueDayLabel, getDaysUntil } from '../lib/calculations'
import LancarEntradaModal from '../components/features/LancarEntradaModal'
import { Check, RefreshCw, Plus, Inbox, ArrowUpRight } from 'lucide-react'

// ─── Item de Saída ────────────────────────────────────────────────────────────

function SaidaItem({ sf, isLast }: { sf: ReturnType<typeof selectCurrentSaidasFixas>[0]; isLast: boolean }) {
  const markPaid   = useAppStore(s => s.markSaidaFixaPaid)
  const markUnpaid = useAppStore(s => s.markSaidaFixaUnpaid)
  const paid       = isPaidThisMonth(sf.paidDates)
  const today      = new Date().toISOString().slice(0, 10)
  const daysUntil  = getDaysUntil(sf.dueDay)
  const isUrgent   = !paid && daysUntil <= 3

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--color-border)', opacity: paid ? 0.55 : 1 }}
    >
      {/* Cor/dot */}
      <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-0.5" style={{ background: sf.color || 'var(--color-accent)' }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className="text-sm font-medium text-[var(--color-text-primary)] truncate"
            style={{ textDecoration: paid ? 'line-through' : 'none' }}
          >
            {sf.name}
          </span>
          {sf.autoDebit && <RefreshCw size={11} className="text-[var(--color-text-tertiary)] shrink-0" />}
        </div>
        <span
          className="text-xs"
          style={{ color: isUrgent ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}
        >
          {paid ? 'Pago · ' + getDueDayLabel(sf.dueDay) : getDueDayLabel(sf.dueDay)}
        </span>
      </div>

      {/* Valor */}
      <span className="text-sm font-semibold text-[var(--color-text-primary)] shrink-0 mr-2">
        {formatCurrency(sf.amount)}
      </span>

      {/* Check / auto badge */}
      {sf.autoDebit ? (
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: paid ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.1)',
            color: paid ? 'var(--color-success)' : 'var(--color-text-tertiary)',
          }}
        >
          {paid ? 'Debitado' : 'Auto'}
        </span>
      ) : (
        <button
          onClick={() => paid ? markUnpaid(sf.id, today) : markPaid(sf.id, today)}
          className="w-7 h-7 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-150 shrink-0"
          style={{
            background: paid ? 'var(--color-success)' : 'transparent',
            borderColor: paid ? 'var(--color-success)' : 'var(--color-border-strong)',
          }}
        >
          <Check size={13} strokeWidth={2.5} style={{ color: paid ? 'white' : 'var(--color-text-tertiary)' }} />
        </button>
      )}
    </div>
  )
}

// ─── Fluxo Page ───────────────────────────────────────────────────────────────

export default function Fluxo() {
  const [tab, setTab]         = useState<'saidas' | 'entradas'>('saidas')
  const [lancarOpen, setLancarOpen] = useState(false)

  const saidasFixas = useAppStore(useShallow(selectCurrentSaidasFixas))
  const entradas    = useAppStore(useShallow(selectCurrentEntradas))

  const { pending, paid } = useMemo(() => ({
    pending: saidasFixas
      .filter(sf => !isPaidThisMonth(sf.paidDates))
      .sort((a, b) => getDaysUntil(a.dueDay) - getDaysUntil(b.dueDay)),
    paid: saidasFixas.filter(sf => isPaidThisMonth(sf.paidDates)),
  }), [saidasFixas])

  const totalPending = pending.reduce((s, sf) => s + sf.amount, 0)
  const totalPaid    = paid.reduce((s, sf) => s + sf.amount, 0)

  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-full pb-6 px-4 pt-12 md:pt-8">

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Fluxo</h1>
        <p className="text-sm text-[var(--color-text-secondary)] capitalize">{currentMonth}</p>
      </div>

      {/* Resumo cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* A pagar */}
        <div
          className="rounded-[var(--radius-lg)] p-4"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)' }}
        >
          <p className="text-xs font-semibold text-[var(--color-danger)] mb-1.5">A pagar</p>
          <p className="text-xl font-bold text-[var(--color-text-primary)]">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{pending.length} conta{pending.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Pago */}
        <div
          className="rounded-[var(--radius-lg)] p-4"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)' }}
        >
          <p className="text-xs font-semibold text-[var(--color-success)] mb-1.5">Pago</p>
          <p className="text-xl font-bold text-[var(--color-text-primary)]">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{paid.length} conta{paid.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-[var(--radius-md)] mb-4"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        {(['saidas', 'entradas'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 text-sm font-semibold rounded-[10px] cursor-pointer transition-all duration-150"
            style={{
              background: tab === t ? 'var(--color-accent)' : 'transparent',
              color: tab === t ? 'white' : 'var(--color-text-secondary)',
            }}
          >
            {t === 'saidas' ? 'Saídas fixas' : 'Entradas'}
          </button>
        ))}
      </div>

      {/* Conteúdo da tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="rounded-[var(--radius-lg)] overflow-hidden"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          {tab === 'saidas' ? (
            <>
              {pending.length === 0 && paid.length === 0 ? (
                <EmptyState label="Nenhuma conta cadastrada" />
              ) : (
                <>
                  {pending.length > 0 && (
                    <>
                      <SectionLabel>Pendentes</SectionLabel>
                      {pending.map((sf, i) => <SaidaItem key={sf.id} sf={sf} isLast={i === pending.length - 1 && paid.length === 0} />)}
                    </>
                  )}
                  {paid.length > 0 && (
                    <>
                      <SectionLabel>Pagos</SectionLabel>
                      {paid.map((sf, i) => <SaidaItem key={sf.id} sf={sf} isLast={i === paid.length - 1} />)}
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {entradas.length === 0 ? (
                <EmptyState label="Nenhuma entrada lançada" />
              ) : (
                [...entradas].reverse().map((e, i, arr) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 px-4 py-3.5"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(91,156,246,0.12)' }}
                    >
                      <ArrowUpRight size={15} className="text-[var(--color-accent)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{e.sourceName}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[var(--color-success)] shrink-0">
                      +{formatCurrency(e.amount)}
                    </span>
                  </div>
                ))
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <div className="mt-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setLancarOpen(true)}
          className="w-full h-12 rounded-[var(--radius-lg)] font-semibold text-sm text-white flex items-center justify-center gap-2 cursor-pointer"
          style={{ background: 'var(--color-accent)', boxShadow: '0 4px 16px rgba(91,156,246,0.22)' }}
        >
          <Plus size={18} strokeWidth={2.5} />
          Lançar entrada
        </motion.button>
      </div>

      <LancarEntradaModal open={lancarOpen} onClose={() => setLancarOpen(false)} />
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[11px] font-semibold uppercase tracking-[0.1em] px-4 py-2.5"
      style={{ color: 'var(--color-text-tertiary)', borderBottom: '1px solid var(--color-border)' }}
    >
      {children}
    </p>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      <Inbox size={28} className="text-[var(--color-text-tertiary)]" />
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
    </div>
  )
}
