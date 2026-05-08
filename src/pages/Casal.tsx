import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAppStore } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { PageHeader, ConfirmDialog } from '../components/ui'
import ItemActionSheet from '../components/ui/ItemActionSheet'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../hooks/useAuth'
import { Share2, Copy, CheckCircle2, Send, UserPlus, Plus, Pencil, Trash2, Target, Eye, EyeOff } from 'lucide-react'
import { useBalanceHidden } from '../hooks/useBalanceHidden'
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
  const divisoes       = useAppStore(useShallow(s => s.divisoes))
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

  const currentUserEntradas = entradas.filter(e => e.userId === (currentUser?.id ?? ''))

  const totalCouple = currentUserBalance + partnerBalance
  const currentPct  = totalCouple > 0 ? (currentUserBalance / totalCouple) * 100 : 50
  const partnerPct  = 100 - currentPct

  const hasPartner      = partner !== null
  const currentUserName = currentUser?.name ?? displayName ?? 'Você'

  // ── Sort objetivos by progress (highest pct first) ───────────────────
  const sortedObjetivos = [...objetivos].sort((a, b) => {
    const pctA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0
    const pctB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0
    return pctB - pctA
  })

  const isMobile = useIsMobile()
  const HERO_BG = '#001442'
  const rawCode = currentUser?.partnerCode ?? '0001'
  const partnerCode = rawCode.startsWith('SOMUS-') ? rawCode.replace('SOMUS-', '').slice(-4).toUpperCase() : rawCode
  const { hidden: balanceHidden, toggle: toggleBalanceHidden } = useBalanceHidden()
  const mask = '•••••'

  // ── PatrimonioCard — all-in-one, profiles inside ──────────────────────
  const PatrimonioCard = ({ isHero = false }: { isHero?: boolean }) => {
    const barBg = isHero ? 'rgba(255,255,255,0.12)' : 'var(--color-bg-tertiary)'

    return (
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: isHero ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(139,92,246,0.2)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}>
        {/* ── Top section: label + total ── */}
        <div style={{ padding: '18px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <p className="section-label" style={{
              margin: 0,
              color: isHero ? 'rgba(255,255,255,0.45)' : 'var(--color-text-tertiary)'
            }}>
              Patrimônio do casal
            </p>
            <button
              onClick={toggleBalanceHidden}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                color: isHero ? 'rgba(255,255,255,0.4)' : 'var(--color-text-tertiary)',
                display: 'flex', alignItems: 'center', transition: 'color 150ms ease',
              }}
            >
              {balanceHidden ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <p style={{
            fontSize: 32, fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: '0 0 14px', lineHeight: 1,
          }}>
            {balanceHidden ? <span style={{ letterSpacing: 4 }}>{mask}</span> : formatCurrency(totalCouple)}
          </p>

          {/* Split bar */}
          <div style={{ display: 'flex', borderRadius: 99, overflow: 'hidden', height: 6, background: barBg, marginBottom: 0 }}>
            <div style={{ width: `${currentPct}%`, background: 'var(--color-lucas)', height: '100%', transition: 'width 0.5s ease' }} />
            {hasPartner && (
              <div style={{ width: `${partnerPct}%`, background: 'var(--color-mirian)', height: '100%', transition: 'width 0.5s ease' }} />
            )}
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: isHero ? 'rgba(255,255,255,0.07)' : 'var(--color-border)', margin: '14px 0 0' }} />

        {/* ── Bottom section: profiles side by side ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

          {/* Current user */}
          <div style={{
            padding: '14px 20px',
            borderRight: `1px solid ${isHero ? 'rgba(255,255,255,0.07)' : 'var(--color-border)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              {photoURL ? (
                <img src={photoURL} alt="" referrerPolicy="no-referrer"
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--color-lucas)' }} />
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'var(--color-lucas)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>
                  {currentUserName.charAt(0)}
                </div>
              )}
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                {currentUserName.split(' ')[0]}
              </p>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-lucas)', margin: '0 0 3px' }}>
              {balanceHidden ? <span style={{ letterSpacing: 2 }}>{mask}</span> : formatCurrency(currentUserBalance)}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>
              {currentUserEntradas.length > 0
                ? `${currentUserEntradas.length} lançamento${currentUserEntradas.length > 1 ? 's' : ''}`
                : 'Sem lançamentos'}
            </p>
          </div>

          {/* Partner — or invite CTA */}
          {hasPartner ? (
            <div style={{ padding: '14px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'var(--color-mirian)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>
                  {partner.name.charAt(0)}
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                  {partner.name.split(' ')[0]}
                </p>
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-mirian)', margin: '0 0 3px' }}>
                {balanceHidden ? <span style={{ letterSpacing: 2 }}>{mask}</span> : formatCurrency(partnerBalance)}
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>Parceiro(a)</p>
            </div>
          ) : (
            <div style={{
              padding: '14px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 10,
            }}>
              {/* Avatar + name placeholder */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(139,92,246,0.08)',
                  border: '1.5px dashed rgba(139,92,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <UserPlus size={12} color="var(--color-accent-couple)" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)', margin: 0 }}>
                    Parceiro(a)
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--color-text-tertiary)', margin: 0, opacity: 0.7 }}>
                    Não vinculado
                  </p>
                </div>
              </div>

              {/* Share button */}
              <button
                onClick={() => {
                  const msg = `💜 Entra comigo no Somus!\n\nhttps://somus.vercel.app/convite/${partnerCode}`
                  if (navigator.share) {
                    navigator.share({ title: 'Somus', text: msg }).catch(() => {})
                  } else {
                    navigator.clipboard.writeText(msg)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '7px 0',
                  borderRadius: 8,
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  color: 'var(--color-accent-couple)',
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  transition: 'all 150ms ease',
                  width: '100%',
                }}
              >
                <UserPlus size={12} />
                Convidar
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24 }}>

      {/* ── Header ── */}
      {isMobile ? (
        <>
          <PageHeader title="Casal" bg={HERO_BG} />
          <div style={{
            background: HERO_BG,
            borderRadius: '0 0 24px 24px',
            padding: '12px 16px 20px',
            marginBottom: 20,
          }}>
            <PatrimonioCard isHero />
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

      {/* ── Modals ── */}
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

      {/* ── Content ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '3fr 2fr',
        gap: 24,
        alignItems: 'start',
        padding: isMobile ? '0 16px' : 0,
      }}>

        {/* Left Column — Objectives */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Desktop: Patrimônio goes here (top of left column) */}
          {!isMobile && <PatrimonioCard />}

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
                  transition: 'all 150ms ease',
                }}
              >
                <Plus size={13} strokeWidth={2.5} />Novo
              </button>
            </div>

            {sortedObjetivos.length === 0 ? (
              <div style={{
                background: 'var(--color-bg-secondary)',
                border: '1.5px dashed rgba(139,92,246,0.3)',
                borderRadius: 16, padding: 32,
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12,
              }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(139,92,246,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                gridTemplateColumns: sortedObjetivos.length === 1 ? '1fr' : '1fr 1fr',
                gap: 16,
                alignItems: 'stretch',
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

        {/* Right Column — Invite code (desktop only, only when no partner) */}
        {!isMobile && !hasPartner && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <InviteCodeCard copied={copied} setCopied={setCopied} partnerCode={partnerCode} />
          </div>
        )}
      </div>

      {/* Mobile-only invite code at the bottom — only while no partner */}
      {isMobile && !hasPartner && (
        <div style={{ padding: '0 16px', marginTop: 24 }}>
          <InviteCodeCard copied={copied} setCopied={setCopied} partnerCode={partnerCode} />
        </div>
      )}
    </div>
  )
}

function InviteCodeCard({ copied, setCopied, partnerCode }: { copied: boolean; setCopied: (v: boolean) => void; partnerCode: string }) {
  return (
    <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', padding: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        <Share2 size={11} />Vincular parceiro(a)
      </p>
      <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--color-accent-couple)', margin: 0 }}>{partnerCode}</p>
      <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>Compartilhe este código para conectar as finanças do casal</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 6, flex: 1, fontSize: 12, fontWeight: 600,
            padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
            background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.08)',
            color: copied ? 'var(--color-success)' : 'var(--color-accent-couple)',
            border: `1px solid ${copied ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.15)'}`,
            fontFamily: 'var(--font-sans)', transition: 'all 200ms ease', justifyContent: 'center',
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
            justifyContent: 'center',
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
