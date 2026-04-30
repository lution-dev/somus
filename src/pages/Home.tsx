import { useState, useMemo } from 'react'
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
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
      padding: 20,
      marginTop: 16,
    }}>
      {/* Label */}
      <p className="section-label" style={{ marginBottom: 4 }}>Saldo disponível</p>

      {/* Valor principal */}
      <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: 12 }}>
        {formatCurrency(total)}
      </p>

      {/* Indicadores */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={13} color="var(--color-success)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(totalIncome)} recebido</span>
        </div>
        {remaining > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={13} color="var(--color-warning)" />
            <span style={{ fontSize: 12, color: 'var(--color-warning)' }}>~{formatCurrency(remaining)} a receber</span>
          </div>
        )}
      </div>

      {/* Barra de progresso da renda */}
      <ProgressBar value={incomeProgress} size="sm" showLabel label="Renda do mês" />
    </div>
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
    <div style={{ marginTop: 20 }}>
      <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Calendar size={13} />
        Próximos dias
      </p>

      <div style={{
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
      }}>
        {upcoming.map((item, i) => (
          <div
            key={item.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              borderBottom: i < upcoming.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: item.type === 'entrada'
                ? 'rgba(16,185,129,0.12)'
                : item.days <= 2 ? 'rgba(239,68,68,0.12)' : 'rgba(59,130,246,0.12)',
            }}>
              {item.type === 'entrada'
                ? <ArrowUpRight size={14} color="var(--color-success)" />
                : <ArrowDownRight size={14} color={item.days <= 2 ? 'var(--color-danger)' : 'var(--color-accent-primary)'} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{item.name}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
                {item.days === 0 ? 'Hoje' : item.days === 1 ? 'Amanhã' : `Em ${item.days} dias`}
              </p>
            </div>
            <span style={{
              fontSize: 14, fontWeight: 700, flexShrink: 0,
              color: item.type === 'entrada' ? 'var(--color-success)' : 'var(--color-text-primary)',
            }}>
              {item.type === 'entrada' ? '+' : '−'}{formatCurrency(item.amount)}
            </span>
          </div>
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
    <div style={{ marginTop: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p className="section-label" style={{ marginBottom: 0 }}>Caixinhas</p>
        <button
          onClick={() => navigate('/caixinhas')}
          style={{
            display: 'flex', alignItems: 'center', gap: 2,
            fontSize: 12, fontWeight: 600, color: 'var(--color-accent-primary)',
            cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'var(--font-sans)',
          }}
        >
          Ver todas <ChevronRight size={13} />
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 10,
      }}>
        <style>{`
          @media (min-width: 1024px) {
            .home-caixinhas-grid { grid-template-columns: repeat(3, 1fr) !important; }
          }
        `}</style>
        {caixinhas.slice(0, 6).map((cx) => {
          const { Icon, color } = getCaixinhaIcon(cx.id)
          const expectedBal     = (cx.percentage / 100) * expectedIncome
          const pct             = expectedBal > 0 ? Math.min(100, (cx.balance / expectedBal) * 100) : 100

          return (
            <button
              key={cx.id}
              onClick={() => navigate(`/caixinhas/${cx.id}`)}
              className="card card-interactive home-caixinhas-grid-item"
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

              {/* Nome */}
              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cx.name}</p>

              {/* Valor */}
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
                {formatCurrency(cx.balance)}
              </p>

              {/* Barra */}
              <ProgressBar value={pct} size="sm" />
            </button>
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
    <div style={{ minHeight: '100%', paddingBottom: 16, paddingTop: 32 }}>
      {/* Saudação + toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, paddingBottom: 4 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500, margin: 0 }}>{greeting}</p>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{firstName}</h1>
        </div>
        <ContextToggle value={ctx} onChange={setCtx} style={{ flexShrink: 0 }} />
      </div>

      {/* Balance card */}
      <BalanceCard
        total={summary.availableBalance}
        totalIncome={summary.totalIncome}
        expectedIncome={expectedIncome}
        incomeProgress={summary.incomeProgress}
      />

      {/* CTA */}
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => setLancarOpen(true)}
          className="btn-primary"
        >
          <Plus size={18} strokeWidth={2.5} />
          Lançar entrada
        </button>
      </div>

      {/* Próximos dias */}
      <ProximosDias />

      {/* Caixinhas */}
      <CaixinhasSection />

      <LancarEntradaModal open={lancarOpen} onClose={() => setLancarOpen(false)} />
    </div>
  )
}
