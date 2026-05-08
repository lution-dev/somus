import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, selectCurrentSaidasFixas, selectCurrentEntradas } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, isPaidForMonth, getDueDayLabel, getDaysUntil, getEffectiveAmount, getUnpaidMonths } from '../lib/calculations'
import LancarEntradaModal from '../components/features/LancarEntradaModal'
import LancarDespesaModal from '../components/features/LancarDespesaModal'
import EditSaidaFixaModal from '../components/features/EditSaidaFixaModal'
import EditMonthlyAmountModal from '../components/features/EditMonthlyAmountModal'
import ConfirmPaymentModal from '../components/features/ConfirmPaymentModal'
import EditSaidaVariavelModal from '../components/features/EditSaidaVariavelModal'
import EditEntradaModal from '../components/features/EditEntradaModal'
import ItemActionSheet from '../components/ui/ItemActionSheet'
import { PageHeader, SearchBar, Dialog, Button, ConfirmDialog } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import { getDivisaoIcon } from '../lib/icons'
import { Check, RefreshCw, Plus, Inbox, ArrowUpRight, ArrowDownLeft, CheckCircle2, Pencil, Trash2, XCircle, TrendingUp, AlertCircle, Clock, ChevronDown } from 'lucide-react'
import type { SaidaFixa, SaidaVariavel, Entrada } from '../types'
import { FluxoChart } from '../components/features/FluxoChart'

// ─── Tipos Locais ─────────────────────────────────────────────────────────────

type FluxoItem =
  | { type: 'fixa';     data: SaidaFixa;     instanceMonth?: string }
  | { type: 'variavel'; data: SaidaVariavel }
  | { type: 'entrada';  data: Entrada }

// ─── Componentes de Item ──────────────────────────────────────────────────────

function FixaItem({ sf, isLast, onPress, yearMonth }: {
  sf: SaidaFixa
  isLast: boolean
  onPress: (sf: SaidaFixa) => void
  yearMonth: string
}) {
  const paid       = isPaidForMonth(sf, yearMonth)
  const isPastMonth = yearMonth < new Date().toISOString().slice(0, 7)
  const daysUntil  = getDaysUntil(sf.dueDay)
  const isUrgent   = !paid && !isPastMonth && daysUntil <= 3 && daysUntil >= 0
  const isOverdue  = !paid && (isPastMonth || daysUntil < 0)
  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  const isMobile = useIsMobile()
  
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
        background: paid ? 'rgba(239,68,68,0.1)' : `${sf.color || 'var(--color-accent-primary)'}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${paid ? 'rgba(239,68,68,0.2)' : `${sf.color || 'var(--color-accent-primary)'}30`}`
      }}>
        {paid ? (
          <ArrowDownLeft size={18} color="var(--color-danger)" />
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
              {isOverdue ? (isPastMonth ? `Atrasado · ${new Date(yearMonth + '-01T12:00:00').toLocaleString('pt-BR', { month: 'long' })}` : 'Atrasado') : daysUntil === 0 ? 'Hoje' : `Em ${daysUntil}d`}
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
        isMobile ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (paid) {
                useAppStore.getState().markSaidaFixaUnpaid(sf.id, yearMonth)
              } else {
                setDateDialogOpen(true)
              }
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
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (paid) {
                useAppStore.getState().markSaidaFixaUnpaid(sf.id, yearMonth)
              } else {
                setDateDialogOpen(true)
              }
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              background: paid ? 'rgba(16,185,129,0.1)' : 'var(--color-bg-primary)',
              color: paid ? 'var(--color-success)' : 'var(--color-text-secondary)',
              border: paid ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--color-border)',
              cursor: 'pointer',
            }}
          >
            {paid ? 'Pago' : 'Marcar pago'}
          </button>
        )
      )}

      <ConfirmPaymentModal
        open={dateDialogOpen}
        onClose={() => setDateDialogOpen(false)}
        costName={sf.name}
        onConfirm={(date) => {
          useAppStore.getState().markSaidaFixaPaid(sf.id, date, yearMonth)
          setDateDialogOpen(false)
        }}
      />
      {sf.autoDebit && paid && (
        <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={18} color="var(--color-success)" />
        </div>
      )}
    </motion.div>
  )
}

