import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'wouter'
import { useAppStore, selectCurrentSaidasFixas } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, isPaidThisMonth, getDueDayLabel } from '../lib/calculations'
import { getDivisaoIcon } from '../lib/icons'
import { PageHeader, SearchBar, groupByMonth, MonthHeader, ConfirmDialog, Breadcrumb } from '../components/ui'
import ItemActionSheet from '../components/ui/ItemActionSheet'
import { useIsMobile } from '../hooks/useIsMobile'
import { Plus, Pencil, Trash2, Target, ArrowUpRight, ArrowDownRight, XCircle, CheckCircle2, Info } from 'lucide-react'
import ObjetivoCard from '../components/features/ObjetivoCard'
import LancarDespesaModal from '../components/features/LancarDespesaModal'
import EditMovementModal from '../components/features/EditMovementModal'
import EditSaidaFixaModal from '../components/features/EditSaidaFixaModal'
import AddSaidaFixaModal from '../components/features/AddSaidaFixaModal'
import AddObjetivoModal from '../components/features/AddObjetivoModal'
import ConfirmPaymentModal from '../components/features/ConfirmPaymentModal'
import type { DivisaoMovement, SaidaFixa, Objetivo } from '../types'
import { usePartnerData } from '../hooks/usePartnerData'

/** Convert hex color + alpha (0-1) to rgba string */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** Animate a number from 0 to target with ease-out cubic */
function useCountUp(target: number, duration = 700): number {
  const [val, setVal] = React.useState(0)
  React.useEffect(() => {
    if (target === 0) { setVal(0); return }
    let start: number | null = null
    const tick = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(target * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(tick)
    }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [target, duration])
  return val
}

// ── DivisaoHeroMobile ─────────────────────────────────────────────────────────
type DivisaoType = NonNullable<ReturnType<typeof useAppStore.getState>['divisoes'][number]>

function DivisaoHeroMobile({
  divisao, color, Icon, expectedBal, totalLancadoMes, pctMes,
}: {
  divisao: DivisaoType
  color: string
  Icon: React.ElementType
  expectedBal: number
  totalLancadoMes: number
  pctMes: number
}) {
  // Inject orb-pulse keyframes once
  React.useEffect(() => {
    if (document.getElementById('somus-orb-kf')) return
    const s = document.createElement('style')
    s.id = 'somus-orb-kf'
    s.textContent = `@keyframes somusOrbPulse {
      0%,100% { transform: scale(1); }
      50%      { transform: scale(1.04); }
    }`
    document.head.appendChild(s)
  }, [])

  const lastMonthLancado = React.useMemo(() => {
    const lastMonthStr = (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7) })()
    return (divisao.movements ?? []).filter(mv => mv.type !== 'income' && mv.date.startsWith(lastMonthStr)).reduce((s, mv) => s + Math.abs(mv.amount), 0)
  }, [divisao.movements])

  const delta = totalLancadoMes - lastMonthLancado
  const hasDelta = lastMonthLancado > 0

  // State machine: pctMes = expenses/income (0% = zerado, 100% = estourado)
  type S = 'overspent' | 'high' | 'normal' | 'empty'
  const state: S = totalLancadoMes === 0 ? 'empty' : pctMes >= 100 ? 'overspent' : pctMes >= 75 ? 'high' : 'normal'
  const cfg: Record<S, { badge: string; bc: string; bbg: string; copy: string }> = {
    overspent: { badge: 'Limite atingido', bc: 'var(--color-danger)',   bbg: 'rgba(239,68,68,0.13)',    copy: 'Gastos ultrapassaram a renda recebida este mes' },
    high:      { badge: 'Alto uso',        bc: 'var(--color-warning)',  bbg: 'rgba(245,158,11,0.13)',   copy: `${Math.round(pctMes)}% da renda recebida ja utilizada` },
    normal:    { badge: 'Em dia',          bc: 'var(--color-success)',  bbg: 'rgba(16,185,129,0.12)',   copy: `${Math.round(pctMes)}% da renda recebida utilizada este mes` },
    empty:     { badge: 'Sem gastos',      bc: 'var(--color-text-secondary)', bbg: 'rgba(255,255,255,0.07)', copy: 'Nenhum gasto registrado este mes' },
  }
  const c = cfg[state]

  // Animated numbers
  const animBal     = useCountUp(divisao.balance,    700)
  const animLancado = useCountUp(totalLancadoMes,    600)

  // Spring progress bar
  const [barW, setBarW] = React.useState(0)
  React.useEffect(() => { const t = setTimeout(() => setBarW(pctMes), 150); return () => clearTimeout(t) }, [pctMes])

  const barGrad = pctMes >= 100
    ? 'var(--color-success)'
    : `linear-gradient(90deg, ${hexToRgba(color, 0.65)}, ${color})`

  return (
    <div style={{ padding: '8px 16px 20px', position: 'relative', overflow: 'hidden', marginBottom: 12 }}>

      {/* Ambient radial glow — internal div, clipped by overflow:hidden */}
      <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 220, height: 120, pointerEvents: 'none', background: `radial-gradient(ellipse, ${hexToRgba(color, 0.20)} 0%, transparent 70%)`, filter: 'blur(8px)' }} />

      {/* Orb icon */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, position: 'relative', zIndex: 1 }}>
        {/* Orb glow layer — separate div so it's clipped by parent overflow:hidden */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: -12, borderRadius: '50%', background: `radial-gradient(circle, ${hexToRgba(color, 0.30)} 0%, transparent 70%)`, filter: 'blur(10px)', pointerEvents: 'none' }} />
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `radial-gradient(circle at 35% 35%, ${hexToRgba(color, 0.26)}, ${hexToRgba(color, 0.07)})`,
            border: `1.5px solid ${hexToRgba(color, 0.40)}`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.10)`,
            animation: 'somusOrbPulse 3.6s ease-in-out infinite',
            position: 'relative', zIndex: 1,
          }}>
            <Icon size={34} style={{ color }} />
          </div>
        </div>
      </div>

      {/* State badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', padding: '3px 12px', borderRadius: 999, background: c.bbg, color: c.bc, border: `1px solid ${c.bc}30` }}>
          {c.badge}
        </span>
      </div>

      {/* Big balance number */}
      <div style={{ textAlign: 'center', marginBottom: 14, position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 34, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
          {formatCurrency(animBal)}
        </p>
        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '5px 0 0', fontWeight: 500 }}>
          Livre este mês
        </p>
      </div>

      {/* Info chip pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 999, background: hexToRgba(color, 0.13), color, border: `1px solid ${hexToRgba(color, 0.28)}` }}>
          {divisao.percentage}% da renda
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 11px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)', border: '1px solid rgba(255,255,255,0.10)' }}>
          Meta {formatCurrency(expectedBal)}
        </span>
      </div>

      {/* Progress card */}
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '14px 16px', position: 'relative', zIndex: 1 }}>

        {/* Top row: lancado + pct + delta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '0 0 3px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gasto este mês</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              {formatCurrency(animLancado)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {hasDelta && (
              <p style={{ fontSize: 11, fontWeight: 600, margin: '0 0 3px', color: delta >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                {delta >= 0 ? '+' : ''}{formatCurrency(delta)} vs anterior
              </p>
            )}
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-secondary)', margin: 0 }}>
              {Math.round(pctMes)}%
            </p>
          </div>
        </div>

        {/* Spring progress bar */}
        <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ height: '100%', width: `${Math.min(barW, 100)}%`, background: barGrad, borderRadius: 999, transition: 'width 900ms cubic-bezier(0.34, 1.56, 0.64, 1)', position: 'relative' }}>
            {pctMes > 5 && pctMes < 100 && (
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 16, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35))', borderRadius: 999 }} />
            )}
          </div>
        </div>

        {/* Contextual copy + falta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.45, flex: 1 }}>{c.copy}</p>
          {totalIncomeMes > 0 && pctMes < 100 && (
            <div style={{
              flexShrink: 0, textAlign: 'right',
              padding: '4px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{ fontSize: 9, color: 'var(--color-text-tertiary)', margin: 0, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Falta usar</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-success)', margin: 0, lineHeight: 1.2 }}>
                {formatCurrency(totalIncomeMes - totalLancadoMes)}
              </p>
            </div>
          )}
        </div>
        {hasDelta && (
          <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '6px 0 0' }}>
            Mês anterior: {formatCurrency(lastMonthLancado)}
          </p>
        )}
      </div>
    </div>
  )
}

export default function DivisaoDetalhe() {
  // Accepts both /relatorios/:id (cx-essencial) and /divisao/:slug (essencial)
  const rawParams = useParams<{ id?: string; slug?: string }>()
  const rawParam = rawParams.id ?? rawParams.slug ?? ''
  // Normalize: if it doesn't start with 'cx-', prefix it
  const id = rawParam.startsWith('cx-') ? rawParam : `cx-${rawParam}`
  const [, navigate] = useLocation()
  const isEssencial  = id === 'cx-essencial'
  const isObjetivos  = id === 'cx-objetivos'
  const defaultTab = isEssencial ? 'custos' : isObjetivos ? 'objetivos' : 'lancamentos'
  const [activeTab, setActiveTab] = useState<'custos' | 'lancamentos' | 'objetivos'>(defaultTab as 'custos' | 'lancamentos' | 'objetivos')
  const [searchQuery, setSearchQuery] = useState('')
  const [mvSearchQuery, setMvSearchQuery] = useState('')
  const [groupBy, setGroupBy] = useState<'date' | 'payment'>('date')
  const [despesaOpen, setDespesaOpen] = useState(false)
  const [addSfOpen, setAddSfOpen] = useState(false)
  const [addObjetivoOpen, setAddObjetivoOpen] = useState(false)

  // Action sheet state
  const [actionItem, setActionItem] = useState<{ type: 'movement' | 'custo'; item: DivisaoMovement | SaidaFixa } | null>(null)
  // Edit modal state
  const [editMv, setEditMv] = useState<DivisaoMovement | null>(null)
  const [editSf, setEditSf] = useState<SaidaFixa | null>(null)
  // Objetivo edit/delete
  const [editObjetivoTarget, setEditObjetivoTarget] = useState<Objetivo | null>(null)

  // Deep-link highlight (from Fluxo GhostLink)
  const [highlightCustos, setHighlightCustos] = useState(false)
  const custosRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('from') === 'fluxo' && isEssencial) {
      setActiveTab('custos')
      // Inject keyframe once
      if (!document.getElementById('somus-highlight-kf')) {
        const s = document.createElement('style')
        s.id = 'somus-highlight-kf'
        s.textContent = `@keyframes somusHighlight {
          0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.35); background-color: rgba(59,130,246,0.10); }
          50%  { box-shadow: 0 0 0 6px rgba(59,130,246,0.08); background-color: rgba(59,130,246,0.06); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0);    background-color: transparent; }
        }`
        document.head.appendChild(s)
      }
      // Small delay so the tab renders before scroll
      setTimeout(() => {
        custosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setHighlightCustos(true)
        setTimeout(() => setHighlightCustos(false), 1500)
      }, 80)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [deleteObjetivoTarget, setDeleteObjetivoTarget] = useState<Objetivo | null>(null)
  const [objetivoActionTarget, setObjetivoActionTarget] = useState<Objetivo | null>(null)
  const [confirmPaySf, setConfirmPaySf] = useState<SaidaFixa | null>(null)

  const divisao = useAppStore(s => s.divisoes.find(cx => cx.id === id))
  const saidasFixas = useAppStore(useShallow(selectCurrentSaidasFixas))
  const objetivos = useAppStore(useShallow(s => s.objetivos))
  const currentUser = useAppStore(s => s.currentUser)
  const editDivisaoMovement = useAppStore(s => s.editDivisaoMovement)
  const deleteDivisaoMovement = useAppStore(s => s.deleteDivisaoMovement)
  const editSaidaFixa = useAppStore(s => s.editSaidaFixa)
  const deleteSaidaFixa = useAppStore(s => s.deleteSaidaFixa)
  const markSaidaFixaPaid = useAppStore(s => s.markSaidaFixaPaid)
  const markSaidaFixaUnpaid = useAppStore(s => s.markSaidaFixaUnpaid)
  const editObjetivo = useAppStore(s => s.editObjetivo)
  const deleteObjetivo = useAppStore(s => s.deleteObjetivo)
  const expectedIncome = useAppStore(s =>
    s.incomeSources
      .filter(src => src.userId === (s.currentUser?.id ?? ''))
      .reduce((sum, src) => sum + (src.expectedAmount ?? 0), 0)
  )

  const { partnerObjetivos } = usePartnerData()

  // Objetivos filtrados: próprios + de casal do parceiro (deduplicados por id)
  const myObjetivos = useMemo(() => {
    const own = objetivos.filter(o => o.userId === (currentUser?.id ?? '') || o.isCouple)
    const seen = new Set<string>(own.map(o => o.id))
    const merged = [...own]
    for (const o of partnerObjetivos) {
      if (!seen.has(o.id)) {
        seen.add(o.id)
        merged.push(o)
      }
    }
    return merged
  }, [objetivos, currentUser, partnerObjetivos])

  const isMobile = useIsMobile()

  if (!divisao) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', gap: 12 }}>
        <Info size={28} color="var(--color-text-tertiary)" />
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Divisão não encontrada</p>
      </div>
    )
  }

  const { Icon, color } = getDivisaoIcon(divisao.id)
  const expectedBal = (divisao.percentage / 100) * expectedIncome


  // Custos fixos desta divisão
  const custosFixos = useMemo(() =>
    saidasFixas.filter(sf => sf.divisaoId === id),
    [saidasFixas, id]
  )

  const totalMensal = custosFixos.reduce((s, sf) => s + sf.amount, 0)
  const totalAnual = totalMensal * 12

  // Gasto no mês — movimentos de despesa do mês atual (consistente com home card calcPct)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const lancamentosMes = useMemo(() =>
    (divisao.movements ?? []).filter(mv => mv.type !== 'income' && mv.date.startsWith(currentMonth))
  , [divisao.movements, currentMonth])

  const totalIncomeMes = useMemo(() =>
    (divisao.movements ?? []).filter(mv => mv.type === 'income' && mv.date.startsWith(currentMonth))
      .reduce((s, mv) => s + mv.amount, 0)
  , [divisao.movements, currentMonth])

  const totalLancadoMes = lancamentosMes.reduce((s, mv) => s + Math.abs(mv.amount), 0)
  // pctMes = gastos / renda recebida no mês (= "X% usado", igual à home card)
  const pctMes = totalIncomeMes > 0 ? Math.min(100, (totalLancadoMes / totalIncomeMes) * 100) : 0

  const PAYMENT_LABELS: Record<string, string> = {
    pix: 'Pix',
    debit: 'Débito',
    credit: 'Cartão Crédito',
    cash: 'Dinheiro',
    auto_debit: 'Débito Automático',
  }

  // Filtered custos
  const filteredCustos = useMemo(() =>
    searchQuery
      ? custosFixos.filter(sf => sf.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : custosFixos,
    [custosFixos, searchQuery]
  )

  // Group custos by dueDay
  const custosByDay = useMemo(() => {
    const groups: Record<number, typeof custosFixos> = {}
    for (const sf of filteredCustos) {
      if (!groups[sf.dueDay]) groups[sf.dueDay] = []
      groups[sf.dueDay].push(sf)
    }
    return Object.entries(groups)
      .map(([day, items]) => ({ day: Number(day), items, total: items.reduce((s, sf) => s + sf.amount, 0) }))
      .sort((a, b) => a.day - b.day)
  }, [filteredCustos])

  // Group custos by paymentMethod
  const custosByPayment = useMemo(() => {
    const groups: Record<string, typeof custosFixos> = {}
    for (const sf of filteredCustos) {
      const key = sf.paymentMethod || 'other'
      if (!groups[key]) groups[key] = []
      groups[key].push(sf)
    }
    return Object.entries(groups)
      .map(([method, items]) => ({ method, label: PAYMENT_LABELS[method] || method, items, total: items.reduce((s, sf) => s + sf.amount, 0) }))
      .sort((a, b) => b.total - a.total)
  }, [filteredCustos])

  // All movements (filtered) — only expenses; income distributions appear in Fluxo
  const allMovements = useMemo(() => {
    const sorted = [...(divisao.movements ?? [])]
      .filter(mv => mv.type !== 'income')           // ← saídas apenas
      .sort((a, b) => b.date.localeCompare(a.date))
    if (!mvSearchQuery.trim()) return sorted
    const q = mvSearchQuery.toLowerCase()
    return sorted.filter(mv => mv.description.toLowerCase().includes(q))
  }, [divisao.movements, mvSearchQuery])

  const groupedMovements = useMemo(
    () => groupByMonth(allMovements, mv => mv.date, mv => mv.amount),
    [allMovements],
  )

  const tabs = isEssencial
    ? [
        { key: 'custos' as const, label: 'Custos Fixos', count: custosFixos.length },
        { key: 'lancamentos' as const, label: 'Lançamentos', count: allMovements.length },
      ]
    : isObjetivos
    ? [
        { key: 'objetivos' as const, label: 'Objetivos', count: myObjetivos.length },
        { key: 'lancamentos' as const, label: 'Lançamentos', count: allMovements.length },
      ]
    : [
        { key: 'lancamentos' as const, label: 'Lançamentos', count: allMovements.length },
      ]

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>
      {/* Header */}
      {isMobile ? (
        <>
          <PageHeader title={divisao.name} back />
          <DivisaoHeroMobile
            divisao={divisao}
            color={color}
            Icon={Icon}
            expectedBal={expectedBal}
            totalLancadoMes={totalLancadoMes}
            pctMes={pctMes}
          />
        </>
      ) : (
        <>
          {/* Desktop Radial Glow */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: 500,
            background: 'radial-gradient(circle at 50% -50px, #001442 0%, transparent 70%)',
            opacity: 0.12,
            pointerEvents: 'none',
            zIndex: 0,
          }} />

          <div style={{ paddingTop: 28, marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <Breadcrumb items={[
            { label: 'Relatórios', href: '/relatorios' },
            {
              label: divisao.name,
              icon: (
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: hexToRgba(color, 0.15),
                }}>
                  <Icon size={12} style={{ color }} />
                </div>
              ),
            },
          ]} />
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '4px 0 0 4px' }}>
            {divisao.percentage}% da renda esperada
          </p>
          </div>
        </>
      )}

      <div style={{ padding: isMobile ? '0 16px' : 0 }}>

      {/* Tabs (Essencial, Objetivos e outras divisões) */}
      {(isEssencial || isObjetivos) ? (
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: '2px solid var(--color-border)',
          marginBottom: 16,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              style={{
                flex: 1, padding: '10px 0',
                fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: activeTab === tab.key ? `2px solid ${color}` : '2px solid transparent',
                fontFamily: 'var(--font-sans)',
                marginBottom: -2,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {tab.label}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 8,
                background: activeTab === tab.key ? `${color}22` : 'rgba(255,255,255,0.06)',
                color: activeTab === tab.key ? color : 'var(--color-text-tertiary)',
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="section-label" style={{ marginBottom: 12 }}>Lançamentos</p>
      )}

      {/* Tab: Objetivos (cx-objetivos only) */}
      {activeTab === 'objetivos' && (
        <div>
          {/* Botão Adicionar Objetivo */}
          <button
            id="btn-add-objetivo"
            onClick={() => setAddObjetivoOpen(true)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              padding: '12px 0', marginBottom: 16,
              borderRadius: 'var(--radius-card)',
              background: hexToRgba(color, 0.12),
              border: `1.5px dashed ${hexToRgba(color, 0.45)}`,
              color, fontSize: 14, fontWeight: 600,
              fontFamily: 'var(--font-sans)', cursor: 'pointer',
              transition: 'background 150ms ease',
            }}
          >
            <Plus size={17} strokeWidth={2.5} />
            Adicionar Objetivo
          </button>

          {/* Lista de objetivos */}
          {myObjetivos.length === 0 ? (
            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '48px 20px', gap: 8, textAlign: 'center',
            }}>
              <Target size={28} color="var(--color-text-tertiary)" strokeWidth={1.5} />
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>Nenhum objetivo ainda</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Crie seu primeiro objetivo financeiro</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: myObjetivos.length === 1 ? '1fr' : '1fr 1fr', gap: 12 }}>
              {myObjetivos.map(obj => (
                <ObjetivoCard 
                  key={obj.id} 
                  obj={obj} 
                  accentColor={color}
                  onNavigate={(id) => navigate(`/casal/objetivo/${id}`)}
                  onAction={setObjetivoActionTarget}
                  compact={isMobile}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Custos Fixos */}
      {activeTab === 'custos' && (
        <div>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: 16,
            }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>Total por Mês</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 2px', lineHeight: 1 }}>
                {formatCurrency(totalMensal)}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>Custo total por mês.</p>
            </div>
            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: 16,
            }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>Total por Ano</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 2px', lineHeight: 1 }}>
                {formatCurrency(totalAnual)}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>Custo total por ano.</p>
            </div>
          </div>

          {/* Add custo fixo button — desktop only (mobile uses FAB) */}
          {!isMobile && <button
            id="btn-add-custo-fixo"
            onClick={() => setAddSfOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 0',
              marginBottom: 16,
              borderRadius: 'var(--radius-card)',
              background: hexToRgba(color, 0.12),
              border: `1.5px dashed ${hexToRgba(color, 0.45)}`,
              color: color,
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              transition: 'background 150ms ease, border-color 150ms ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = hexToRgba(color, 0.2)
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = hexToRgba(color, 0.7)
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = hexToRgba(color, 0.12)
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = hexToRgba(color, 0.45)
            }}
            aria-label="Adicionar custo fixo"
          >
            <Plus size={17} strokeWidth={2.5} />
            Adicionar Custo Fixo
          </button>}

          {/* List header + filter chips inline (Fluxo pattern) */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10, paddingLeft: 2,
          }}>
            <p style={{
              fontSize: 13, fontWeight: 700,
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              margin: 0,
            }}>
              Custos Fixos
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setGroupBy('date')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 8,
                  fontSize: 11, fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  border: groupBy === 'date' ? '1px solid rgba(59,130,246,0.4)' : '1px solid var(--color-border)',
                  background: groupBy === 'date' ? 'rgba(59,130,246,0.12)' : 'var(--color-bg-secondary)',
                  color: groupBy === 'date' ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)',
                }}
              >
                Data
              </button>
              <button
                onClick={() => setGroupBy('payment')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 8,
                  fontSize: 11, fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  border: groupBy === 'payment' ? '1px solid rgba(59,130,246,0.4)' : '1px solid var(--color-border)',
                  background: groupBy === 'payment' ? 'rgba(59,130,246,0.12)' : 'var(--color-bg-secondary)',
                  color: groupBy === 'payment' ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)',
                }}
              >
                Forma de Pgto
              </button>
            </div>
          </div>

          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <div style={{ marginBottom: 12 }} />
          {/* Custos grouped list */}
          <div
            ref={custosRef}
            style={{
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              transition: 'background-color 300ms ease, box-shadow 300ms ease',
              ...(highlightCustos ? {
                animation: 'somusHighlight 1.4s ease-out forwards',
              } : {}),
            }}
          >
            {filteredCustos.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 8 }}>
                <Info size={24} color="var(--color-text-tertiary)" />
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>Nenhum custo fixo</p>
              </div>
            ) : groupBy === 'date' ? (
              custosByDay.map((group, gi) => (
                <div key={group.day}>
                  <div style={{
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderBottom: '1px solid var(--color-border)',
                    borderTop: gi > 0 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                      Todo dia {group.day}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>
                      {formatCurrency(group.total)}
                    </p>
                  </div>
                  {group.items.map((sf, i) => {
                    const paid = isPaidThisMonth(sf)
                    const payLabel = PAYMENT_LABELS[sf.paymentMethod] || sf.paymentMethod
                    return (
                      <div
                        key={sf.id}
                        onClick={() => setActionItem({ type: 'custo', item: sf })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px',
                          borderBottom: i < group.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                          opacity: paid ? 0.55 : 1,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 10,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          background: sf.color ? `${sf.color}18` : 'rgba(255,255,255,0.06)',
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: sf.color || 'var(--color-accent-primary)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0,
                            textDecoration: paid ? 'line-through' : 'none',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{sf.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
                            {sf.isVariable
                              ? <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>Variável</span>
                              : formatCurrency(sf.amount)}{' · '}{getDueDayLabel(sf.dueDay)}{' · '}
                            <span style={{ color: 'var(--color-text-tertiary)' }}>{payLabel}</span>
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            ) : (
              custosByPayment.map((group, gi) => (
                <div key={group.method}>
                  <div style={{
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderBottom: '1px solid var(--color-border)',
                    borderTop: gi > 0 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                      {group.label}
                    </p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>
                      {formatCurrency(group.total)}
                    </p>
                  </div>
                  {group.items.map((sf, i) => {
                    const paid = isPaidThisMonth(sf)
                    return (
                      <div
                        key={sf.id}
                        onClick={() => setActionItem({ type: 'custo', item: sf })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 16px',
                          borderBottom: i < group.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                          opacity: paid ? 0.55 : 1,
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 10,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          background: sf.color ? `${sf.color}18` : 'rgba(255,255,255,0.06)',
                        }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: sf.color || 'var(--color-accent-primary)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0,
                            textDecoration: paid ? 'line-through' : 'none',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>{sf.name}</p>
                          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
                            {sf.isVariable
                              ? <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>Variável</span>
                              : formatCurrency(sf.amount)}{' · '}
                            <span style={{ color: 'var(--color-text-tertiary)' }}>Dia {sf.dueDay}</span>
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Lançamentos */}
      {activeTab === 'lancamentos' && (
        <div style={{
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderBottom: '1px solid var(--color-border)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Procurar" value={mvSearchQuery} onChange={e => setMvSearchQuery(e.target.value)} style={{ flex: 1, padding: '12px 0', fontSize: 14, background: 'none', border: 'none', outline: 'none', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }} />
          </div>
          <div>
            {allMovements.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 8 }}>
                <Info size={24} color="var(--color-text-tertiary)" />
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>Nenhuma movimentação ainda</p>
              </div>
            ) : (
              groupedMovements.map((g) => (
                <React.Fragment key={g.key}>
                  <MonthHeader label={g.label} total={g.total} type="mixed" />
                  {g.items.map((mv, i) => (
                    <div
                      key={mv.id}
                      onClick={() => setActionItem({ type: 'movement', item: mv })}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 16px',
                        borderBottom: i < g.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                        cursor: 'pointer',
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
                          {new Date(mv.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                      <span style={{
                        fontSize: 14, fontWeight: 700, flexShrink: 0,
                        color: mv.amount > 0 ? 'var(--color-success)' : 'var(--color-danger)',
                      }}>
                        {mv.amount > 0 ? '+' : ''}{formatCurrency(mv.amount)}
                      </span>
                    </div>
                  ))}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      )}

      </div>

      {/* Mobile: Floating Action Button */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          right: 20,
          zIndex: 35,
        }}>
          <button
            onClick={() => {
              if (activeTab === 'custos') setAddSfOpen(true)
              else if (activeTab === 'objetivos') setAddObjetivoOpen(true)
              else setDespesaOpen(true)
            }}
            style={{
              width: 52, height: 52, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: color,
              border: 'none', cursor: 'pointer',
              color: 'white',
            }}
            aria-label="Ação principal"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Desktop: Button */}
      {!isMobile && !(isEssencial && activeTab === 'custos') && activeTab !== 'objetivos' && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => setDespesaOpen(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Registrar despesa
          </button>
        </div>
      )}

      <LancarDespesaModal
        open={despesaOpen}
        onClose={() => setDespesaOpen(false)}
        divisaoId={divisao.id}
        divisaoName={divisao.name}
      />

      <AddSaidaFixaModal
        open={addSfOpen}
        onClose={() => setAddSfOpen(false)}
        divisaoId={divisao.id}
        divisaoName={divisao.name}
      />

      <AddObjetivoModal
        open={addObjetivoOpen}
        onClose={() => setAddObjetivoOpen(false)}
      />

      {/* Action sheet */}
      <ItemActionSheet
        open={!!actionItem}
        onClose={() => setActionItem(null)}
        title={actionItem?.type === 'custo' ? (actionItem.item as SaidaFixa).name : (actionItem?.item as DivisaoMovement)?.description ?? ''}
        subtitle={actionItem ? formatCurrency(Math.abs(actionItem.item.amount)) : ''}
        actions={actionItem ? (
          actionItem.type === 'custo'
            ? (() => {
                const sf = actionItem.item as SaidaFixa
                const paid = isPaidThisMonth(sf)
                return [
                  paid
                    ? { label: 'Desmarcar pagamento', icon: XCircle, color: 'var(--color-warning)', onClick: () => markSaidaFixaUnpaid(sf.id, currentMonth) }
                    : { label: 'Marcar como pago', icon: CheckCircle2, color: 'var(--color-success)', onClick: () => { setActionItem(null); setConfirmPaySf(sf) } },
                  { label: 'Editar', icon: Pencil, color: 'var(--color-accent-primary)', onClick: () => setEditSf(sf) },
                  { label: 'Excluir', icon: Trash2, color: 'var(--color-danger)', onClick: () => deleteSaidaFixa(sf.id) },
                ]
              })()
            : [
                { label: 'Editar', icon: Pencil, color: 'var(--color-accent-primary)', onClick: () => setEditMv(actionItem.item as DivisaoMovement) },
                { label: 'Excluir', icon: Trash2, color: 'var(--color-danger)', onClick: () => deleteDivisaoMovement(divisao.id, actionItem.item.id) },
              ]
        ) : undefined}
      />

      {/* Edit movement modal */}
      <EditMovementModal
        open={!!editMv}
        onClose={() => setEditMv(null)}
        initialDescription={editMv?.description ?? ''}
        initialAmount={editMv?.amount ?? 0}
        initialDate={editMv?.date ?? ''}
        onSave={(updates) => {
          if (!editMv) return
          editDivisaoMovement(divisao.id, editMv.id, updates)
        }}
      />

      {/* Edit saída fixa modal */}
      <EditSaidaFixaModal
        open={!!editSf}
        onClose={() => setEditSf(null)}
        saidaFixa={editSf}
        onSave={(updates) => {
          if (!editSf) return
          editSaidaFixa(editSf.id, updates)
        }}
      />

      {/* Objetivo: action sheet */}
      <ItemActionSheet
        open={!!objetivoActionTarget}
        onClose={() => setObjetivoActionTarget(null)}
        title={objetivoActionTarget?.name ?? ''}
        subtitle={objetivoActionTarget ? formatCurrency(objetivoActionTarget.targetAmount) + ' de meta' : ''}
        actions={objetivoActionTarget ? [
          {
            label: 'Editar objetivo',
            icon: Pencil,
            color: 'var(--color-accent-primary)',
            onClick: () => { setEditObjetivoTarget(objetivoActionTarget); setObjetivoActionTarget(null) },
          },
          {
            label: 'Excluir objetivo',
            icon: Trash2,
            color: 'var(--color-danger)',
            onClick: () => { setDeleteObjetivoTarget(objetivoActionTarget); setObjetivoActionTarget(null) },
          },
        ] : undefined}
      />

      {/* Objetivo: editar — reutiliza AddObjetivoModal pré-preenchido */}
      <AddObjetivoModal
        open={!!editObjetivoTarget}
        onClose={() => setEditObjetivoTarget(null)}
        editTarget={editObjetivoTarget ?? undefined}
        onSave={(updates) => {
          if (!editObjetivoTarget) return
          editObjetivo(editObjetivoTarget.id, updates)
        }}
      />

      {/* Objetivo: confirmar exclusão */}
      <ConfirmDialog
        open={!!deleteObjetivoTarget}
        onClose={() => setDeleteObjetivoTarget(null)}
        onConfirm={() => {
          if (!deleteObjetivoTarget) return
          deleteObjetivo(deleteObjetivoTarget.id)
        }}
        title="Remover objetivo"
        description={`"${deleteObjetivoTarget?.name ?? ''}" será removido, incluindo todos os registros e o progresso acumulado. Essa ação não pode ser desfeita.`}
        confirmLabel="Remover permanentemente"
        variant="danger"
      />
      <ConfirmPaymentModal
        open={!!confirmPaySf}
        onClose={() => setConfirmPaySf(null)}
        costName={confirmPaySf?.name}
        onConfirm={(date) => {
          if (confirmPaySf) markSaidaFixaPaid(confirmPaySf.id, date, currentMonth)
        }}
      />
    </div>
  )
}
