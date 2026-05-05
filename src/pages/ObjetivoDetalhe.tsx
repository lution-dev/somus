import { useState, useMemo, useRef } from 'react'
import { useParams } from 'wouter'
import { useAppStore } from '../stores/useAppStore'
import { formatCurrency } from '../lib/calculations'
import { PageHeader, ProgressBar, SearchBar } from '../components/ui'
import ItemActionSheet from '../components/ui/ItemActionSheet'
import { useIsMobile } from '../hooks/useIsMobile'
import { useImageUpload } from '../hooks/useImageUpload'
import { ArrowUpRight, ArrowDownRight, Info, Plus, Camera } from 'lucide-react'
import EditMovementModal from '../components/features/EditMovementModal'
import type { ObjetivoMovement } from '../types'

const HERO_BG = '#001442'

export default function ObjetivoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const objetivo = useAppStore(s => s.objetivos.find(o => o.id === id))
  const addObjetivoMovement = useAppStore(s => s.addObjetivoMovement)
  const editObjetivoMovement = useAppStore(s => s.editObjetivoMovement)
  const deleteObjetivoMovement = useAppStore(s => s.deleteObjetivoMovement)
  const updateObjetivoImage = useAppStore(s => s.updateObjetivoImage)
  const isMobile = useIsMobile()
  const { upload, isProcessing } = useImageUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [actionItem, setActionItem] = useState<ObjetivoMovement | null>(null)
  const [editMv, setEditMv] = useState<ObjetivoMovement | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  if (!objetivo) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', gap: 12 }}>
        <Info size={28} color="var(--color-text-tertiary)" />
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>Objetivo não encontrado</p>
      </div>
    )
  }

  const pct = Math.min(100, (objetivo.currentAmount / objetivo.targetAmount) * 100)
  const remaining = Math.max(0, objetivo.targetAmount - objetivo.currentAmount)

  const createdDate = objetivo.createdAt ? new Date(objetivo.createdAt + 'T12:00:00') : null
  const now = new Date()
  const monthsSaving = createdDate
    ? Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)))
    : 0
  const avgPerMonth = monthsSaving > 0 ? objetivo.currentAmount / monthsSaving : 0
  const monthsToGoal = avgPerMonth > 0 ? Math.ceil(remaining / avgPerMonth) : 0

  const movements = objetivo.movements ?? []

  const sortedMovements = useMemo(() => {
    const sorted = [...movements].sort((a, b) => b.date.localeCompare(a.date))
    if (!searchQuery.trim()) return sorted
    const q = searchQuery.toLowerCase()
    return sorted.filter(mv => mv.description.toLowerCase().includes(q))
  }, [movements, searchQuery])

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, typeof sortedMovements> = {}
    for (const mv of sortedMovements) {
      const d = new Date(mv.date + 'T12:00:00')
      const key = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      if (!groups[key]) groups[key] = []
      groups[key].push(mv)
    }
    return Object.entries(groups)
  }, [sortedMovements])

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file || !objetivo) return
          const result = await upload(file)
          if (result) {
            updateObjetivoImage(objetivo.id, result.dataUrl)
          }
          e.target.value = ''
        }}
      />

      {/* Header */}
      {isMobile ? (
        <>
          <PageHeader title={objetivo.name} back bg={HERO_BG} />
          <div style={{
            background: HERO_BG,
            borderRadius: '0 0 24px 24px',
            padding: '0 16px 24px',
            marginBottom: 20,
            overflow: 'hidden',
          }}>
            {/* Cover Image or Icon */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex', justifyContent: 'center', marginBottom: 12,
                cursor: 'pointer', position: 'relative',
              }}
            >
              {objetivo.imageUrl ? (
                <div style={{ position: 'relative', width: 80, height: 80 }}>
                  <img
                    src={objetivo.imageUrl}
                    alt={objetivo.name}
                    style={{
                      width: 80, height: 80, borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid rgba(139,92,246,0.3)',
                      opacity: isProcessing ? 0.5 : 1,
                      transition: 'opacity 200ms ease',
                    }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--color-accent-couple)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid ' + HERO_BG,
                  }}>
                    <Camera size={12} color="white" />
                  </div>
                </div>
              ) : (
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 2,
                  background: 'rgba(139,92,246,0.15)', border: '2px dashed rgba(139,92,246,0.3)',
                  opacity: isProcessing ? 0.5 : 1,
                  transition: 'opacity 200ms ease',
                }}>
                  <Camera size={20} color="var(--color-accent-couple)" />
                  <span style={{ fontSize: 8, color: 'var(--color-text-tertiary)' }}>Foto</span>
                </div>
              )}
            </div>

            {/* Progress card */}
            <div style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 'var(--radius-card)',
              padding: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Guardado</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent-couple)', margin: 0 }}>{Math.round(pct)}%</p>
              </div>
              <ProgressBar value={pct} variant="couple" size="md" />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>Guardando por</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{monthsSaving} {monthsSaving === 1 ? 'mês' : 'meses'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>Para atingir</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{monthsToGoal} {monthsToGoal === 1 ? 'mês' : 'meses'}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ paddingTop: 32, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Desktop: Cover image or upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer', flexShrink: 0, position: 'relative' }}
          >
            {objetivo.imageUrl ? (
              <div style={{ position: 'relative' }}>
                <img
                  src={objetivo.imageUrl}
                  alt={objetivo.name}
                  style={{
                    width: 56, height: 56, borderRadius: 16,
                    objectFit: 'cover',
                    border: '2px solid rgba(139,92,246,0.3)',
                    opacity: isProcessing ? 0.5 : 1,
                  }}
                />
                <div style={{
                  position: 'absolute', bottom: -4, right: -4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--color-accent-couple)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--color-bg-primary)',
                }}>
                  <Camera size={10} color="white" />
                </div>
              </div>
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(139,92,246,0.12)', border: '2px dashed rgba(139,92,246,0.3)',
                cursor: 'pointer',
              }}>
                <Camera size={20} color="var(--color-accent-couple)" />
              </div>
            )}
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-accent-couple)', margin: 0 }}>
            {objetivo.name}
          </h1>
        </div>
      )}

      <div style={{ padding: isMobile ? '0 16px' : 0 }}>

      {/* Faltam / Total Guardado */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 'var(--radius-card)',
        padding: 20, marginBottom: 20,
      }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>Total Guardado</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-accent-couple)', margin: '0 0 4px', lineHeight: 1 }}>
          {formatCurrency(objetivo.currentAmount)}
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
          Faltam {formatCurrency(remaining)} · Meta {formatCurrency(objetivo.targetAmount)}
        </p>
      </div>

      {/* Lançamentos */}
      <p className="section-label" style={{ marginBottom: 12 }}>Lançamentos</p>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <div style={{
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}>
        {groupedByMonth.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 8 }}>
            <Info size={24} color="var(--color-text-tertiary)" />
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>Nenhum lançamento</p>
          </div>
        ) : (
          groupedByMonth.map(([monthLabel, mvs], gi) => (
            <div key={monthLabel}>
              {/* Month header */}
              <div style={{
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: '1px solid var(--color-border)',
                borderTop: gi > 0 ? '1px solid var(--color-border)' : 'none',
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', margin: 0, textTransform: 'capitalize' }}>
                  {monthLabel}
                </p>
              </div>

              {mvs.map((mv, i) => (
                <div
                  key={mv.id}
                  onClick={() => setActionItem(mv)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px',
                    borderBottom: i < mvs.length - 1 ? '1px solid var(--color-border)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: mv.type === 'deposit' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                  }}>
                    {mv.type === 'deposit'
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
                    color: mv.type === 'deposit' ? 'var(--color-success)' : 'var(--color-danger)',
                  }}>
                    {mv.type === 'deposit' ? '+' : '-'}{formatCurrency(mv.amount)}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
      </div>

      {/* Mobile: FAB */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
          right: 20, zIndex: 35,
        }}>
          <button
            onClick={() => setAddOpen(true)}
            style={{
              width: 52, height: 52, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-accent-couple)',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
              color: 'white',
            }}
            aria-label="Adicionar depósito"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Desktop: Button */}
      {!isMobile && (
        <div style={{ marginTop: 16 }}>
          <button onClick={() => setAddOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} strokeWidth={2.5} />
            Adicionar depósito
          </button>
        </div>
      )}

      {/* Action sheet */}
      <ItemActionSheet
        open={!!actionItem}
        onClose={() => setActionItem(null)}
        title={actionItem?.description ?? ''}
        subtitle={actionItem ? formatCurrency(actionItem.amount) : ''}
        onEdit={() => { if (actionItem) setEditMv(actionItem) }}
        onDelete={() => { if (actionItem) deleteObjetivoMovement(objetivo.id, actionItem.id) }}
      />

      {/* Edit movement */}
      <EditMovementModal
        open={!!editMv}
        onClose={() => setEditMv(null)}
        title="Editar Depósito"
        initialDescription={editMv?.description ?? ''}
        initialAmount={editMv?.amount ?? 0}
        initialDate={editMv?.date ?? ''}
        onSave={(updates) => {
          if (!editMv) return
          editObjetivoMovement(objetivo.id, editMv.id, updates)
        }}
      />

      {/* Add deposit modal */}
      <EditMovementModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Novo Depósito"
        initialDescription=""
        initialAmount={0}
        initialDate={new Date().toISOString().slice(0, 10)}
        onSave={(data) => {
          addObjetivoMovement(objetivo.id, {
            date: data.date,
            amount: Math.abs(data.amount),
            description: data.description,
            type: 'deposit',
          })
        }}
      />
    </div>
  )
}
