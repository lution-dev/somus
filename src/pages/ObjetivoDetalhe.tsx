import { useState, useMemo, useRef } from 'react'
import { useParams } from 'wouter'
import { useAppStore } from '../stores/useAppStore'
import { formatCurrency } from '../lib/calculations'
import { PageHeader, ProgressBar, SearchBar, Breadcrumb } from '../components/ui'
import ImageCropPicker from '../components/ui/ImageCropPicker'
import ItemActionSheet from '../components/ui/ItemActionSheet'
import { useIsMobile } from '../hooks/useIsMobile'
import { ArrowUpRight, ArrowDownRight, Info, Plus, Camera } from 'lucide-react'
import EditMovementModal from '../components/features/EditMovementModal'
import LancarObjetivoModal from '../components/features/LancarObjetivoModal'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [actionItem, setActionItem] = useState<ObjetivoMovement | null>(null)
  const [editMv, setEditMv] = useState<ObjetivoMovement | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cropSrc, setCropSrc] = useState<string | null>(null)

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
      {/* Image crop picker overlay */}
      {cropSrc && (
        <ImageCropPicker
          imageSrc={cropSrc}
          aspect={2.5}
          outputWidth={900}
          outputHeight={360}
          onConfirm={(dataUrl) => {
            updateObjetivoImage(objetivo.id, dataUrl)
            setCropSrc(null)
          }}
          onCancel={() => setCropSrc(null)}
        />
      )}
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = (ev) => {
            if (ev.target?.result) setCropSrc(ev.target.result as string)
          }
          reader.readAsDataURL(file)
          e.target.value = ''
        }}
      />

      {/* Header */}
      {isMobile ? (
        <>
          <PageHeader title={objetivo.name} back bg={HERO_BG} />

          <div style={{
            background: `linear-gradient(to bottom, ${HERO_BG} 0%, transparent 100%)`,
            marginBottom: 20,
            overflow: 'hidden',
          }}>
            {/* Banner hero — click para trocar */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              {objetivo.imageUrl ? (
                // Imagem em banner wide
                <div style={{ position: 'relative', height: 200 }}>
                  <img
                    src={objetivo.imageUrl}
                    alt={objetivo.name}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      opacity: 1,
                      transition: 'opacity 200ms ease',
                    }}
                  />
                  {/* Gradiente bottom */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,20,66,0.85) 0%, transparent 60%)',
                  }} />
                  {/* Botão editar foto */}
                  <div style={{
                    position: 'absolute', bottom: 12, right: 12,
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                    borderRadius: 20, padding: '5px 10px',
                    display: 'flex', alignItems: 'center', gap: 5,
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}>
                    <Camera size={13} color="white" />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>Alterar</span>
                  </div>
                </div>
              ) : (
                // Sem imagem: área de upload integrada ao hero
                <div style={{
                  height: 120,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: 'rgba(139,92,246,0.08)',
                  borderBottom: '1px dashed rgba(139,92,246,0.25)',
                  opacity: 1,
                  transition: 'opacity 200ms ease',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(139,92,246,0.15)',
                    border: '1px solid rgba(139,92,246,0.25)',
                  }}>
                    <Camera size={18} color="var(--color-accent-couple)" />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Adicionar foto de capa</span>
                </div>
              )}
            </div>

            {/* Progress card */}
            <div style={{ padding: '16px 16px 24px' }}>
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
          </div>
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

          <div style={{ paddingTop: 28, marginBottom: 24, position: 'relative', zIndex: 1 }}>
          <Breadcrumb items={[
            { label: 'Casal', href: '/casal' },
            { label: objetivo.name },
          ]} style={{ marginBottom: 20 }} />
          {/* Desktop: Banner wide ou upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer', position: 'relative', marginBottom: 20, borderRadius: 16, overflow: 'hidden' }}
          >
            {objetivo.imageUrl ? (
              <div style={{ position: 'relative', height: 180 }}>
                <img
                  src={objetivo.imageUrl}
                  alt={objetivo.name}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    opacity: 1,
                    borderRadius: 16,
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 16,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                }} />
                <div style={{
                  position: 'absolute', bottom: 16, left: 20, right: 20,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                }}>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                    {objetivo.name}
                  </h1>
                  <div style={{
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
                    borderRadius: 20, padding: '4px 10px',
                    display: 'flex', alignItems: 'center', gap: 5,
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}>
                    <Camera size={12} color="white" />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'white' }}>Alterar</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(139,92,246,0.12)', border: '2px dashed rgba(139,92,246,0.3)',
                }}>
                  <Camera size={20} color="var(--color-accent-couple)" />
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-accent-couple)', margin: 0 }}>
                  {objetivo.name}
                </h1>
              </div>
            )}
          </div>
          {objetivo.imageUrl && (
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 0 0', display: 'none' }}>
              {objetivo.name}
            </h1>
          )}
        </div>
      </>
    )}

      <div style={{ padding: isMobile ? '0 16px' : 0 }}>

      {/* Faltam / Total Guardado */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 'var(--radius-card)',
        padding: 20, marginBottom: 12,
      }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>Total Guardado</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-accent-couple)', margin: '0 0 4px', lineHeight: 1 }}>
          {formatCurrency(objetivo.currentAmount)}
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
          Faltam {formatCurrency(remaining)} · Meta {formatCurrency(objetivo.targetAmount)}
        </p>
      </div>

      {/* Botão Lançar Pagamento — destaque */}
      <button
        id="btn-lancar-pagamento"
        onClick={() => setAddOpen(true)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8,
          padding: '12px 20px', borderRadius: 'var(--radius-card)',
          background: 'rgba(139,92,246,0.1)',
          border: '1.5px solid rgba(139,92,246,0.25)',
          color: 'var(--color-accent-couple)',
          fontSize: 14, fontWeight: 600,
          fontFamily: 'var(--font-sans)', cursor: 'pointer',
          transition: 'all 150ms ease',
          marginBottom: 20,
        }}
      >
        <Plus size={16} strokeWidth={2.5} />
        Lançar Pagamento
      </button>

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
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          right: 20, zIndex: 35,
        }}>
          <button
            onClick={() => setAddOpen(true)}
            style={{
              width: 52, height: 52, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-accent-couple)',
              border: 'none', cursor: 'pointer',
              color: 'white',
            }}
            aria-label="Lançar pagamento"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Desktop: Button — removido pois o botão inline já existe acima */}


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

      {/* Add movement modal */}
      <LancarObjetivoModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Lançar Pagamento"
        onSave={(mv) => {
          addObjetivoMovement(objetivo.id, mv)
        }}
      />
    </div>
  )
}
