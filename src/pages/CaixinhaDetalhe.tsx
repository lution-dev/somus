import { useParams, useLocation } from 'wouter'
import { motion } from 'framer-motion'
import { useAppStore } from '../stores/useAppStore'
import { formatCurrency } from '../lib/calculations'
import { getCaixinhaIcon } from '../lib/icons'
import { ProgressBar } from '../components/ui'
import { ChevronLeft, ArrowUpRight, ArrowDownRight, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function CaixinhaDetalhe() {
  const { id } = useParams<{ id: string }>()
  const [, navigate] = useLocation()

  const caixinha = useAppStore(s => s.caixinhas.find(cx => cx.id === id))
  const expectedIncome = useAppStore(s =>
    s.incomeSources
      .filter(src => src.userId === (s.currentUser?.id ?? 'lucas'))
      .reduce((sum, src) => sum + (src.expectedAmount ?? 0), 0)
  )

  if (!caixinha) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-3">
        <Info size={28} className="text-[var(--color-text-tertiary)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">Caixinha não encontrada</p>
      </div>
    )
  }

  const { Icon, color } = getCaixinhaIcon(caixinha.id)
  const expectedBal     = (caixinha.percentage / 100) * expectedIncome
  const pct             = expectedBal > 0 ? Math.min(100, (caixinha.balance / expectedBal) * 100) : 100
  const isLow           = pct < 50 && expectedBal > 0
  const isFull          = pct >= 100

  const movements = [...caixinha.movements].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="min-h-full pb-6 pt-12 md:pt-8">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 mb-5">
        <button
          onClick={() => navigate('/caixinhas')}
          className="cursor-pointer text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-1.5 -ml-1.5 rounded-[var(--radius-sm)]"
        >
          <ChevronLeft size={20} />
        </button>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-[var(--color-text-primary)] truncate">{caixinha.name}</h1>
          <p className="text-xs text-[var(--color-text-secondary)]">{caixinha.percentage}% da renda</p>
        </div>
      </div>

      {/* Card de saldo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 rounded-[var(--radius-xl)] p-5 mb-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${color}10 0%, var(--color-bg-secondary) 80%)`,
          border: `1px solid ${color}25`,
        }}
      >
        {/* Orb */}
        <div
          className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 70%)` }}
        />

        <div className="relative">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Saldo atual</p>
          <p className="text-[2rem] font-extrabold text-white mb-3 tracking-tight">{formatCurrency(caixinha.balance)}</p>

          <ProgressBar
            value={pct}
            variant={isLow ? 'danger' : isFull ? 'success' : 'default'}
            size="md"
            showLabel
            animated
          />

          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {isLow && (
              <div className="flex items-center gap-1.5 text-[var(--color-danger)]">
                <AlertTriangle size={12} />
                <span className="text-xs font-medium">Abaixo do esperado ({formatCurrency(expectedBal)})</span>
              </div>
            )}
            {isFull && (
              <div className="flex items-center gap-1.5 text-[var(--color-success)]">
                <CheckCircle2 size={12} />
                <span className="text-xs font-medium">Meta mensal atingida!</span>
              </div>
            )}
            {!isLow && !isFull && expectedBal > 0 && (
              <span className="text-xs text-[var(--color-text-secondary)]">
                Meta mensal: {formatCurrency(expectedBal)}
              </span>
            )}
            {caixinha.targetAmount && (
              <span className="text-xs text-[var(--color-text-tertiary)]">
                · Objetivo total: {formatCurrency(caixinha.targetAmount)}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Histórico */}
      <div className="mx-4">
        <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-2.5">Movimentações</p>

        <div
          className="rounded-[var(--radius-lg)] overflow-hidden"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
        >
          {movements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Info size={24} className="text-[var(--color-text-tertiary)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">Nenhuma movimentação ainda</p>
            </div>
          ) : (
            movements.map((mv, i) => (
              <motion.div
                key={mv.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-4 py-3.5"
                style={{ borderBottom: i < movements.length - 1 ? '1px solid var(--color-border)' : 'none' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: mv.amount > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}
                >
                  {mv.amount > 0
                    ? <ArrowUpRight size={14} className="text-[var(--color-success)]" />
                    : <ArrowDownRight size={14} className="text-[var(--color-danger)]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{mv.description}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {new Date(mv.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span
                  className="text-sm font-bold shrink-0"
                  style={{ color: mv.amount > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
                >
                  {mv.amount > 0 ? '+' : ''}{formatCurrency(mv.amount)}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
