import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useLocation } from 'wouter'
import { useAppStore } from '../stores/useAppStore'
import { formatCurrency } from '../lib/calculations'
import { ProgressBar, SearchBar, Breadcrumb } from '../components/ui'
import ImageCropPicker from '../components/ui/ImageCropPicker'
import ItemActionSheet from '../components/ui/ItemActionSheet'
import UsarObjetivoModal from '../components/features/UsarObjetivoModal'
import RedistribuirModal from '../components/features/RedistribuirModal'
import { useIsMobile } from '../hooks/useIsMobile'
import { ArrowUpRight, ArrowDownRight, Info, Plus, Camera, MoreVertical, Calendar, Sparkles, Maximize2, Trash2, ChevronLeft, Wallet, TrendingUp, Target, ArrowRightLeft } from 'lucide-react'
import EditMovementModal from '../components/features/EditMovementModal'
import LancarObjetivoModal from '../components/features/LancarObjetivoModal'
import type { ObjetivoMovement } from '../types'


export default function ObjetivoDetalhe() {
  const { id } = useParams<{ id: string }>()
  const objetivo = useAppStore(s => s.objetivos.find(o => o.id === id))
  const addObjetivoMovement = useAppStore(s => s.addObjetivoMovement)
  const editObjetivoMovement = useAppStore(s => s.editObjetivoMovement)
  const deleteObjetivoMovement = useAppStore(s => s.deleteObjetivoMovement)
  const updateObjetivoImage = useAppStore(s => s.updateObjetivoImage)
  const editObjetivo = useAppStore(s => s.editObjetivo)
  const allObjetivos = useAppStore(s => s.objetivos)
  const isMobile = useIsMobile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [, navigate] = useLocation()

  const [actionItem, setActionItem] = useState<ObjetivoMovement | null>(null)
  const [editMv, setEditMv] = useState<ObjetivoMovement | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false)
  const [hoveredMvId, setHoveredMvId] = useState<string | null>(null)
  const [phase3Open, setPhase3Open] = useState(false)
  const [usarOpen, setUsarOpen] = useState(false)
  const [redistribuirOpen, setRedistribuirOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [justReached, setJustReached] = useState(false)
  const prevPctRef = useRef<number | null>(null)

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

  // Celebração ao atingir 100%
  useEffect(() => {
    const prev = prevPctRef.current
    prevPctRef.current = pct  // sempre atualiza, evita duplo disparo
    if (prev !== null && prev < 100 && pct >= 100) {
      setJustReached(true)
      const t = setTimeout(() => setJustReached(false), 2200)  // só esconde, NAO abre sheet
      return () => clearTimeout(t)
    }
  }, [pct])

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  function showToast(msg: string) { setToast(msg) }

  function handleUsar(amount: number, description: string, date: string) {
    addObjetivoMovement(objetivo.id, { date, amount, description, type: 'withdraw' })
    editObjetivo(objetivo.id, { status: 'em_realizacao' })
    showToast('Utilização registrada ✨')
  }

  function handleRedistribuir(items: { objetivoId: string; objetivoName: string; amount: number }[]) {
    const total = items.reduce((s, i) => s + i.amount, 0)
    const today = new Date().toISOString().slice(0, 10)
    // Withdraw from origin
    addObjetivoMovement(objetivo.id, { date: today, amount: total, description: `Redistribuído para ${items.length} objetivo(s)`, type: 'withdraw' })
    editObjetivo(objetivo.id, { status: 'redistribuido' })
    // Deposit into each destination
    items.forEach(item => {
      addObjetivoMovement(item.objetivoId, { date: today, amount: item.amount, description: `Patrimônio redistribuído de: ${objetivo.name} ✨`, type: 'deposit' })
    })
    showToast('Patrimônio redistribuído com sucesso ✨')
  }

  const startDateStr = objetivo.startDate ?? objetivo.createdAt
  const createdDate = startDateStr ? new Date(startDateStr + 'T12:00:00') : null
  const now = new Date()
  const monthsSaving = createdDate
    ? Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)))
    : 0
  const avgPerMonth = monthsSaving > 0 ? objetivo.currentAmount / monthsSaving : 0
  const monthsToGoal = avgPerMonth > 0 ? Math.ceil(remaining / avgPerMonth) : 0

  // Crescimento estimado até dezembro (taxa conservadora ~0.5%/mês — poupança-like)
  const monthsToDecember = Math.max(0, 11 - now.getMonth())
  const estimatedGrowth = objetivo.currentAmount > 0 && monthsToDecember > 0
    ? Math.round(objetivo.currentAmount * 0.005 * monthsToDecember)
    : 0

  // Projeção emocional
  const projectionCopy = remaining <= 0
    ? null
    : monthsToGoal > 0
      ? `Mantendo esse ritmo, vocês chegam lá em ${monthsToGoal} ${monthsToGoal === 1 ? 'mês' : 'meses'}.`
      : null

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

  // ⁝ Kebab menu para gerenciar foto
  const photoMenuEl = (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setPhotoMenuOpen(v => !v) }}
        onBlur={() => setTimeout(() => setPhotoMenuOpen(false), 150)}
        style={{
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)',
          borderRadius: 999, width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.22)', cursor: 'pointer', color: 'white',
        }}
        aria-label="Opções da foto"
      >
        <MoreVertical size={15} />
      </button>
      {photoMenuOpen && (
        <div style={{
          position: 'absolute',
          ...(isMobile
            ? { top: 'calc(100% + 8px)', right: 0 }
            : { bottom: 'calc(100% + 8px)', right: 0 }),
          background: 'rgba(8, 13, 30, 0.97)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14,
          overflow: 'hidden', minWidth: 172, boxShadow: '0 12px 40px rgba(0,0,0,0.7)', zIndex: 20,
        }}>
          {([
            { label: 'Alterar foto',  icon: Camera,    action: () => { fileInputRef.current?.click(); setPhotoMenuOpen(false) }, danger: false },
            { label: 'Reposicionar', icon: Maximize2,  action: () => { if (objetivo.imageUrl) { setCropSrc(objetivo.imageUrl); setPhotoMenuOpen(false) } }, danger: false },
            { label: 'Remover foto',  icon: Trash2,    action: () => { updateObjetivoImage(objetivo.id, ''); setPhotoMenuOpen(false) }, danger: true },
          ] as const).map((item, idx, arr) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                onClick={(e) => { e.stopPropagation(); item.action() }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', textAlign: 'left', padding: '11px 14px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500,
                  color: item.danger ? '#F87171' : 'var(--color-text-primary)',
                  fontFamily: 'var(--font-sans)',
                  borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <Icon size={14} />
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>
      {/* Image crop picker overlay */}
      {cropSrc && (
        <ImageCropPicker
          imageSrc={cropSrc}
          aspect={4/3}
          outputWidth={900}
          outputHeight={675}
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
          {/* Botão voltar fixo — sempre visível ao scrollar */}
          <button
            onClick={() => window.history.back()}
            style={{
              position: 'fixed',
              top: 'calc(env(safe-area-inset-top, 0px) + 10px)',
              left: 16, zIndex: 120,
              width: 36, height: 36, borderRadius: 12,
              background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white',
            }}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Imagem full-bleed — começa do topo, substitui a navbar */}
          {objetivo.imageUrl ? (
            <div style={{ position: 'relative', height: 280 }}>
              <img
                src={objetivo.imageUrl}
                alt={objetivo.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Gradiente sutil no topo para o botão voltar */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 35%)' }} />
              {/* ⋮ Menu foto — fixed top-right */}
              <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 10px)', right: 16 }}>{photoMenuEl}</div>
            </div>
          ) : (
            /* Sem imagem: cabeçalho minimalista com espaço p/ botão fixo */
            <div style={{ background: 'var(--color-bg-primary)' }}>
              <div style={{ height: 'calc(env(safe-area-inset-top, 0px) + 56px)' }} />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', background: 'rgba(139,92,246,0.06)', borderTop: '1px dashed rgba(139,92,246,0.18)', borderBottom: '1px dashed rgba(139,92,246,0.18)' }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <Camera size={16} color="var(--color-accent-couple)" />
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 500 }}>Adicionar foto</span>
              </div>
            </div>
          )}

          {/* Título abaixo da imagem */}
          <div style={{ padding: '16px 20px 12px' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              {objetivo.name}
            </h1>
          </div>

        </>
      ) : (
        <>
          {/* Desktop: Immersive hero with breadcrumb overlay */}
          <div style={{ position: 'relative', zIndex: 1, paddingTop: 28, marginBottom: 24 }}>
            {objetivo.imageUrl ? (
              <div
                style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 20, overflow: 'hidden' }}
              >
                <img src={objetivo.imageUrl} alt={objetivo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {/* Top gradient for breadcrumb readability */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 35%)', pointerEvents: 'none' }} />
                {/* Bottom gradient for title */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 65%)', pointerEvents: 'none' }} />
                {/* Purple brand tint */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

                {/* Breadcrumb overlay — top left */}
                <div style={{ position: 'absolute', top: 16, left: 20, right: 20, zIndex: 2 }}>
                  <Breadcrumb items={[
                    { label: 'Casal', href: '/casal' },
                    { label: objetivo.name },
                  ]} style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }} />
                </div>

                {/* Title + photo menu — bottom */}
                <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.6)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1.2, maxWidth: '70%' }}>{objetivo.name}</h1>
                  {photoMenuEl}
                </div>
              </div>
            ) : (
              /* No image: breadcrumb + inline upload */
              <>
                <Breadcrumb items={[
                  { label: 'Casal', href: '/casal' },
                  { label: objetivo.name },
                ]} style={{ marginBottom: 20 }} />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,0.12)', border: '2px dashed rgba(139,92,246,0.3)' }}>
                    <Camera size={20} color="var(--color-accent-couple)" />
                  </div>
                  <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-accent-couple)', margin: 0 }}>{objetivo.name}</h1>
                </div>
              </>
            )}
          </div>
        </>
      )}

      <div style={{ padding: isMobile ? '0 16px' : 0 }}>

      {/* Desktop: 2-column layout | Mobile: single column */}
      <div style={{
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: isMobile ? undefined : '340px 1fr',
        gap: isMobile ? undefined : 24,
        alignItems: 'start',
      }}>

      {/* ── Left column (or full width on mobile): Progress + CTA ── */}
      <div style={{
        position: isMobile ? 'static' : 'sticky',
        top: isMobile ? undefined : 24,
      }}>
      <div style={{
        background: remaining <= 0 ? 'linear-gradient(180deg, var(--color-bg-secondary) 0%, rgba(139,92,246,0.03) 100%)' : 'var(--color-bg-secondary)',
        border: remaining <= 0 ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(139,92,246,0.2)',
        boxShadow: remaining <= 0 ? '0 4px 30px rgba(139,92,246,0.12)' : 'none',
        borderRadius: 'var(--radius-card)',
        padding: '16px 20px', marginBottom: 16,
        transition: 'all 0.5s ease',
      }}>
        {/* Header: label emocional + % */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-accent-couple)', margin: 0, letterSpacing: '0.02em' }}>
            {remaining <= 0 ? 'Objetivo construído ✨' : 'Vocês já construíram'}
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent-couple)', margin: 0 }}>{Math.round(pct)}%</p>
        </div>
        {/* Valor grande */}
        <p style={{ fontSize: 28, fontWeight: 700, margin: '0 0 2px', lineHeight: 1, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #C4B5FD, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {formatCurrency(objetivo.currentAmount)}
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '0 0 12px' }}>
          {remaining <= 0 
            ? 'Valor construído com consistência e equilíbrio.'
            : `de ${formatCurrency(objetivo.targetAmount)} · faltam ${formatCurrency(remaining)}`
          }
        </p>
        {/* Barra de progresso */}
        <ProgressBar value={pct} variant="couple" size="md" />
        {/* Stats de tempo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '0 0 2px' }}>Construindo há</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{monthsSaving} {monthsSaving === 1 ? 'mês' : 'meses'}</p>
          </div>
          {remaining > 0 && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '0 0 2px' }}>Para chegar</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                {monthsToGoal > 0 ? `${monthsToGoal} ${monthsToGoal === 1 ? 'mês' : 'meses'}` : 'Comece a guardar'}
              </p>
            </div>
          )}
        </div>
        
        {/* Projeção emocional */}
        {remaining > 0 && projectionCopy && (
          <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)', borderRadius: 12, padding: '8px 12px', marginTop: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.5, fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <Calendar size={12} color="var(--color-accent-couple)" style={{ flexShrink: 0, marginTop: 2 }} />
              {projectionCopy}
            </p>
          </div>
        )}
        {/* Crescimento invisível */}
        {remaining > 0 && estimatedGrowth > 0 && (
          <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '8px 0 0', fontStyle: 'italic' }}>
            +{formatCurrency(estimatedGrowth)} estimados em crescimento até dezembro
          </p>
        )}
      </div>

      {/* Botão principal */}
      <button
        id="btn-guardar-sonho"
        onClick={() => remaining <= 0 ? setPhase3Open(true) : setAddOpen(true)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 8,
          padding: '14px 20px', borderRadius: 'var(--radius-card)',
          background: remaining <= 0 ? 'var(--color-accent-couple)' : 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(37,99,235,0.12))',
          border: remaining <= 0 ? 'none' : '1.5px solid rgba(139,92,246,0.30)',
          color: remaining <= 0 ? 'white' : 'var(--color-accent-couple)',
          fontSize: 15, fontWeight: 700,
          fontFamily: 'var(--font-display)', cursor: 'pointer',
          transition: 'all 0.35s ease',
          marginBottom: isMobile ? 24 : 0,
          letterSpacing: '-0.01em',
          boxShadow: remaining <= 0 ? '0 8px 24px rgba(139,92,246,0.3)' : 'none',
        }}
      >
        {remaining <= 0 ? <Sparkles size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
        {remaining <= 0 ? 'Planejar próximo passo' : 'Guardar para esse sonho'}
      </button>
      </div>

      {/* ── Right column (or below on mobile): Histórico ── */}
      <div>
      <p className="section-label" style={{ marginBottom: 8 }}>Histórico</p>
      <div style={{ marginBottom: 8 }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div style={{
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}>
        {groupedByMonth.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 12, textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
              marginBottom: 4,
            }}>
              <Sparkles size={22} color="var(--color-accent-couple)" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Cada passo começa pequeno.</p>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6, maxWidth: 260 }}>
              O primeiro valor adicionado aqui marca o início dessa construção.
            </p>
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
                  onMouseEnter={() => setHoveredMvId(mv.id)}
                  onMouseLeave={() => setHoveredMvId(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px',
                    background: hoveredMvId === mv.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                    borderBottom: i < mvs.length - 1 ? '1px solid var(--color-border)' : 'none',
                    cursor: 'pointer', transition: 'background 150ms ease',
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

      </div>{/* end 2-col grid */}
      </div>


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
        title="Editar registro"
        initialDescription={editMv?.description ?? ''}
        initialAmount={editMv?.amount ?? 0}
        initialDate={editMv?.date ?? ''}
        onSave={(updates) => {
          if (!editMv) return
          editObjetivoMovement(objetivo.id, editMv.id, updates)
        }}
      />

      <LancarObjetivoModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Guardar para esse sonho"
        onSave={(mv) => {
          addObjetivoMovement(objetivo.id, mv)
        }}
      />

      {/* Fase 3: Decidir próximos passos */}
      <ItemActionSheet
        open={phase3Open}
        onClose={() => setPhase3Open(false)}
        title="O que vocês gostariam de fazer agora?"
        subtitle="Esse valor construído já é patrimônio."
        actions={[
          { label: 'Usar esse valor', icon: Wallet, onClick: () => { setPhase3Open(false); setUsarOpen(true) } },
          { label: 'Continuar rendendo', icon: TrendingUp, onClick: () => { setPhase3Open(false); showToast('Patrimônio em evolução ✨ O dinheiro segue crescendo.') } },
          { label: 'Transformar em nova meta', icon: Target, onClick: () => { setPhase3Open(false); navigate('/casal'); showToast('Crie o próximo objetivo com seu patrimônio como base ✨') } },
          { label: 'Redistribuir patrimônio', icon: ArrowRightLeft, onClick: () => { setPhase3Open(false); setRedistribuirOpen(true) } },
        ]}
      />

      {/* Modal: Usar esse valor */}
      <UsarObjetivoModal
        open={usarOpen}
        onClose={() => setUsarOpen(false)}
        objetivoName={objetivo.name}
        currentAmount={objetivo.currentAmount}
        onConfirm={handleUsar}
      />

      {/* Modal: Redistribuir patrimônio */}
      <RedistribuirModal
        open={redistribuirOpen}
        onClose={() => setRedistribuirOpen(false)}
        originObjetivo={objetivo}
        allObjetivos={allObjetivos}
        onConfirm={handleRedistribuir}
      />

      {/* Celebração ao atingir 100% */}
      {justReached && (
        <div
          onClick={() => setJustReached(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9200,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(4, 6, 20, 0.88)', backdropFilter: 'blur(20px)',
            animation: 'celebFadeIn 0.6s cubic-bezier(0.16,1,0.3,1)',
            cursor: 'pointer',
          }}
        >
          <style>{`
            @keyframes celebFadeIn { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
            @keyframes celebGlow { 0%,100% { opacity: 0.5 } 50% { opacity: 0.9 } }
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          `}</style>

          {/* Radial purple glow */}
          <div style={{
            position: 'absolute', width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
            animation: 'celebGlow 2.5s ease-in-out infinite',
            pointerEvents: 'none',
          }} />

          {/* Content */}
          <div style={{ position: 'relative', textAlign: 'center', padding: '0 40px' }}>
            <p style={{ fontSize: 52, margin: '0 0 20px', lineHeight: 1 }}>✨</p>
            <p style={{
              fontSize: 32, fontWeight: 800, color: 'white', margin: 0,
              fontFamily: 'var(--font-display)', lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}>
              Vocês chegaram lá
            </p>
            <p style={{
              fontSize: 15, color: 'rgba(255,255,255,0.6)', margin: '16px 0 0',
              lineHeight: 1.6, maxWidth: 240, marginInline: 'auto',
            }}>
              Cada valor guardado ajudou a tornar isso possível.
            </p>
          </div>

          {/* Tap hint */}
          <p style={{
            position: 'absolute', bottom: 'calc(48px + env(safe-area-inset-bottom, 0px))',
            fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.04em',
          }}>
            Toque para continuar
          </p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))', left: 16, right: 16,
          zIndex: 9100, background: 'rgba(8,13,30,0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139,92,246,0.3)', borderRadius: 14,
          padding: '12px 16px', textAlign: 'center',
          fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.3s ease',
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}
