import { motion } from 'framer-motion'
import { useLocation } from 'wouter'
import { useAppStore, selectCurrentCaixinhas, selectExpectedMonthlyIncome } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { getCaixinhaIcon } from '../lib/icons'
import { ProgressBar } from '../components/ui'
import { ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function Caixinhas() {
  const [, navigate]   = useLocation()
  const caixinhas      = useAppStore(useShallow(selectCurrentCaixinhas))
  const expectedIncome = useAppStore(selectExpectedMonthlyIncome)
  const totalBalance   = caixinhas.reduce((s, cx) => s + cx.balance, 0)

  return (
    <div className="min-h-full pb-6 px-4 pt-12 md:pt-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Caixinhas</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          Total · <span className="font-semibold text-[var(--color-text-primary)]">{formatCurrency(totalBalance)}</span>
        </p>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-3">
        {caixinhas.map((cx, i) => {
          const { Icon, color }  = getCaixinhaIcon(cx.id)
          const expectedBal      = (cx.percentage / 100) * expectedIncome
          const pct              = expectedBal > 0 ? Math.min(100, (cx.balance / expectedBal) * 100) : 100
          const isLow            = pct < 50 && expectedBal > 0
          const isFull           = pct >= 100

          return (
            <motion.button
              key={cx.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate(`/caixinhas/${cx.id}`)}
              className="w-full text-left cursor-pointer card-interactive"
              style={{
                background: 'var(--color-bg-card)',
                border: `1px solid ${isLow ? 'rgba(239,68,68,0.25)' : isFull ? 'rgba(16,185,129,0.25)' : 'var(--color-border)'}`,
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              <div className="p-4">
                {/* Linha principal */}
                <div className="flex items-center gap-3 mb-3">
                  {/* Ícone */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}18` }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{cx.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{cx.percentage}% da renda esperada</p>
                  </div>

                  {/* Valor + chevron */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="text-right">
                      <p className="text-base font-bold text-[var(--color-text-primary)]">{formatCurrency(cx.balance)}</p>
                      {cx.targetAmount && (
                        <p className="text-[11px] text-[var(--color-text-tertiary)]">meta {formatCurrency(cx.targetAmount)}</p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-[var(--color-text-tertiary)] opacity-50" />
                  </div>
                </div>

                {/* Progresso — DENTRO do card */}
                <ProgressBar
                  value={pct}
                  variant={isLow ? 'danger' : isFull ? 'success' : 'lucas'}
                  size="sm"
                  animated={false}
                />

                {/* Status */}
                <div className="flex items-center gap-1.5 mt-2">
                  {isLow && (
                    <div className="flex items-center gap-1 text-[var(--color-danger)]">
                      <AlertTriangle size={11} />
                      <span className="text-[11px] font-medium">Abaixo do esperado</span>
                    </div>
                  )}
                  {isFull && !isLow && (
                    <div className="flex items-center gap-1 text-[var(--color-success)]">
                      <CheckCircle2 size={11} />
                      <span className="text-[11px] font-medium">Meta atingida</span>
                    </div>
                  )}
                  {!isLow && !isFull && (
                    <span className="text-[11px] text-[var(--color-text-tertiary)]">
                      {formatCurrency(expectedBal > 0 ? expectedBal - cx.balance : 0)} para atingir a meta mensal
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
