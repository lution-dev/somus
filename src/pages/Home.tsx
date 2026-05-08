import React, { useState, useMemo, useCallback } from 'react'
import { useLocation } from 'wouter'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useAppStore,
  selectCurrentDivisoes,
  selectCurrentSaidasFixas,
  selectCurrentEntradas,
  selectExpectedMonthlyIncome,
} from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, getMonthSummary, getDaysUntil, isPaidThisMonth, getEffectiveAmount } from '../lib/calculations'
import { getDivisaoIcon } from '../lib/icons'
import { ProgressBar, PageHeader, Dialog, groupByMonth, MonthHeader } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../hooks/useAuth'
import { useBalanceHidden } from '../hooks/useBalanceHidden'
import UserMenu from '../components/ui/UserMenu'
import LancarEntradaModal from '../components/features/LancarEntradaModal'
import ConfirmPaymentModal from '../components/features/ConfirmPaymentModal'
import {
  Plus,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ChevronDown,
  Wallet,
  History,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'

// ─── Pill button style ──────────────────────────────────────────────────────

const pillBtn = (accent: string, bg: string): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', borderRadius: 20,
  fontSize: 12, fontWeight: 600,
  fontFamily: 'var(--font-sans)',
  background: bg, color: accent,
  border: 'none', cursor: 'pointer',
  transition: 'opacity 150ms ease',
  whiteSpace: 'nowrap',
})

// ─── BalanceCard ─────────────────────────────────────────────────────────────

function BalanceCard({
  total, totalIncome, expectedIncome,
  onLancar, onHistorico, balanceHidden, onToggleHidden,
}: {
  total: number; totalIncome: number; expectedIncome: number
  onLancar: () => void; onHistorico: () => void
  balanceHidden: boolean; onToggleHidden: () => void
}) {
  const remaining = Math.max(0, expectedIncome - totalIncome)
  const mask = '•••••'

  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
      padding: 20,
    }}>
      {/* Label row with eye toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <p className="section-label" style={{ margin: 0 }}>Saldo disponível</p>
        <button
          onClick={onToggleHidden}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center',
            transition: 'color 150ms ease',
          }}
        >
          {balanceHidden ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>

      {/* Valor principal */}
      <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: 12 }}>
        {balanceHidden ? <span style={{ letterSpacing: 4 }}>{mask}</span> : formatCurrency(total)}
      </p>

      {/* Indicadores */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={13} color="var(--color-success)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)' }}>
            {balanceHidden ? mask : formatCurrency(totalIncome)} recebido
          </span>
        </div>
        {remaining > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} color="var(--color-warning)" />
            <span style={{ fontSize: 12, color: 'var(--color-warning)' }}>
              ~{balanceHidden ? mask : formatCurrency(remaining)} a receber
            </span>
          </div>
        )}
      </div>

      {/* ── Action pills ── */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
        <button onClick={onLancar} style={pillBtn('var(--color-accent-primary)', 'rgba(59,130,246,0.12)')}>
          <Plus size={14} strokeWidth={2.5} /> Entrada
        </button>
        <button onClick={onHistorico} style={pillBtn('var(--color-text-secondary)', 'var(--color-bg-tertiary)')}>
          <History size={14} /> Histórico
        </button>
      </div>
    </div>
  )
}

// ─── Histórico Dialog ────────────────────────────────────────────────────────

function HistoricoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const entradas = useAppStore(useShallow(selectCurrentEntradas))

  const grouped = useMemo(
    () => groupByMonth(entradas, e => e.date, e => e.amount),
    [entradas],
  )

  return (
    <Dialog open={open} onClose={onClose} title="Histórico de Entradas" size="lg">
      {grouped.length === 0 ? (
        <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)', textAlign: 'center', padding: 32 }}>
          Nenhuma entrada registrada ainda.
        </p>
      ) : (
        <div style={{
          borderRadius: 'var(--radius-card)', overflow: 'hidden',
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
        }}>
          {grouped.map((g) => (
            <React.Fragment key={g.key}>
              <MonthHeader label={g.label} total={g.total} type="income" />
              {g.items.map((item, i) => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px',
                  borderBottom: (i < g.items.length - 1) ? '1px solid var(--color-border)' : 'none',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: 'rgba(16,185,129,0.1)',
                  }}>
                    <ArrowUpRight size={13} color="var(--color-success)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.sourceName}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>
                      {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-success)', flexShrink: 0 }}>
                    +{formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </Dialog>
  )
}

// ─── Próximos Dias ─────────────────────────────────────────────────────────

function ProximosDias({ onEntradaClick, onDespesaClick, isDesktop }: {
  onEntradaClick: (name: string, amount: number) => void
  onDespesaClick: (id: string) => void
  isDesktop?: boolean
}) {
  const saidasFixas = useAppStore(useShallow(selectCurrentSaidasFixas))
  const incomeSources = useAppStore(useShallow(s =>
    s.incomeSources.filter(src => src.userId === (s.currentUser?.id ?? ''))
  ))
  const saidasVariaveis = useAppStore(useShallow(s => s.saidasVariaveis))

  const upcoming = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
    const despesas = saidasFixas
      .filter(sf => !isPaidThisMonth(sf) && !sf.skippedMonths?.includes(todayStr))
      .map(sf => ({
        id: sf.id, name: sf.name, amount: getEffectiveAmount(sf, todayStr),
        days: getDaysUntil(sf.dueDay), type: 'despesa' as const,
      }))

    const variables = saidasVariaveis
      .filter(sv => sv.status === 'pending')
      .map(sv => {
        const day = parseInt(sv.date.split('-')[2])
        return {
          id: sv.id, name: sv.description, amount: sv.amount,
          days: getDaysUntil(day), type: 'despesa' as const, // Treat as despesa for UI consistency
        }
      })

    const entradas = incomeSources
      .filter(src => src.expectedDay !== undefined)
      .map(src => ({
        id: src.id, name: src.name, amount: src.expectedAmount ?? 0,
        days: getDaysUntil(src.expectedDay!), type: 'entrada' as const,
      }))
      .filter(e => e.days > 0 && e.days <= 10)

    return [...despesas, ...variables, ...entradas]
      .sort((a, b) => a.days - b.days)
      .slice(0, 10)
  }, [saidasFixas, saidasVariaveis, incomeSources])

  // Status counts for mobile header badges
  const overdueCount  = upcoming.filter(i => i.type === 'despesa' && i.days < 0).length
  const pendingCount  = upcoming.filter(i => i.type === 'despesa' && i.days >= 0).length

  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('somus:proxDias') === 'collapsed')

  const toggle = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem('somus:proxDias', next ? 'collapsed' : 'open')
      return next
    })
  }, [])

  // ── Shared list item renderer ──
  const renderItem = (item: typeof upcoming[0], i: number) => (
    <div
      key={item.id}
      onClick={() => item.type === 'entrada'
        ? onEntradaClick(item.name, item.amount)
        : onDespesaClick(item.id)
      }
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        borderBottom: i < upcoming.length - 1 ? '1px solid var(--color-border)' : 'none',
        background: item.days === 0 ? 'rgba(239,68,68,0.06)' : 'transparent',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: item.type === 'entrada'
          ? 'rgba(16,185,129,0.12)'
          : item.days <= 2 ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
      }}>
        {item.type === 'entrada'
          ? <ArrowUpRight size={14} color="var(--color-success)" />
          : <AlertCircle size={14} color={item.days <= 2 ? 'var(--color-danger)' : 'var(--color-warning)'} />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.name}</p>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
          {item.days === 0 ? 'Hoje' : 
           item.days === 1 ? 'Amanhã' : 
           item.days < 0 ? `Atrasado há ${Math.abs(item.days)}d` : 
           `Em ${item.days} dias`}
        </p>
      </div>
      <span style={{
        fontSize: 14, fontWeight: 700, flexShrink: 0,
        color: item.type === 'entrada' ? 'var(--color-success)' : 'var(--color-text-primary)',
      }}>
        {item.type === 'entrada' ? '+' : '−'}{formatCurrency(item.amount)}
      </span>
    </div>
  )

  // ══════════════════════════════════════════════
  //  DESKTOP: card-style, scrollable list (max 4 visible)
  // ══════════════════════════════════════════════
  if (isDesktop) {
    return (
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <Calendar size={13} color="var(--color-text-tertiary)" />
          <p className="section-label" style={{ marginBottom: 0, flex: 1 }}>Próximos dias</p>
          {upcoming.length > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'var(--color-accent-primary)',
              background: 'rgba(59,130,246,0.12)', padding: '2px 8px', borderRadius: 10,
            }}>{upcoming.length}</span>
          )}
        </div>

        {upcoming.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 0',
          }}>
            <Calendar size={28} color="var(--color-text-tertiary)" strokeWidth={1.25} />
            <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0, textAlign: 'center' }}>
              Nenhum compromisso nos próximos dias
            </p>
          </div>
        ) : (
          /* Outer: clips to border-radius. Inner: scrolls. */
          <div style={{
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            background: 'var(--color-bg-tertiary)', // Darker background to distinguish from outer card
          }}>
            <div style={{
              maxHeight: 232,
              overflowY: 'auto',
              overflowX: 'hidden',
            }}>
              {upcoming.map(renderItem)}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ══════════════════════════════════════════════
  //  MOBILE: collapsible section with status badges
  // ══════════════════════════════════════════════

  // Mobile header: shared button element
  const mobileHeader = (
    <button
      onClick={toggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, width: '100%',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        fontFamily: 'var(--font-sans)',
      }}
    >
      <Calendar size={13} color="var(--color-text-tertiary)" />
      <span className="section-label" style={{ marginBottom: 0, flex: 1, textAlign: 'left' }}>
        Próximos dias
      </span>
      {/* Status badges — shown when collapsed and there are items */}
      {collapsed && upcoming.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 4 }}>
          {overdueCount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)',
              padding: '2px 7px', borderRadius: 8,
            }}>
              {overdueCount} atrasad{overdueCount === 1 ? 'o' : 'os'}
            </span>
          )}
          {pendingCount > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              background: 'rgba(245,158,11,0.15)', color: 'var(--color-warning)',
              padding: '2px 7px', borderRadius: 8,
            }}>
              {pendingCount} pendente{pendingCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
      )}
      {/* Plain count when open */}
      {!collapsed && upcoming.length > 0 && (
        <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginRight: 2 }}>
          {upcoming.length}
        </span>
      )}
      <ChevronDown
        size={14}
        color="var(--color-text-tertiary)"
        style={{
          transition: 'transform 200ms ease',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
        }}
      />
    </button>
  )

  if (upcoming.length === 0) return (
    <div style={{ marginTop: 20 }}>
      {mobileHeader}
      {!collapsed && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '28px 16px', borderRadius: 'var(--radius-card)',
          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
          marginTop: 8,
        }}>
          <Calendar size={22} color="var(--color-text-tertiary)" strokeWidth={1.5} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0, textAlign: 'center' }}>Nenhum compromisso nos próximos dias</p>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ marginTop: 20 }}>
      {mobileHeader}

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: 'hidden', marginTop: 8 }}
          >
            <div style={{
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-secondary)',
            }}>
              {upcoming.map(renderItem)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


// ─── Divisoes Grid (Home) ────────────────────────────────────────────────

function DivisoesSection({ balanceHidden = false }: { balanceHidden?: boolean }) {
  const [, navigate]   = useLocation()
  const divisoes      = useAppStore(useShallow(selectCurrentDivisoes))
  const mask = '•••'

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p className="section-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wallet size={13} />
          Divisões
        </p>
      </div>

      {divisoes.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '32px 16px', borderRadius: 'var(--radius-card)',
          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
        }}>
          <Wallet size={24} color="var(--color-text-tertiary)" strokeWidth={1.5} style={{ marginBottom: 10 }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>Nenhuma divisão criada</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0, textAlign: 'center', maxWidth: 240 }}>
            Lance sua primeira entrada para criar as divisões automaticamente.
          </p>
        </div>
      ) : (() => {
        // Option A: Essencial (55%) as featured card, rest in 2x2 grid
        const essencial = divisoes.find(cx => cx.id === 'cx-essencial')
        const others = divisoes.filter(cx => cx.id !== 'cx-essencial')

        // Helper to calc % used: expenses are stored as negative amounts, so use Math.abs
        const calcPct = (cx: typeof divisoes[0]) => {
          const totalIn  = cx.movements.filter(m => m.type === 'income').reduce((s, m) => s + m.amount, 0)
          const totalOut = cx.movements.filter(m => m.type === 'expense').reduce((s, m) => s + Math.abs(m.amount), 0)
          return totalIn > 0 ? Math.min(100, (totalOut / totalIn) * 100) : 0
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* ── Featured: Essencial (55%) ── */}
            {essencial && (() => {
              const { Icon, color } = getDivisaoIcon(essencial.id)
              const pct = calcPct(essencial)
              const totalIn = essencial.movements.filter(m => m.type === 'income').reduce((s, m) => s + m.amount, 0)
              return (
                <button
                  onClick={() => navigate(`/relatorios/${essencial.id}`)}
                  className="card card-interactive"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    textAlign: 'left', cursor: 'pointer', width: '100%',
                    border: 'none', fontFamily: 'var(--font-sans)',
                    background: 'var(--color-bg-secondary)',
                    borderWidth: 1, borderStyle: 'solid',
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                    padding: 16,
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${color}15`,
                  }}>
                    <Icon size={22} style={{ color }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{essencial.name}</p>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color, flexShrink: 0,
                        background: `${color}15`, padding: '1px 5px', borderRadius: 6,
                      }}>{essencial.percentage}%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
                      <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                        {balanceHidden ? <span style={{ letterSpacing: 2 }}>{mask}</span> : formatCurrency(essencial.balance)}
                      </p>
                      {totalIn > 0 && (
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          color: pct >= 80 ? 'var(--color-danger)' : pct >= 50 ? 'var(--color-warning)' : 'var(--color-text-tertiary)',
                        }}>{Math.round(pct)}% usado</span>
                      )}
                    </div>
                    <ProgressBar value={pct} size="sm" />
                  </div>
                </button>
              )
            })()}

            {/* ── Grid 2x2 (4 cards restantes) ── */}
            <div className="home-divisoes-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}>
              <style>{`
                @media (min-width: 1024px) {
                  .home-divisoes-grid { grid-template-columns: repeat(4, 1fr) !important; }
                }
              `}</style>
              {others.slice(0, 4).map((cx) => {
                const { Icon, color } = getDivisaoIcon(cx.id)
                const pct = calcPct(cx)
                const totalIn = cx.movements.filter(m => m.type === 'income').reduce((s, m) => s + m.amount, 0)

                return (
                  <button
                    key={cx.id}
                    onClick={() => navigate(`/relatorios/${cx.id}`)}
                    className="card card-interactive home-divisoes-grid-item"
                    style={{
                      textAlign: 'left', cursor: 'pointer',
                      border: 'none', fontFamily: 'var(--font-sans)',
                      background: 'var(--color-bg-secondary)',
                      borderWidth: 1, borderStyle: 'solid',
                      borderColor: 'var(--color-border)',
                      borderRadius: 'var(--radius-card)',
                      padding: 14,
                    }}
                  >
                    {/* Ícone */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${color}15`, marginBottom: 10,
                    }}>
                      <Icon size={18} style={{ color }} />
                    </div>

                    {/* Nome + % alocação */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{cx.name}</p>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color, flexShrink: 0,
                        background: `${color}15`, padding: '1px 5px', borderRadius: 6,
                      }}>{cx.percentage}%</span>
                    </div>

                    {/* Valor + % gasto */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                        {balanceHidden ? <span style={{ letterSpacing: 2 }}>{mask}</span> : formatCurrency(cx.balance)}
                      </p>
                      {totalIn > 0 && (
                        <span style={{
                          fontSize: 10, fontWeight: 600,
                          color: pct >= 80 ? 'var(--color-danger)' : pct >= 50 ? 'var(--color-warning)' : 'var(--color-text-tertiary)',
                        }}>{Math.round(pct)}% usado</span>
                      )}
                    </div>

                    {/* Barra */}
                    <ProgressBar value={pct} size="sm" />
                  </button>
                )
              })}
            </div>
          </div>
        )
      })()
      }
    </div>
  )
}

