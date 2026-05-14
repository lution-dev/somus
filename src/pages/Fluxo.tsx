import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { useNavStore } from '../stores/useNavStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, selectCurrentSaidasFixas, selectCurrentEntradas } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, isPaidForMonth, getDueDayLabel, getDaysUntil, getDaysUntilDate, getEffectiveAmount, getUnpaidMonths } from '../lib/calculations'
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
import { Check, RefreshCw, Plus, Inbox, ArrowUpRight, ArrowDownLeft, CheckCircle2, Pencil, Trash2, XCircle, TrendingUp, AlertCircle, Clock, ChevronDown, Copy, CalendarRange } from 'lucide-react'
import type { SaidaFixa, SaidaVariavel, Entrada } from '../types'
import { FluxoChart } from '../components/features/FluxoChart'

// --- Tipos Locais -------------------------------------------------------------

type FluxoItem =
  | { type: 'fixa';     data: SaidaFixa;     instanceMonth?: string }
  | { type: 'variavel'; data: SaidaVariavel }
  | { type: 'entrada';  data: Entrada }

// --- Componentes de Item ------------------------------------------------------

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'Pix',
  debit: 'Débito',
  credit: 'Crédito',
  cash: 'Dinheiro',
  auto_debit: 'Déb. Auto',
  boleto: 'Boleto',
}

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
        background: paid
          ? 'rgba(239,68,68,0.1)'
          : isOverdue
          ? 'rgba(239,68,68,0.1)'
          : isUrgent
          ? 'rgba(245,158,11,0.1)'
          : 'rgba(148,163,184,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${
          paid      ? 'rgba(239,68,68,0.2)'
          : isOverdue ? 'rgba(239,68,68,0.2)'
          : isUrgent  ? 'rgba(245,158,11,0.2)'
          : 'rgba(148,163,184,0.12)'
        }`
      }}>
        {paid ? (
          <ArrowDownLeft size={18} color="var(--color-danger)" />
        ) : (
          <AlertCircle size={18} color={
            isOverdue ? 'var(--color-danger)'
            : isUrgent ? 'var(--color-warning)'
            : 'var(--color-text-tertiary)'
          } />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 2 }}>
          <span style={{
            fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            textDecoration: paid ? 'line-through' : 'none',
            lineHeight: 1.3
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
          {sf.paymentMethod && (
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
              · {PAYMENT_LABELS[sf.paymentMethod] || sf.paymentMethod}
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
          textDecoration: !isPending ? 'line-through' : 'none',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          lineHeight: 1.3
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
  const isPending = e.status === 'pending'
  const isOverdueEntry = isPending && getDaysUntilDate(e.date) < 0
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
        opacity: isPending ? 1 : 0.85,
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        background: !isPending
          ? 'rgba(16,185,129,0.1)'
          : isOverdueEntry
          ? 'rgba(245,158,11,0.10)'
          : 'rgba(16,185,129,0.08)',
        border: isPending
          ? `1px solid ${isOverdueEntry ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.15)'}`
          : 'none',
      }}>
        {isPending
          ? <Clock size={16} color={isOverdueEntry ? 'var(--color-warning)' : 'var(--color-success)'} style={{ opacity: 0.75 }} />
          : <ArrowUpRight size={16} color="var(--color-success)" />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ 
          fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 2px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          lineHeight: 1.3
        }}>{e.sourceName}</p>
        <p style={{ fontSize: 12, color: isOverdueEntry ? 'var(--color-warning)' : 'var(--color-text-secondary)', margin: 0 }}>
          {isPending
            ? isOverdueEntry
              ? 'Não recebido — '
              : 'Aguardando para '
            : ''}
          {new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </p>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontSize: 15, fontWeight: 700, flexShrink: 0,
          color: isOverdueEntry ? 'var(--color-warning)' : 'var(--color-success)',
          opacity: isPending && !isOverdueEntry ? 0.65 : 1
        }}>
          +{formatCurrency(e.amount)}
        </span>
        {isPending && (
          <div style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid rgba(16,185,129,0.3)', borderRadius: 10,
            background: 'rgba(16,185,129,0.06)',
          }}>
            <Check size={14} color="var(--color-success)" style={{ opacity: 0.7 }} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// --- Fluxo Page ---------------------------------------------------------------

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
  // futureCollapsed is driven by NavStore so FutureHint in Home can open it directly
  const fluxoFutureOpen      = useNavStore(s => s.fluxoFutureOpen)
  const setFluxoFutureOpen   = useNavStore(s => s.setFluxoFutureOpen)
  const fluxoFuturePulse     = useNavStore(s => s.fluxoFuturePulse)
  const futureCollapsed      = !fluxoFutureOpen
  const setFutureCollapsed   = (v: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof v === 'function' ? v(futureCollapsed) : v
    setFluxoFutureOpen(!next)
  }
  const [futureHighlight, setFutureHighlight] = useState(false)
  const futureRef = useRef<HTMLDivElement>(null)
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
  const [confirmPayEntrada, setConfirmPayEntrada]       = useState<Entrada | null>(null)
  // Duplicate state
  const [despesaPrefill, setDespesaPrefill] = useState<{ description?: string; amount?: number; paymentMethod?: string; subcategory?: string; date?: string } | null>(null)
  const [entradaPrefill, setEntradaPrefill] = useState<{ sourceName: string; amount: number; note?: string; date?: string } | null>(null)
  const [dupeDivisaoPicker, setDupeDivisaoPicker] = useState(false)
  const isMobile = useIsMobile()
  const HERO_BG = '#112A5F'
  const [, setNewFixaPrefill] = useState<string | null>(null)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('prefill')
    if (p) {
      const url = new URL(window.location.href)
      url.searchParams.delete('prefill')
      window.history.replaceState({}, '', url.toString())
      setNewFixaPrefill(p)
    }
  }, [])

  // Watch pulse counter: each increment triggers the glow highlight + scroll
  useEffect(() => {
    if (fluxoFuturePulse > 0) {
      setFutureHighlight(true)
      const t = setTimeout(() => setFutureHighlight(false), 2000)
      // Scroll into view after the section expands (brief delay for animation)
      requestAnimationFrame(() => {
        setTimeout(() => {
          futureRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 120)
      })
      return () => clearTimeout(t)
    }
  }, [fluxoFuturePulse])


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

  // Realizadas: só do mês atual. Pendentes: qualquer mês (entradas e despesas agendadas futuras)
  const currentMonthEntradas     = useMemo(() => entradas.filter(e => e.date.startsWith(yearMonth) && e.status !== 'pending'), [entradas, yearMonth])
  const allPendingEntradas        = useMemo(() => entradas.filter(e => e.status === 'pending'), [entradas])
  const currentMonthVariaveis    = useMemo(() => saidasVariaveis.filter(sv => sv.date.startsWith(yearMonth)), [saidasVariaveis, yearMonth])
  // Saídas variáveis pendentes de meses futuros (não estão no currentMonthVariaveis)
  const allPendingSaidasVariaveis = useMemo(() =>
    saidasVariaveis.filter(sv =>
      sv.status === 'pending' &&
      !sv.date.startsWith(yearMonth) &&
      !sv.id.startsWith('sv-fixed-')
    )
  , [saidasVariaveis, yearMonth])

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
      // Saídas variáveis pendentes de meses futuros
      allPendingSaidasVariaveis.forEach(sv => items.push({ type: 'variavel', data: sv }))
    }

    if (filterType === 'all' || filterType === 'entradas') {
      // Realizadas do mês atual
      currentMonthEntradas.forEach(e => items.push({ type: 'entrada', data: e }))
      // Pendentes de qualquer mês (agendamentos futuros)
      allPendingEntradas.forEach(e => items.push({ type: 'entrada', data: e }))
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
  }, [saidasFixas, currentMonthVariaveis, allPendingSaidasVariaveis, currentMonthEntradas, allPendingEntradas, filterType, fluxoSearch, yearMonth])

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
      if (item.type === 'entrada') return (item.data as Entrada).status === 'pending'
      return false
    })
    const realized = unifiedList.filter(item => {
      if (item.type === 'fixa') return isPaidForMonth(item.data, item.instanceMonth || yearMonth)
      if (item.type === 'variavel') return item.data.status !== 'pending'
      if (item.type === 'entrada') return (item.data as Entrada).status !== 'pending'
      return true
    })

    // Função utilitária: verifica se um item pendente é do mês atual ou de um mês futuro
    const isFutureMonth = (item: FluxoItem): boolean => {
      if (item.type === 'fixa') return false // fixas são sempre do contexto mensal atual
      const itemDate = (item.data as SaidaVariavel | Entrada).date
      return !itemDate.startsWith(yearMonth)
    }

    const pendingThisMonth = pending.filter(i => !isFutureMonth(i))
    const pendingFuture    = pending.filter(i => isFutureMonth(i))

    // Agrupar futuros por mês
    const futureByMonth = pendingFuture.reduce<Record<string, FluxoItem[]>>((acc, item) => {
      const itemDate = (item.data as SaidaVariavel | Entrada).date
      const ym = itemDate.slice(0, 7)
      if (!acc[ym]) acc[ym] = []
      acc[ym].push(item)
      return acc
    }, {})
    const futureMonths = Object.keys(futureByMonth).sort()

    return (
      <>
        {pendingThisMonth.length > 0 && (
          <>
            <SectionLabel
              icon={<Clock size={12} />}
              collapsed={pendingCollapsed}
              onClick={() => setPendingCollapsed(v => !v)}
              extra={<StatusBadge status={getPendingStatus(pendingThisMonth)} />}
            >Pendentes</SectionLabel>
            <AnimatePresence initial={false}>
              {!pendingCollapsed && (
                <motion.div
                  key="pending-section"
                  initial={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
                  exit={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  {pendingThisMonth.map((item, i) => {
                    const isLast = i === pendingThisMonth.length - 1 && realized.length === 0 && pendingFuture.length === 0
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
                    if (item.type === 'entrada') {
                      return (
                        <EntradaItem
                          key={`e-${item.data.id}`}
                          e={item.data as Entrada}
                          isLast={isLast}
                          onPress={setActionEntrada}
                        />
                      )
                    }
                    return null
                  })}
                  {/* Ghost link — aparece só quando expandido, após o último item */}
                  <GhostLink href="/relatorios/cx-essencial?from=fluxo" />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* -- Meses Futuros -- */}
        {pendingFuture.length > 0 && (
          <div ref={futureRef}>
            <SectionLabel
              icon={<CalendarRange size={12} />}
              collapsed={futureCollapsed}
              onClick={() => setFutureCollapsed(v => !v)}
              count={pendingFuture.length}
              highlighted={futureHighlight}
            >Meses futuros</SectionLabel>
            <AnimatePresence initial={false}>
              {!futureCollapsed && (
                <motion.div
                  key="future-section"
                  initial={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
                  exit={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  {futureMonths.map(ym => {
                    const monthLabel = new Date(ym + '-15').toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
                    const monthItems = futureByMonth[ym]
                    return (
                      <div key={ym}>
                        {/* Sub-header do mês */}
                        <div style={{
                          padding: '8px 16px 4px',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <p style={{
                            fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
                            textTransform: 'capitalize',
                            color: 'var(--color-text-tertiary)', margin: 0,
                          }}>{monthLabel}</p>
                          <div style={{ flex: 1, height: 1, background: 'var(--color-border)', opacity: 0.5 }} />
                        </div>
                        {/* Itens do mês com opacidade reduzida */}
                        <div style={{ opacity: 0.75 }}>
                          {monthItems.map((item, i) => {
                            const isLast = i === monthItems.length - 1
                            if (item.type === 'variavel') {
                              return <VariavelItem key={`v-${item.data.id}`} sv={item.data as SaidaVariavel} isLast={isLast} onPress={setActionSv} />
                            }
                            if (item.type === 'entrada') {
                              return <EntradaItem key={`e-${item.data.id}`} e={item.data as Entrada} isLast={isLast} onPress={setActionEntrada} />
                            }
                            return null
                          })}
                        </div>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
                <motion.div
                  key="realized-section"
                  initial={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ height: 'auto', opacity: 1, filter: 'blur(0px)' }}
                  exit={{ height: 0, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{ overflow: 'hidden' }}
                >
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
        <>
          <PageHeader 
            title="Fluxo" 
            bg={HERO_BG} 
            rightAction={
              <div style={{ 
                background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: 8,
                fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'capitalize'
              }}>
                {new Date().toLocaleString('pt-BR', { month: 'long' })}
              </div>
            }
          />
          {/* Gradient wrapping FluxoChart — same structure as Home wraps BalanceCard */}
          <div style={{
            background: `linear-gradient(to bottom, ${HERO_BG} 0%, transparent 100%)`,
            padding: '12px 16px 20px',
            overflow: 'hidden',
          }}>
            <FluxoChart 
              paidPct={paidPct} 
              totalFixasPending={totalFixasPending} 
              totalPagoNoMes={totalPagoNoMes} 
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

          <div style={{ paddingTop: 32, marginBottom: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Fluxo de Caixa</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Button variant="secondary" onClick={() => setDivisaoPicker(true)} style={{ color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <ArrowDownLeft size={16} /> Lançar saída
              </Button>
              <Button variant="primary" onClick={() => setLancarOpen(true)}>
                <ArrowUpRight size={16} /> Registrar entrada
              </Button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', textTransform: 'capitalize', margin: 0 }}>{currentMonthLabel}</p>
          </div>

          {/* FluxoChart — desktop */}
          <div style={{ marginBottom: 24, position: 'relative', zIndex: 1 }}>
            <FluxoChart
              paidPct={paidPct}
              totalFixasPending={totalFixasPending}
              totalPagoNoMes={totalPagoNoMes}
            />
          </div>
        </>
      )}


      <div style={{ padding: isMobile ? '0 16px 0' : 0, position: 'relative', zIndex: 1 }}>

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
          <SearchBar value={fluxoSearch} onChange={setFluxoSearch} placeholder="Buscar lançamentos..." />
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
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'white', background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: 8 }}>Registrar entrada</span>
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
                  <Icon size={24} style={{ color }} />
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

      {/* Seletor de divisão para duplicar despesa */}
      <Dialog open={dupeDivisaoPicker} onClose={() => { setDupeDivisaoPicker(false); setDespesaPrefill(null) }} title="Duplicar em qual divisão?" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {divisoes.map(cx => {
            const { Icon, color } = getDivisaoIcon(cx.id)
            return (
              <button key={cx.id} onClick={() => {
                setDupeDivisaoPicker(false)
                setDespesaModal({ divisaoId: cx.id, divisaoName: cx.name })
              }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)', borderRadius: 12, textAlign: 'left' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={24} style={{ color }} />
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
      {/* Duplicate entrada modal — pre-filled, separate from lancarOpen */}
      <LancarEntradaModal
        open={!!entradaPrefill}
        onClose={() => setEntradaPrefill(null)}
        prefill={entradaPrefill ?? undefined}
      />
      {despesaModal && (
        <LancarDespesaModal
          open={!!despesaModal}
          onClose={() => { setDespesaModal(null); setDespesaPrefill(null) }}
          divisaoId={despesaModal.divisaoId}
          divisaoName={despesaModal.divisaoName}
          prefill={despesaPrefill ?? undefined}
        />
      )}

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
          { label: 'Duplicar como variável', icon: Copy, color: 'var(--color-text-secondary)', onClick: () => {
            const amount = getEffectiveAmount(actionSf, yearMonth)
            // Fixa não tem data completa, usar o dia de vencimento no mês atual
            const today = new Date()
            const dueDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(actionSf.dueDay).padStart(2, '0')}`
            setDespesaPrefill({ description: actionSf.name, amount, date: dueDateStr })
            setDupeDivisaoPicker(true)
            setActionSf(null)
          }},
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

      {/* -- Variável: Action Sheet -- */}
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
          { label: 'Duplicar lançamento', icon: Copy, color: 'var(--color-text-secondary)', onClick: () => {
            setDespesaPrefill({
              description: actionSv.description,
              amount: actionSv.amount,
              paymentMethod: actionSv.paymentMethod,
              subcategory: actionSv.subcategory,
              date: actionSv.date,
            })
            setDupeDivisaoPicker(true)
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

      {/* -- Entrada: Action Sheet -- */}
      <ItemActionSheet
        open={!!actionEntrada}
        onClose={() => setActionEntrada(null)}
        title={actionEntrada?.sourceName ?? ''}
        subtitle={actionEntrada ? `+${formatCurrency(actionEntrada.amount)} · ${new Date(actionEntrada.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}` : ''}
        actions={actionEntrada ? [
          ...(actionEntrada.status === 'pending' ? [
            { label: 'Confirmar recebimento', icon: CheckCircle2, color: 'var(--color-success)', onClick: () => { setConfirmPayEntrada(actionEntrada); setActionEntrada(null) } }
          ] : []),
          { label: 'Editar entrada', icon: Pencil, color: 'var(--color-accent-primary)', onClick: () => {
            setSelectedEntrada(actionEntrada)
            setEditEntradaOpen(true)
            setActionEntrada(null)
          }},
          { label: 'Duplicar entrada', icon: Copy, color: 'var(--color-text-secondary)', onClick: () => {
            setEntradaPrefill({
              sourceName: actionEntrada.sourceName,
              amount: actionEntrada.amount,
              note: actionEntrada.note,
              date: actionEntrada.date,
            })
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
        description={selectedEntrada?.status === 'pending'
          ? `Isso removerá o agendamento de recebimento "${selectedEntrada?.sourceName}".`
          : `Isso removerá "${selectedEntrada?.sourceName}" e estornará +R$\u00a0${selectedEntrada ? selectedEntrada.amount.toFixed(2).replace('.', ',') : ''} das divisões.`
        }
        confirmLabel="Excluir"
        variant="danger"
      />

      <ConfirmPaymentModal
        open={!!confirmPayEntrada}
        onClose={() => setConfirmPayEntrada(null)}
        costName={confirmPayEntrada?.sourceName}
        title="Confirmar recebimento"
        onConfirm={(date) => { if (confirmPayEntrada) useAppStore.getState().confirmEntrada(confirmPayEntrada.id, date); setConfirmPayEntrada(null) }}
      />
    </div>
  )
}

// --- Helpers ------------------------------------------------------------------

type PendingStatus =
  | { kind: 'all-good' }
  | { kind: 'upcoming';  count: number }
  | { kind: 'pending';   count: number }
  | { kind: 'overdue';   count: number; pending: number }

function getPendingStatus(pending: FluxoItem[]): PendingStatus {
  if (pending.length === 0) return { kind: 'all-good' }

  const getDays = (item: FluxoItem): number => {
    if (item.type === 'fixa') return getDaysUntil((item.data as SaidaFixa).dueDay)
    if (item.type === 'variavel') return getDaysUntilDate((item.data as SaidaVariavel).date)
    if (item.type === 'entrada') return getDaysUntilDate((item.data as Entrada).date)
    return 999
  }

  const overdue  = pending.filter(i => getDays(i) < 0).length
  const upcoming = pending.filter(i => { const d = getDays(i); return d >= 0 && d <= 3 }).length
  if (overdue > 0)  return { kind: 'overdue', count: overdue, pending: pending.length - overdue }
  if (upcoming > 0) return { kind: 'pending', count: pending.length }
  return { kind: 'upcoming', count: pending.length }
}

function StatusBadge({ status }: { status: PendingStatus }) {
  if (status.kind === 'all-good') return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
      background: 'rgba(16,185,129,0.12)', color: 'var(--color-success)', opacity: 0.8 }}>
      Tudo em dia
    </span>
  )
  if (status.kind === 'upcoming') return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
      background: 'rgba(59,130,246,0.12)', color: 'var(--color-accent-primary)' }}>
      {status.count} {status.count === 1 ? 'próximo' : 'próximos'}
    </span>
  )
  if (status.kind === 'pending') return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
      background: 'rgba(245,158,11,0.15)', color: 'var(--color-warning)' }}>
      {status.count} {status.count === 1 ? 'pendente' : 'pendentes'}
    </span>
  )
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
        background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)' }}>
        {status.count} {status.count === 1 ? 'atrasado' : 'atrasados'}
      </span>
      {status.pending > 0 && (
        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
          background: 'rgba(245,158,11,0.15)', color: 'var(--color-warning)' }}>
          {status.pending} {status.pending === 1 ? 'pendente' : 'pendentes'}
        </span>
      )}
    </span>
  )
}

function SectionLabel({ children, count, icon, onClick, collapsed, extra, highlighted }: {
  children: React.ReactNode
  count?: number
  icon?: React.ReactNode
  onClick?: () => void
  collapsed?: boolean
  extra?: React.ReactNode
  highlighted?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 16px',
        margin: 0,
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: highlighted
          ? 'rgba(96,165,250,0.10)'
          : hovered && onClick ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: highlighted ? 'background 600ms ease' : 'background 150ms ease',
        boxShadow: highlighted ? 'inset 0 0 0 1px rgba(96,165,250,0.25)' : 'none',
      }}
    >
      {icon && <span style={{ color: 'var(--color-text-tertiary)', display: 'flex', transition: 'opacity 150ms ease', opacity: hovered && onClick ? 0.9 : 0.6 }}>{icon}</span>}
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
            transform: collapsed
              ? 'rotate(-90deg)'
              : hovered ? 'rotate(4deg)' : 'rotate(0deg)',
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

function GhostLink({ href }: { href: string }) {
  const [, navigate] = useLocation()
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={(e) => { e.stopPropagation(); navigate(href) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 4,
        padding: '8px 16px 10px',
        cursor: 'pointer',
        transition: 'opacity 150ms ease',
      }}
    >
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        color: 'var(--color-text-tertiary)',
        letterSpacing: '0.01em',
        opacity: hovered ? 0.82 : 0.72,
        transition: 'opacity 150ms ease',
      }}>
        Ver estrutura completa
      </span>
      <span style={{
        fontSize: 11,
        color: 'var(--color-text-tertiary)',
        opacity: hovered ? 1 : 0.88,
        transition: 'opacity 150ms ease, transform 150ms ease',
        transform: hovered ? 'translateX(2px)' : 'translateX(0)',
      }}>→</span>
    </div>
  )
}
