import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, selectCurrentSaidasFixas, selectCurrentEntradas } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, isPaidThisMonth, getDueDayLabel, getDaysUntil } from '../lib/calculations'
import { Badge } from '../components/ui'
import LancarEntradaModal from '../components/features/LancarEntradaModal'

// ─── Ícones ───────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const AutoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

// ─── Saída Item ───────────────────────────────────────────────────────────────

function SaidaItem({ sf }: { sf: ReturnType<typeof selectCurrentSaidasFixas>[0] }) {
  const markPaid = useAppStore(s => s.markSaidaFixaPaid)
  const markUnpaid = useAppStore(s => s.markSaidaFixaUnpaid)
  const paid = isPaidThisMonth(sf.paidDates)
  const today = new Date().toISOString().slice(0, 10)
  const daysUntil = getDaysUntil(sf.dueDay)
  const isOverdue = !paid && daysUntil > 20

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        'flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)] last:border-0',
        paid ? 'opacity-60' : '',
      ].join(' ')}
    >
      {/* Dot cor */}
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: sf.color || '#3B82F6' }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-sm font-semibold ${paid ? 'line-through text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>
            {sf.name}
          </span>
          {sf.autoDebit && (
            <span className="text-[var(--color-text-tertiary)]"><AutoIcon /></span>
          )}
        </div>
        <span className={`text-xs ${isOverdue ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-tertiary)]'}`}>
          {paid ? 'Pago ✓' : getDueDayLabel(sf.dueDay)}
        </span>
      </div>

      {/* Valor */}
      <span className={`text-sm font-bold mr-2 ${paid ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>
        {formatCurrency(sf.amount)}
      </span>

      {/* Botão pagar */}
      {!sf.autoDebit && (
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => paid ? markUnpaid(sf.id, today) : markPaid(sf.id, today)}
          className={[
            'w-8 h-8 rounded-full flex items-center justify-center border-2 cursor-pointer transition-all duration-200 shrink-0',
            paid
              ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white'
              : 'border-[var(--color-border-strong)] text-[var(--color-text-tertiary)] hover:border-[var(--color-success)] hover:text-[var(--color-success)]',
          ].join(' ')}
        >
          <CheckIcon />
        </motion.button>
      )}
      {sf.autoDebit && (
        <Badge variant={paid ? 'success' : 'default'} size="sm">
          {paid ? 'Debitado' : 'Auto'}
        </Badge>
      )}
    </motion.div>
  )
}

// ─── Fluxo Page ───────────────────────────────────────────────────────────────

export default function Fluxo() {
  const [tab, setTab] = useState<'saidas' | 'entradas'>('saidas')
  const [lancarOpen, setLancarOpen] = useState(false)

  const saidasFixas = useAppStore(useShallow(selectCurrentSaidasFixas))
  const entradas = useAppStore(useShallow(selectCurrentEntradas))

  const { paid, pending } = useMemo(() => ({
    paid:    saidasFixas.filter(sf => isPaidThisMonth(sf.paidDates)),
    pending: saidasFixas.filter(sf => !isPaidThisMonth(sf.paidDates)).sort((a, b) => getDaysUntil(a.dueDay) - getDaysUntil(b.dueDay)),
  }), [saidasFixas])

  const totalPaid    = paid.reduce((s, sf) => s + sf.amount, 0)
  const totalPending = pending.reduce((s, sf) => s + sf.amount, 0)

  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-full pb-6">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Fluxo</h1>
        <p className="text-sm text-[var(--color-text-secondary)] capitalize">{currentMonth}</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 mx-4 mb-4">
        <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-[var(--radius-lg)] p-3.5">
          <p className="text-xs text-[var(--color-danger)] font-semibold uppercase tracking-wide mb-1">A pagar</p>
          <p className="text-xl font-bold text-[var(--color-text-primary)]">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{pending.length} conta{pending.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)] rounded-[var(--radius-lg)] p-3.5">
          <p className="text-xs text-[var(--color-success)] font-semibold uppercase tracking-wide mb-1">Pago</p>
          <p className="text-xl font-bold text-[var(--color-text-primary)]">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{paid.length} conta{paid.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mb-3 bg-[var(--color-bg-secondary)] p-1 rounded-[var(--radius-md)]">
        {(['saidas', 'entradas'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 py-2 text-sm font-semibold rounded-[var(--radius-sm)] cursor-pointer transition-all duration-200',
              tab === t
                ? 'bg-[var(--color-accent)] text-white'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            ].join(' ')}
          >
            {t === 'saidas' ? 'Saídas Fixas' : 'Entradas'}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === 'saidas' ? (
          <motion.div
            key="saidas"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.18 }}
            className="mx-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden"
          >
            {pending.length === 0 && paid.length === 0 ? (
              <p className="text-center text-[var(--color-text-tertiary)] py-10 text-sm">Nenhuma conta cadastrada</p>
            ) : (
              <>
                {pending.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--color-text-tertiary)] px-4 pt-3 pb-1 font-semibold uppercase tracking-wide">Pendentes</p>
                    {pending.map(sf => <SaidaItem key={sf.id} sf={sf} />)}
                  </div>
                )}
                {paid.length > 0 && (
                  <div>
                    <p className="text-xs text-[var(--color-text-tertiary)] px-4 pt-3 pb-1 font-semibold uppercase tracking-wide">Pagos</p>
                    {paid.map(sf => <SaidaItem key={sf.id} sf={sf} />)}
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="entradas"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18 }}
            className="mx-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden"
          >
            {entradas.length === 0 ? (
              <p className="text-center text-[var(--color-text-tertiary)] py-10 text-sm">Nenhuma entrada lançada</p>
            ) : (
              [...entradas].reverse().map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-[rgba(59,130,246,0.15)] flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-lucas)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{e.sourceName}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-success)]">+{formatCurrency(e.amount)}</span>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <div className="mx-4 mt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setLancarOpen(true)}
          className="w-full h-12 rounded-[var(--radius-lg)] bg-[var(--color-accent)] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
          style={{ boxShadow: '0 0 24px rgba(59,130,246,0.4)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Lançar Entrada
        </motion.button>
      </div>

      <LancarEntradaModal open={lancarOpen} onClose={() => setLancarOpen(false)} />
    </div>
  )
}
