import React, { useState, useMemo } from 'react'
import { useParams, useLocation } from 'wouter'
import { useAppStore, selectCurrentSaidasFixas, selectCurrentEntradas } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, isPaidThisMonth, getDueDayLabel } from '../lib/calculations'
import { getCaixinhaIcon } from '../lib/icons'
import { ProgressBar, PageHeader, SearchBar, groupByMonth, MonthHeader } from '../components/ui'
import ItemActionSheet from '../components/ui/ItemActionSheet'
import { useIsMobile } from '../hooks/useIsMobile'
import { ArrowUpRight, ArrowDownRight, Info, ChevronLeft, Plus } from 'lucide-react'
import LancarDespesaModal from '../components/features/LancarDespesaModal'
import EditMovementModal from '../components/features/EditMovementModal'
import EditSaidaFixaModal from '../components/features/EditSaidaFixaModal'
import AddSaidaFixaModal from '../components/features/AddSaidaFixaModal'
import type { CaixinhaMovement, SaidaFixa } from '../types'

const HERO_BG = '#001442'

/** Convert hex color + alpha (0-1) to rgba string */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function CaixinhaDetalhe() {
  const { id } = useParams<{ id: string }>()
  const [, navigate] = useLocation()
  const isEssencial = id === 'cx-essencial'
  const [activeTab, setActiveTab] = useState<'custos' | 'lancamentos'>(isEssencial ? 'custos' : 'lancamentos')
  const [searchQuery, setSearchQuery] = useState('')
  const [mvSearchQuery, setMvSearchQuery] = useState('')
  const [groupBy, setGroupBy] = useState<'date' | 'payment'>('date')
  const [despesaOpen, setDespesaOpen] = useState(false)
  const [addSfOpen, setAddSfOpen] = useState(false)

  // Action sheet state
  const [actionItem, setActionItem] = useState<{ type: 'movement' | 'custo'; item: CaixinhaMovement | SaidaFixa } | null>(null)
  // Edit modal state
  const [editMv, setEditMv] = useState<CaixinhaMovement | null>(null)
  const [editSf, setEditSf] = useState<SaidaFixa | null>(null)

  const caixinha = useAppStore(s => s.caixinhas.find(cx => cx.id === id))
  const saidasFixas = useAppStore(useShallow(selectCurrentSaidasFixas))
  const entradas = useAppStore(useShallow(selectCurrentEntradas))
  const editCaixinhaMovement = useAppStore(s => s.editCaixinhaMovement)
  const deleteCaixinhaMovement = useAppStore(s => s.deleteCaixinhaMovement)
  const editSaidaFixa = useAppStore(s => s.editSaidaFixa)
  const deleteSaidaFixa = useAppStore(s => s.deleteSaidaFixa)
  const expectedIncome = useAppStore(s =>
    s.incomeSources
      .filter(src => src.userId === (s.currentUser?.id ?? 'lucas'))
      .reduce((sum, src) => sum + (src.expectedAmount ?? 0), 0)
  )

  const isMobile = useIsMobile()

  if (!caixinha) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', gap: 12 }}>
        <Info size={28} color="var(--color-text-tertiary)" />
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Divisão não encontrada</p>
      </div>
    )
  }

  const { Icon, color } = getCaixinhaIcon(caixinha.id)
  const expectedBal = (caixinha.percentage / 100) * expectedIncome


  // Custos fixos desta divisão
  const custosFixos = useMemo(() =>
    saidasFixas.filter(sf => sf.caixinhaId === id),
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
          .filter(d => d.caixinhaId === id)
          .map(d => ({
            id: `${e.id}-${d.caixinhaId}`,
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

  // All movements (filtered)
  const allMovements = useMemo(() => {
    const sorted = [...(caixinha.movements ?? [])].sort((a, b) => b.date.localeCompare(a.date))
    if (!mvSearchQuery.trim()) return sorted
    const q = mvSearchQuery.toLowerCase()
    return sorted.filter(mv => mv.description.toLowerCase().includes(q))
  }, [caixinha.movements, mvSearchQuery])

  const groupedMovements = useMemo(
    () => groupByMonth(allMovements, mv => mv.date, mv => mv.amount),
    [allMovements],
  )

  const tabs = isEssencial
    ? [
        { key: 'custos' as const, label: 'Custos Fixos', count: custosFixos.length },
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
          <PageHeader title={caixinha.name} back backTo="/caixinhas" bg={HERO_BG} />
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
                Meta: {formatCurrency(expectedBal)} · {caixinha.percentage}% do total
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingTop: 32 }}>
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
            background: hexToRgba(color, 0.09),
          }}>
            <Icon size={18} style={{ color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{caixinha.name}</h1>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>{caixinha.percentage}% da renda</p>
          </div>
        </div>
      )}

      <div style={{ padding: isMobile ? '0 16px' : 0 }}>

      {/* Tabs (only for Essencial) */}
      {isEssencial ? (
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: '2px solid var(--color-border)',
          marginBottom: 16,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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
                    const paid = isPaidThisMonth(sf.paidDates)
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
                            {formatCurrency(sf.amount)} · {getDueDayLabel(sf.dueDay)}
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
                    const paid = isPaidThisMonth(sf.paidDates)
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
                            {formatCurrency(sf.amount)} · {getDueDayLabel(sf.dueDay)}
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
        <div>
          <SearchBar value={mvSearchQuery} onChange={setMvSearchQuery} />
          <div style={{
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}>
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
          bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
          right: 20,
          zIndex: 35,
        }}>
          <button
            onClick={() => activeTab === 'custos' ? setAddSfOpen(true) : setDespesaOpen(true)}
            style={{
              width: 52, height: 52, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: color,
              border: 'none', cursor: 'pointer',
              boxShadow: `0 4px 20px ${hexToRgba(color, 0.35)}`,
              color: 'white',
            }}
            aria-label="Lançar despesa"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Desktop: Button */}
      {!isMobile && (
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
        caixinhaId={caixinha.id}
        caixinhaName={caixinha.name}
      />

      <AddSaidaFixaModal
        open={addSfOpen}
        onClose={() => setAddSfOpen(false)}
        caixinhaId={caixinha.id}
        caixinhaName={caixinha.name}
      />

      {/* Action sheet */}
      <ItemActionSheet
        open={!!actionItem}
        onClose={() => setActionItem(null)}
        title={actionItem?.type === 'custo' ? (actionItem.item as SaidaFixa).name : (actionItem?.item as CaixinhaMovement)?.description ?? ''}
        subtitle={actionItem ? formatCurrency(Math.abs(actionItem.item.amount)) : ''}
        onEdit={() => {
          if (!actionItem) return
          if (actionItem.type === 'custo') setEditSf(actionItem.item as SaidaFixa)
          else setEditMv(actionItem.item as CaixinhaMovement)
        }}
        onDelete={() => {
          if (!actionItem) return
          if (actionItem.type === 'custo') deleteSaidaFixa(actionItem.item.id)
          else deleteCaixinhaMovement(caixinha.id, actionItem.item.id)
        }}
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
          editCaixinhaMovement(caixinha.id, editMv.id, updates)
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
    </div>
  )
}
