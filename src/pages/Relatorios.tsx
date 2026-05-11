import { useState, useMemo } from 'react'
import { useAppStore, selectCurrentDivisoes } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { getDivisaoIcon } from '../lib/icons'
import { PageHeader } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import {
  ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownRight,
  TrendingUp, TrendingDown,
  Calendar, AlertTriangle, CheckCircle2, Info,
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
    const mvs     = cx.movements.filter(mv => mv.date.startsWith(month))
    const totalIn  = mvs.filter(mv => mv.type === 'income').reduce((s, mv) => s + mv.amount, 0)
    // Saídas: movements com type 'expense' OU amount negativo
    const totalOut = mvs
      .filter(mv => mv.type === 'expense' || mv.amount < 0)
      .reduce((s, mv) => s + Math.abs(mv.amount), 0)
    return { cx, totalIn, totalOut }
  })
}

// -- Monthly history (last 6 months) -----------------------------------------------

function monthLabelShort(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
}

function getMonthlyHistory(divisoes: Divisoes, anchorMonth: string, count = 6) {
  return Array.from({ length: count }, (_, i) => {
    const ym = shiftMonth(anchorMonth, -(count - 1 - i))
    const agg = aggregateMonth(divisoes, ym)
    const totalIn  = agg.reduce((s, d) => s + d.totalIn,  0)
    const totalOut = agg.reduce((s, d) => s + d.totalOut, 0)
    return { ym, label: monthLabelShort(ym), totalIn, totalOut, balance: totalIn - totalOut }
  })
}

// -- Adherence score ----------------------------------------------------------------

