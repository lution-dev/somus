import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAppStore } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { ProgressBar, PageHeader } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAuth } from '../hooks/useAuth'
import { Target, Share2, Copy, Heart, CheckCircle2, Building2, Send, Users, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const OBJ_ICONS: Record<string, LucideIcon> = {
  'obj-casamento': Heart,
  'obj-apto': Building2,
}
function getObjIcon(id: string): LucideIcon { return OBJ_ICONS[id] || Target }

export default function Casal() {
  const [copied, setCopied] = useState(false)
  const [, navigate] = useLocation()
  const { photoURL, displayName } = useAuth()
  const currentUser = useAppStore(s => s.currentUser)
  const partner     = useAppStore(s => s.partner)
  const objetivos   = useAppStore(useShallow(s => s.objetivos))
  const caixinhas   = useAppStore(useShallow(s => s.caixinhas))
  const entradas    = useAppStore(useShallow(s => s.entradas))

  // ── Calculate real balances ──────────────────────────────────────────────────
  const currentUserBalance = caixinhas
    .filter(cx => cx.userId === (currentUser?.id ?? 'lucas'))
    .reduce((s, cx) => s + cx.balance, 0)

  const partnerBalance = partner
    ? caixinhas.filter(cx => cx.userId === partner.id).reduce((s, cx) => s + cx.balance, 0)
    : 0

  const totalCouple  = currentUserBalance + partnerBalance
  const currentPct   = totalCouple > 0 ? (currentUserBalance / totalCouple) * 100 : 50
  const partnerPct   = 100 - currentPct

  const hasPartner      = partner !== null
  const hasData         = currentUserBalance > 0 || partnerBalance > 0
  const currentUserName = currentUser?.name ?? displayName ?? 'Você'

  const isMobile = useIsMobile()
  const HERO_BG = '#001442'

  // ── Empty state component ──────────────────────────────────────────────────
  const EmptyCard = ({ icon: Icon, title, desc }: { icon: LucideIcon, title: string, desc: string }) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', padding: '32px 20px',
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(139,92,246,0.08)',
        marginBottom: 14,
      }}>
        <Icon size={22} color="var(--color-accent-couple)" strokeWidth={1.5} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px' }}>{title}</p>
      <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5, maxWidth: 260 }}>{desc}</p>
    </div>
  )

  // ── Patrimônio card (shared between mobile/desktop) ─────────────────────────
  const PatrimonioCard = ({ bgBar }: { bgBar: string }) => (
    <div style={{
      background: isMobile ? 'rgba(255,255,255,0.06)' : 'var(--color-bg-secondary)',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: 'var(--radius-card)',
      padding: 20, marginBottom: 16,
    }}>
      <p className="section-label" style={{ marginBottom: 4 }}>Patrimônio do casal</p>

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
            padding: '0 16px 20px',
            marginBottom: 20,
          }}>
            <PatrimonioCard bgBar="rgba(255,255,255,0.08)" />
          </div>
        </>
      ) : (
        <div style={{ paddingTop: 32, marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-accent-couple)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Heart size={20} fill="var(--color-accent-couple)" />
            Casal
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>Visão consolidada</p>
        </div>
      )}

      <div style={{ padding: isMobile ? '0 16px' : 0 }}>

      {/* Desktop: patrimônio card */}
      {!isMobile && <PatrimonioCard bgBar="var(--color-bg-tertiary)" />}

      {/* Cards de perfil — grid 1fr 1fr */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Current user card */}
        <div style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-lucas)',
          borderRadius: 'var(--radius-card)',
          padding: 16,
        }}>
          {photoURL ? (
            <img src={photoURL} alt="" referrerPolicy="no-referrer" style={{
              width: 40, height: 40, borderRadius: '50%',
              objectFit: 'cover', marginBottom: 10,
              border: '2px solid var(--color-lucas)',
            }} />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: 'white', fontSize: 14,
              background: 'var(--color-lucas)', marginBottom: 10,
            }}>
              {currentUserName.charAt(0)}
            </div>
          )}
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{currentUserName.split(' ')[0]}</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 8px' }}>
            {entradas.length > 0 ? `${entradas.length} lançamento${entradas.length > 1 ? 's' : ''}` : 'Sem lançamentos'}
          </p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-lucas)', margin: 0 }}>{formatCurrency(currentUserBalance)}</p>
        </div>

        {/* Partner card */}
        {hasPartner ? (
          <div style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-mirian)',
            borderRadius: 'var(--radius-card)',
            padding: 16,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: 'white', fontSize: 14,
              background: 'var(--color-mirian)', marginBottom: 10,
            }}>
              {partner.name.charAt(0)}
            </div>
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
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-bg-tertiary)', marginBottom: 10,
            }}>
              <Users size={18} color="var(--color-text-tertiary)" strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-tertiary)', margin: '0 0 2px' }}>Parceiro(a)</p>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>Convide pelo código abaixo</p>
          </div>
        )}
      </div>

      {/* Objetivos */}
      <div style={{ marginBottom: 20 }}>
        <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Target size={13} />
          Objetivos do casal
        </p>

        {objetivos.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {objetivos.map((obj) => {
              const pct     = obj.targetAmount > 0 ? Math.min(100, (obj.currentAmount / obj.targetAmount) * 100) : 0
              const ObjIcon = getObjIcon(obj.id)
              return (
                <button
                  key={obj.id}
                  onClick={() => navigate(`/casal/objetivo/${obj.id}`)}
                  className="card-interactive"
                  style={{
                    width: '100%', textAlign: 'left', cursor: 'pointer',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                    padding: 16,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(139,92,246,0.12)',
                      }}>
                        <ObjIcon size={17} color="var(--color-accent-couple)" />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{obj.name}</p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-accent-couple)', margin: 0 }}>
                      {Math.round(pct)}%
                    </p>
                  </div>

                  <ProgressBar value={pct} variant="couple" size="sm" />

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>{formatCurrency(obj.currentAmount)}</p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>meta {formatCurrency(obj.targetAmount)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <EmptyCard
            icon={Sparkles}
            title="Nenhum objetivo ainda"
            desc="Crie objetivos como casamento, viagem ou apartamento para acompanhar o progresso juntos."
          />
        )}
      </div>

      {/* Código de convite */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: 16,
      }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Share2 size={12} />
          Código de convite
        </p>
        <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-sans)', letterSpacing: '0.12em', color: 'var(--color-accent-couple)', margin: 0 }}>
          {currentUser?.partnerCode ?? 'SOMUS-0001'}
        </p>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>Compartilhe com seu parceiro(a)</p>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6, flex: 1,
              fontSize: 12, fontWeight: 600, padding: '10px 12px',
              borderRadius: 10, cursor: 'pointer',
              background: copied ? 'rgba(16,185,129,0.1)' : 'rgba(139,92,246,0.08)',
              color: copied ? 'var(--color-success)' : 'var(--color-accent-couple)',
              border: `1px solid ${copied ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.15)'}`,
              fontFamily: 'var(--font-sans)',
              transition: 'all 200ms ease',
              justifyContent: 'center',
            }}
            onClick={() => {
              navigator.clipboard.writeText(currentUser?.partnerCode ?? 'SOMUS-0001')
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
          >
            {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
            {copied ? 'Copiado!' : 'Copiar código'}
          </button>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6, flex: 1,
              fontSize: 12, fontWeight: 600, padding: '10px 12px',
              borderRadius: 10, cursor: 'pointer',
              background: 'var(--color-accent-couple)',
              color: 'white',
              border: 'none',
              fontFamily: 'var(--font-sans)',
              transition: 'opacity 150ms ease',
              justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            onClick={() => {
              const code = currentUser?.partnerCode ?? 'SOMUS-0001'
              const msg = `💜 Entra comigo no Somus pra gente organizar nossas finanças juntos!\n\nUsa o código: ${code}\n\nhttps://somus.vercel.app`
              if (navigator.share) {
                navigator.share({ title: 'Somus — Finanças do Casal', text: msg }).catch(() => {})
              } else {
                navigator.clipboard.writeText(msg)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }
            }}
          >
            <Send size={13} />
            Compartilhar
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
