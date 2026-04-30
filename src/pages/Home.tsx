import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'wouter'
import {
  useAppStore,
  selectCurrentCaixinhas,
  selectCurrentSaidasFixas,
  selectCurrentEntradas,
  selectExpectedMonthlyIncome,
} from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, getMonthSummary, getDaysUntil, isPaidThisMonth } from '../lib/calculations'
import { getCaixinhaIcon } from '../lib/icons'
import { ContextToggle, ProgressBar } from '../components/ui'
import type { Context } from '../components/ui/ContextToggle'
import LancarEntradaModal from '../components/features/LancarEntradaModal'
import {
  Plus,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react'

// ─── BalanceCard ─────────────────────────────────────────────────────────────

function BalanceCard({
  total, totalIncome, expectedIncome, incomeProgress,
}: { total: number; totalIncome: number; expectedIncome: number; incomeProgress: number }) {
  const remaining = Math.max(0, expectedIncome - totalIncome)

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-4 mt-4 rounded-[var(--radius-xl)] p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #152A40 0%, #0F1923 60%, #172038 100%)',
        border: '1px solid rgba(91,156,246,0.15)',
      }}
    >
      {/* Orb decorativo */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(91,156,246,0.12) 0%, transparent 70%)' }}
      />

      <div className="relative">
        {/* Label */}
        <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Saldo disponível</p>

        {/* Valor principal */}
        <p className="text-[2.25rem] font-extrabold text-white leading-none mb-3 tracking-tight">
          {formatCurrency(total)}
        </p>

        {/* Indicadores */}
        <div className="flex items-center gap-4 mb-3.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-[var(--color-success)]" />
            <span className="text-xs font-semibold text-[var(--color-success)]">{formatCurrency(totalIncome)} recebido</span>
          </div>
          {remaining > 0 && (
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[var(--color-warning)]" />
              <span className="text-xs text-[var(--color-warning)]">~{formatCurrency(remaining)} a receber</span>
            </div>
          )}
        </div>

        {/* Barra de progresso da renda */}
        <ProgressBar
          value={incomeProgress}
          variant="lucas"
          size="sm"
          showLabel
          label="Renda do mês"
        />
      </div>
    </motion.div>
  )
}

// ─── Próximos Dias ─────────────────────────────────────────────────────────

