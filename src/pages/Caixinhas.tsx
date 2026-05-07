import { useState } from 'react'
import { useAppStore, selectCurrentCaixinhas } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { getCaixinhaIcon } from '../lib/icons'
import { ProgressBar, PageHeader } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import {
  ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownRight,
  TrendingUp, TrendingDown, Minus,
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

type Caixinhas = ReturnType<typeof selectCurrentCaixinhas>

function aggregateMonth(caixinhas: Caixinhas, month: string) {
  return caixinhas.map(cx => {
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
  const caixinhas    = useAppStore(useShallow(selectCurrentCaixinhas))
  const isMobile     = useIsMobile()
  const TODAY        = currentYM()
  const [month, setMonth] = useState(TODAY)

  const data     = aggregateMonth(caixinhas, month)
  const dataPrev = aggregateMonth(caixinhas, shiftMonth(month, -1))

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
          {/* Month navigator — row independente abaixo do header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '8px 16px 4px' }}>
            <MonthNav month={month} today={TODAY} onChange={setMonth} showLabel />
          </div>
        </>
      ) : (
        <div style={{ paddingTop: 32, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Relatórios</h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>{monthLabel(month)}</p>
          </div>
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
          <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5, maxWidth: 260 }}>
            Não há movimentos registrados em {monthLabel(month).toLowerCase()}.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 16,
          padding: isMobile ? '0 16px' : 0,
          maxWidth: 800, margin: '0 auto',
        }}>

          {/* ── 1. Resumo ──────────────────────────────────────────────────── */}
          <div style={CARD}>
            <p className="section-label" style={{ marginBottom: 16 }}>Resumo do mês</p>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {/* Entrou */}
              <div style={{ flex: 1, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <ArrowUpRight size={13} color="var(--color-success)" />
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Entrou</span>
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-success)', margin: 0, lineHeight: 1 }}>
                  {formatCurrency(globalIn)}
                </p>
              </div>

              {/* Saiu */}
              <div style={{ flex: 1, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <ArrowDownRight size={13} color="var(--color-danger)" />
                  <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500 }}>Saiu</span>
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-danger)', margin: 0, lineHeight: 1 }}>
                  {formatCurrency(globalOut)}
                </p>
              </div>
            </div>

            <ProgressBar
              value={usagePct}
              variant={usagePct >= 100 ? 'danger' : usagePct >= 80 ? 'warning' : 'default'}
              size="md"
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{Math.round(usagePct)}% utilizado</span>
              <span style={{ fontSize: 12, color: globalIn - globalOut >= 0 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                {globalIn - globalOut >= 0 ? '+' : ''}{formatCurrency(globalIn - globalOut)} restante
              </span>
            </div>
          </div>

          {/* ── 2. Tendência ───────────────────────────────────────────────── */}
          <div style={CARD}>
            <p className="section-label" style={{ marginBottom: 16 }}>Tendência vs. mês anterior</p>

            {prevIn === 0 && prevOut === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0 }}>
                Sem dados do mês anterior para comparar.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <TrendRow
                  label="Receitas"
                  current={globalIn}
                  delta={inDelta}
                  positiveIsGood
                />
                <div style={{ height: 1, background: 'var(--color-border)' }} />
                <TrendRow
                  label="Gastos"
                  current={globalOut}
                  delta={outDelta}
                  positiveIsGood={false}
                />
              </div>
            )}
          </div>

          {/* ── 3. Gastos por divisão ──────────────────────────────────────── */}
          <div style={{ ...CARD, gridColumn: isMobile ? undefined : '1 / -1' }}>
            <p className="section-label" style={{ marginBottom: 16 }}>Gastos por divisão</p>

            {bySpending.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0 }}>Nenhum gasto registrado este mês.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {bySpending.map(({ cx, totalOut }) => {
                  const { Icon, color } = getCaixinhaIcon(cx.id)
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

          {/* ── 4. Distribuição real vs. esperada ─────────────────────────── */}
          <div style={{ ...CARD, gridColumn: isMobile ? undefined : '1 / -1' }}>
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
                    const { Icon, color } = getCaixinhaIcon(cx.id)
                    const realPct     = globalOut > 0 ? (totalOut / globalOut) * 100 : 0
                    const expectedPct = cx.percentage
                    const delta       = realPct - expectedPct
                    const overshot    = delta > 5
                    const undershot   = delta < -5

                    return (
                      <div key={cx.id}>
                        {/* Row header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}15` }}>
                            <Icon size={14} style={{ color }} />
                          </div>
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>{cx.name}</span>

                          {/* Delta badge */}
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

                          {/* Pcts */}
                          <span style={{ fontSize: 12, color: overshot ? 'var(--color-danger)' : undershot ? 'var(--color-success)' : 'var(--color-text-secondary)', fontWeight: 600, minWidth: 70, textAlign: 'right' }}>
                            {Math.round(realPct)}% <span style={{ fontWeight: 400, color: 'var(--color-text-tertiary)' }}>/ {expectedPct}%</span>
                          </span>
                        </div>

                        {/* Dual bar: fill in color up to expected, red if overshoot */}
                        <div style={{ position: 'relative', height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)' }}>
                          {/* Expected marker */}
                          <div style={{
                            position: 'absolute', left: `${Math.min(expectedPct, 100)}%`,
                            top: -2, bottom: -2, width: 2, borderRadius: 1,
                            background: 'var(--color-text-tertiary)', opacity: 0.5,
                            transform: 'translateX(-1px)',
                          }} />
                          {/* Fill up to min(real, expected) */}
                          {totalOut > 0 && (
                            <div style={{
                              position: 'absolute', left: 0, top: 0, bottom: 0,
                              width: `${Math.min(realPct, expectedPct, 100)}%`,
                              background: color, borderRadius: 3,
                              transition: 'width 500ms ease',
                            }} />
                          )}
                          {/* Overshoot fill */}
                          {overshot && (
                            <div style={{
                              position: 'absolute',
                              left: `${Math.min(expectedPct, 100)}%`,
                              top: 0, bottom: 0,
                              width: `${Math.min(realPct - expectedPct, 100 - expectedPct)}%`,
                              background: 'var(--color-danger)', borderRadius: '0 3px 3px 0',
                              transition: 'width 500ms ease',
                            }} />
                          )}
                        </div>
                      </div>
                    )
                  })}

                {/* Legend */}
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
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

function TrendRow({ label, current, delta, positiveIsGood }: { label: string; current: number; delta: number; positiveIsGood: boolean }) {
  const isGood    = positiveIsGood ? delta >= 0 : delta <= 0
  const isNeutral = delta === 0
  const color     = isNeutral ? 'var(--color-text-tertiary)' : isGood ? 'var(--color-success)' : 'var(--color-danger)'
  const Icon      = isNeutral ? Minus : isGood ? TrendingUp : TrendingDown

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '0 0 2px' }}>{label}</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{formatCurrency(current)}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color }}>
        <Icon size={15} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {delta > 0 ? '+' : ''}{formatCurrency(Math.abs(delta))}
        </span>
      </div>
    </div>
  )
}
