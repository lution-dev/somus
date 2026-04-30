import { useLocation } from 'wouter'
import { useAppStore, selectCurrentCaixinhas, selectExpectedMonthlyIncome } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { getCaixinhaIcon } from '../lib/icons'
import { ProgressBar, PageHeader } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import { ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function Caixinhas() {
  const [, navigate]   = useLocation()
  const caixinhas      = useAppStore(useShallow(selectCurrentCaixinhas))
  const expectedIncome = useAppStore(selectExpectedMonthlyIncome)
  const totalBalance   = caixinhas.reduce((s, cx) => s + cx.balance, 0)
  const isMobile = useIsMobile()

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>
      {/* Header */}
      {isMobile ? (
        <PageHeader title="Caixinhas" subtitle={`Total · ${formatCurrency(totalBalance)}`} />
      ) : (
        <div style={{ paddingTop: 32, marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Caixinhas</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Total · <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatCurrency(totalBalance)}</span>
          </p>
        </div>
      )}

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 12, maxWidth: 800, margin: '0 auto', padding: isMobile ? '8px 16px 0' : 0 }}>
        {caixinhas.map((cx) => {
          const { Icon, color }  = getCaixinhaIcon(cx.id)
          const expectedBal      = (cx.percentage / 100) * expectedIncome
          const pct              = expectedBal > 0 ? Math.min(100, (cx.balance / expectedBal) * 100) : 100
          const isLow            = pct < 50 && expectedBal > 0
          const isFull           = pct >= 100

          return (
            <button
              key={cx.id}
              onClick={() => navigate(`/caixinhas/${cx.id}`)}
              className="card-interactive"
              style={{
                width: '100%', textAlign: 'left', cursor: 'pointer',
                background: 'var(--color-bg-secondary)',
                border: `1px solid ${isLow ? 'rgba(239,68,68,0.25)' : isFull ? 'rgba(16,185,129,0.25)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-card)',
                overflow: 'hidden', fontFamily: 'var(--font-sans)',
              }}
            >
              <div style={{ padding: 16 }}>
                {/* Linha principal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  {/* Ícone */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: `${color}18`,
                  }}>
                    <Icon size={20} style={{ color }} />
                  </div>

                  {/* Texto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cx.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{cx.percentage}% da renda esperada</p>
                  </div>

                  {/* Valor + chevron */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{formatCurrency(cx.balance)}</p>
                      {cx.targetAmount && (
                        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>meta {formatCurrency(cx.targetAmount)}</p>
                      )}
                    </div>
                    <ChevronRight size={16} color="var(--color-text-tertiary)" style={{ opacity: 0.5 }} />
                  </div>
                </div>

                {/* Progresso */}
                <ProgressBar
                  value={pct}
                  variant={isFull ? 'success' : undefined}
                  size="sm"
                />

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  {isLow && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-danger)' }}>
                      <AlertTriangle size={11} />
                      <span style={{ fontSize: 11, fontWeight: 500 }}>Abaixo do esperado</span>
                    </div>
                  )}
                  {isFull && !isLow && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-success)' }}>
                      <CheckCircle2 size={11} />
                      <span style={{ fontSize: 11, fontWeight: 500 }}>Meta atingida</span>
                    </div>
                  )}
                  {!isLow && !isFull && (
                    <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                      {formatCurrency(expectedBal > 0 ? expectedBal - cx.balance : 0)} para atingir a meta mensal
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
