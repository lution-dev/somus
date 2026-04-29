import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'wouter'
import { useAppStore, selectCurrentCaixinhas, selectCurrentSaidasFixas, selectCurrentEntradas, selectExpectedMonthlyIncome } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, getMonthSummary, getDaysUntil, isPaidThisMonth } from '../lib/calculations'
import { Badge, ContextToggle, ProgressBar } from '../components/ui'
import type { Context } from '../components/ui/ContextToggle'
import LancarEntradaModal from '../components/features/LancarEntradaModal'

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function BalanceCard({ total, incomeProgress, expectedIncome }: { total: number; incomeProgress: number; expectedIncome: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-4 mt-4"
    >
      <div className="relative rounded-[var(--radius-xl)] overflow-hidden p-5"
        style={{ background: 'linear-gradient(135deg, #1A3A5C 0%, #0D1B2A 60%, #1A2040 100%)' }}
      >
        {/* Glow decorativo */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />

        <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest font-semibold mb-1">Saldo Disponível</p>
        <p className="text-4xl font-extrabold text-white mb-4">
          {formatCurrency(total)}
        </p>

        <ProgressBar
          value={incomeProgress}
          variant="lucas"
          size="sm"
          label={`${formatCurrency(expectedIncome - (expectedIncome * incomeProgress / 100))} esperados`}
          showLabel
          className="mb-1"
        />
        <p className="text-[10px] text-[var(--color-text-tertiary)] text-right">
          {Math.round(incomeProgress)}% da renda esperada lançada
        </p>
      </div>
    </motion.div>
  )
}

function TimelineSection() {
  const saidasFixas = useAppStore(useShallow(selectCurrentSaidasFixas))

  const upcoming = useMemo(() => {
    return saidasFixas
      .filter(sf => !isPaidThisMonth(sf.paidDates))
      .map(sf => ({ ...sf, daysUntil: getDaysUntil(sf.dueDay) }))
      .filter(sf => sf.daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil)
  }, [saidasFixas])

  if (upcoming.length === 0) return null

  return (
    <div className="mx-4 mt-5">
      <h2 className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest font-semibold mb-2">
        Próximos 7 dias
      </h2>
      <div className="flex flex-col gap-2">
        {upcoming.map((sf, i) => (
          <motion.div
            key={sf.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 bg-[var(--color-bg-secondary)] rounded-[var(--radius-md)] px-3.5 py-2.5 border border-[var(--color-border)]"
          >
            <div className={`w-1.5 h-8 rounded-full shrink-0 ${sf.daysUntil === 0 ? 'bg-[var(--color-danger)]' : sf.daysUntil <= 2 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-info)]'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{sf.name}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                {sf.daysUntil === 0 ? 'Vence hoje' : sf.daysUntil === 1 ? 'Vence amanhã' : `Em ${sf.daysUntil} dias`}
              </p>
            </div>
            <span className="text-sm font-bold text-[var(--color-text-primary)] shrink-0">
              {formatCurrency(sf.amount)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CaixinhasGrid() {
  const [, navigate] = useLocation()
  const caixinhas = useAppStore(useShallow(selectCurrentCaixinhas))
  const expectedIncome = useAppStore(selectExpectedMonthlyIncome)

  return (
    <div className="mx-4 mt-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest font-semibold">Caixinhas</h2>
        <button
          onClick={() => navigate('/caixinhas')}
          className="text-xs text-[var(--color-accent)] font-semibold cursor-pointer"
        >
          Ver todas
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {caixinhas.slice(0, 6).map((cx, i) => {
          const expectedBal = (cx.percentage / 100) * expectedIncome
          const pct = expectedBal > 0 ? Math.min(100, (cx.balance / expectedBal) * 100) : 100
          const isLow = pct < 50 && expectedBal > 0

          return (
            <motion.button
              key={cx.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/caixinhas/${cx.id}`)}
              className="relative bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-3.5 text-left cursor-pointer overflow-hidden"
              style={{ borderColor: isLow ? 'rgba(239,68,68,0.4)' : undefined }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xl">{cx.emoji}</span>
                {isLow && <Badge variant="danger" size="sm">Baixo</Badge>}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] truncate mb-0.5">{cx.name}</p>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">
                {formatCurrency(cx.balance)}
              </p>
              <div className="mt-2">
                <ProgressBar value={pct} variant={isLow ? 'danger' : 'lucas'} size="sm" animated={false} />
              </div>
              <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1">{cx.percentage}% da renda</p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [ctx, setCtx] = useState<Context>('personal')
  const [lancarOpen, setLancarOpen] = useState(false)

  const caixinhas  = useAppStore(useShallow(selectCurrentCaixinhas))
  const entradas   = useAppStore(useShallow(selectCurrentEntradas))
  const saidasFixas = useAppStore(useShallow(selectCurrentSaidasFixas))
  const expectedIncome = useAppStore(selectExpectedMonthlyIncome)

  const summary = useMemo(() =>
    getMonthSummary(entradas, saidasFixas, caixinhas, expectedIncome),
    [entradas, saidasFixas, caixinhas, expectedIncome]
  )

  return (
    <div className="min-h-full pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-2">
        <div>
          <p className="text-xs text-[var(--color-text-tertiary)] font-medium">Bom dia 👋</p>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Lucas</h1>
        </div>
        <ContextToggle value={ctx} onChange={setCtx} />
      </div>

      {/* Balance Card */}
      <BalanceCard
        total={summary.availableBalance}
        incomeProgress={summary.incomeProgress}
        expectedIncome={expectedIncome}
      />

      {/* FAB — Lançar Entrada */}
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

      {/* Timeline */}
      <TimelineSection />

      {/* Caixinhas */}
      <CaixinhasGrid />

      {/* Modal */}
      <LancarEntradaModal open={lancarOpen} onClose={() => setLancarOpen(false)} />
    </div>
  )
}
