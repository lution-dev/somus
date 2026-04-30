import { useParams, useLocation } from 'wouter'
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', gap: 12 }}>
        <Info size={28} color="var(--color-text-tertiary)" />
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Caixinha não encontrada</p>
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
    <div style={{ minHeight: '100%', paddingBottom: 24, paddingTop: 32 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => navigate('/caixinhas')}
          style={{
            cursor: 'pointer', color: 'var(--color-text-secondary)',
            padding: 6, marginLeft: -6, borderRadius: 8,
            background: 'none', border: 'none',
          }}
        >
          <ChevronLeft size={20} />
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${color}18`,
        }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{caixinha.name}</h1>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>{caixinha.percentage}% da renda</p>
        </div>
      </div>

      {/* Card de saldo */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: `1px solid ${color}25`,
        borderRadius: 'var(--radius-card)',
        padding: 20, marginBottom: 20,
      }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>Saldo atual</p>
        <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 12px', lineHeight: 1 }}>{formatCurrency(caixinha.balance)}</p>

        <ProgressBar
          value={pct}
          variant={isFull ? 'success' : undefined}
          size="md"
          showLabel
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {isLow && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-danger)' }}>
              <AlertTriangle size={12} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>Abaixo do esperado ({formatCurrency(expectedBal)})</span>
            </div>
          )}
          {isFull && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-success)' }}>
              <CheckCircle2 size={12} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>Meta mensal atingida!</span>
            </div>
          )}
          {!isLow && !isFull && expectedBal > 0 && (
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              Meta mensal: {formatCurrency(expectedBal)}
            </span>
          )}
          {caixinha.targetAmount && (
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
              · Objetivo total: {formatCurrency(caixinha.targetAmount)}
            </span>
          )}
        </div>
      </div>

      {/* Histórico */}
      <div>
        <p className="section-label">Movimentações</p>

        <div style={{
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
        }}>
          {movements.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 8 }}>
              <Info size={24} color="var(--color-text-tertiary)" />
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>Nenhuma movimentação ainda</p>
            </div>
          ) : (
            movements.map((mv, i) => (
              <div
                key={mv.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  borderBottom: i < movements.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: mv.amount > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                }}>
                  {mv.amount > 0
                    ? <ArrowUpRight size={14} color="var(--color-success)" />
                    : <ArrowDownRight size={14} color="var(--color-danger)" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{mv.description}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
                    {new Date(mv.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span style={{
                  fontSize: 14, fontWeight: 700, flexShrink: 0,
                  color: mv.amount > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                }}>
                  {mv.amount > 0 ? '+' : ''}{formatCurrency(mv.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
