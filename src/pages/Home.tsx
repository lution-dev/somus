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
import { formatCurrency, getMonthSummary, getDaysUntil, getDaysUntilDate, isPaidThisMonth, getEffectiveAmount } from '../lib/calculations'
import { getDivisaoIcon } from '../lib/icons'
import { PageHeader, Dialog, groupByMonth, MonthHeader } from '../components/ui'
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
  Receipt,
  Users,
  Sparkles,
  Info,
  X,
  Plane,
  Shield,
  Home as HomeIcon,
  Heart,
  BarChart2,
  Share2,
  Clock,
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
        <p className="section-label" style={{ margin: 0 }}>Disponível agora</p>
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
      <p style={{ fontSize: 36, fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: 'var(--tracking-financial)', color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: 12 }}>
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

function ProximosDias({ onEntradaClick, onDespesaClick, onEntradaPendingClick, isDesktop }: {
  onEntradaClick: (name: string, amount: number) => void
  onDespesaClick: (id: string) => void
  onEntradaPendingClick: (id: string) => void
  isDesktop?: boolean
}) {
  const saidasFixas = useAppStore(useShallow(selectCurrentSaidasFixas))
  const incomeSources = useAppStore(useShallow(s =>
    s.incomeSources.filter(src => src.userId === (s.currentUser?.id ?? ''))
  ))
  const saidasVariaveis = useAppStore(useShallow(s => s.saidasVariaveis))
  const entradasAll = useAppStore(useShallow(s => s.entradas))

  const result = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
    const despesas = saidasFixas
      .filter(sf => !isPaidThisMonth(sf) && !sf.skippedMonths?.includes(todayStr))
      .map(sf => ({
        id: sf.id, name: sf.name, amount: getEffectiveAmount(sf, todayStr),
        days: getDaysUntil(sf.dueDay), type: 'despesa' as const,
        paymentMethod: sf.paymentMethod as string | undefined,
      }))

    const variables = saidasVariaveis
      .filter(sv => sv.status === 'pending')
      .map(sv => ({
        id: sv.id, name: sv.description, amount: sv.amount,
        days: getDaysUntilDate(sv.date), type: 'despesa' as const,
        paymentMethod: sv.paymentMethod as string | undefined,
      }))

    const entradas = incomeSources
      .filter(src => src.expectedDay !== undefined)
      .map(src => ({
        id: src.id, name: src.name, amount: src.expectedAmount ?? 0,
        days: getDaysUntil(src.expectedDay!), type: 'entrada' as const,
      }))
      .filter(e => e.days > 0 && e.days <= 10)

    const entradasPendentes = entradasAll
      .filter(e => e.status === 'pending')
      .map(e => ({
        id: e.id, name: e.sourceName, amount: e.amount,
        days: getDaysUntilDate(e.date), type: 'entrada-pending' as const,
        paymentMethod: undefined as string | undefined,
      }))

    const allItems = [...despesas, ...variables, ...entradas, ...entradasPendentes]
      .sort((a, b) => a.days - b.days)

    const futureItems  = allItems.filter(i => {
      // Items where days > current month boundary — roughly > 31 days OR the date is in a future yearMonth
      // We detect "future month" by checking if it's not in this month's window
      // despesas fixas: dueDay-based, treat as current month
      // variables/entradas: have actual full date via getDaysUntilDate
      return i.days > 31
    })

    const top10      = allItems.slice(0, 10)
    const shownIds   = new Set(top10.map(i => i.id))
    const futureHiddenCount = futureItems.filter(i => !shownIds.has(i.id)).length

    return { items: top10, futureHiddenCount }
  }, [saidasFixas, saidasVariaveis, incomeSources, entradasAll])

  const upcoming = result.items
  const futureHiddenCount = result.futureHiddenCount

  // Status counts for mobile header badges
  const overdueCount  = upcoming.filter(i => i.days < 0 && (i.type === 'despesa' || i.type === 'entrada-pending')).length
  const pendingCount  = upcoming.filter(i => i.days >= 0 && (i.type === 'despesa' || i.type === 'entrada-pending')).length

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
      onClick={() => {
        if (item.type === 'entrada') onEntradaClick(item.name, item.amount)
        else if (item.type === 'entrada-pending') onEntradaPendingClick(item.id)
        else onDespesaClick(item.id)
      }}
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
          : item.type === 'entrada-pending'
          ? item.days < 0 ? 'rgba(245,158,11,0.10)' : 'rgba(16,185,129,0.08)'
          : item.days < 0 ? 'rgba(239,68,68,0.12)'
          : item.days <= 2 ? 'rgba(245,158,11,0.10)'
          : 'rgba(148,163,184,0.08)',
      }}>
        {item.type === 'entrada'
          ? <ArrowUpRight size={14} color="var(--color-success)" />
          : item.type === 'entrada-pending'
          ? <Clock size={14}
              color={item.days < 0 ? 'var(--color-warning)' : 'var(--color-success)'}
              style={{ opacity: 0.75 }}
            />
          : <AlertCircle size={14} color={
              item.days < 0 ? 'var(--color-danger)'
              : item.days <= 2 ? 'var(--color-warning)'
              : 'var(--color-text-tertiary)'
            } />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.name}</p>
        <p style={{ fontSize: 12, color: item.type === 'entrada-pending' && item.days < 0 ? 'var(--color-warning)' : 'var(--color-text-secondary)', margin: 0 }}>
          {item.type === 'entrada-pending'
            ? item.days < 0 ? 'Não recebido — ' : 'Recebimento esperado — '
            : ''}
          {item.days === 0 ? 'Hoje' : 
           item.days === 1 ? 'Amanhã' : 
           item.days < 0 ? `Atrasado há ${Math.abs(item.days)}d` : 
           `Em ${item.days} dias`}
          {'paymentMethod' in item && item.paymentMethod
            ? ` · ${{ pix: 'Pix', debit: 'Débito', credit: 'Crédito', cash: 'Dinheiro', auto_debit: 'Déb. Auto', boleto: 'Boleto' }[item.paymentMethod as string] ?? item.paymentMethod}`
            : ''}
        </p>
      </div>
      <span style={{
        fontSize: 14, fontWeight: 700, flexShrink: 0,
        color: (item.type === 'entrada' || item.type === 'entrada-pending')
          ? item.type === 'entrada-pending' && item.days < 0
            ? 'var(--color-warning)'
            : 'var(--color-success)'
          : 'var(--color-text-primary)',
        opacity: item.type === 'entrada-pending' && item.days >= 0 ? 0.65 : 1,
      }}>
        {(item.type === 'entrada' || item.type === 'entrada-pending') ? '+' : '−'}{formatCurrency(item.amount)}
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
          <p className="section-label" style={{ marginBottom: 0, flex: 1 }}>O que vem por aí</p>
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
              Tudo em dia por aqui.
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
            {futureHiddenCount > 0 && (
              <a
                href="/relatorios"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderTop: '1px solid var(--color-border)',
                  textDecoration: 'none',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'background 150ms ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              >
                <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                  + {futureHiddenCount} agendado{futureHiddenCount === 1 ? '' : 's'} em meses futuros
                </span>
                <span style={{ fontSize: 11, color: 'var(--color-accent-blue-light)', fontWeight: 500 }}>Ver no Fluxo →</span>
              </a>
            )}
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
        O que vem por aí
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
    <div style={{ marginTop: 4 }}>
      {mobileHeader}
      {!collapsed && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '28px 16px', borderRadius: 'var(--radius-card)',
          background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
          marginTop: 8,
        }}>
          <Calendar size={22} color="var(--color-text-tertiary)" strokeWidth={1.5} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0, textAlign: 'center' }}>Tudo em dia por aqui.</p>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ marginTop: 4 }}>
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
              {futureHiddenCount > 0 && (
                <a
                  href="/relatorios"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderTop: '1px solid var(--color-border)',
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                    + {futureHiddenCount} agendado{futureHiddenCount === 1 ? '' : 's'} em meses futuros
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-accent-blue-light)', fontWeight: 500 }}>Ver no Fluxo →</span>
                </a>
              )}
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
  const incomeSources = useAppStore(useShallow(s => s.incomeSources.filter(src => src.userId === (s.currentUser?.id ?? ''))))
  const mask = '•••'

  // Taglines filosóficos por divisão (empty state)
  const DORMANT_TAG: Record<string, string> = {
    'cx-essencial':  'O que sustenta sua rotina.',
    'cx-objetivos':  'O que você quer construir.',
    'cx-reserva':    'Seu futuro com mais tranquilidade.',
    'cx-dizimo':     'Generosidade como hábito.',
    'cx-educacao':   'O fermento da vida financeira.',
  }

  const isDormant = incomeSources.length === 0

  // Helper pct usado
  const calcPct = (cx: typeof divisoes[0]) => {
    const totalIn  = cx.movements.filter(m => m.type === 'income').reduce((s, m) => s + m.amount, 0)
    const totalOut = cx.movements.filter(m => m.type === 'expense').reduce((s, m) => s + Math.abs(m.amount), 0)
    return totalIn > 0 ? Math.min(100, (totalOut / totalIn) * 100) : 0
  }

  // Se divisões ainda não foram criadas (rarissimo), mostra placeholder mínimo
  if (divisoes.length === 0) return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 16px', borderRadius: 'var(--radius-card)',
      background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
    }}>
      <Wallet size={24} color="var(--color-text-tertiary)" strokeWidth={1.5} style={{ marginBottom: 10 }} />
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>A estrutura está sendo preparada.</p>
      <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0, textAlign: 'center', maxWidth: 240 }}>
        Isso leva apenas um instante.
      </p>
    </div>
  )

  const essencial = divisoes.find(cx => cx.id === 'cx-essencial')
  const others    = divisoes.filter(cx => cx.id !== 'cx-essencial')

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p className="section-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wallet size={13} />
          Divisões
          {isDormant && (
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
              background: 'rgba(59,130,246,0.1)', color: 'rgba(59,130,246,0.6)',
              padding: '1px 7px', borderRadius: 6, marginLeft: 4,
            }}>aguardando</span>
          )}
        </p>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 12,
        opacity: isDormant ? 0.65 : 1,
        transition: 'opacity 0.8s ease',
        filter: isDormant ? 'saturate(0.55)' : 'saturate(1)',
      }}>

        {/* ── Featured: Essencial (55%) ── */}
        {essencial && (() => {
          const { Icon, color } = getDivisaoIcon(essencial.id)
          const pct    = calcPct(essencial)
          const totalIn = essencial.movements.filter(m => m.type === 'income').reduce((s, m) => s + m.amount, 0)
          return (
            <button
              onClick={() => navigate(`/relatorios/${essencial.id}`)}
              className="card card-interactive"
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                textAlign: 'left', cursor: 'pointer', width: '100%',
                border: 'none', fontFamily: 'var(--font-sans)',
                background: isDormant
                  ? 'rgba(255,255,255,0.03)'
                  : 'var(--color-bg-secondary)',
                borderWidth: 1, borderStyle: 'solid',
                borderColor: isDormant ? 'rgba(255,255,255,0.06)' : 'var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: 16,
                boxShadow: isDormant ? 'none' : undefined,
                transition: 'all 0.6s ease',
              }}
            >
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${color}${isDormant ? '0A' : '15'}`,
                transition: 'background 0.6s ease',
              }}>
                <Icon size={30} style={{ color: isDormant ? `${color}70` : color }} />
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

                {isDormant ? (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '0 0 8px', fontStyle: 'italic', lineHeight: 1.4 }}>
                    {DORMANT_TAG['cx-essencial']}
                  </p>
                ) : (
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
                )}

                {/* Barra — vazia no dormant, animada quando ativo */}
                <div style={{
                  height: 4, borderRadius: 99,
                  background: isDormant ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isDormant ? '0%' : `${pct}%` }}
                    transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
                    style={{
                      height: '100%', borderRadius: 99,
                      background: `linear-gradient(90deg, ${color}80, ${color})`,
                      boxShadow: isDormant ? 'none' : `0 0 8px ${color}60`,
                    }}
                  />
                </div>
              </div>
            </button>
          )
        })()}

        {/* ── Grid 2x2 / 4x1 (demais divisões) ── */}
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
            const pct    = calcPct(cx)
            const totalIn = cx.movements.filter(m => m.type === 'income').reduce((s, m) => s + m.amount, 0)

            return (
              <button
                key={cx.id}
                onClick={() => navigate(`/relatorios/${cx.id}`)}
                className="card card-interactive home-divisoes-grid-item"
                style={{
                  textAlign: 'left', cursor: 'pointer',
                  border: 'none', fontFamily: 'var(--font-sans)',
                  background: isDormant ? 'rgba(255,255,255,0.025)' : 'var(--color-bg-secondary)',
                  borderWidth: 1, borderStyle: 'solid',
                  borderColor: isDormant ? 'rgba(255,255,255,0.05)' : 'var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                  padding: 14,
                  transition: 'all 0.6s ease',
                }}
              >
                {/* Ícone */}
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${color}${isDormant ? '08' : '15'}`, marginBottom: 10,
                  transition: 'background 0.6s ease',
                }}>
                  <Icon size={24} style={{ color: isDormant ? `${color}60` : color }} />
                </div>

                {/* Nome + % alocação */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{cx.name}</p>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: isDormant ? `${color}60` : color, flexShrink: 0,
                    background: `${color}${isDormant ? '08' : '15'}`, padding: '1px 5px', borderRadius: 6,
                  }}>{cx.percentage}%</span>
                </div>

                {/* Valor ou tagline dormant */}
                {isDormant ? (
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '4px 0 8px', fontStyle: 'italic', lineHeight: 1.4 }}>
                    {DORMANT_TAG[cx.id] ?? 'Aguardando.'}
                  </p>
                ) : (
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
                )}

                {/* Barra */}
                <div style={{
                  height: 4, borderRadius: 99,
                  background: isDormant ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isDormant ? '0%' : `${pct}%` }}
                    transition={{ duration: 1.1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
                    style={{
                      height: '100%', borderRadius: 99,
                      background: `linear-gradient(90deg, ${color}80, ${color})`,
                      boxShadow: isDormant ? 'none' : `0 0 6px ${color}50`,
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Progressive Onboarding Banner ──────────────────────────────────────────

const CHIP_SUGGESTIONS = ['Aluguel', 'Mercado', 'Internet', 'Transporte', 'Streaming']

const OBJ_SUGGESTIONS = [
  { label: 'Viagem',        Icon: Plane,    color: '#8B5CF6' },
  { label: 'Reserva',       Icon: Shield,   color: '#10B981' },
  { label: 'Casa',          Icon: HomeIcon, color: '#3B82F6' },
  { label: 'Casamento',     Icon: Heart,    color: '#EC4899' },
  { label: 'Investimentos', Icon: BarChart2,color: '#F59E0B' },
  { label: '+ Criar',       Icon: Plus,     color: '#64748B' },
]

const cardMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] },
}

function ProgressiveOnboardingBanner({ onLancar }: { onLancar: () => void }) {
  const [, navigate] = useLocation()

  const incomeSources = useAppStore(useShallow(s => s.incomeSources.filter(src => src.userId === (s.currentUser?.id ?? ''))))
  const saidasFixas   = useAppStore(useShallow(selectCurrentSaidasFixas))
  const objetivos     = useAppStore(useShallow(s => s.objetivos))
  const partner       = useAppStore(s => s.partner)
  const currentUser   = useAppStore(s => s.currentUser)

  const [victoryDismissed, setVictoryDismissed] = React.useState(
    () => !!localStorage.getItem('somus:victory-shown')
  )
  const [hintEntrada, setHintEntrada] = React.useState(
    () => !!localStorage.getItem('somus:hint-entrada')
  )
  const [hintObjetivo, setHintObjetivo] = React.useState(
    () => !!localStorage.getItem('somus:hint-objetivo')
  )
  const [partnerDismissed, setPartnerDismissed] = React.useState(
    () => !!localStorage.getItem('somus:partner-later')
  )
  const [copied, setCopied] = React.useState(false)

  // Auto-dismiss victory
  React.useEffect(() => {
    if (incomeSources.length > 0 && !victoryDismissed) {
      const t = setTimeout(() => {
        localStorage.setItem('somus:victory-shown', '1')
        setVictoryDismissed(true)
      }, 6000)
      return () => clearTimeout(t)
    }
  }, [incomeSources.length, victoryDismissed])

  // Auto-dismiss hint-entrada
  React.useEffect(() => {
    if (incomeSources.length > 0 && !hintEntrada) {
      const t = setTimeout(() => {
        localStorage.setItem('somus:hint-entrada', '1')
        setHintEntrada(true)
      }, 5000)
      return () => clearTimeout(t)
    }
  }, [incomeSources.length, hintEntrada])

  function handleShare() {
    const code = currentUser?.partnerCode ?? ''
    const text = `Vem construir comigo no Somus!\nhttps://somus.vercel.app/convite/${code}`
    if (navigator.share) { navigator.share({ title: 'Somus', text }).catch(() => {}) }
    else { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }
  }

  const glassCard = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 16, padding: '18px 16px',
    marginBottom: 16,
    ...extra,
  })

  // Card 1: sem renda
  if (incomeSources.length === 0) return (
    <AnimatePresence>
      <motion.div key="card1" {...cardMotion} style={glassCard({ border: '1px solid rgba(59,130,246,0.2)' })}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={20} color="var(--color-success)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>Vamos começar pela sua base financeira?</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 14px', lineHeight: 1.5 }}>Adicionar sua primeira entrada ajuda a Somus a organizar tudo melhor.</p>
            <button onClick={onLancar} style={{ background: 'var(--color-success)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              Adicionar entrada
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )

  // Card 5: Primeira Vitória (logo após 1ª entrada)
  if (!victoryDismissed) return (
    <AnimatePresence>
      <motion.div key="victory" {...cardMotion} style={glassCard({ border: '1px solid rgba(16,185,129,0.3)' })}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Sparkles size={20} color="var(--color-success)" style={{ flexShrink: 0 }} />
          <p style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>
            Sua estrutura financeira começou a ganhar forma ✨
          </p>
          <button onClick={() => { localStorage.setItem('somus:victory-shown','1'); setVictoryDismissed(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 4, flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )

  // Card 6a: Hint após 1ª entrada
  if (incomeSources.length === 1 && !hintEntrada) return (
    <AnimatePresence>
      <motion.div key="hint-entrada" {...cardMotion} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 12 }}>
        <Info size={14} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
        <p style={{ flex: 1, fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>Agora a Somus já consegue visualizar sua estrutura mensal.</p>
        <button onClick={() => { localStorage.setItem('somus:hint-entrada','1'); setHintEntrada(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 4 }}>
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  )

  // Card 2: sem custos fixos
  if (saidasFixas.length === 0) return (
    <AnimatePresence>
      <motion.div key="card2" {...cardMotion} style={glassCard()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Receipt size={20} color="var(--color-danger)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>Agora vamos entender sua rotina.</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>Adicione os custos que fazem parte do seu mês.</p>
            {/* Chips */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 12 }}>
              {CHIP_SUGGESTIONS.map(chip => (
                <button key={chip} onClick={() => navigate(`/fluxo?prefill=${encodeURIComponent(chip)}`)} style={{ flexShrink: 0, background: 'rgba(239,68,68,0.08)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap' }}>
                  {chip}
                </button>
              ))}
            </div>
            <button onClick={() => navigate('/fluxo')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-sans)', padding: 0, textDecoration: 'underline' }}>
              Ver todos os custos
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )

  // Card 3: sem objetivos
  if (objetivos.length === 0) return (
    <AnimatePresence>
      <motion.div key="card3" {...cardMotion} style={glassCard()}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 14px' }}>O que você gostaria de construir?</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {OBJ_SUGGESTIONS.map(({ label, Icon, color }) => (
            <button key={label} onClick={() => navigate('/casal')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px', borderRadius: 12, background: `${color}0D`, border: `1px solid ${color}25`, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', transition: 'all 200ms ease' }}>
              <Icon size={18} color={color} />
              {label}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )

  // Card 6b: Hint após 1º objetivo
  if (objetivos.length === 1 && !hintObjetivo) return (
    <AnimatePresence>
      <motion.div key="hint-objetivo" {...cardMotion} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 12 }}>
        <Info size={14} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
        <p style={{ flex: 1, fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>Que tal criar uma divisão para acelerar esse objetivo?</p>
        <button onClick={() => navigate('/relatorios')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-accent-primary)', fontFamily: 'var(--font-sans)', padding: '0 8px', whiteSpace: 'nowrap' }}>Ver divisões</button>
        <button onClick={() => { localStorage.setItem('somus:hint-objetivo','1'); setHintObjetivo(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 4 }}>
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  )

  // Card 4: sem parceiro
  if (!partner && !partnerDismissed) return (
    <AnimatePresence>
      <motion.div key="card4" {...cardMotion} style={glassCard({ background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(139,92,246,0.05) 100%)', border: '1px solid rgba(139,92,246,0.15)', position: 'relative', overflow: 'hidden' })}>
        {/* Ambient SVG lines */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 300 100" preserveAspectRatio="none">
          <path d="M 0 50 Q 150 10 300 50" stroke="rgba(139,92,246,0.08)" strokeWidth="1" fill="none" />
          <path d="M 0 60 Q 150 20 300 60" stroke="rgba(59,130,246,0.06)" strokeWidth="1" fill="none" />
        </svg>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative' }}>
          {/* Dual glow icons */}
          <div style={{ position: 'relative', width: 44, height: 40, flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: 2, left: 0, width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)' }} />
            <div style={{ position: 'absolute', top: 2, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />
            <Users size={16} color="rgba(139,92,246,0.8)" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>Agora imagine compartilhar tudo isso com alguém.</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 14px', lineHeight: 1.5 }}>Cada pessoa mantém sua individualidade, mas vocês podem construir juntos.</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                <Share2 size={14} />{copied ? 'Copiado!' : 'Convidar parceiro(a)'}
              </button>
              <button onClick={() => { localStorage.setItem('somus:partner-later', '1'); setPartnerDismissed(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-sans)', padding: 0 }}>Talvez depois</button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )

  return null
}

// ─── Home Page ────────────────────────────────────────────────────────────

export default function Home() {
  const [lancarOpen, setLancarOpen] = useState(false)
  const [historicoOpen, setHistoricoOpen] = useState(false)
  const [prefill, setPrefill] = useState<{ sourceName: string; amount: number } | undefined>()
  const [confirmPayId, setConfirmPayId] = useState<string | null>(null)
  const [confirmPayEntradaId, setConfirmPayEntradaId] = useState<string | null>(null)
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

  const HERO_BG = '#112A5F'

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
          {/* Desktop Radial Glow */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: 500,
            background: 'radial-gradient(circle at 50% -50px, var(--color-lucas) 0%, transparent 70%)',
            opacity: 0.12,
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {/* Desktop: 2-column dashboard header */}
          <div style={{ paddingTop: 32, paddingBottom: 4, position: 'relative', zIndex: 1 }}>
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
            position: 'relative', zIndex: 1,
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
              onEntradaPendingClick={setConfirmPayEntradaId}
              isDesktop
            />
          </div>
        </>
      )}

      <div className='somus-stagger' style={{ padding: isMobile ? '0 16px' : 0, display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Próximos dias — mobile only */}
      {isMobile && (
        <ProximosDias
          onEntradaClick={handleEntradaClick}
          onDespesaClick={handleDespesaClick}
          onEntradaPendingClick={setConfirmPayEntradaId}
        />
      )}

      {/* Progressive Onboarding */}
      <div style={{ marginTop: 16 }}>
        <ProgressiveOnboardingBanner onLancar={() => setLancarOpen(true)} />
      </div>

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
      <ConfirmPaymentModal
        open={!!confirmPayEntradaId}
        onClose={() => setConfirmPayEntradaId(null)}
        title="Confirmar recebimento"
        dateLabel="Quando você recebeu?"
        costName={confirmPayEntradaId
          ? (useAppStore.getState().entradas.find(e => e.id === confirmPayEntradaId)?.sourceName ?? '')
          : ''
        }
        onConfirm={(date) => {
          if (confirmPayEntradaId) useAppStore.getState().confirmEntrada(confirmPayEntradaId, date)
          setConfirmPayEntradaId(null)
        }}
      />
    </div>
  )
}
