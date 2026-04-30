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
import { Check, RefreshCw, Plus, Inbox, ArrowUpRight, CheckCircle2, Pencil, Trash2, XCircle } from 'lucide-react'
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
  const isUrgent   = !paid && daysUntil <= 3

  return (
    <div
      onClick={() => onPress(sf)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
        opacity: paid ? 0.55 : 1,
        cursor: 'pointer',
      }}
    >
      {/* Dot */}
      <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: sf.color || 'var(--color-accent-primary)' }} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textDecoration: paid ? 'line-through' : 'none',
          }}>
            {sf.name}
          </span>
          {sf.autoDebit && <RefreshCw size={11} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />}
        </div>
        <span style={{
          fontSize: 12,
          color: isUrgent ? 'var(--color-danger)' : 'var(--color-text-secondary)',
        }}>
          {paid ? 'Pago · ' + getDueDayLabel(sf.dueDay) : getDueDayLabel(sf.dueDay)}
        </span>
      </div>

      {/* Valor */}
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', flexShrink: 0, marginRight: 8 }}>
        {formatCurrency(sf.amount)}
      </span>

      {/* Check / auto badge */}
      {sf.autoDebit ? (
        <span style={{
          fontSize: 11, fontWeight: 500, padding: '3px 8px',
          borderRadius: 'var(--radius-badge)', flexShrink: 0,
          background: paid ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.15)',
          color: paid ? 'var(--color-success)' : 'var(--color-accent-electric)',
        }}>
          {paid ? 'Debitado' : 'Auto'}
        </span>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); paid ? markUnpaid(sf.id, today) : markPaid(sf.id, today) }}
          style={{
            width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            background: 'transparent', border: 'none',
            padding: 0,
          }}
        >
          <span style={{
            width: 28, height: 28, borderRadius: '50%',
            border: `2px solid ${paid ? 'var(--color-success)' : 'var(--color-border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: paid ? 'var(--color-success)' : 'transparent',
            transition: 'all 150ms ease',
          }}>
            <Check size={13} strokeWidth={2.5} color={paid ? 'white' : 'var(--color-text-tertiary)'} />
          </span>
        </button>
      )}
    </div>
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

  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>
      {/* Header */}
      {isMobile ? (
        <PageHeader title="Fluxo" bg="#001442" />
      ) : (
        <div style={{ paddingTop: 32, marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Fluxo</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', textTransform: 'capitalize', margin: '4px 0 0' }}>{currentMonth}</p>
        </div>
      )}

      <div style={{ padding: isMobile ? '8px 16px 0' : 0 }}>

      {/* Resumo cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {/* A pagar */}
        <div style={{
          borderRadius: 'var(--radius-card)', padding: 16,
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.25)',
        }}>
          <p className="section-label" style={{ color: 'var(--color-danger)', marginBottom: 6 }}>A pagar</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{formatCurrency(totalPending)}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{pending.length} conta{pending.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Pago */}
        <div style={{
          borderRadius: 'var(--radius-card)', padding: 16,
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.25)',
        }}>
          <p className="section-label" style={{ color: 'var(--color-success)', marginBottom: 6 }}>Pago</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{formatCurrency(totalPaid)}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{paid.length} conta{paid.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, padding: 4,
        borderRadius: 10,
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        marginBottom: 16,
      }}>
        {(['saidas', 'entradas'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '8px 0',
              fontSize: 14, fontWeight: 600,
              borderRadius: 8,
              cursor: 'pointer', border: 'none',
              fontFamily: 'var(--font-sans)',
              background: tab === t ? 'var(--color-accent-primary)' : 'transparent',
              color: tab === t ? 'white' : 'var(--color-text-secondary)',
              transition: 'background 150ms ease, color 150ms ease',
            }}
          >
            {t === 'saidas' ? 'Saídas fixas' : 'Entradas'}
          </button>
        ))}
      </div>

      <SearchBar value={fluxoSearch} onChange={setFluxoSearch} />

      {/* Conteúdo da tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          style={{
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          {tab === 'saidas' ? (
            <>
              {pending.length === 0 && paid.length === 0 ? (
                <EmptyState label="Nenhuma conta cadastrada" />
              ) : (
                <>
                  {pending.length > 0 && (
                    <>
                      <SectionLabel>Pendentes</SectionLabel>
                      {pending.map((sf, i) => <SaidaItem key={sf.id} sf={sf} isLast={i === pending.length - 1 && paid.length === 0} onPress={setActionSf} />)}
                    </>
                  )}
                  {paid.length > 0 && (
                    <>
                      <SectionLabel>Pagos</SectionLabel>
                      {paid.map((sf, i) => <SaidaItem key={sf.id} sf={sf} isLast={i === paid.length - 1} onPress={setActionSf} />)}
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {groupedEntradas.length === 0 ? (
                <EmptyState label="Nenhuma entrada lançada" />
              ) : (
                groupedEntradas.map((g) => (
                  <React.Fragment key={g.key}>
                    <MonthHeader label={g.label} total={g.total} type="income" />
                    {g.items.map((e, i) => (
                      <div
                        key={e.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '14px 16px',
                          borderBottom: i < g.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                        }}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          background: 'rgba(59,130,246,0.12)',
                        }}>
                          <ArrowUpRight size={15} color="var(--color-accent-primary)" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{e.sourceName}</p>
                          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
                            {new Date(e.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-success)', flexShrink: 0 }}>
                          +{formatCurrency(e.amount)}
                        </span>
                      </div>
                    ))}
                  </React.Fragment>
                ))
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Desktop CTA */}
      {!isMobile && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => setLancarOpen(true)}
            className="btn-primary"
          >
            <Plus size={18} strokeWidth={2.5} />
            Lançar entrada
          </button>
        </div>
      )}

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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="section-label"
      style={{ padding: '10px 16px', margin: 0, borderBottom: '1px solid var(--color-border)' }}
    >
      {children}
    </p>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 8 }}>
      <Inbox size={28} color="var(--color-text-tertiary)" />
      <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>{label}</p>
    </div>
  )
}
