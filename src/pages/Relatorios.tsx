import { useState, useMemo } from 'react'
import { useAppStore, selectCurrentDivisoes } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { getDivisaoIcon } from '../lib/icons'
import { ProgressBar, PageHeader } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import {
  ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownRight,
  TrendingUp, TrendingDown,
  Calendar, AlertTriangle, CheckCircle2,
} from 'lucide-react'

// ── Month helpers ─────────────────────────────────────────────────────────────

function currentYM(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const s = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ── Per-month aggregation ─────────────────────────────────────────────────────

type Divisoes = ReturnType<typeof selectCurrentDivisoes>

function aggregateMonth(divisoes: Divisoes, month: string) {
  return divisoes.map(cx => {
    const mvs    = cx.movements.filter(mv => mv.date.startsWith(month))
    const totalIn  = mvs.filter(mv => mv.type === 'income').reduce((s, mv) => s + mv.amount, 0)
    const totalOut = mvs.filter(mv => mv.type === 'expense').reduce((s, mv) => s + mv.amount, 0)
    return { cx, totalIn, totalOut }
  })
}

// ── Card style constant ───────────────────────────────────────────────────────

const CARD: React.CSSProperties = {
  background: 'var(--color-bg-secondary)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-card)',
  padding: 20,
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Relatorios() {
  const allDivisoes = useAppStore(useShallow(s => s.divisoes))
  const currentUser  = useAppStore(s => s.currentUser)
  const partner      = useAppStore(s => s.partner)
  const isMobile     = useIsMobile()
  const TODAY        = currentYM()
  const [month, setMonth]       = useState(TODAY)
  const [reportCtx, setReportCtx] = useState<'me' | 'partner' | 'couple'>('couple')

  const myName      = currentUser?.name?.split(' ')[0] ?? 'Meu'
  const partnerName = partner?.name?.split(' ')[0] ?? 'Parceiro(a)'

  const ctxOptions: Array<{ key: 'me' | 'partner' | 'couple'; label: string }> = [
    { key: 'me',      label: myName },
    ...(partner ? [{ key: 'partner' as const, label: partnerName }] : []),
    { key: 'couple',  label: 'Casal' },
  ]

  const ctxLabel = reportCtx === 'me' ? myName : reportCtx === 'partner' ? partnerName : 'Casal'

  const divisoes = useMemo(() => {
    if (reportCtx === 'me')      return allDivisoes.filter(cx => cx.userId === currentUser?.id)
    if (reportCtx === 'partner') return allDivisoes.filter(cx => cx.userId === partner?.id)
    return allDivisoes
  }, [allDivisoes, reportCtx, currentUser, partner])

  const data     = aggregateMonth(divisoes, month)
  const dataPrev = aggregateMonth(divisoes, shiftMonth(month, -1))

  const globalIn   = data.reduce((s, d) => s + d.totalIn, 0)
  const globalOut  = data.reduce((s, d) => s + d.totalOut, 0)
  const prevIn     = dataPrev.reduce((s, d) => s + d.totalIn, 0)
  const prevOut    = dataPrev.reduce((s, d) => s + d.totalOut, 0)
  const hasData    = globalIn > 0 || globalOut > 0

  const usagePct   = globalIn > 0 ? Math.min(100, (globalOut / globalIn) * 100) : 0

  const bySpending = [...data].filter(d => d.totalOut > 0).sort((a, b) => b.totalOut - a.totalOut)
  const maxOut     = bySpending[0]?.totalOut ?? 0

  const inDelta    = globalIn  - prevIn
  const outDelta   = globalOut - prevOut

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      {isMobile ? (
        <>
          <PageHeader title="Relatórios" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '8px 16px 4px' }}>
            <MonthNav month={month} today={TODAY} onChange={setMonth} showLabel />
          </div>
          {/* Segmented control mobile */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 16px 12px' }}>
            <SegmentedCtrl options={ctxOptions} value={reportCtx} onChange={(v) => setReportCtx(v as 'me' | 'partner' | 'couple')} />
          </div>
        </>
      ) : (
        /* Desktop: título + segmented + monthnav em 1 linha */
        <div style={{ paddingTop: 32, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flexShrink: 0 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Relatórios</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>{monthLabel(month)}</p>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.12)', color: 'var(--color-accent-primary)', border: '1px solid rgba(59,130,246,0.2)' }}>
                {ctxLabel}
              </span>
            </div>
          </div>
          <SegmentedCtrl options={ctxOptions} value={reportCtx} onChange={(v) => setReportCtx(v as 'me' | 'partner' | 'couple')} />
          <MonthNav month={month} today={TODAY} onChange={setMonth} />
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!hasData ? (
        <div style={{ ...CARD, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 20px', margin: isMobile ? '0 16px' : 0 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Calendar size={24} color="var(--color-accent-primary)" strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>Nenhum lançamento</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5, maxWidth: 280 }}>
            Nenhum movimento de <strong style={{ color: 'var(--color-text-secondary)' }}>{ctxLabel}</strong> em {monthLabel(month).toLowerCase()}.
          </p>
        </div>

      ) : (
        <div style={{ padding: isMobile ? '0 16px' : 0, maxWidth: 1200, margin: '0 auto' }}>

          {/* ── KPI Strip — 4 cards (desktop only inline, mobile 2x2) ─────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? 10 : 14,
            marginBottom: isMobile ? 16 : 20,
          }}>
            <KpiCard
              label="Total entrou"
              value={formatCurrency(globalIn)}
              delta={inDelta}
              positiveIsGood
              accentColor="var(--color-success)"
              Icon={ArrowUpRight}
            />
            <KpiCard
              label="Total saiu"
              value={formatCurrency(globalOut)}
              delta={outDelta}
              positiveIsGood={false}
              accentColor="var(--color-danger)"
              Icon={ArrowDownRight}
            />
            <KpiCard
              label="Saldo do mês"
              value={formatCurrency(globalIn - globalOut)}
              delta={inDelta - outDelta}
              positiveIsGood
              accentColor={globalIn - globalOut >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}
              Icon={globalIn - globalOut >= 0 ? TrendingUp : TrendingDown}
            />
            <KpiCard
              label="Utilizado"
              value={`${Math.round(usagePct)}%`}
              delta={null}
              positiveIsGood={false}
              accentColor={usagePct >= 100 ? 'var(--color-danger)' : usagePct >= 80 ? 'var(--color-warning)' : 'var(--color-accent-primary)'}
              Icon={usagePct >= 80 ? AlertTriangle : CheckCircle2}
              progressPct={usagePct}
            />
          </div>

          {/* ── Bento 2 colunas (mobile: 1 col) ────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 12 : 20,
          }}>

            {/* ── Gastos por divisão ────────────────────────────────────────── */}
            <div style={CARD}>
              <p className="section-label" style={{ marginBottom: 16 }}>Gastos por divisão</p>

              {bySpending.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0 }}>Nenhum gasto registrado este mês.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {bySpending.map(({ cx, totalOut }) => {
                    const { Icon, color } = getDivisaoIcon(cx.id)
                    const barPct = maxOut > 0 ? (totalOut / maxOut) * 100 : 0
                    return (
                      <div key={cx.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}15` }}>
                            <Icon size={14} style={{ color }} />
                          </div>
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{cx.name}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{formatCurrency(totalOut)}</span>
                          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', minWidth: 36, textAlign: 'right' }}>
                            {globalOut > 0 ? Math.round((totalOut / globalOut) * 100) : 0}%
                          </span>
                        </div>
                        <ProgressBar value={barPct} size="sm" />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Distribuição real vs. esperada ────────────────────────────── */}
            <div style={CARD}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <p className="section-label" style={{ margin: 0 }}>Distribuição real vs. esperada</p>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>% dos gastos totais</span>
              </div>

              {globalOut === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0 }}>Nenhum gasto registrado este mês.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {data
                    .filter(d => d.totalOut > 0 || d.cx.percentage > 0)
                    .sort((a, b) => {
                      const deltaA = globalOut > 0 ? (a.totalOut / globalOut) * 100 - a.cx.percentage : 0
                      const deltaB = globalOut > 0 ? (b.totalOut / globalOut) * 100 - b.cx.percentage : 0
                      return Math.abs(deltaB) - Math.abs(deltaA)
                    })
                    .map(({ cx, totalOut }) => {
                      const { Icon, color } = getDivisaoIcon(cx.id)
                      const realPct     = globalOut > 0 ? (totalOut / globalOut) * 100 : 0
                      const expectedPct = cx.percentage
                      const delta       = realPct - expectedPct
                      const overshot    = delta > 5
                      const undershot   = delta < -5
                      return (
                        <div key={cx.id}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}15` }}>
                              <Icon size={14} style={{ color }} />
                            </div>
                            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{cx.name}</span>
                            {overshot && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--color-danger)' }}>
                                <AlertTriangle size={11} />
                                <span style={{ fontSize: 11, fontWeight: 600 }}>+{Math.round(delta)}pp</span>
                              </div>
                            )}
                            {undershot && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--color-success)' }}>
                                <CheckCircle2 size={11} />
                                <span style={{ fontSize: 11, fontWeight: 600 }}>{Math.round(delta)}pp</span>
                              </div>
                            )}
                            <span style={{ fontSize: 12, color: overshot ? 'var(--color-danger)' : undershot ? 'var(--color-success)' : 'var(--color-text-secondary)', fontWeight: 600, minWidth: 70, textAlign: 'right' }}>
                              {Math.round(realPct)}% <span style={{ fontWeight: 400, color: 'var(--color-text-tertiary)' }}>/ {expectedPct}%</span>
                            </span>
                          </div>
                          <div style={{ position: 'relative', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                            <div style={{ position: 'absolute', left: `${Math.min(expectedPct, 100)}%`, top: -2, bottom: -2, width: 2, borderRadius: 1, background: 'var(--color-text-tertiary)', opacity: 0.5, transform: 'translateX(-1px)' }} />
                            {totalOut > 0 && (
                              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(realPct, expectedPct, 100)}%`, background: color, borderRadius: 3, transition: 'width 500ms ease' }} />
                            )}
                            {overshot && (
                              <div style={{ position: 'absolute', left: `${Math.min(expectedPct, 100)}%`, top: 0, bottom: 0, width: `${Math.min(realPct - expectedPct, 100 - expectedPct)}%`, background: 'var(--color-danger)', borderRadius: '0 3px 3px 0', transition: 'width 500ms ease' }} />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 2, height: 12, background: 'var(--color-text-tertiary)', opacity: 0.5, borderRadius: 1 }} />
                      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Esperado pelo método</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 12, height: 4, background: 'var(--color-danger)', borderRadius: 2 }} />
                      <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Acima do esperado</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SegmentedCtrl({
  options, value, onChange,
}: { options: { key: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'inline-flex', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 999, padding: 3, gap: 2 }}>
      {options.map(({ key, label }) => {
        const isActive = value === key
        return (
          <button key={key} onClick={() => onChange(key)} style={{ padding: '6px 16px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: isActive ? 600 : 500, fontFamily: 'var(--font-sans)', background: isActive ? 'var(--color-accent-primary)' : 'transparent', color: isActive ? 'white' : 'var(--color-text-secondary)', transition: 'background 150ms ease, color 150ms ease', whiteSpace: 'nowrap' }}>
            {label}
          </button>
        )
      })}
    </div>
  )
}

function MonthNav({ month, today, onChange, showLabel }: { month: string; today: string; onChange: (m: string) => void; showLabel?: boolean }) {
  const isCurrentMonth = month === today
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: showLabel ? 8 : 4 }}>
      <button
        onClick={() => onChange(shiftMonth(month, -1))}
        style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <ChevronLeft size={16} />
      </button>
      {showLabel && (
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', minWidth: 110, textAlign: 'center' }}>
          {monthLabel(month)}
        </span>
      )}
      <button
        onClick={() => !isCurrentMonth && onChange(shiftMonth(month, 1))}
        style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: isCurrentMonth ? 'transparent' : 'rgba(255,255,255,0.06)', cursor: isCurrentMonth ? 'default' : 'pointer', color: isCurrentMonth ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-disabled={isCurrentMonth}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}


type KpiCardProps = {
  label: string
  value: string
  delta: number | null
  positiveIsGood: boolean
  accentColor: string
  Icon: React.ElementType
  progressPct?: number
}

function KpiCard({ label, value, delta, positiveIsGood, accentColor, Icon, progressPct }: KpiCardProps) {
  const deltaGood = delta === null ? true : (positiveIsGood ? delta >= 0 : delta <= 0)
  const deltaColor = delta === null ? 'var(--color-text-tertiary)' : deltaGood ? 'var(--color-success)' : 'var(--color-danger)'
  const DeltaIcon = delta === null ? null : deltaGood ? TrendingUp : TrendingDown
  return (
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: `1px solid var(--color-border)`,
      borderTop: `3px solid ${accentColor}`,
      borderRadius: 'var(--radius-card)',
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <Icon size={14} color={accentColor} />
      </div>
      <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1 }}>{value}</p>
      {progressPct !== undefined && (
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden', marginTop: 10 }}>
          <div style={{ height: '100%', width: `${Math.min(progressPct, 100)}%`, background: accentColor, borderRadius: 9999, transition: 'width 500ms ease' }} />
        </div>
      )}
      {delta !== null && DeltaIcon && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, color: deltaColor }}>
          <DeltaIcon size={12} />
          <span style={{ fontSize: 11, fontWeight: 600 }}>
            {delta > 0 ? '+' : ''}{formatCurrency(Math.abs(delta))} vs mês anterior
          </span>
        </div>
      )}
    </div>
  )
}
