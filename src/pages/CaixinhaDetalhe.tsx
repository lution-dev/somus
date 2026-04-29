import { useParams, useLocation } from 'wouter'
import { motion } from 'framer-motion'
import { useAppStore } from '../stores/useAppStore'
import { formatCurrency } from '../lib/calculations'
import { ProgressBar, Badge } from '../components/ui'
import { shouldRedirectReserva } from '../lib/calculations'

const ArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

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
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-[var(--color-text-secondary)]">Caixinha não encontrada</p>
      </div>
    )
  }

  const expectedBal = (caixinha.percentage / 100) * expectedIncome
  const pct = expectedBal > 0 ? Math.min(100, (caixinha.balance / expectedBal) * 100) : 100
  const isLow = pct < 50 && expectedBal > 0
  const isFull = shouldRedirectReserva(caixinha)

  const movements = [...caixinha.movements].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="min-h-full pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => navigate('/caixinhas')} className="cursor-pointer text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
          <ArrowLeft />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <span className="text-2xl">{caixinha.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{caixinha.name}</h1>
            <p className="text-xs text-[var(--color-text-tertiary)]">{caixinha.percentage}% da renda</p>
          </div>
        </div>
      </div>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 rounded-[var(--radius-xl)] p-5 mb-4"
        style={{ background: `linear-gradient(135deg, ${caixinha.color}30 0%, #0D1B2A 100%)`, border: `1px solid ${caixinha.color}40` }}
      >
        <p className="text-xs text-[var(--color-text-secondary)] mb-1 uppercase tracking-wide font-semibold">Saldo atual</p>
        <p className="text-3xl font-extrabold text-white mb-3">{formatCurrency(caixinha.balance)}</p>

        <ProgressBar value={pct} variant={isLow ? 'danger' : isFull ? 'success' : 'default'} size="md" showLabel animated />

        <div className="flex gap-2 mt-3 flex-wrap">
          {isLow && <Badge variant="danger" size="sm" dot>Abaixo do esperado</Badge>}
          {isFull && <Badge variant="success" size="sm" dot>Meta atingida! Sugerimos redirecionar para Objetivos</Badge>}
          {!isLow && !isFull && expectedBal > 0 && (
            <Badge variant="info" size="sm">Meta: {formatCurrency(expectedBal)}</Badge>
          )}
          {caixinha.targetAmount && (
            <Badge variant="couple" size="sm">Alvo: {formatCurrency(caixinha.targetAmount)}</Badge>
          )}
        </div>
      </motion.div>

      {/* Histórico */}
      <div className="mx-4">
        <h2 className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold mb-2">Movimentações</h2>
        <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
          {movements.length === 0 ? (
            <p className="text-center text-[var(--color-text-tertiary)] py-10 text-sm">Nenhuma movimentação ainda</p>
          ) : (
            movements.map((mv, i) => (
              <motion.div
                key={mv.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)] last:border-0"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${mv.amount > 0 ? 'bg-[rgba(16,185,129,0.15)]' : 'bg-[rgba(239,68,68,0.15)]'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={mv.amount > 0 ? 'var(--color-success)' : 'var(--color-danger)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {mv.amount > 0
                      ? <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>
                      : <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="5 12 12 19 19 12" /></>
                    }
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{mv.description}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">{new Date(mv.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${mv.amount > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
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
