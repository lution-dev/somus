import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAppStore, selectCurrentCaixinhas, selectExpectedMonthlyIncome } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { getCaixinhaIcon } from '../lib/icons'
import { DIVISAO_INFO, DIVISAO_ORDER } from '../lib/divisoes'
import { ProgressBar, PageHeader, Dialog } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import { ChevronRight, AlertTriangle, CheckCircle2, Info, Inbox } from 'lucide-react'

export default function Caixinhas() {
  const [, navigate]   = useLocation()
  const caixinhas      = useAppStore(useShallow(selectCurrentCaixinhas))
  const expectedIncome = useAppStore(selectExpectedMonthlyIncome)
  const totalBalance   = caixinhas.reduce((s, cx) => s + cx.balance, 0)
  const isMobile = useIsMobile()
  const [infoOpen, setInfoOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>
      {/* Header */}
      {isMobile ? (
        <PageHeader
          title="Divisões"
          bg="#001442"
          rightAction={
            <button
              onClick={() => setInfoOpen(true)}
              style={{
                background: 'rgba(59,130,246,0.15)', border: 'none',
                borderRadius: 8, padding: 6, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Info size={16} color="var(--color-accent-primary)" />
            </button>
          }
        />
      ) : (
        <div style={{ paddingTop: 32, marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Divisões</h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
              Total · <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{formatCurrency(totalBalance)}</span>
            </p>
          </div>
          <button
            onClick={() => setInfoOpen(true)}
            title="Entenda as divisões"
            style={{
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-sans)',
              fontSize: 12, fontWeight: 500, color: 'var(--color-accent-primary)',
              transition: 'background 150ms ease',
            }}
          >
            <Info size={14} /> Entenda
          </button>
        </div>
      )}

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 8 : 12, maxWidth: 800, margin: '0 auto', padding: isMobile ? '8px 16px 0' : 0 }}>
        {caixinhas.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', padding: '48px 20px',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(59,130,246,0.08)', marginBottom: 16,
            }}>
              <Inbox size={26} color="var(--color-accent-primary)" strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>Nenhuma divisão criada</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5, maxWidth: 280 }}>
              Ao lançar sua primeira entrada na tela Home, as divisões serão criadas automaticamente com base no Método Nati Arcuri.
            </p>
          </div>
        ) : (
          caixinhas.map((cx) => {
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
                    <ChevronRight size={16} color="var(--color-text-tertiary)" style={{ opacity: 0.7 }} />
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
        })
        )}
      </div>

      {/* Info Dialog */}
      <Dialog open={infoOpen} onClose={() => { setInfoOpen(false); setExpandedId(null) }} title="Entenda as divisões" size="lg">
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
          Baseado no Método Nati Arcuri, cada divisão tem um propósito específico para manter suas finanças equilibradas.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DIVISAO_ORDER.map((id) => {
            const info = DIVISAO_INFO[id]
            const { Icon, color } = getCaixinhaIcon(id)
            const isOpen = expandedId === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setExpandedId(isOpen ? null : id)}
                style={{
                  background: isOpen ? `${color}08` : 'var(--color-bg-tertiary)',
                  border: `1px solid ${isOpen ? color + '30' : 'var(--color-border)'}`,
                  borderRadius: 10, padding: '10px 12px',
                  display: 'flex', flexDirection: 'column', gap: isOpen ? 8 : 0,
                  cursor: 'pointer', width: '100%', textAlign: 'left',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 200ms ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: `${color}15`,
                  }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{info.name}</p>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color, flexShrink: 0 }}>{info.pct}%</span>
                </div>
                {isOpen && (
                  <div style={{
                    paddingLeft: 38, paddingTop: 4,
                    fontSize: 12, lineHeight: 1.6,
                    color: 'var(--color-text-secondary)',
                  }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 500, color: 'var(--color-text-primary)', fontSize: 12 }}>{info.short}</p>
                    {info.detail}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Dialog>
    </div>
  )
}