function calcAdherenceScore(data: ReturnType<typeof aggregateMonth>, globalIn: number): number {
  if (globalIn === 0) return 0
  const divisoesWithPct = data.filter(d => d.cx.percentage > 0)
  if (divisoesWithPct.length === 0) return 0
  const totalDev = divisoesWithPct.reduce((sum, d) => {
    const realPct = (d.totalIn / globalIn) * 100
    return sum + Math.abs(realPct - d.cx.percentage)
  }, 0)
  const avgDev = totalDev / divisoesWithPct.length
  return Math.max(0, Math.round(100 - avgDev * 2))
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
  const allDivisoes  = useAppStore(useShallow(s => s.divisoes))
  const currentUser  = useAppStore(s => s.currentUser)
  const partner      = useAppStore(s => s.partner)
  const isMobile     = useIsMobile()
  const TODAY        = currentYM()
  const [month, setMonth]         = useState(TODAY)
  const [reportCtx, setReportCtx] = useState<'me' | 'partner' | 'couple'>('couple')
  const headerBg = reportCtx === 'couple' ? '#150D27' : reportCtx === 'partner' ? '#2D0A1A' : '#001442'
  const accentColor = reportCtx === 'couple' ? '#8B5CF6' : reportCtx === 'partner' ? '#EC4899' : '#3B82F6'

  const myName      = currentUser?.name?.split(' ')[0] ?? 'Meu'
  const partnerName = partner?.name?.split(' ')[0] ?? 'Parceiro(a)'

  const ctxOptions: Array<{ key: 'me' | 'partner' | 'couple'; label: string }> = [
    { key: 'me',      label: myName },
    ...(partner ? [{ key: 'partner' as const, label: partnerName }] : []),
    { key: 'couple',  label: 'Casal' },
  ]

  const divisoes = useMemo(() => {
    if (!allDivisoes || allDivisoes.length === 0) return []
    if (reportCtx === 'me')      return allDivisoes.filter(cx => cx.userId === currentUser?.id)
    if (reportCtx === 'partner') return allDivisoes.filter(cx => cx.userId === partner?.id)
    return allDivisoes
  }, [allDivisoes, reportCtx, currentUser, partner])

  const data     = aggregateMonth(divisoes, month)
  const dataPrev = aggregateMonth(divisoes, shiftMonth(month, -1))

  // Total entrou = soma de todas as entradas (income) das divisões
  const globalIn   = data.reduce((s, d) => s + d.totalIn, 0)
  // Total saiu = soma de todas as saídas (expense) das divisões
  const globalOut  = data.reduce((s, d) => s + d.totalOut, 0)
  const prevIn     = dataPrev.reduce((s, d) => s + d.totalIn, 0)
  const prevOut    = dataPrev.reduce((s, d) => s + d.totalOut, 0)
  const hasData    = globalIn > 0 || globalOut > 0

  const usagePct   = globalIn > 0 ? Math.min(100, (globalOut / globalIn) * 100) : 0

  // Gastos por divisão: divisões com saídas OU com saldo positivo (recebeu entradas)
  const byActivity = [...data]
    .filter(d => d.totalIn > 0 || d.totalOut > 0)
    .sort((a, b) => b.totalIn - a.totalIn)
  const maxIn = byActivity[0]?.totalIn ?? 0

  const inDelta    = globalIn  - prevIn
  const outDelta   = globalOut - prevOut

  const monthlyHistory   = useMemo(() => getMonthlyHistory(divisoes, month),  [divisoes, month])
  const adherenceScore   = useMemo(() => calcAdherenceScore(data, globalIn),   [data, globalIn])

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ paddingBottom: isMobile ? 120 : 40 }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      {isMobile ? (
        <>
          <PageHeader
            title="Relatórios"
            bg={headerBg}
            rightAction={
              <MonthNav month={month} today={TODAY} onChange={setMonth} showLabel />
            }
          />
          {/* Toggle abaixo da navbar */}
          <div style={{
            background: `linear-gradient(to bottom, ${headerBg} 0%, transparent 100%)`,
            padding: '0 16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <SegmentedCtrl
              options={ctxOptions}
              value={reportCtx}
              onChange={(v) => setReportCtx(v as 'me' | 'partner' | 'couple')}
            />
          </div>
        </>
      ) : (
        <>
          {/* Desktop Radial Glow */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: 500,
            background: `radial-gradient(circle at 50% -50px, ${headerBg} 0%, transparent 70%)`,
            opacity: 0.12,
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          {/* Desktop: título + segmented + monthnav em 1 linha */}
          <div style={{ paddingTop: 32, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ flexShrink: 0 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Relatórios</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MonthNav month={month} today={TODAY} onChange={setMonth} showLabel />
            <SegmentedCtrl options={ctxOptions} value={reportCtx} onChange={(v) => setReportCtx(v as 'me' | 'partner' | 'couple')} />
          </div>
        </div>
        </>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!hasData ? (
        <div style={{ ...CARD, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 20px', margin: isMobile ? '0 16px' : 0, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(59,130,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Calendar size={24} color="var(--color-accent-primary)" strokeWidth={1.5} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>Nenhum lançamento</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5, maxWidth: 280 }}>
            Nenhum movimento em {monthLabel(month).toLowerCase()}.
          </p>
        </div>

      ) : (
        <div style={{ padding: isMobile ? '0 16px' : 0, maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20, position: 'relative', zIndex: 1 }}>

          {/* ── KPI Strip ───────────────────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? 10 : 14,
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
              accentColor={usagePct >= 100 ? 'var(--color-danger)' : usagePct >= 80 ? 'var(--color-warning)' : accentColor}
              Icon={usagePct >= 80 ? AlertTriangle : CheckCircle2}
              progressPct={usagePct}
            />
          </div>

          {/* -- Score de Aderencia ao Metodo */}
          {hasData && (
            <AdherenceScoreCard score={adherenceScore} accentColor={accentColor} />
          )}

          {/* -- Historico Mensal */}
          <div style={{ ...CARD }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p className='section-label' style={{ margin: 0 }}>Historico Mensal</p>
              <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Ultimos 6 meses</span>
            </div>
            <MonthlyHistoryChart data={monthlyHistory} currentMonth={month} accentColor={accentColor} />
          </div>


          {/* ── Bento 2 colunas (mobile: 1 col) ─────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 12 : 20,
          }}>

            {/* ── Gastos por divisão ──────────────────────────────────────────── */}
            <div style={CARD}>
              <p className="section-label" style={{ marginBottom: 16 }}>Entradas por divisão</p>

              {byActivity.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0 }}>Nenhum movimento registrado este mês.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {byActivity.map(({ cx, totalIn, totalOut }) => {
                    const { Icon, color } = getDivisaoIcon(cx.id)
                    const barPct = maxIn > 0 ? (totalIn / maxIn) * 100 : 0
                    return (
                      <div key={cx.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}15` }}>
                            <Icon size={14} style={{ color }} />
                          </div>
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{cx.name}</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-success)' }}>+{formatCurrency(totalIn)}</div>
                            {totalOut > 0 && (
                              <div style={{ fontSize: 11, color: 'var(--color-danger)' }}>-{formatCurrency(totalOut)}</div>
                            )}
                          </div>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${barPct}%`, background: color, borderRadius: 99, transition: 'width 500ms ease' }} />
                        </div>
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
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>% das entradas</span>
              </div>

              {globalIn === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0 }}>Nenhum movimento registrado este mês.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {data
                    .filter(d => d.totalIn > 0 || d.cx.percentage > 0)
                    .sort((a, b) => {
                      const deltaA = globalIn > 0 ? (a.totalIn / globalIn) * 100 - a.cx.percentage : 0
                      const deltaB = globalIn > 0 ? (b.totalIn / globalIn) * 100 - b.cx.percentage : 0
                      return Math.abs(deltaB) - Math.abs(deltaA)
                    })
                    .map(({ cx, totalIn }) => {
                      const { Icon, color } = getDivisaoIcon(cx.id)
                      const realPct     = globalIn > 0 ? (totalIn / globalIn) * 100 : 0
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
                            {totalIn > 0 && (
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
        const activeBg = key === 'couple'
          ? 'var(--color-accent-couple)'
          : key === 'partner'
          ? 'var(--color-mirian)'
          : 'var(--color-lucas)'
        return (
          <button key={key} onClick={() => onChange(key)} style={{ padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: isActive ? 600 : 500, fontFamily: 'var(--font-sans)', background: isActive ? activeBg : 'transparent', color: isActive ? 'white' : 'var(--color-text-secondary)', transition: 'background 150ms ease, color 150ms ease', whiteSpace: 'nowrap' }}>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <button
        onClick={() => onChange(shiftMonth(month, -1))}
        style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <ChevronLeft size={15} />
      </button>
      {showLabel && (
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', minWidth: 100, textAlign: 'center' }}>
          {monthLabel(month)}
        </span>
      )}
      <button
        onClick={() => !isCurrentMonth && onChange(shiftMonth(month, 1))}
        style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: isCurrentMonth ? 'transparent' : 'rgba(255,255,255,0.06)', cursor: isCurrentMonth ? 'default' : 'pointer', color: isCurrentMonth ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-disabled={isCurrentMonth}
      >
        <ChevronRight size={15} />
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
      borderRadius: 'var(--radius-card)',
      padding: '16px',
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

// -- AdherenceScoreCard -------------------------------------------------------

function AdherenceScoreCard({ score, accentColor }: { score: number; accentColor: string }) {
  const [showInfo, setShowInfo] = useState(false)
  const color = score >= 80 ? 'var(--color-success)' : score >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'
  const label = score >= 80 ? 'Excelente' : score >= 60 ? 'Bom' : score >= 40 ? 'Regular' : 'Precisa melhorar'
  const msg   = score >= 80
    ? 'Voce esta seguindo muito bem o metodo de distribuicao!'
    : score >= 60
    ? 'Quase la! Pequenos ajustes vao melhorar sua aderencia.'
    : 'A distribuicao real esta longe do planejado. Revise seus aportes.'

  const r = 28
  const circumference = 2 * Math.PI * r
  const strokeDash = (score / 100) * circumference

  return (
    <div style={{
      background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)', padding: '16px 18px',
    }}>
      {/* Header row: titulo + info + badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>
          Aderencia ao metodo
        </span>
        <button
          onClick={() => setShowInfo(v => !v)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px',
            color: showInfo ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)',
            display: 'flex', alignItems: 'center', transition: 'color 150ms ease', flexShrink: 0,
          }}
          aria-label="O que e este score?"
        >
          <Info size={13} />
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: `${color}20`, color, whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </div>

      {/* Score row: gauge menor + mensagem ao lado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Gauge compacto */}
        <div style={{ flexShrink: 0, position: 'relative', width: 72, height: 72 }}>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              transform="rotate(-90 36 36)"
              style={{ transition: 'stroke-dasharray 800ms ease' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 1, lineHeight: 1 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color }}>{score}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color, opacity: 0.85 }}>%</span>
            </div>
            
          </div>
        </div>

        {/* Mensagem */}
        <p style={{ flex: 1, fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.55 }}>
          {msg}
        </p>
      </div>

      {/* Info panel */}
      {showInfo && (
        <div style={{
          marginTop: 14,
          padding: '12px 14px',
          background: `rgba(0,0,0,0)`,
          border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 10,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: accentColor, margin: 0 }}>
            O que este score mede?
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Compara a <strong style={{ color: 'var(--color-text-primary)' }}>distribuicao real</strong> das entradas entre suas divisoes com os <strong style={{ color: 'var(--color-text-primary)' }}>percentuais definidos no metodo</strong>.
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
            Exemplo: se voce definiu 50% para Essencial e este mes 50% das entradas foram para Essencial &mdash; isso contribui para um score alto.
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
            <strong>Nota:</strong> o score analisa a alocacao das entradas, nao os gastos dentro de cada divisao.
          </p>
        </div>
      )}
    </div>
  )
}

// -- MonthlyHistoryChart ------------------------------------------------------

function MonthlyHistoryChart({ data, currentMonth, accentColor }: { data: Array<{ ym: string, label: string, totalIn: number, totalOut: number, balance: number }>, currentMonth: string, accentColor: string }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.totalIn, d.totalOut)), 1)
  const [active, setActive] = useState<string | null>(null)
  const activeItem = active ? data.find(d => d.ym === active) ?? null : null

  return (
    <div style={{ width: "100%" }}>
      {/* Info bar */}
      <div style={{ height: 36, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, opacity: activeItem ? 1 : 0, transition: "opacity 150ms ease", pointerEvents: "none" }}>
        {activeItem && (
          <>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>{activeItem.label}</span>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: 2, background: "var(--color-success)" }} />
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Entrou:</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-success)" }}>{formatCurrency(activeItem.totalIn)}</span>
              </div>
              {activeItem.totalOut > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 2, background: "var(--color-danger)" }} />
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Saiu:</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-danger)" }}>{formatCurrency(activeItem.totalOut)}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bars */}
      <div style={{ width: "100%", display: "flex", alignItems: "flex-end", gap: 8, height: 140, position: "relative" }}>
        <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, height: 1, background: "var(--color-border)" }} />
        {data.map((d) => {
          const inH    = Math.round((d.totalIn  / maxVal) * 110)
          const outH   = Math.round((d.totalOut / maxVal) * 110)
          const isCurrent = d.ym === currentMonth
          const isActive  = active === d.ym
          const hasData   = d.totalIn > 0
          return (
            <div key={d.ym}
              onMouseEnter={() => hasData && setActive(d.ym)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(isActive ? null : d.ym)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: hasData ? "pointer" : "default" }}
            >
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 110, width: "100%", justifyContent: "center" }}>
                <div style={{ width: "clamp(6px, 35%, 18px)", height: inH, background: "var(--color-success)", borderRadius: "3px 3px 0 0", opacity: !active || isActive ? 1 : 0.2, transition: "opacity 150ms ease", boxShadow: isCurrent ? "0 0 8px var(--color-success)" : "none" }} />
                {outH > 0 && <div style={{ width: "clamp(6px, 35%, 18px)", height: outH, background: "var(--color-danger)", borderRadius: "3px 3px 0 0", opacity: !active || isActive ? 1 : 0.2, transition: "opacity 150ms ease" }} />}
              </div>
              <span style={{ fontSize: 10, lineHeight: '1', color: isCurrent ? accentColor : isActive ? "var(--color-text-primary)" : "var(--color-text-tertiary)", fontWeight: isCurrent || isActive ? 700 : 400, transition: "color 150ms ease", whiteSpace: "nowrap" }}>
                {d.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