function ProximosDias() {
  const saidasFixas = useAppStore(useShallow(selectCurrentSaidasFixas))
  const incomeSources = useAppStore(useShallow(s =>
    s.incomeSources.filter(src => src.userId === (s.currentUser?.id ?? 'lucas'))
  ))

  const upcoming = useMemo(() => {
    const despesas = saidasFixas
      .filter(sf => !isPaidThisMonth(sf.paidDates))
      .map(sf => ({
        id: sf.id, name: sf.name, amount: sf.amount,
        days: getDaysUntil(sf.dueDay), type: 'despesa' as const,
      }))
      .filter(d => d.days >= 0 && d.days <= 10)

    const entradas = incomeSources
      .filter(src => src.expectedDay !== undefined)
      .map(src => ({
        id: src.id, name: src.name, amount: src.expectedAmount ?? 0,
        days: getDaysUntil(src.expectedDay!), type: 'entrada' as const,
      }))
      .filter(e => e.days > 0 && e.days <= 10)

    return [...despesas, ...entradas].sort((a, b) => a.days - b.days).slice(0, 5)
  }, [saidasFixas, incomeSources])

  if (upcoming.length === 0) return null

  return (
    <div className="mx-4 mt-5">
      <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2.5 flex items-center gap-1.5">
        <Calendar size={13} />
        Próximos 10 dias
      </p>

      <div
        className="rounded-[var(--radius-lg)] overflow-hidden"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        {upcoming.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: i < upcoming.length - 1 ? '1px solid var(--color-border)' : 'none' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: item.type === 'entrada'
                  ? 'rgba(16,185,129,0.12)'
                  : item.days <= 2 ? 'rgba(239,68,68,0.12)' : 'rgba(91,156,246,0.12)',
              }}
            >
              {item.type === 'entrada'
                ? <ArrowUpRight size={14} className="text-[var(--color-success)]" />
                : <ArrowDownRight size={14} style={{ color: item.days <= 2 ? 'var(--color-danger)' : 'var(--color-accent)' }} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{item.name}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {item.days === 0 ? 'Hoje' : item.days === 1 ? 'Amanhã' : `Em ${item.days} dias`}
              </p>
            </div>
            <span
              className="text-sm font-bold shrink-0"
              style={{ color: item.type === 'entrada' ? 'var(--color-success)' : 'var(--color-text-primary)' }}
            >
              {item.type === 'entrada' ? '+' : '−'}{formatCurrency(item.amount)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Caixinhas Grid (Home) ────────────────────────────────────────────────

function CaixinhasSection() {
  const [, navigate]   = useLocation()
  const caixinhas      = useAppStore(useShallow(selectCurrentCaixinhas))
  const expectedIncome = useAppStore(selectExpectedMonthlyIncome)

  return (
    <div className="mx-4 mt-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Caixinhas</p>
        <button
          onClick={() => navigate('/caixinhas')}
          className="flex items-center gap-0.5 text-xs font-semibold text-[var(--color-accent)] cursor-pointer hover:text-[var(--color-accent-light)] transition-colors"
        >
          Ver todas <ChevronRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {caixinhas.slice(0, 6).map((cx, i) => {
          const { Icon, color } = getCaixinhaIcon(cx.id)
          const expectedBal     = (cx.percentage / 100) * expectedIncome
          const pct             = expectedBal > 0 ? Math.min(100, (cx.balance / expectedBal) * 100) : 100
          const isLow           = pct < 50 && expectedBal > 0

          return (
            <motion.button
              key={cx.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 + 0.1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/caixinhas/${cx.id}`)}
              className="text-left cursor-pointer card-interactive rounded-[var(--radius-lg)] p-3.5"
              style={{
                background: 'var(--color-bg-card)',
                border: `1px solid ${isLow ? 'rgba(239,68,68,0.2)' : 'var(--color-border)'}`,
              }}
            >
              {/* Ícone */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                style={{ background: `${color}15` }}
              >
                <Icon size={18} style={{ color }} />
              </div>

              {/* Nome */}
              <p className="text-[11px] text-[var(--color-text-secondary)] truncate mb-0.5">{cx.name}</p>

              {/* Valor */}
              <p className="text-sm font-bold text-[var(--color-text-primary)] mb-2">
                {formatCurrency(cx.balance)}
              </p>

              {/* Barra — DENTRO do card */}
              <ProgressBar
                value={pct}
                variant={isLow ? 'danger' : 'lucas'}
                size="sm"
                animated={false}
              />
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Home Page ────────────────────────────────────────────────────────────

export default function Home() {
  const [ctx, setCtx]       = useState<Context>('personal')
  const [lancarOpen, setLancarOpen] = useState(false)

  const caixinhas      = useAppStore(useShallow(selectCurrentCaixinhas))
  const entradas       = useAppStore(useShallow(selectCurrentEntradas))
  const saidasFixas    = useAppStore(useShallow(selectCurrentSaidasFixas))
  const expectedIncome = useAppStore(selectExpectedMonthlyIncome)
  const firstName      = useAppStore(s => (s.currentUser?.name ?? 'Lucas').split(' ')[0])

  const summary = useMemo(
    () => getMonthSummary(entradas, saidasFixas, caixinhas, expectedIncome),
    [entradas, saidasFixas, caixinhas, expectedIncome],
  )

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="min-h-full pb-4">
      {/* Saudação + toggle */}
      <div className="flex items-start justify-between px-4 pt-12 md:pt-8 pb-1 gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[var(--color-text-secondary)] font-medium">{greeting}</p>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] leading-tight truncate">{firstName}</h1>
        </div>
        <ContextToggle value={ctx} onChange={setCtx} className="shrink-0" />
      </div>

      {/* Balance card */}
      <BalanceCard
        total={summary.availableBalance}
        totalIncome={summary.totalIncome}
        expectedIncome={expectedIncome}
        incomeProgress={summary.incomeProgress}
      />

      {/* CTA */}
      <div className="px-4 mt-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setLancarOpen(true)}
          className="w-full h-12 rounded-[var(--radius-lg)] font-semibold text-sm text-white flex items-center justify-center gap-2 cursor-pointer transition-shadow duration-200"
          style={{
            background: 'var(--color-accent)',
            boxShadow: '0 4px 16px rgba(91,156,246,0.22)',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 6px 24px rgba(91,156,246,0.35)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(91,156,246,0.22)')}
        >
          <Plus size={18} strokeWidth={2.5} />
          Lançar entrada
        </motion.button>
      </div>

      {/* Próximos dias */}
      <ProximosDias />

      {/* Caixinhas */}
      <CaixinhasSection />

      <LancarEntradaModal open={lancarOpen} onClose={() => setLancarOpen(false)} />
    </div>
  )
}
