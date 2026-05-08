import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, selectCurrentSaidasFixas, selectCurrentEntradas } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, isPaidThisMonth, getDueDayLabel, getDaysUntil, getEffectiveAmount } from '../lib/calculations'
import LancarEntradaModal from '../components/features/LancarEntradaModal'
import LancarDespesaModal from '../components/features/LancarDespesaModal'
import EditSaidaFixaModal from '../components/features/EditSaidaFixaModal'
import EditMonthlyAmountModal from '../components/features/EditMonthlyAmountModal'
import ConfirmPaymentModal from '../components/features/ConfirmPaymentModal'
import ItemActionSheet from '../components/ui/ItemActionSheet'
import { PageHeader, SearchBar, Dialog, Button } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import { getDivisaoIcon } from '../lib/icons'
import { Check, RefreshCw, Plus, Inbox, ArrowUpRight, ArrowDownLeft, CheckCircle2, Pencil, Trash2, XCircle, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import type { SaidaFixa, SaidaVariavel, Entrada } from '../types'

// ─── Tipos Locais ─────────────────────────────────────────────────────────────

type FluxoItem = 
  | { type: 'fixa'; data: SaidaFixa }
  | { type: 'variavel'; data: SaidaVariavel }
  | { type: 'entrada'; data: Entrada }

// ─── Componentes de Item ──────────────────────────────────────────────────────

function FixaItem({ sf, isLast, onPress, yearMonth }: {
  sf: SaidaFixa
  isLast: boolean
  onPress: (sf: SaidaFixa) => void
  yearMonth: string
}) {
  const markPaid   = useAppStore(s => s.markSaidaFixaPaid)
  const markUnpaid = useAppStore(s => s.markSaidaFixaUnpaid)
  const paid       = isPaidThisMonth(sf.paidDates)
  const today      = new Date().toISOString().slice(0, 10)
  const daysUntil  = getDaysUntil(sf.dueDay)
  const isUrgent   = !paid && daysUntil <= 3 && daysUntil >= 0
  const isOverdue  = !paid && daysUntil < 0
  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(today)
  
  const effectiveAmount = getEffectiveAmount(sf, yearMonth)
  const hasOverride = sf.monthlyAmountOverrides?.[yearMonth] !== undefined

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ background: 'rgba(255, 255, 255, 0.03)' }}
      onClick={() => onPress(sf)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
        opacity: paid ? 0.55 : 1,
        cursor: 'pointer',
        transition: 'opacity 300ms ease',
      }}
    >
      <div style={{ 
        width: 32, height: 32, borderRadius: 10, flexShrink: 0, 
        background: paid ? 'rgba(16,185,129,0.1)' : `${sf.color || 'var(--color-accent-primary)'}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${paid ? 'transparent' : `${sf.color || 'var(--color-accent-primary)'}30`}`
      }}>
        {paid ? (
          <CheckCircle2 size={18} color="var(--color-success)" />
        ) : (
          <AlertCircle size={18} color={isOverdue ? 'var(--color-danger)' : sf.color || 'var(--color-accent-primary)'} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{
            fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textDecoration: paid ? 'line-through' : 'none',
          }}>
            {sf.name}
          </span>
          {hasOverride && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-warning)' }} title="Valor editado este mês" />}
          {sf.autoDebit && (
            <div title="Débito Automático" style={{ display: 'flex', alignItems: 'center', background: 'rgba(59,130,246,0.1)', padding: '2px 4px', borderRadius: 4 }}>
              <RefreshCw size={10} color="var(--color-accent-primary)" />
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            {paid ? 'Pago' : getDueDayLabel(sf.dueDay)}
          </span>
          {!paid && (isUrgent || isOverdue) && (
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '1px 6px', borderRadius: 4,
              background: isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              color: isOverdue ? 'var(--color-danger)' : 'var(--color-warning)',
              display: 'flex', alignItems: 'center', gap: 3
            }}>
              <AlertCircle size={10} />
              {isOverdue ? 'Atrasado' : daysUntil === 0 ? 'Hoje' : `Em ${daysUntil}d`}
            </span>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'right', marginRight: 4 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
          {formatCurrency(effectiveAmount)}
        </p>
      </div>

      {!sf.autoDebit && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (paid) { markUnpaid(sf.id, today) } else { setDateDialogOpen(true) }
            }}
            style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
              background: paid ? 'var(--color-success)' : 'transparent',
              border: `2px solid ${paid ? 'var(--color-success)' : 'var(--color-border)'}`,
              borderRadius: 10, padding: 0,
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Check size={16} strokeWidth={3} color={paid ? 'white' : 'var(--color-text-tertiary)'} />
          </button>

          <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)} title="Data do pagamento" size="sm">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
                  Quando você pagou?
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', fontSize: 14,
                    border: '1px solid var(--color-border)', borderRadius: 8,
                    background: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-sans)', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" fullWidth onClick={() => setDateDialogOpen(false)}>Cancelar</Button>
                <Button variant="primary" fullWidth style={{ background: 'var(--color-success)' }} onClick={() => {
                  markPaid(sf.id, selectedDate)
                  setDateDialogOpen(false)
                }}>Confirmar</Button>
              </div>
            </div>
          </Dialog>
        </>
      )}
      {sf.autoDebit && paid && (
        <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={18} color="var(--color-success)" />
        </div>
      )}
    </motion.div>
  )
}

