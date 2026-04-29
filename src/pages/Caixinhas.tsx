import { motion } from 'framer-motion'
import { useLocation } from 'wouter'
import { useAppStore, selectCurrentCaixinhas, selectExpectedMonthlyIncome } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, shouldRedirectReserva } from '../lib/calculations'
import { Badge, ProgressBar } from '../components/ui'

export default function Caixinhas() {
  const [, navigate] = useLocation()
  const caixinhas    = useAppStore(useShallow(selectCurrentCaixinhas))
  const expectedIncome = useAppStore(selectExpectedMonthlyIncome)

  const totalBalance = caixinhas.reduce((s, cx) => s + cx.balance, 0)

  return (
    <div className="min-h-full pb-6">
      {/* Header */}
      <div className="px-4 pt-12 pb-2">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Caixinhas</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          Total: <span className="font-bold text-[var(--color-text-primary)]">{formatCurrency(totalBalance)}</span>
        </p>
      </div>

      {/* Lista */}
      <div className="flex flex-col gap-2.5 mx-4 mt-3">
        {caixinhas.map((cx, i) => {
          const expectedBal = (cx.percentage / 100) * expectedIncome
          const pct = expectedBal > 0 ? Math.min(100, (cx.balance / expectedBal) * 100) : 100
          const isLow = pct < 50 && expectedBal > 0
          const isReservaFull = shouldRedirectReserva(cx)

          return (
            <motion.button
              key={cx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/caixinhas/${cx.id}`)}
              className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 text-left cursor-pointer"
              style={{ borderColor: isLow ? 'rgba(239,68,68,0.35)' : isReservaFull ? 'rgba(16,185,129,0.35)' : undefined }}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-xl shrink-0"
                    style={{ background: `${cx.color}20` }}
                  >
                    {cx.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">{cx.name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{cx.percentage}% da renda</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-[var(--color-text-primary)]">{formatCurrency(cx.balance)}</p>
                  {cx.targetAmount && (
                    <p className="text-xs text-[var(--color-text-tertiary)]">meta: {formatCurrency(cx.targetAmount)}</p>
                  )}
                </div>
              </div>

              {/* Progress */}
              <ProgressBar
                value={pct}
                variant={isLow ? 'danger' : isReservaFull ? 'success' : 'default'}
                size="sm"
                animated={false}
              />

              {/* Alertas */}
              <div className="flex gap-1.5 mt-2.5 flex-wrap">
                {isLow && <Badge variant="danger" size="sm" dot>Saldo abaixo do esperado</Badge>}
                {isReservaFull && <Badge variant="success" size="sm" dot>Meta atingida! Redirecionar?</Badge>}
                {expectedBal > 0 && !isLow && !isReservaFull && (
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Esperado: {formatCurrency(expectedBal)} · {Math.round(pct)}% atingido
                  </p>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
