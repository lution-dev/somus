import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore, selectCurrentSaidasFixas, selectCurrentEntradas } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency, isPaidThisMonth, getDueDayLabel, getDaysUntil } from '../lib/calculations'
import LancarEntradaModal from '../components/features/LancarEntradaModal'
import EditSaidaFixaModal from '../components/features/EditSaidaFixaModal'
import ItemActionSheet from '../components/ui/ItemActionSheet'
import { PageHeader, SearchBar, groupByMonth, MonthHeader } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import { Check, RefreshCw, Plus, Inbox, ArrowUpRight, CheckCircle2, Pencil, Trash2, XCircle, TrendingUp, AlertCircle } from 'lucide-react'
import type { SaidaFixa } from '../types'

// ─── Item de Saída ────────────────────────────────────────────────────────────

function SaidaItem({ sf, isLast, onPress }: {
  sf: ReturnType<typeof selectCurrentSaidasFixas>[0]
  isLast: boolean
  onPress: (sf: SaidaFixa) => void
}) {
  const markPaid   = useAppStore(s => s.markSaidaFixaPaid)
  const markUnpaid = useAppStore(s => s.markSaidaFixaUnpaid)
  const paid       = isPaidThisMonth(sf.paidDates)
  const today      = new Date().toISOString().slice(0, 10)
  const daysUntil  = getDaysUntil(sf.dueDay)
  const isUrgent   = !paid && daysUntil <= 3 && daysUntil >= 0
  const isOverdue  = !paid && daysUntil < 0

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
      {/* Icon/Dot */}
      <div style={{ 
        width: 32, height: 32, borderRadius: 10, flexShrink: 0, 
        background: paid ? 'rgba(255,255,255,0.05)' : `${sf.color || 'var(--color-accent-primary)'}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${paid ? 'transparent' : `${sf.color || 'var(--color-accent-primary)'}30`}`
      }}>
        <div style={{ 
          width: 8, height: 8, borderRadius: '50%', 
          background: sf.color || 'var(--color-accent-primary)',
          boxShadow: paid ? 'none' : `0 0 10px ${sf.color || 'var(--color-accent-primary)'}`
        }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{
            fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textDecoration: paid ? 'line-through' : 'none',
          }}>
            {sf.name}
          </span>
          {sf.autoDebit && (
            <div title="Débito Automático" style={{ display: 'flex', alignItems: 'center', background: 'rgba(59,130,246,0.1)', padding: '2px 4px', borderRadius: 4 }}>
              <RefreshCw size={10} color="var(--color-accent-primary)" />
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
          }}>
            {paid ? 'Pago' : getDueDayLabel(sf.dueDay)}
          </span>
          
          {!paid && (isUrgent || isOverdue) && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '1px 6px',
              borderRadius: 4,
              background: isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              color: isOverdue ? 'var(--color-danger)' : 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              gap: 3
            }}>
              <AlertCircle size={10} />
              {isOverdue ? 'Atrasado' : daysUntil === 0 ? 'Hoje' : `Em ${daysUntil}d`}
            </span>
          )}
        </div>
      </div>

      {/* Valor */}
      <div style={{ textAlign: 'right', marginRight: 4 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
          {formatCurrency(sf.amount)}
        </p>
      </div>

      {/* Action Button */}
      {!sf.autoDebit && (
        <button
          onClick={(e) => { e.stopPropagation(); paid ? markUnpaid(sf.id, today) : markPaid(sf.id, today) }}
          style={{
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            background: paid ? 'var(--color-success)' : 'transparent',
            border: `2px solid ${paid ? 'var(--color-success)' : 'var(--color-border)'}`,
            borderRadius: 10,
            padding: 0,
            transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Check size={16} strokeWidth={3} color={paid ? 'white' : 'var(--color-text-tertiary)'} />
        </button>
      )}
      {sf.autoDebit && paid && (
        <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={18} color="var(--color-success)" />
        </div>
      )}
    </motion.div>
  )
}

// ─── Fluxo Page ───────────────────────────────────────────────────────────────

export default function Fluxo() {
  const [tab, setTab]         = useState<'saidas' | 'entradas'>('saidas')
  const [lancarOpen, setLancarOpen] = useState(false)
  const [fluxoSearch, setFluxoSearch] = useState('')
  const [actionSf, setActionSf] = useState<SaidaFixa | null>(null)
  const [editSf, setEditSf] = useState<SaidaFixa | null>(null)
  const isMobile = useIsMobile()

  const saidasFixas = useAppStore(useShallow(selectCurrentSaidasFixas))
  const entradas    = useAppStore(useShallow(selectCurrentEntradas))
  const markPaid    = useAppStore(s => s.markSaidaFixaPaid)
  const markUnpaid  = useAppStore(s => s.markSaidaFixaUnpaid)
  const editSaidaFixa = useAppStore(s => s.editSaidaFixa)
  const deleteSaidaFixa = useAppStore(s => s.deleteSaidaFixa)

  const { pending, paid } = useMemo(() => {
    const q = fluxoSearch.toLowerCase()
    const filtered = fluxoSearch.trim()
      ? saidasFixas.filter(sf => sf.name.toLowerCase().includes(q))
      : saidasFixas
    return {
      pending: filtered
        .filter(sf => !isPaidThisMonth(sf.paidDates))
        .sort((a, b) => getDaysUntil(a.dueDay) - getDaysUntil(b.dueDay)),
      paid: filtered.filter(sf => isPaidThisMonth(sf.paidDates)),
    }
  }, [saidasFixas, fluxoSearch])

  const filteredEntradas = useMemo(() => {
    if (!fluxoSearch.trim()) return entradas
    const q = fluxoSearch.toLowerCase()
    return entradas.filter(e => e.sourceName.toLowerCase().includes(q))
  }, [entradas, fluxoSearch])

  const groupedEntradas = useMemo(
    () => groupByMonth(filteredEntradas, e => e.date, e => e.amount),
    [filteredEntradas],
  )

  const totalPending = pending.reduce((s, sf) => s + sf.amount, 0)
  const totalPaid    = paid.reduce((s, sf) => s + sf.amount, 0)
  const paidPct      = Math.round((paid.length / (saidasFixas.length || 1)) * 100)

  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  // Helper to render Saídas List
  const renderSaidasList = () => (
    <>
      {pending.length === 0 && paid.length === 0 ? (
        <EmptyState 
          icon={<Inbox size={24} />}
          label="Nenhuma conta cadastrada" 
          desc="Adicione suas contas fixas mensais para acompanhar pagamentos." 
        />
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <SectionLabel count={pending.length}>Pendentes</SectionLabel>
              {pending.map((sf, i) => (
                <SaidaItem 
                  key={sf.id} 
                  sf={sf} 
                  isLast={i === pending.length - 1 && paid.length === 0} 
                  onPress={setActionSf} 
                />
              ))}
            </>
          )}
          {paid.length > 0 && (
            <>
              <SectionLabel count={paid.length}>Pagos</SectionLabel>
              {paid.map((sf, i) => (
                <SaidaItem 
                  key={sf.id} 
                  sf={sf} 
                  isLast={i === paid.length - 1} 
                  onPress={setActionSf} 
                />
              ))}
            </>
          )}
        </>
      )}
    </>
  )

  // Helper to render Entradas List
  const renderEntradasList = () => (
    <>
      {groupedEntradas.length === 0 ? (
        <EmptyState 
          icon={<TrendingUp size={24} />}
          label="Nenhuma entrada lançada" 
          desc="Lance uma entrada na tela Home para registrar seus recebimentos." 
        />
      ) : (
        groupedEntradas.map((g) => (
          <React.Fragment key={g.key}>
            <MonthHeader label={g.label} total={g.total} type="income" />
            {g.items.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  borderBottom: i < g.items.length - 1 ? '1px solid var(--color-border)' : 'none',
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
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 2px' }}>{e.sourceName}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
                    {new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-success)', flexShrink: 0 }}>
                  +{formatCurrency(e.amount)}
                </span>
              </motion.div>
            ))}
          </React.Fragment>
        ))
      )}
    </>
  )

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>
      {/* Header */}
      {isMobile ? (
        <PageHeader 
          title="Fluxo" 
          bg="#001442" 
          rightAction={
            <div style={{ 
              background: 'rgba(255,255,255,0.08)', 
              padding: '4px 10px', 
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'capitalize'
            }}>
              {new Date().toLocaleString('pt-BR', { month: 'short' })}
            </div>
          }
        />
      ) : (
        <div style={{ paddingTop: 32, marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Fluxo</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', textTransform: 'capitalize', margin: '4px 0 0' }}>{currentMonth}</p>
        </div>
      )}

      <div style={{ padding: isMobile ? '12px 16px 0' : 0 }}>

      {/* Summary Card */}
      <div style={{ 
        background: 'var(--color-bg-secondary)',
        borderRadius: 16,
        padding: 20,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: 20,
      }}>
        {/* Progress header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <p className="section-label" style={{ margin: 0 }}>Progresso do mês</p>
          <span style={{ fontSize: 13, fontWeight: 700, color: paidPct > 0 ? 'var(--color-success)' : 'var(--color-text-tertiary)' }}>
            {paid.length}/{saidasFixas.length} pagas
          </span>
        </div>

        {/* Progress Bar — 8px per DESIGN.md */}
        <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 9999, overflow: 'hidden', marginBottom: 16 }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${paidPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', background: 'var(--color-success)', borderRadius: 9999 }} 
          />
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, padding: '12px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-danger)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>A pagar</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{formatCurrency(totalPending)}</p>
          </div>
          <div style={{ flex: 1, padding: '12px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-success)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pago</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{formatCurrency(totalPaid)}</p>
          </div>
        </div>
      </div>

      {isMobile ? (
        <>
          {/* Mobile Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['saidas', 'entradas'] as const).map(t => {
              const count = t === 'saidas' ? saidasFixas.length : entradas.length
              const isActive = tab === t
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1, padding: '10px 0',
                    fontSize: 14, fontWeight: 700,
                    borderRadius: 12,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    background: isActive ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)',
                    color: isActive ? 'white' : 'var(--color-text-secondary)',
                    border: `1px solid ${isActive ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 200ms ease',
                  }}
                >
                  {t === 'saidas' ? 'Saídas' : 'Entradas'}
                  <span style={{
                    fontSize: 10,
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                    padding: '2px 6px', borderRadius: 6,
                    color: isActive ? 'white' : 'var(--color-text-tertiary)',
                  }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <SearchBar value={fluxoSearch} onChange={setFluxoSearch} />

          {/* Mobile Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                background: 'var(--color-bg-secondary)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {tab === 'saidas' ? renderSaidasList() : renderEntradasList()}
            </motion.div>
          </AnimatePresence>
        </>
      ) : (
        <>
          {/* Desktop: toolbar row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ width: 240 }}>
              <SearchBar value={fluxoSearch} onChange={setFluxoSearch} />
            </div>
            <button
              onClick={() => setLancarOpen(true)}
              aria-label="Lançar entrada"
              style={{
                height: 36, padding: '0 14px', fontSize: 13, fontWeight: 600,
                background: 'var(--color-accent-primary)', color: 'white',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--font-sans)',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2563EB')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent-primary)')}
            >
              <Plus size={15} strokeWidth={2.5} />
              Lançar entrada
            </button>
          </div>

          {/* Desktop: 2-column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, alignItems: 'start' }}>
            {/* Col 1: Saídas */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Saídas Fixas</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-tertiary)' }}>
                  {saidasFixas.length}
                </span>
              </div>
              <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--color-bg-secondary)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {renderSaidasList()}
              </div>
            </div>

            {/* Col 2: Entradas */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Entradas</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-tertiary)' }}>
                  {entradas.length}
                </span>
              </div>
              <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--color-bg-secondary)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {renderEntradasList()}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop CTA removed — already in header */}

      </div>

      {/* Mobile: Floating Action Buttons */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
          right: 20,
          display: 'flex', flexDirection: 'column', gap: 12,
          zIndex: 35,
        }}>
          <button
            onClick={() => setLancarOpen(true)}
            style={{
              width: 52, height: 52, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-success)',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
              color: 'white',
            }}
            aria-label="Lançar entrada"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>
      )}

      <LancarEntradaModal open={lancarOpen} onClose={() => setLancarOpen(false)} />

      {/* Action Sheet for saída fixa */}
      <ItemActionSheet
        open={!!actionSf}
        onClose={() => setActionSf(null)}
        title={actionSf?.name ?? ''}
        subtitle={actionSf ? formatCurrency(actionSf.amount) + ' · ' + getDueDayLabel(actionSf.dueDay) : ''}
        actions={actionSf ? [
          ...(isPaidThisMonth(actionSf.paidDates)
            ? [{ label: 'Desmarcar pagamento', icon: XCircle, color: 'var(--color-warning)', onClick: () => { markUnpaid(actionSf.id, new Date().toISOString().slice(0, 10)) } }]
            : [{ label: 'Marcar como pago', icon: CheckCircle2, color: 'var(--color-success)', onClick: () => { markPaid(actionSf.id, new Date().toISOString().slice(0, 10)) } }]
          ),
          { label: 'Editar', icon: Pencil, color: 'var(--color-accent-primary)', onClick: () => setEditSf(actionSf) },
          { label: 'Excluir', icon: Trash2, color: 'var(--color-danger)', onClick: () => { if (confirm('Excluir ' + actionSf.name + '?')) deleteSaidaFixa(actionSf.id) } },
        ] : []}
      />

      {/* Edit Saída Fixa Modal */}
      {editSf && (
        <EditSaidaFixaModal
          open={!!editSf}
          onClose={() => setEditSf(null)}
          saidaFixa={editSf}
          onSave={(data) => { editSaidaFixa(editSf.id, data); setEditSf(null) }}
        />
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
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
      <p className="section-label" style={{ margin: 0 }}>
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
      {icon && (
        <div style={{
          width: 56, height: 56, borderRadius: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(59,130,246,0.08)', marginBottom: 4,
          color: 'var(--color-text-tertiary)'
        }}>
          {icon}
        </div>
      )}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>{label}</p>
        {desc && <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5, maxWidth: 260 }}>{desc}</p>}
      </div>
    </div>
  )
}