function VariavelItem({ sv, isLast, onPress }: { sv: SaidaVariavel; isLast: boolean; onPress: (sv: SaidaVariavel) => void }) {
  const isPending = sv.status === 'pending'
  const isMobile = useIsMobile()

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ background: 'rgba(255,255,255,0.03)' }}
      onClick={() => onPress(sv)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
        cursor: 'pointer',
        opacity: isPending ? 1 : 0.55,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: isPending ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
      }}>
        {isPending ? <AlertCircle size={16} color="var(--color-warning)" /> : <ArrowDownLeft size={16} color="var(--color-danger)" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ 
          fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 2px',
          textDecoration: !isPending ? 'line-through' : 'none'
        }}>{sv.description}</p>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
          {isPending ? 'Agendado para ' : ''}
          {new Date(sv.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </p>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: isPending ? 'var(--color-text-primary)' : 'var(--color-danger)', flexShrink: 0 }}>
          -{formatCurrency(sv.amount)}
        </span>
        
        {isPending && (
          isMobile ? (
            <div style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid var(--color-border)', borderRadius: 10,
            }}>
              <Check size={16} color="var(--color-text-tertiary)" />
            </div>
          ) : (
            <div style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}>
              Confirmar
            </div>
          )
        )}
      </div>
    </motion.div>
  )
}

