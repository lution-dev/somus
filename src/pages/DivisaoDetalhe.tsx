import React, { useState, useMemo } from 'react'
import { useParams, useLocation } from 'wouter'
import { useAppStore, selectCurrentSaidasFixas, selectCurrentEntradas } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, isPaidThisMonth, getDueDayLabel } from '../lib/calculations'
import { getDivisaoIcon } from '../lib/icons'
import { ProgressBar, PageHeader, SearchBar, groupByMonth, MonthHeader, ConfirmDialog, Breadcrumb } from '../components/ui'
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

const HERO_BG = '#001442'

/** Convert hex color + alpha (0-1) to rgba string */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function DivisaoDetalhe() {
  const { id } = useParams<{ id: string }>()
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
  const [deleteObjetivoTarget, setDeleteObjetivoTarget] = useState<Objetivo | null>(null)
  const [objetivoActionTarget, setObjetivoActionTarget] = useState<Objetivo | null>(null)
  const [confirmPaySf, setConfirmPaySf] = useState<SaidaFixa | null>(null)

  const divisao = useAppStore(s => s.divisoes.find(cx => cx.id === id))
  const saidasFixas = useAppStore(useShallow(selectCurrentSaidasFixas))
  const entradas = useAppStore(useShallow(selectCurrentEntradas))
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

  // Objetivos filtrados para o usuário atual
  const myObjetivos = useMemo(
    () => objetivos.filter(o => o.userId === (currentUser?.id ?? '') || o.isCouple),
    [objetivos, currentUser]
  )

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

  // Lançamentos no mês atual
  const currentMonth = new Date().toISOString().slice(0, 7)
  const lancamentosMes = useMemo(() => {
    // From entradas distribution
    const fromEntradas = entradas
      .filter(e => e.date.startsWith(currentMonth))
      .flatMap(e =>
        e.distribution
          .filter(d => d.divisaoId === id)
          .map(d => ({
            id: `${e.id}-${d.divisaoId}`,
            date: e.date,
            amount: d.amount,
            description: `Entrada — ${e.sourceName}`,
            type: 'income' as const,
          }))
      )

    return fromEntradas
  }, [entradas, currentMonth, id])

  const totalLancadoMes = lancamentosMes.reduce((s, l) => s + l.amount, 0)
  const pctMes = expectedBal > 0 ? Math.min(100, (totalLancadoMes / expectedBal) * 100) : 0

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
          <PageHeader title={divisao.name} back bg={HERO_BG} />
          <div style={{
            background: HERO_BG,
            borderRadius: '0 0 24px 24px',
            padding: '0 16px 24px',
            marginBottom: 20,
            overflow: 'hidden',
          }}>
            {/* Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: hexToRgba(color, 0.12), border: `2px solid ${hexToRgba(color, 0.25)}`,
              }}>
                <Icon size={28} style={{ color }} />
              </div>
            </div>

            {/* Meta (title is already in navbar) */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                Meta: {formatCurrency(expectedBal)} · {divisao.percentage}% do total
              </p>
            </div>

            {/* Lançado esse mês card */}
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              padding: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Lançado esse Mês</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{formatCurrency(totalLancadoMes)}</p>
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: pctMes >= 100 ? 'var(--color-success)' : 'var(--color-text-secondary)', margin: 0 }}>
                  {Math.round(pctMes)}%
                </p>
              </div>
              <ProgressBar value={pctMes} size="sm" />
            </div>

            {/* CTA */}
            {totalLancadoMes === 0 && (
              <div style={{
                marginTop: 12,
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 'var(--radius-card)',
                padding: '10px 14px',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 13, color: 'var(--color-warning)', margin: 0, fontWeight: 500 }}>
                  Nada esse mês ainda. Comece lançando.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ paddingTop: 28, marginBottom: 20 }}>
          <Breadcrumb items={[
            { label: 'Divisões', href: '/divisoes' },
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

          {/* Filter chips */}
          <div style={{ marginBottom: 12 }}>
            <p className="section-label" style={{ marginBottom: 8 }}>Filtrar por</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['date', 'payment'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setGroupBy(mode)}
                  style={{
                    padding: '6px 14px', borderRadius: 20,
                    fontSize: 13, fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    cursor: 'pointer',
                    border: `1.5px solid ${groupBy === mode ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                    background: groupBy === mode ? 'rgba(59,130,246,0.1)' : 'transparent',
                    color: groupBy === mode ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                    transition: 'all 150ms ease',
                  }}
                >
                  {mode === 'date' ? 'Data' : 'Forma de Pagamento'}
                </button>
              ))}
            </div>
          </div>

          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* Custos grouped list */}
          <div style={{
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}>
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
                              : formatCurrency(sf.amount)}{' · '}{getDueDayLabel(sf.dueDay)}
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
                              : formatCurrency(sf.amount)}{' · '}{getDueDayLabel(sf.dueDay)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))
            )}
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
            Lançar despesa
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
        title="Excluir objetivo"
        description={`"${deleteObjetivoTarget?.name ?? ''}" será excluído permanentemente, incluindo todos os lançamentos e o progresso acumulado. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir permanentemente"
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
