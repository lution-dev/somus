import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAppStore } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { PageHeader, ConfirmDialog } from '../components/ui'
import ItemActionSheet from '../components/ui/ItemActionSheet'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../hooks/useAuth'
import { Share2, Copy, CheckCircle2, Send, Users, Plus, Pencil, Trash2, Target } from 'lucide-react'
import type { Objetivo } from '../types'
import AddObjetivoModal from '../components/features/AddObjetivoModal'
import ObjetivoCard from '../components/features/ObjetivoCard'

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

  // ── Calculate real balances ───────────────────────────────────────────
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
  const currentUserName = currentUser?.name ?? displayName ?? 'Você'

  // ── Sort objetivos by progress (highest pct first) ───────────────────
  const sortedObjetivos = [...objetivos].sort((a, b) => {
    const pctA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0
    const pctB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0
    return pctB - pctA
  })

  const isMobile = useIsMobile()
  const HERO_BG = '#001442'

  // ── Patrimonio card (shared between mobile/desktop) ──────────────────
  const PatrimonioCard = ({ bgBar, marginBottom = 16, isHero = false }: { bgBar: string, marginBottom?: number, isHero?: boolean }) => (
    <div style={{
      background: 'var(--color-bg-secondary)',
      border: isHero ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(139,92,246,0.2)',
      borderRadius: 'var(--radius-card)',
      padding: 20, marginBottom,
      boxShadow: isHero ? '0 10px 25px -5px rgba(0,0,0,0.3)' : 'none',
    }}>
      <p className="section-label" style={{ marginBottom: 4, color: isHero ? 'rgba(255,255,255,0.5)' : 'var(--color-text-tertiary)' }}>Patrimônio do casal</p>

      {hasData ? (
        <>
          <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 16px', lineHeight: 1 }}>
            {formatCurrency(totalCouple)}
          </p>

          {/* Barra de contribuição */}
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
            {hasPartner ? 'Comecem a lançar entradas para ver o patrimônio' : 'Convide seu parceiro(a) para começar'}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>
      {/* Header */}
      {isMobile ? (
        <>
          <PageHeader title="Casal" bg={HERO_BG} />
          <div style={{
            background: HERO_BG,
            borderRadius: '0 0 24px 24px',
            padding: '12px 16px 20px',
            marginBottom: 20,
          }}>
            <PatrimonioCard bgBar="rgba(255,255,255,0.1)" marginBottom={0} isHero />
          </div>
        </>
      ) : (
        <div style={{ paddingTop: 32, marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            Casal
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>Visão consolidada</p>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <AddObjetivoModal open={addObjetivoOpen} onClose={() => setAddObjetivoOpen(false)} defaultIsCouple />
      <AddObjetivoModal
        open={!!editObjetivoTarget} onClose={() => setEditObjetivoTarget(null)}
        defaultIsCouple editTarget={editObjetivoTarget ?? undefined}
        onSave={(updates) => { if (!editObjetivoTarget) return; editObjetivo(editObjetivoTarget.id, updates); setEditObjetivoTarget(null) }}
      />
      <ItemActionSheet
        open={!!objetivoActionTarget} 
        onClose={() => setObjetivoActionTarget(null)}
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
        description={`"${deleteObjetivoTarget?.name ?? ''}" será excluído permanentemente.`}
        confirmLabel="Excluir permanentemente" variant="danger"
      />

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr', 
        gap: 24, 
        alignItems: 'start',
        padding: isMobile ? '0 16px' : 0
      }}>

        {/* Left Column (Objectives) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {!isMobile && <PatrimonioCard bgBar="var(--color-bg-tertiary)" />}
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                <Target size={13} />Objetivos do casal
              </p>
              <button 
                id="btn-add-objetivo-inline" 
                onClick={() => setAddObjetivoOpen(true)} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, 
                  padding: '7px 14px', borderRadius: 10, cursor: 'pointer', 
                  background: 'rgba(139,92,246,0.1)', color: 'var(--color-accent-couple)', 
                  border: '1.5px solid rgba(139,92,246,0.25)', fontFamily: 'var(--font-sans)', 
                  transition: 'all 150ms ease' 
                }}
              >
                <Plus size={13} strokeWidth={2.5} />Novo
              </button>
            </div>

            {sortedObjetivos.length === 0 ? (
              <div style={{ 
                background: 'var(--color-bg-secondary)', 
                border: '1.5px dashed rgba(139,92,246,0.3)', 
                borderRadius: 16, 
                padding: 32, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center', 
                gap: 12 
              }}>
                <div style={{ 
                  width: 52, height: 52, borderRadius: 16, 
                  background: 'rgba(139,92,246,0.08)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Target size={24} color="var(--color-accent-couple)" strokeWidth={1.5} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>Nenhum objetivo ainda</p>
                  <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5 }}>Defina aonde vocês querem chegar juntos</p>
                </div>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile || sortedObjetivos.length === 1 ? '1fr' : '1fr 1fr', 
                gap: 16 
              }}>
                {sortedObjetivos.map(obj => (
                  <ObjetivoCard 
                    key={obj.id} 
                    obj={obj} 
                    onNavigate={(id) => navigate(`/casal/objetivo/${id}`)}
                    onAction={setObjetivoActionTarget}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Profiles & Invite) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ 
              background: 'var(--color-bg-secondary)', 
              border: '1px solid var(--color-lucas)', 
              borderRadius: 'var(--radius-card)', 
              padding: 16 
            }}>
              {photoURL ? (
                <img src={photoURL} alt="" referrerPolicy="no-referrer" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginBottom: 10, border: '2px solid var(--color-lucas)' }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14, background: 'var(--color-lucas)', marginBottom: 10 }}>{currentUserName.charAt(0)}</div>
              )}
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{currentUserName.split(' ')[0]}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 8px' }}>{entradas.length > 0 ? `${entradas.length} lançamento${entradas.length > 1 ? 's' : ''}` : 'Sem lançamentos'}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-lucas)', margin: 0 }}>{formatCurrency(currentUserBalance)}</p>
            </div>
            
            {hasPartner ? (
              <div style={{ 
                background: 'var(--color-bg-secondary)', 
                border: '1px solid var(--color-mirian)', 
                borderRadius: 'var(--radius-card)', 
                padding: 16 
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14, background: 'var(--color-mirian)', marginBottom: 10 }}>{partner.name.charAt(0)}</div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{partner.name.split(' ')[0]}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 8px' }}>Parceiro(a)</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-mirian)', margin: 0 }}>{formatCurrency(partnerBalance)}</p>
              </div>
            ) : (
              <div style={{ 
                background: 'var(--color-bg-secondary)', 
                border: '1px dashed var(--color-border)', 
                borderRadius: 'var(--radius-card)', 
                padding: 16, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                textAlign: 'center' 
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-tertiary)', marginBottom: 10 }}>
                  <Users size={18} color="var(--color-text-tertiary)" strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)', margin: '0 0 2px' }}>Parceiro(a)</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>Convide pelo código abaixo</p>
              </div>
            )}
          </div>

          <InviteCodeCard copied={copied} setCopied={setCopied} partnerCode={currentUser?.partnerCode ?? 'SOMUS-0001'} />
        </div>
      </div>
    </div>
  )
}

function InviteCodeCard({ copied, setCopied, partnerCode }: { copied: boolean; setCopied: (v: boolean) => void; partnerCode: string }) {
  return (
    <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 16 }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Share2 size={12} />Código de convite
      </p>
      <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-accent-couple)', margin: 0 }}>{partnerCode}</p>
      <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>Compartilhe com seu parceiro(a)</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          style={{ 
            display: 'flex', alignItems: 'center', gap: 6, flex: 1, fontSize: 12, fontWeight: 600, 
            padding: '10px 12px', borderRadius: 10, cursor: 'pointer', 
            background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.08)', 
            color: copied ? 'var(--color-success)' : 'var(--color-accent-couple)', 
            border: `1px solid ${copied ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.15)'}`, 
            fontFamily: 'var(--font-sans)', transition: 'all 200ms ease', justifyContent: 'center' 
          }}
          onClick={() => { navigator.clipboard.writeText(partnerCode); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        >
          {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
          {copied ? 'Copiado!' : 'Copiar código'}
        </button>
        <button
          style={{ 
            display: 'flex', alignItems: 'center', gap: 6, flex: 1, fontSize: 12, fontWeight: 600, 
            padding: '10px 12px', borderRadius: 10, cursor: 'pointer', 
            background: 'var(--color-accent-couple)', color: 'white', 
            border: 'none', fontFamily: 'var(--font-sans)', transition: 'opacity 150ms ease', 
            justifyContent: 'center' 
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          onClick={() => {
            const msg = `💜 Entra comigo no Somus!\n\nCódigo: ${partnerCode}\n\nhttps://somus.vercel.app`
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
