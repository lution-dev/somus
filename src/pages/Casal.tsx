import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAppStore } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { PageHeader, ConfirmDialog } from '../components/ui'
import ItemActionSheet from '../components/ui/ItemActionSheet'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../hooks/useAuth'
import { Target, Share2, Copy, Heart, CheckCircle2, Send, Users, Plus, Pencil, Trash2 } from 'lucide-react'
import type { Objetivo } from '../types'
import AddObjetivoModal from '../components/features/AddObjetivoModal'

export default function Casal() {
  const [copied, setCopied] = useState(false)
  const [addObjetivoOpen, setAddObjetivoOpen] = useState(false)
  const [objetivoActionTarget, setObjetivoActionTarget] = useState<Objetivo | null>(null)
  const [editObjetivoTarget, setEditObjetivoTarget] = useState<Objetivo | null>(null)
  const [deleteObjetivoTarget, setDeleteObjetivoTarget] = useState<Objetivo | null>(null)
  const [, navigate] = useLocation()
  const { photoURL, displayName } = useAuth()
  const currentUser    = useAppStore(s => s.currentUser)
  const partner        = useAppStore(s => s.partner)
  const objetivos      = useAppStore(useShallow(s => s.objetivos.filter(o => o.isCouple)))
  const divisoes      = useAppStore(useShallow(s => s.divisoes))
  const entradas       = useAppStore(useShallow(s => s.entradas))
  const editObjetivo   = useAppStore(s => s.editObjetivo)
  const deleteObjetivo = useAppStore(s => s.deleteObjetivo)

  // â”€â”€ Calculate real balances â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const currentUserBalance = divisoes
    .filter(cx => cx.userId === (currentUser?.id ?? ''))
    .reduce((s, cx) => s + cx.balance, 0)

  const partnerBalance = partner
    ? divisoes.filter(cx => cx.userId === partner.id).reduce((s, cx) => s + cx.balance, 0)
    : 0

  const totalCouple  = currentUserBalance + partnerBalance
  const currentPct   = totalCouple > 0 ? (currentUserBalance / totalCouple) * 100 : 50
  const partnerPct   = 100 - currentPct

  const hasPartner      = partner !== null
  const hasData         = currentUserBalance > 0 || partnerBalance > 0
  const currentUserName = currentUser?.name ?? displayName ?? 'VocÃª'

  // â”€â”€ Sort objetivos by progress (highest pct first) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sortedObjetivos = [...objetivos].sort((a, b) => {
    const pctA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0
    const pctB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0
    return pctB - pctA
  })
  const featuredObj        = sortedObjetivos[0] ?? null
  const remainingObjetivos = sortedObjetivos.slice(1)

  const isMobile = useIsMobile()

  // â”€â”€ Reusable objetivo card renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const renderObjetivoCard = (obj: typeof objetivos[0]) => {
    const pct       = obj.targetAmount > 0 ? Math.min(100, (obj.currentAmount / obj.targetAmount) * 100) : 0
    const remaining = Math.max(0, obj.targetAmount - obj.currentAmount)
    const accent    = '#8B5CF6'
    return (
      <div key={obj.id} style={{ position: 'relative' }}>
        <button
          onClick={() => navigate(`/casal/objetivo/${obj.id}`)}
          style={{
            width: '100%', textAlign: 'left', cursor: 'pointer',
            background: 'var(--color-bg-secondary)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 16, padding: 0,
            fontFamily: 'var(--font-sans)', overflow: 'hidden',
          }}
        >
          {obj.imageUrl ? (
            <div style={{ position: 'relative', height: 110, overflow: 'hidden' }}>
              <img src={obj.imageUrl} alt={obj.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: `center ${(obj as any).imagePosition ?? 50}%` }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)' }} />
              <div style={{ position: 'absolute', top: 10, left: 14, background: 'rgba(139,92,246,0.85)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Heart size={10} color="white" fill="white" />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>Casal</span>
              </div>
              <div style={{ position: 'absolute', bottom: 10, left: 14, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{obj.name}</p>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{Math.round(pct)}%</span>
              </div>
            </div>
          ) : (
            <div style={{ height: 72, background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 100%)`, borderBottom: `1px solid ${accent}20`, display: 'flex', alignItems: 'center', padding: '0 44px 0 16px', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accent}20`, border: `1px solid ${accent}30` }}>
                <Target size={20} color={accent} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.name}</p>
                  <Heart size={11} color="#EC4899" fill="#EC4899" style={{ flexShrink: 0 }} />
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: accent, flexShrink: 0 }}>{Math.round(pct)}%</span>
            </div>
          )}
          <div style={{ padding: '12px 14px' }}>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{ height: '100%', borderRadius: 9999, background: accent, width: `${pct}%`, transition: 'width 600ms ease' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Guardado</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{formatCurrency(obj.currentAmount)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '0 0 1px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Faltam</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: remaining > 0 ? 'var(--color-text-secondary)' : 'var(--color-success)', margin: 0 }}>
                  {remaining > 0 ? formatCurrency(remaining) : 'âœ“ Meta atingida'}
                </p>
              </div>
            </div>
          </div>
        </button>
        <button
          onClick={e => { e.stopPropagation(); setObjetivoActionTarget(obj) }}
          style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', color: 'white', fontSize: 16, fontWeight: 700, lineHeight: 1 }}
          aria-label="OpÃ§Ãµes do objetivo"
        >â‹¯</button>
      </div>
    )
  }
  const HERO_BG = '#001442'

  // â”€â”€ PatrimÃ´nio card (shared between mobile/desktop) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const PatrimonioCard = ({ bgBar }: { bgBar: string }) => (
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: 'var(--radius-card)',
      padding: 20, marginBottom: 16,
    }}>
      <p className="section-label" style={{ marginBottom: 4 }}>PatrimÃ´nio do casal</p>

      {hasData ? (
        <>
          <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 16px', lineHeight: 1 }}>
            {formatCurrency(totalCouple)}
          </p>

          {/* Barra de contribuiÃ§Ã£o */}
          <div style={{ display: 'flex', borderRadius: 99, overflow: 'hidden', height: 8, background: bgBar, marginBottom: 12 }}>
            <div style={{ width: `${currentPct}%`, background: 'var(--color-lucas)', height: '100%', transition: 'width 0.5s ease' }} />
            {hasPartner && <div style={{ width: `${partnerPct}%`, background: 'var(--color-mirian)', height: '100%', transition: 'width 0.5s ease' }} />}
          </div>

          {/* Legenda */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Current user */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {photoURL ? (
                <img src={photoURL} alt="" referrerPolicy="no-referrer" style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--color-lucas)' }} />
              ) : (
                <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: 'var(--color-lucas)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>{currentUserName.charAt(0)}</div>
              )}
              <div>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>{currentUserName.split(' ')[0]}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{formatCurrency(currentUserBalance)}</p>
              </div>
            </div>

            {/* Partner */}
            {hasPartner && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, background: 'var(--color-mirian)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>{partner.name.charAt(0)}</div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>{partner.name.split(' ')[0]}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{formatCurrency(partnerBalance)}</p>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '12px 0 4px' }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-tertiary)', margin: '0 0 6px' }}>R$ 0,00</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>
            {hasPartner ? 'Comecem a lanÃ§ar entradas para ver o patrimÃ´nio' : 'Convide seu parceiro(a) para comeÃ§ar'}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>
      {/* Header */}
      {/* â”€â”€ Hero header â”€â”€ */}
      {isMobile ? (
        <>
          <PageHeader title="Casal" bg={HERO_BG} />
          <div style={{ background: HERO_BG, borderRadius: '0 0 24px 24px', padding: '0 16px 20px', marginBottom: 20 }}>
            {featuredObj ? renderObjetivoCard(featuredObj) : (
              <div style={{ background: 'rgba(139,92,246,0.1)', border: '1.5px dashed rgba(139,92,246,0.3)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={22} color="var(--color-accent-couple)" strokeWidth={1.5} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: '0 0 4px' }}>Nenhum objetivo ainda</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>Defina aonde vocÃªs querem chegar juntos</p>
                </div>
                <button onClick={() => setAddObjetivoOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '10px 20px', borderRadius: 10, cursor: 'pointer', background: 'var(--color-accent-couple)', color: 'white', border: 'none', fontFamily: 'var(--font-sans)' }}>
                  <Plus size={14} strokeWidth={2.5} />
                  Criar primeiro objetivo
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ paddingTop: 32, marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-accent-couple)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Heart size={20} fill="var(--color-accent-couple)" />
            Casal
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>VisÃ£o consolidada</p>
        </div>
      )}

      {/* â”€â”€ Modals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AddObjetivoModal open={addObjetivoOpen} onClose={() => setAddObjetivoOpen(false)} defaultIsCouple />
      <AddObjetivoModal
        open={!!editObjetivoTarget} onClose={() => setEditObjetivoTarget(null)}
        defaultIsCouple editTarget={editObjetivoTarget ?? undefined}
        onSave={(updates) => { if (!editObjetivoTarget) return; editObjetivo(editObjetivoTarget.id, updates); setEditObjetivoTarget(null) }}
      />
      <ItemActionSheet
        open={!!objetivoActionTarget} onClose={() => setObjetivoActionTarget(null)}
        title={objetivoActionTarget?.name ?? ''}
        subtitle={objetivoActionTarget ? formatCurrency(objetivoActionTarget.targetAmount) + ' de meta' : ''}
        actions={objetivoActionTarget ? [
          { label: 'Editar objetivo', icon: Pencil, color: 'var(--color-accent-primary)', onClick: () => { setEditObjetivoTarget(objetivoActionTarget); setObjetivoActionTarget(null) } },
          { label: 'Excluir objetivo', icon: Trash2, color: 'var(--color-danger)', onClick: () => { setDeleteObjetivoTarget(objetivoActionTarget); setObjetivoActionTarget(null) } },
        ] : undefined}
      />
      <ConfirmDialog
        open={!!deleteObjetivoTarget} onClose={() => setDeleteObjetivoTarget(null)}
        onConfirm={() => { if (!deleteObjetivoTarget) return; deleteObjetivo(deleteObjetivoTarget.id); setDeleteObjetivoTarget(null) }}
        title="Excluir objetivo"
        description={`"${deleteObjetivoTarget?.name ?? ''}" serÃ¡ excluÃ­do permanentemente.`}
        confirmLabel="Excluir permanentemente" variant="danger"
      />

      {/* â”€â”€ Mobile layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {isMobile && (
        <div style={{ padding: '0 16px' }}>
          <PatrimonioCard bgBar="var(--color-bg-tertiary)" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-lucas)', borderRadius: 'var(--radius-card)', padding: 16 }}>
              {photoURL ? (<img src={photoURL} alt="" referrerPolicy="no-referrer" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginBottom: 10, border: '2px solid var(--color-lucas)' }} />) : (<div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14, background: 'var(--color-lucas)', marginBottom: 10 }}>{currentUserName.charAt(0)}</div>)}
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{currentUserName.split(' ')[0]}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 8px' }}>{entradas.length > 0 ? `${entradas.length} lanÃ§amento${entradas.length > 1 ? 's' : ''}` : 'Sem lanÃ§amentos'}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-lucas)', margin: 0 }}>{formatCurrency(currentUserBalance)}</p>
            </div>
            {hasPartner ? (
              <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-mirian)', borderRadius: 'var(--radius-card)', padding: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14, background: 'var(--color-mirian)', marginBottom: 10 }}>{partner.name.charAt(0)}</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{partner.name.split(' ')[0]}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 8px' }}>Parceiro(a)</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-mirian)', margin: 0 }}>{formatCurrency(partnerBalance)}</p>
              </div>
            ) : (
              <div style={{ background: 'var(--color-bg-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-tertiary)', marginBottom: 10 }}><Users size={18} color="var(--color-text-tertiary)" strokeWidth={1.5} /></div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)', margin: '0 0 2px' }}>Parceiro(a)</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>Convide pelo cÃ³digo abaixo</p>
              </div>
            )}
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}><Target size={13} />{remainingObjetivos.length > 0 ? 'Outros objetivos' : 'Objetivos do casal'}</p>
              <button id="btn-add-objetivo-inline" onClick={() => setAddObjetivoOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 10, cursor: 'pointer', background: 'rgba(139,92,246,0.1)', color: 'var(--color-accent-couple)', border: '1.5px solid rgba(139,92,246,0.25)', fontFamily: 'var(--font-sans)', transition: 'all 150ms ease' }}>
                <Plus size={13} strokeWidth={2.5} />Novo
              </button>
            </div>
            {remainingObjetivos.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{remainingObjetivos.map(renderObjetivoCard)}</div>}
          </div>
          <InviteCodeCard copied={copied} setCopied={setCopied} partnerCode={currentUser?.partnerCode ?? 'SOMUS-0001'} />
        </div>
      )}

      {/* â”€â”€ Desktop: grid 3fr / 2fr â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {!isMobile && (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, alignItems: 'start' }}>

          {/* Coluna esquerda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {featuredObj ? renderObjetivoCard(featuredObj) : (
              <div style={{ background: 'var(--color-bg-secondary)', border: '1.5px dashed rgba(139,92,246,0.3)', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(139,92,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={24} color="var(--color-accent-couple)" strokeWidth={1.5} /></div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>Nenhum objetivo ainda</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5 }}>Defina aonde vocÃªs querem chegar juntos</p>
                </div>
                <button onClick={() => setAddObjetivoOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, padding: '10px 24px', borderRadius: 10, cursor: 'pointer', background: 'var(--color-accent-couple)', color: 'white', border: 'none', fontFamily: 'var(--font-sans)' }}>
                  <Plus size={14} strokeWidth={2.5} />Criar primeiro objetivo
                </button>
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}><Target size={13} />{remainingObjetivos.length > 0 ? 'Outros objetivos' : 'Objetivos do casal'}</p>
                <button id="btn-add-objetivo-inline" onClick={() => setAddObjetivoOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 10, cursor: 'pointer', background: 'rgba(139,92,246,0.1)', color: 'var(--color-accent-couple)', border: '1.5px solid rgba(139,92,246,0.25)', fontFamily: 'var(--font-sans)', transition: 'all 150ms ease' }}>
                  <Plus size={13} strokeWidth={2.5} />Novo
                </button>
              </div>
              {remainingObjetivos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {remainingObjetivos.map(renderObjetivoCard)}
                </div>
              )}
            </div>
          </div>

          {/* Coluna direita */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PatrimonioCard bgBar="var(--color-bg-tertiary)" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-lucas)', borderRadius: 'var(--radius-card)', padding: 16 }}>
                {photoURL ? (<img src={photoURL} alt="" referrerPolicy="no-referrer" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginBottom: 10, border: '2px solid var(--color-lucas)' }} />) : (<div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14, background: 'var(--color-lucas)', marginBottom: 10 }}>{currentUserName.charAt(0)}</div>)}
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{currentUserName.split(' ')[0]}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 8px' }}>{entradas.length > 0 ? `${entradas.length} lanÃ§amento${entradas.length > 1 ? 's' : ''}` : 'Sem lanÃ§amentos'}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-lucas)', margin: 0 }}>{formatCurrency(currentUserBalance)}</p>
              </div>
              {hasPartner ? (
                <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-mirian)', borderRadius: 'var(--radius-card)', padding: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14, background: 'var(--color-mirian)', marginBottom: 10 }}>{partner.name.charAt(0)}</div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{partner.name.split(' ')[0]}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 8px' }}>Parceiro(a)</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-mirian)', margin: 0 }}>{formatCurrency(partnerBalance)}</p>
                </div>
              ) : (
                <div style={{ background: 'var(--color-bg-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-card)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-tertiary)', marginBottom: 10 }}><Users size={18} color="var(--color-text-tertiary)" strokeWidth={1.5} /></div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)', margin: '0 0 2px' }}>Parceiro(a)</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>Convide pelo cÃ³digo abaixo</p>
                </div>
              )}
            </div>
            <InviteCodeCard copied={copied} setCopied={setCopied} partnerCode={currentUser?.partnerCode ?? 'SOMUS-0001'} />
          </div>

        </div>
      )}
    </div>
  )
}