// ─── Home Page ────────────────────────────────────────────────────────────

export default function Home() {
  const [lancarOpen, setLancarOpen] = useState(false)
  const [historicoOpen, setHistoricoOpen] = useState(false)
  const [prefill, setPrefill] = useState<{ sourceName: string; amount: number } | undefined>()
  const [confirmPayId, setConfirmPayId] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const { displayName } = useAuth()

  const markSaidaFixaPaid = useAppStore(s => s.markSaidaFixaPaid)
  const saidasFixasAll    = useAppStore(useShallow(s => s.saidasFixas))

  const divisoes      = useAppStore(useShallow(selectCurrentDivisoes))
  const entradas       = useAppStore(useShallow(selectCurrentEntradas))
  const saidasFixas    = useAppStore(useShallow(selectCurrentSaidasFixas))
  const expectedIncome = useAppStore(selectExpectedMonthlyIncome)
  const currentUserName = useAppStore(s => s.currentUser?.name ?? 'Usuário')
  const firstName       = displayName?.split(' ')[0] ?? currentUserName.split(' ')[0]

  const summary = useMemo(
    () => getMonthSummary(entradas, saidasFixas, divisoes, expectedIncome),
    [entradas, saidasFixas, divisoes, expectedIncome],
  )

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const HERO_BG = '#001442'

  function handleEntradaClick(name: string, amount: number) {
    setPrefill({ sourceName: name, amount })
    setLancarOpen(true)
  }

  function handleDespesaClick(sfId: string) {
    setConfirmPayId(sfId)
  }

  function handleCloseModal() {
    setLancarOpen(false)
    setPrefill(undefined)
  }

  const { hidden: balanceHidden, toggle: toggleBalanceHidden } = useBalanceHidden()

  return (
    <div style={{ minHeight: '100%' }}>
      {/* ── Hero Header Section ── */}
      {isMobile ? (
        <>
          <PageHeader
            title={`${greeting}, ${firstName}`}
            bg={HERO_BG}
            rightAction={<UserMenu variant="hero" />}
          />
          <div style={{
            background: `linear-gradient(to bottom, ${HERO_BG} 0%, transparent 100%)`,
            padding: '12px 16px 20px',
            marginBottom: 20,
            overflow: 'hidden',
          }}>
            <BalanceCard
              total={summary.availableBalance}
              totalIncome={summary.totalIncome}
              expectedIncome={expectedIncome}
              onLancar={() => setLancarOpen(true)}
              onHistorico={() => setHistoricoOpen(true)}
              balanceHidden={balanceHidden}
              onToggleHidden={toggleBalanceHidden}
            />
          </div>
        </>
      ) : (
        <>
          {/* Desktop: 2-column dashboard header */}
          <div style={{ paddingTop: 32, paddingBottom: 4 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500, margin: 0 }}>{greeting}</p>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2, margin: 0 }}>{firstName}</h1>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 20,
            marginTop: 8,
            alignItems: 'start',
          }}>
            {/* Left: Balance card with inline actions */}
            <BalanceCard
              total={summary.availableBalance}
              totalIncome={summary.totalIncome}
              expectedIncome={expectedIncome}
              onLancar={() => setLancarOpen(true)}
              onHistorico={() => setHistoricoOpen(true)}
              balanceHidden={balanceHidden}
              onToggleHidden={toggleBalanceHidden}
            />

            {/* Right: Próximos Dias */}
            <ProximosDias
              onEntradaClick={handleEntradaClick}
              onDespesaClick={handleDespesaClick}
              isDesktop
            />
          </div>
        </>
      )}

      <div style={{ padding: isMobile ? '0 16px' : 0 }}>

      {/* Próximos dias — mobile only */}
      {isMobile && (
        <ProximosDias
          onEntradaClick={handleEntradaClick}
          onDespesaClick={handleDespesaClick}
        />
      )}

      {/* Divisoes */}
      <DivisoesSection balanceHidden={balanceHidden} />

      </div>
      <LancarEntradaModal open={lancarOpen} onClose={handleCloseModal} prefill={prefill} />
      <HistoricoDialog open={historicoOpen} onClose={() => setHistoricoOpen(false)} />
      <ConfirmPaymentModal
        open={!!confirmPayId}
        onClose={() => setConfirmPayId(null)}
        costName={confirmPayId ? (
          saidasFixasAll.find(s => s.id === confirmPayId)?.name ?? 
          useAppStore.getState().saidasVariaveis.find(s => s.id === confirmPayId)?.description ?? ''
        ) : ''}
        onConfirm={(date) => {
          if (confirmPayId) {
            if (confirmPayId.startsWith('sv-')) {
              useAppStore.getState().confirmSaidaVariavel(confirmPayId, date)
            } else {
              markSaidaFixaPaid(confirmPayId, date)
            }
          }
          setConfirmPayId(null)
        }}
      />
    </div>
  )
}