function VariavelItem({ sv, isLast }: { sv: SaidaVariavel; isLast: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: 'rgba(239,68,68,0.1)',
      }}>
        <ArrowDownLeft size={16} color="var(--color-danger)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 2px' }}>{sv.description}</p>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
          {new Date(sv.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </p>
      </div>
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-danger)', flexShrink: 0 }}>
        -{formatCurrency(sv.amount)}
      </span>
    </motion.div>
  )
}

function EntradaItem({ e, isLast }: { e: Entrada; isLast: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: 'rgba(16,185,129,0.1)',
      }}>
        <ArrowUpRight size={16} color="var(--color-success)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 2px' }}>{e.sourceName}</p>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
          {new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </p>
      </div>
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-success)', flexShrink: 0 }}>
        +{formatCurrency(e.amount)}
      </span>
    </motion.div>
  )
}

// ─── Fluxo Page ───────────────────────────────────────────────────────────────

export default function Fluxo() {
  const [filterType, setFilterType] = useState<'all' | 'saidas' | 'entradas'>('all')
  const [lancarOpen, setLancarOpen] = useState(false)
  const [despesaModal, setDespesaModal] = useState<{ divisaoId: string; divisaoName: string } | null>(null)
  const [divisaoPicker, setDivisaoPicker] = useState(false)
  const [fabOpen, setFabOpen] = useState(false)
  const [fluxoSearch, setFluxoSearch] = useState('')
  const [actionSf, setActionSf] = useState<SaidaFixa | null>(null)
  const [editSf, setEditSf] = useState<SaidaFixa | null>(null)
  const [editMonthlySf, setEditMonthlySf] = useState<SaidaFixa | null>(null)
  const [confirmPaySf, setConfirmPaySf] = useState<SaidaFixa | null>(null)
  const isMobile = useIsMobile()

  const yearMonth = useMemo(() => new Date().toISOString().slice(0, 7), [])

  const saidasFixas      = useAppStore(useShallow(selectCurrentSaidasFixas))
  const entradas         = useAppStore(useShallow(selectCurrentEntradas))
  const saidasVariaveis  = useAppStore(useShallow(s => s.saidasVariaveis))
  const divisoes         = useAppStore(useShallow(s => s.divisoes))
  const markPaid         = useAppStore(s => s.markSaidaFixaPaid)
  const markUnpaid       = useAppStore(s => s.markSaidaFixaUnpaid)
  const editSaidaFixa    = useAppStore(s => s.editSaidaFixa)
  const editMonthly      = useAppStore(s => s.editSaidaFixaForMonth)
  const skipMonthly      = useAppStore(s => s.skipSaidaFixaForMonth)
  const deleteSaidaFixa  = useAppStore(s => s.deleteSaidaFixa)

  // Filtra saídas variáveis e entradas do mês atual
  const currentMonthEntradas = useMemo(() => entradas.filter(e => e.date.startsWith(yearMonth)), [entradas, yearMonth])
  const currentMonthVariaveis = useMemo(() => saidasVariaveis.filter(sv => sv.date.startsWith(yearMonth)), [saidasVariaveis, yearMonth])

  const unifiedList = useMemo(() => {
    const q = fluxoSearch.toLowerCase()
    
    let items: FluxoItem[] = []

    if (filterType === 'all' || filterType === 'saidas') {
      saidasFixas.forEach(sf => {
        const isSkipped = sf.skippedMonths?.includes(yearMonth)
        if (!isSkipped) items.push({ type: 'fixa', data: sf })
      })
      currentMonthVariaveis.forEach(sv => items.push({ type: 'variavel', data: sv }))
    }
    if (filterType === 'all' || filterType === 'entradas') {
      currentMonthEntradas.forEach(e => items.push({ type: 'entrada', data: e }))
    }

    if (q) {
      items = items.filter(item => {
        if (item.type === 'fixa') return item.data.name.toLowerCase().includes(q)
        if (item.type === 'variavel') return item.data.description.toLowerCase().includes(q)
        return item.data.sourceName.toLowerCase().includes(q)
      })
    }

    // Ordenação: Pendentes Primeiro -> Data (mais recente)
    return items.sort((a, b) => {
      // Prioridade 1: Fixas Pendentes no topo
      const aPaid = a.type === 'fixa' ? isPaidThisMonth(a.data.paidDates) : true
      const bPaid = b.type === 'fixa' ? isPaidThisMonth(b.data.paidDates) : true
      
      if (!aPaid && bPaid) return -1
      if (aPaid && !bPaid) return 1

      // Prioridade 2: Ordem cronológica por dia (Fixas usam dueDay, resto usa date)
      const aDay = a.type === 'fixa' ? a.data.dueDay : parseInt(a.data.date.split('-')[2])
      const bDay = b.type === 'fixa' ? b.data.dueDay : parseInt(b.data.date.split('-')[2])
      
      return aDay - bDay
    })
  }, [saidasFixas, currentMonthVariaveis, currentMonthEntradas, filterType, fluxoSearch])

  // Cálculos de resumo
  const nonSkippedFixas = saidasFixas.filter(sf => !sf.skippedMonths?.includes(yearMonth))
  const totalFixasPending = nonSkippedFixas.filter(sf => !isPaidThisMonth(sf.paidDates)).reduce((s, sf) => s + getEffectiveAmount(sf, yearMonth), 0)
  const totalFixasPaid = nonSkippedFixas.filter(sf => isPaidThisMonth(sf.paidDates)).reduce((s, sf) => s + getEffectiveAmount(sf, yearMonth), 0)
  const totalVariaveis = currentMonthVariaveis.reduce((s, sv) => s + sv.amount, 0)
  
  const totalPagoNoMes = totalFixasPaid + totalVariaveis
  const paidPct = Math.round((saidasFixas.filter(sf => isPaidThisMonth(sf.paidDates)).length / (saidasFixas.length || 1)) * 100)

  const currentMonthLabel = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  const renderUnifiedList = () => {
    if (unifiedList.length === 0) {
      return (
        <EmptyState 
          icon={<Inbox size={24} />}
          label="Nenhum lançamento encontrado" 
          desc="Tente mudar os filtros ou adicione novos lançamentos." 
        />
      )
    }

    const pending = unifiedList.filter(item => item.type === 'fixa' && !isPaidThisMonth(item.data.paidDates))
    const realized = unifiedList.filter(item => item.type !== 'fixa' || isPaidThisMonth(item.data.paidDates))

    return (
      <>
        {pending.length > 0 && (
          <>
            <SectionLabel icon={<Clock size={12} />} count={pending.length}>Pendentes</SectionLabel>
            {pending.map((item, i) => (
              <FixaItem key={`f-${item.data.id}`} sf={item.data as SaidaFixa} isLast={i === pending.length - 1 && realized.length === 0} onPress={setActionSf} yearMonth={yearMonth} />
            ))}
          </>
        )}
        
        {realized.length > 0 && (
          <>
            <SectionLabel icon={<TrendingUp size={12} />} count={realized.length}>Lançamentos do mês</SectionLabel>
            {realized.map((item, i) => {
              const isLast = i === realized.length - 1
              if (item.type === 'fixa') return <FixaItem key={`f-${item.data.id}`} sf={item.data as SaidaFixa} isLast={isLast} onPress={setActionSf} yearMonth={yearMonth} />
              if (item.type === 'variavel') return <VariavelItem key={`v-${item.data.id}`} sv={item.data as SaidaVariavel} isLast={isLast} />
              return <EntradaItem key={`e-${item.data.id}`} e={item.data as Entrada} isLast={isLast} />
            })}
          </>
        )}
      </>
    )
  }

  return (
    <div style={{ minHeight: '100%', paddingBottom: isMobile ? 120 : 24 }}>
      {/* Header */}
      {isMobile ? (
        <PageHeader 
          title="Fluxo" 
          bg="#001442" 
          rightAction={
            <div style={{ 
              background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 8,
              fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'capitalize'
            }}>
              {new Date().toLocaleString('pt-BR', { month: 'short' })}
            </div>
          }
        />
      ) : (
        <div style={{ paddingTop: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Fluxo de Caixa</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button variant="secondary" onClick={() => setDivisaoPicker(true)} style={{ color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <ArrowDownLeft size={16} /> Lançar saída
              </Button>
              <Button variant="primary" onClick={() => setLancarOpen(true)}>
                <ArrowUpRight size={16} /> Lançar entrada
              </Button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', textTransform: 'capitalize', margin: 0 }}>{currentMonthLabel}</p>
        </div>
      )}

      <div style={{ padding: isMobile ? '12px 16px 0' : 0 }}>

        {/* Summary Card */}
        <div style={{ 
          background: 'var(--color-bg-secondary)', borderRadius: 16, padding: 20,
          border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p className="section-label" style={{ margin: 0 }}>Progresso do mês</p>
            <span style={{ fontSize: 13, fontWeight: 700, color: paidPct > 0 ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
              {paidPct}% das contas pagas
            </span>
          </div>

          <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 9999, overflow: 'hidden', marginBottom: 16 }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${paidPct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ height: '100%', background: 'var(--color-success)', borderRadius: 9999 }} />
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1, padding: '12px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-danger)', margin: '0 0 4px', textTransform: 'uppercase' }}>A pagar (fixas)</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{formatCurrency(totalFixasPending)}</p>
            </div>
            <div style={{ flex: 1, padding: '12px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-success)', margin: '0 0 4px', textTransform: 'uppercase' }}>Pago este mês</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{formatCurrency(totalPagoNoMes)}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, marginBottom: 16, alignItems: isMobile ? 'flex-start' : 'center' }}>
          {/* Segmented control tab bar */}
          <div style={{
            display: 'inline-flex',
            height: 44,
            padding: 4,
            background: 'var(--color-bg-secondary)',
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            alignItems: 'center',
            flexShrink: 0,
            alignSelf: 'flex-start',
          }}>
            {(['all', 'saidas', 'entradas'] as const).map(f => {
              const isActive = filterType === f
              return (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  style={{
                    height: '100%',
                    padding: '0 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    whiteSpace: 'nowrap',
                    transition: 'all 150ms ease',
                    border: isActive ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
                    background: isActive ? 'var(--color-accent-primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--color-text-tertiary)',
                    boxShadow: isActive ? '0 2px 8px rgba(59,130,246,0.35)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--color-text-secondary)'; if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--color-text-tertiary)'; if (!isActive) e.currentTarget.style.background = 'transparent' }}
                >
                  {f === 'all' ? 'Tudo' : f === 'saidas' ? 'Saídas' : 'Entradas'}
                </button>
              )
            })}
          </div>
          <div style={{ width: '100%' }}>
            <SearchBar value={fluxoSearch} onChange={setFluxoSearch} placeholder="Procurar no fluxo..." />
          </div>
        </div>

        {/* List */}
        <div style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          {renderUnifiedList()}
        </div>
      </div>

      {/* FAB Mobile */}
      {isMobile && (
        <>
          {fabOpen && <div onClick={() => setFabOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 34, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }} />}
          <div style={{ position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))', right: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, zIndex: 35 }}>
            <AnimatePresence>
              {fabOpen && (
                <>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'white', background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: 8 }}>Lançar saída</span>
                    <button onClick={() => { setFabOpen(false); setDivisaoPicker(true) }} style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--color-danger)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                      <ArrowDownLeft size={20} strokeWidth={2.5} />
                    </button>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'white', background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: 8 }}>Lançar entrada</span>
                    <button onClick={() => { setFabOpen(false); setLancarOpen(true) }} style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--color-success)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                      <ArrowUpRight size={20} strokeWidth={2.5} />
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            <motion.button onClick={() => setFabOpen(v => !v)} animate={{ rotate: fabOpen ? 45 : 0 }} style={{ width: 52, height: 52, borderRadius: 16, background: fabOpen ? 'var(--color-bg-tertiary)' : 'var(--color-accent-primary)', border: 'none', color: 'white', boxShadow: '0 4px 20px rgba(59,130,246,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Plus size={22} strokeWidth={2.5} />
            </motion.button>
          </div>
        </>
      )}

      {/* Modals */}
      <Dialog open={divisaoPicker} onClose={() => setDivisaoPicker(false)} title="Qual divisão?" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {divisoes.map(cx => {
            const { Icon, color } = getDivisaoIcon(cx.id)
            return (
              <button key={cx.id} onClick={() => { setDivisaoPicker(false); setDespesaModal({ divisaoId: cx.id, divisaoName: cx.name }) }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 12, textAlign: 'left' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{cx.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>{cx.percentage}% · {formatCurrency(cx.balance)}</p>
                </div>
              </button>
            )
          })}
        </div>
      </Dialog>

      <LancarEntradaModal open={lancarOpen} onClose={() => setLancarOpen(false)} />
      {despesaModal && <LancarDespesaModal open={!!despesaModal} onClose={() => setDespesaModal(null)} divisaoId={despesaModal.divisaoId} divisaoName={despesaModal.divisaoName} />}

      <ItemActionSheet
        open={!!actionSf}
        onClose={() => setActionSf(null)}
        title={actionSf?.name ?? ''}
        subtitle={actionSf ? formatCurrency(getEffectiveAmount(actionSf, yearMonth)) + ' · Dia ' + actionSf.dueDay : ''}
        actions={actionSf ? [
          ...(isPaidThisMonth(actionSf.paidDates)
            ? [{ label: 'Desmarcar pagamento', icon: XCircle, color: 'var(--color-warning)', onClick: () => { markUnpaid(actionSf.id, new Date().toISOString().slice(0, 10)) } }]
            : [
                { label: 'Marcar como pago', icon: CheckCircle2, color: 'var(--color-success)', onClick: () => { setConfirmPaySf(actionSf) } },
                { label: 'Pular este mês', icon: XCircle, color: 'var(--color-warning)', onClick: () => { if (confirm('Pular o pagamento de ' + actionSf.name + ' este mês?')) skipMonthly(actionSf.id, yearMonth); setActionSf(null) } }
              ]
          ),
          { label: 'Editar valor deste mês', icon: TrendingUp, color: 'var(--color-accent-blue-light)', onClick: () => setEditMonthlySf(actionSf) },
          { label: 'Editar custo fixo base', icon: Pencil, color: 'var(--color-accent-primary)', onClick: () => setEditSf(actionSf) },
          { label: 'Excluir permanentemente', icon: Trash2, color: 'var(--color-danger)', onClick: () => { if (confirm('Excluir ' + actionSf.name + ' de TODOS os meses?')) deleteSaidaFixa(actionSf.id) } },
        ] : []}
      />

      {editMonthlySf && (
        <EditMonthlyAmountModal
          open={!!editMonthlySf}
          onClose={() => setEditMonthlySf(null)}
          saidaFixa={editMonthlySf}
          yearMonth={yearMonth}
          onSave={(ym, amt) => { editMonthly(editMonthlySf.id, ym, amt); setEditMonthlySf(null) }}
        />
      )}

      {editSf && (
        <EditSaidaFixaModal
          open={!!editSf}
          onClose={() => setEditSf(null)}
          saidaFixa={editSf}
          onSave={(data) => { editSaidaFixa(editSf.id, data); setEditSf(null) }}
        />
      )}

      <ConfirmPaymentModal
        open={!!confirmPaySf}
        onClose={() => setConfirmPaySf(null)}
        costName={confirmPaySf?.name}
        onConfirm={(date) => { if (confirmPaySf) markPaid(confirmPaySf.id, date) }}
      />
    </div>
  )
}

function SectionLabel({ children, count, icon }: { children: React.ReactNode; count?: number; icon?: React.ReactNode }) {
  return (
    <div
      style={{ 
        padding: '12px 16px', 
        margin: 0, 
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(255,255,255,0.02)'
      }}
    >
      {icon && <span style={{ color: 'var(--color-text-tertiary)', display: 'flex' }}>{icon}</span>}
      <p className="section-label" style={{ margin: 0, flex: 1 }}>
        {children}
      </p>
      {count !== undefined && (
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--color-text-tertiary)',
          padding: '2px 6px',
          borderRadius: 6,
        }}>
          {count}
        </span>
      )}
    </div>
  )
}

function EmptyState({ icon, label, desc }: { icon?: React.ReactNode; label: string; desc?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12 }}>
      {icon && <div style={{ width: 56, height: 56, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-secondary)', color: 'var(--color-text-tertiary)' }}>{icon}</div>}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>{label}</p>
        {desc && <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5, maxWidth: 260 }}>{desc}</p>}
      </div>
    </div>
  )
}