function InviteCodeCard({ copied, setCopied, partnerCode }: { copied: boolean; setCopied: (v: boolean) => void; partnerCode: string }) {
  return (
    <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 16 }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Share2 size={12} />CÃ³digo de convite
      </p>
      <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-accent-couple)', margin: 0 }}>{partnerCode}</p>
      <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>Compartilhe com seu parceiro(a)</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, fontSize: 12, fontWeight: 600, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.08)', color: copied ? 'var(--color-success)' : 'var(--color-accent-couple)', border: `1px solid ${copied ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.15)'}`, fontFamily: 'var(--font-sans)', transition: 'all 200ms ease', justifyContent: 'center' }}
          onClick={() => { navigator.clipboard.writeText(partnerCode); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        >
          {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
          {copied ? 'Copiado!' : 'Copiar cÃ³digo'}
        </button>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, fontSize: 12, fontWeight: 600, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: 'var(--color-accent-couple)', color: 'white', border: 'none', fontFamily: 'var(--font-sans)', transition: 'opacity 150ms ease', justifyContent: 'center' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onClick={() => {
            const msg = `ðŸ’œ Entra comigo no Somus!\n\nCÃ³digo: ${partnerCode}\n\nhttps://somus.vercel.app`
            if (navigator.share) { navigator.share({ title: 'Somus', text: msg }).catch(() => {}) }
            else { navigator.clipboard.writeText(msg); setCopied(true); setTimeout(() => setCopied(false), 2000) }
          }}
        >
          <Send size={13} />Compartilhar
        </button>
      </div>
    </div>
  )
}