function EntradaItem({ e, isLast, onPress }: { e: Entrada; isLast: boolean; onPress: (e: Entrada) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ background: 'rgba(255,255,255,0.03)' }}
      onClick={() => onPress(e)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
        cursor: 'pointer',
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
  const [pendingCollapsed, setPendingCollapsed] = useState(false)
  const [realizedCollapsed, setRealizedCollapsed] = useState(false)
  const [confirmSkipSf, setConfirmSkipSf] = useState<SaidaFixa | null>(null)
  const [confirmDeleteSf, setConfirmDeleteSf] = useState<SaidaFixa | null>(null)
  const [actionSv, setActionSv] = useState<SaidaVariavel | null>(null)
  const [selectedSv, setSelectedSv] = useState<SaidaVariavel | null>(null)  // mantém referência durante edit/delete
  const [editSvOpen, setEditSvOpen] = useState(false)
  const [confirmDeleteSv, setConfirmDeleteSv] = useState(false)
  const [confirmPaySv, setConfirmPaySv] = useState<SaidaVariavel | null>(null)
  const [actionEntrada, setActionEntrada]               = useState<Entrada | null>(null)
  const [selectedEntrada, setSelectedEntrada]           = useState<Entrada | null>(null)
  const [editEntradaOpen, setEditEntradaOpen]           = useState(false)
  const [confirmDeleteEntrada, setConfirmDeleteEntrada] = useState(false)
  const isMobile = useIsMobile()

  const yearMonth = useMemo(() => new Date().toISOString().slice(0, 7), [])

  const saidasFixas      = useAppStore(useShallow(selectCurrentSaidasFixas))
  const entradas         = useAppStore(useShallow(selectCurrentEntradas))
  const saidasVariaveis  = useAppStore(useShallow(s => s.saidasVariaveis))
  const divisoes         = useAppStore(useShallow(s => s.divisoes))
  const markPaid         = useAppStore(s => s.markSaidaFixaPaid)
  const editSaidaFixa    = useAppStore(s => s.editSaidaFixa)
  const editMonthly      = useAppStore(s => s.editSaidaFixaForMonth)
  const skipMonthly      = useAppStore(s => s.skipSaidaFixaForMonth)
  const deleteSaidaFixa  = useAppStore(s => s.deleteSaidaFixa)
  const deleteSaidaVariavel  = useAppStore(s => s.deleteSaidaVariavel)
  const deleteEntrada        = useAppStore(s => s.deleteEntrada)

  // Filtra saídas variáveis e entradas do mês atual
  const currentMonthEntradas = useMemo(() => entradas.filter(e => e.date.startsWith(yearMonth)), [entradas, yearMonth])
  const currentMonthVariaveis = useMemo(() => saidasVariaveis.filter(sv => sv.date.startsWith(yearMonth)), [saidasVariaveis, yearMonth])

  const unifiedList = useMemo(() => {
    const q = fluxoSearch.toLowerCase()
    let items: FluxoItem[] = []

    if (filterType === 'all' || filterType === 'saidas') {
      saidasFixas.forEach(sf => {
        // Pendentes: todos os meses não pagos até o atual
        const unpaidMonths = getUnpaidMonths(sf, yearMonth)
        unpaidMonths.forEach(m => items.push({ type: 'fixa', data: sf, instanceMonth: m }))

        // Realizados: pago neste mês
        if (isPaidForMonth(sf, yearMonth)) {
          items.push({ type: 'fixa', data: sf, instanceMonth: yearMonth })
        }
      })

      // Despesas variáveis manuais (exclui as geradas automaticamente por custos fixos)
      currentMonthVariaveis.forEach(sv => {
        if (!sv.id.startsWith('sv-fixed-')) {
          items.push({ type: 'variavel', data: sv })
        }
      })
    }

    if (filterType === 'all' || filterType === 'entradas') {
      currentMonthEntradas.forEach(e => items.push({ type: 'entrada', data: e }))
    }

    if (q) {
      items = items.filter(item => {
        if (item.type === 'fixa')     return item.data.name.toLowerCase().includes(q)
        if (item.type === 'variavel') return item.data.description.toLowerCase().includes(q)
        return item.data.sourceName.toLowerCase().includes(q)
      })
    }

    // Ordenação: pendentes primeiro; pagos por data desc (mais recente no topo)
    items.sort((a, b) => {
      const aPaid = a.type === 'fixa' 
        ? isPaidForMonth(a.data, a.instanceMonth || yearMonth) 
        : (a.type === 'variavel' ? a.data.status !== 'pending' : true)
      
      const bPaid = b.type === 'fixa' 
        ? isPaidForMonth(b.data, b.instanceMonth || yearMonth) 
        : (b.type === 'variavel' ? b.data.status !== 'pending' : true)
      
      if (!aPaid && bPaid)  return -1
      if (aPaid  && !bPaid) return 1
      
      const aDay = a.type === 'fixa' ? a.data.dueDay : parseInt(a.data.date.split('-')[2])
      const bDay = b.type === 'fixa' ? b.data.dueDay : parseInt(b.data.date.split('-')[2])
      
      if (aPaid && bPaid) return bDay - aDay  // pagos: mais recentes primeiro
      return aDay - bDay                      // pendentes: mais próximos primeiro
    })

    return items
  }, [saidasFixas, currentMonthVariaveis, currentMonthEntradas, filterType, fluxoSearch, yearMonth])

  // Cálculos de resumo
  const nonSkippedFixas = saidasFixas.filter(sf => !sf.skippedMonths?.includes(yearMonth))
  const totalFixasPending = nonSkippedFixas.filter(sf => !isPaidForMonth(sf, yearMonth)).reduce((s, sf) => s + getEffectiveAmount(sf, yearMonth), 0)
  const totalFixasPaid = nonSkippedFixas.filter(sf => isPaidForMonth(sf, yearMonth)).reduce((s, sf) => s + getEffectiveAmount(sf, yearMonth), 0)
  const totalVariaveis = currentMonthVariaveis.reduce((s, sv) => s + sv.amount, 0)
  
  const totalPagoNoMes = totalFixasPaid + totalVariaveis
  const paidPct = Math.round((saidasFixas.filter(sf => isPaidForMonth(sf, yearMonth)).length / (saidasFixas.length || 1)) * 100)

  const currentMonthLabel = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  const renderUnifiedList = () => {
    if (unifiedList.length === 0) return <EmptyState icon={<Inbox size={24} />} label="Nenhum lançamento encontrado" desc="Tente mudar os filtros ou adicione novos lançamentos." />

    const pending  = unifiedList.filter(item => {
      if (item.type === 'fixa') return !isPaidForMonth(item.data, item.instanceMonth || yearMonth)
      if (item.type === 'variavel') return item.data.status === 'pending'
      return false
    })
    const realized = unifiedList.filter(item => {
      if (item.type === 'fixa') return isPaidForMonth(item.data, item.instanceMonth || yearMonth)
      if (item.type === 'variavel') return item.data.status !== 'pending'
      return item.type === 'entrada'
    })

    return (
      <>
        {pending.length > 0 && (
          <>
            <SectionLabel
              icon={<Clock size={12} />}
              count={pending.length}
              collapsed={pendingCollapsed}
              onClick={() => setPendingCollapsed(v => !v)}
              extra={pendingCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {(() => {
                    const ov = pending.filter(item => getDaysUntil((item.data as SaidaFixa).dueDay) < 0).length
                    const pd = pending.length - ov
                    return (
                      <>
                        {ov > 0 && (
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)',
                            padding: '2px 7px', borderRadius: 8,
                          }}>
                            {ov} atrasad{ov === 1 ? 'o' : 'os'}
                          </span>
                        )}
                        {pd > 0 && (
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            background: 'rgba(245,158,11,0.15)', color: 'var(--color-warning)',
                            padding: '2px 7px', borderRadius: 8,
                          }}>
                            {pd} pendente{pd === 1 ? '' : 's'}
                          </span>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
            >Pendentes</SectionLabel>
            <AnimatePresence initial={false}>
              {!pendingCollapsed && (
                <motion.div key="pending-section" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                  {pending.map((item, i) => {
                    const isLast = i === pending.length - 1 && realized.length === 0
                    if (item.type === 'fixa') {
                      return (
                        <FixaItem 
                          key={`${item.data.id}-${item.instanceMonth}`} 
                          sf={item.data} 
                          yearMonth={item.instanceMonth || yearMonth} 
                          isLast={isLast} 
                          onPress={setActionSf} 
                        />
                      )
                    }
                    if (item.type === 'variavel') {
                      return (
                        <VariavelItem 
                          key={`v-${item.data.id}`} 
                          sv={item.data as SaidaVariavel} 
                          isLast={isLast} 
                          onPress={setActionSv} 
                        />
                      )
                    }
                    return null
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {realized.length > 0 && (
          <>
            <SectionLabel
              icon={<TrendingUp size={12} />}
              count={realized.length}
              collapsed={realizedCollapsed}
              onClick={() => setRealizedCollapsed(v => !v)}
            >Lançamentos do mês</SectionLabel>
            <AnimatePresence initial={false}>
              {!realizedCollapsed && (
                <motion.div key="realized-section" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                  {realized.map((item, i) => {
                    const isLast = i === realized.length - 1
                    if (item.type === 'fixa') {
                      return (
                        <FixaItem 
                          key={`${item.data.id}-${item.instanceMonth}`} 
                          sf={item.data} 
                          yearMonth={item.instanceMonth || yearMonth} 
                          isLast={isLast} 
                          onPress={setActionSf} 
                        />
                      )
                    }
                    if (item.type === 'variavel') {
                      return <VariavelItem key={`v-${item.data.id}`} sv={item.data as SaidaVariavel} isLast={isLast} onPress={setActionSv} />
                    }
                    if (item.type === 'entrada') {
                      return <EntradaItem key={`e-${item.data.id}`} e={item.data as Entrada} isLast={isLast} onPress={setActionEntrada} />
                    }
                    return null
                  })}
                </motion.div>
              )}
            </AnimatePresence>
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
              {new Date().toLocaleString('pt-BR', { month: 'long' })}
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

      {/* Gradient hero bleed — mobile only */}
      {isMobile && (
        <div style={{
          height: 80,
          marginTop: -1,
          background: 'linear-gradient(to bottom, #001442CC 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      )}
      {/* Gradient hero bleed — mobile only */}
      {isMobile && (
        <div style={{
          height: 80, marginTop: -1,
          background: 'linear-gradient(to bottom, #001442CC 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ padding: isMobile ? '12px 16px 0' : 0 }}>
        <FluxoChart 
          paidPct={paidPct} 
          totalFixasPending={totalFixasPending} 
          totalPagoNoMes={totalPagoNoMes} 
        />

        {/* List header with contextual title + filter chips */}
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
            transition: 'color 200ms ease',
          }}>
            {filterType === 'saidas' ? 'Saídas' : filterType === 'entradas' ? 'Entradas' : 'Lançamentos'}
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setFilterType(f => f === 'saidas' ? 'all' : 'saidas')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 8,
                fontSize: 11, fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                border: filterType === 'saidas' ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--color-border)',
                background: filterType === 'saidas' ? 'rgba(239,68,68,0.12)' : 'var(--color-bg-secondary)',
                color: filterType === 'saidas' ? 'var(--color-danger)' : 'var(--color-text-tertiary)',
              }}
            >
              <ArrowDownLeft size={11} strokeWidth={2.5} />
              Saídas
            </button>
            <button
              onClick={() => setFilterType(f => f === 'entradas' ? 'all' : 'entradas')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 8,
                fontSize: 11, fontWeight: 700,
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                border: filterType === 'entradas' ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--color-border)',
                background: filterType === 'entradas' ? 'rgba(16,185,129,0.1)' : 'var(--color-bg-secondary)',
                color: filterType === 'entradas' ? 'var(--color-success)' : 'var(--color-text-tertiary)',
              }}
            >
              <ArrowUpRight size={11} strokeWidth={2.5} />
              Entradas
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 12 }}>
          <SearchBar value={fluxoSearch} onChange={setFluxoSearch} placeholder="Procurar no fluxo..." />
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
          ...(isPaidForMonth(actionSf, yearMonth)
            ? [{ label: 'Desmarcar pagamento', icon: XCircle, color: 'var(--color-warning)', onClick: () => { useAppStore.getState().markSaidaFixaUnpaid(actionSf.id, yearMonth) } }]
            : [
                { label: 'Marcar como pago', icon: CheckCircle2, color: 'var(--color-success)', onClick: () => { setConfirmPaySf(actionSf) } },
                { label: 'Pular este mês', icon: XCircle, color: 'var(--color-warning)', onClick: () => { setConfirmSkipSf(actionSf); setActionSf(null) } }
              ]
          ),
          { label: 'Editar valor deste mês', icon: TrendingUp, color: 'var(--color-accent-blue-light)', onClick: () => { setEditMonthlySf(actionSf); setActionSf(null) } },
          { label: 'Editar custo fixo base', icon: Pencil, color: 'var(--color-accent-primary)', onClick: () => { setEditSf(actionSf); setActionSf(null) } },
          { label: 'Excluir permanentemente', icon: Trash2, color: 'var(--color-danger)', onClick: () => { setConfirmDeleteSf(actionSf); setActionSf(null) } },
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
        onConfirm={(date) => { if (confirmPaySf) markPaid(confirmPaySf.id, date, yearMonth) }}
      />

      <ConfirmDialog
        open={!!confirmSkipSf}
        onClose={() => setConfirmSkipSf(null)}
        onConfirm={() => { if (confirmSkipSf) skipMonthly(confirmSkipSf.id, yearMonth) }}
        title="Pular este mês?"
        description={`O custo "${confirmSkipSf?.name}" não será cobrado este mês, mas continuará aparecendo nos próximos.`}
        confirmLabel="Pular mês"
        variant="warning"
      />

      <ConfirmDialog
        open={!!confirmDeleteSf}
        onClose={() => setConfirmDeleteSf(null)}
        onConfirm={() => { if (confirmDeleteSf) deleteSaidaFixa(confirmDeleteSf.id) }}
        title="Excluir permanentemente?"
        description={`Isso removerá o custo "${confirmDeleteSf?.name}" de TODOS os meses passados e futuros. Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir custo"
        variant="danger"
      />

      {/* ── Variável: Action Sheet ── */}
      <ItemActionSheet
        open={!!actionSv}
        onClose={() => setActionSv(null)}
        title={actionSv?.description ?? ''}
        subtitle={actionSv ? `-${formatCurrency(actionSv.amount)} · ${new Date(actionSv.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}` : ''}
        actions={actionSv ? [
          ...(actionSv.status === 'pending' ? [
            { label: 'Confirmar pagamento', icon: CheckCircle2, color: 'var(--color-success)', onClick: () => { setConfirmPaySv(actionSv); setActionSv(null) } }
          ] : []),
          { label: 'Editar lançamento', icon: Pencil, color: 'var(--color-accent-primary)', onClick: () => {
            setSelectedSv(actionSv)
            setEditSvOpen(true)
            setActionSv(null)
          }},
          { label: 'Excluir lançamento', icon: Trash2, color: 'var(--color-danger)', onClick: () => {
            setSelectedSv(actionSv)
            setConfirmDeleteSv(true)
            setActionSv(null)
          }},
        ] : []}
      />

      <EditSaidaVariavelModal
        open={editSvOpen}
        onClose={() => { setEditSvOpen(false); setSelectedSv(null) }}
        saidaVariavel={selectedSv}
      />

      <ConfirmPaymentModal
        open={!!confirmPaySv}
        onClose={() => setConfirmPaySv(null)}
        costName={confirmPaySv?.description}
        onConfirm={(date) => { if (confirmPaySv) useAppStore.getState().confirmSaidaVariavel(confirmPaySv.id, date); setConfirmPaySv(null) }}
      />

      <ConfirmDialog
        open={confirmDeleteSv}
        onClose={() => setConfirmDeleteSv(false)}
        onConfirm={() => { if (selectedSv) { deleteSaidaVariavel(selectedSv.id); setSelectedSv(null) } }}
        title="Excluir lançamento?"
        description={selectedSv?.status === 'pending' 
          ? `Isso removerá o agendamento "${selectedSv?.description}".`
          : `Isso removerá "${selectedSv?.description}" e estornará R$\u00a0${selectedSv ? selectedSv.amount.toFixed(2).replace('.', ',') : ''} no saldo da divisão.`
        }
        confirmLabel="Excluir"
        variant="danger"
      />

      {/* ── Entrada: Action Sheet ── */}
      <ItemActionSheet
        open={!!actionEntrada}
        onClose={() => setActionEntrada(null)}
        title={actionEntrada?.sourceName ?? ''}
        subtitle={actionEntrada ? `+${formatCurrency(actionEntrada.amount)} · ${new Date(actionEntrada.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}` : ''}
        actions={actionEntrada ? [
          { label: 'Editar entrada', icon: Pencil, color: 'var(--color-success)', onClick: () => {
            setSelectedEntrada(actionEntrada)
            setEditEntradaOpen(true)
            setActionEntrada(null)
          }},
          { label: 'Excluir entrada', icon: Trash2, color: 'var(--color-danger)', onClick: () => {
            setSelectedEntrada(actionEntrada)
            setConfirmDeleteEntrada(true)
            setActionEntrada(null)
          }},
        ] : []}
      />

      <EditEntradaModal
        open={editEntradaOpen}
        onClose={() => { setEditEntradaOpen(false); setSelectedEntrada(null) }}
        entrada={selectedEntrada}
      />

      <ConfirmDialog
        open={confirmDeleteEntrada}
        onClose={() => setConfirmDeleteEntrada(false)}
        onConfirm={() => { if (selectedEntrada) { deleteEntrada(selectedEntrada.id); setSelectedEntrada(null) } }}
        title="Excluir entrada?"
        description={`Isso removerá "${selectedEntrada?.sourceName}" e estornará +R$\u00a0${selectedEntrada ? selectedEntrada.amount.toFixed(2).replace('.', ',') : ''} das divisões.`}
        confirmLabel="Excluir"
        variant="danger"
      />
    </div>
  )
}

function SectionLabel({ children, count, icon, onClick, collapsed, extra }: {
  children: React.ReactNode
  count?: number
  icon?: React.ReactNode
  onClick?: () => void
  collapsed?: boolean
  extra?: React.ReactNode
}) {
  return (
    <div
      onClick={onClick}
      style={{ 
        padding: '10px 16px', 
        margin: 0, 
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(255,255,255,0.02)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      {icon && <span style={{ color: 'var(--color-text-tertiary)', display: 'flex' }}>{icon}</span>}
      <p className="section-label" style={{ margin: 0, flex: 1 }}>
        {children}
      </p>
      {extra}
      {(count !== undefined && !extra) && (
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
      {onClick && (
        <ChevronDown
          size={13}
          color="var(--color-text-tertiary)"
          style={{
            transition: 'transform 200ms ease',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        />
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
