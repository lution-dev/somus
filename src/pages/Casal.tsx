import { useAppStore } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { ProgressBar } from '../components/ui'
import { Target, Plane, Car, Share2, Copy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const OBJ_ICONS: Record<string, LucideIcon> = {
  'obj-viagem': Plane,
  'obj-carro': Car,
}
function getObjIcon(id: string): LucideIcon { return OBJ_ICONS[id] || Target }

export default function Casal() {
  const currentUser = useAppStore(s => s.currentUser)
  const partner     = useAppStore(s => s.partner)
  const objetivos   = useAppStore(useShallow(s => s.objetivos))
  const caixinhas   = useAppStore(useShallow(s => s.caixinhas))

  const lucasBalance  = caixinhas.filter(cx => cx.userId === 'lucas').reduce((s, cx) => s + cx.balance, 0)
  const mirianBalance = 2850 * 0.8
  const totalCouple   = lucasBalance + mirianBalance
  const lucasPct      = totalCouple > 0 ? (lucasBalance / totalCouple) * 100 : 50
  const mirianPct     = 100 - lucasPct

  const profiles = [
    { user: currentUser, accent: 'var(--color-lucas)', balance: lucasBalance, tipo: 'Renda variável' },
    { user: partner,     accent: 'var(--color-mirian)', balance: mirianBalance, tipo: 'Renda fixa' },
  ]

  return (
    <div style={{ minHeight: '100%', paddingBottom: 24, paddingTop: 32 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-accent-couple)', margin: 0 }}>♥ Casal</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>Visão consolidada</p>
      </div>

      {/* Card total patrimônio */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: 'var(--radius-card)',
        padding: 20, marginBottom: 16,
      }}>
        <p className="section-label" style={{ marginBottom: 4 }}>Patrimônio do casal</p>
        <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 16px', lineHeight: 1 }}>
          {formatCurrency(totalCouple)}
        </p>

        {/* Barra de contribuição */}
        <div style={{ display: 'flex', borderRadius: 99, overflow: 'hidden', height: 8, background: 'var(--color-bg-tertiary)', marginBottom: 12 }}>
          <div style={{ width: `${lucasPct}%`, background: 'var(--color-lucas)', height: '100%', transition: 'width 0.5s ease' }} />
          <div style={{ width: `${mirianPct}%`, background: 'var(--color-mirian)', height: '100%', transition: 'width 0.5s ease' }} />
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {profiles.map(({ user, accent, balance }) => user ? (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: accent }} />
              <div>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>{user.name.split(' ')[0]}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{formatCurrency(balance)}</p>
              </div>
            </div>
          ) : null)}
        </div>
      </div>

      {/* Cards de perfil — grid 1fr 1fr */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {profiles.map(({ user, accent, balance, tipo }) => user ? (
          <div
            key={user.id}
            style={{
              background: 'var(--color-bg-secondary)',
              border: `1px solid ${accent}`,
              borderRadius: 'var(--radius-card)',
              padding: 16,
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: 'white', fontSize: 14,
              background: accent, marginBottom: 10,
            }}>
              {user.name.charAt(0)}
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{user.name.split(' ')[0]}</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 8px' }}>{tipo}</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: accent, margin: 0 }}>{formatCurrency(balance)}</p>
          </div>
        ) : null)}
      </div>

      {/* Objetivos */}
      {objetivos.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Target size={13} />
            Objetivos do casal
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {objetivos.map((obj) => {
              const pct     = Math.min(100, (obj.currentAmount / obj.targetAmount) * 100)
              const ObjIcon = getObjIcon(obj.id)
              return (
                <div
                  key={obj.id}
                  style={{
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                    padding: 16,
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
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Código de convite */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Share2 size={12} />
              Código de convite
            </p>
            <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-accent-couple)', margin: 0 }}>
              {currentUser?.partnerCode ?? 'SOMUS-0001'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>Compartilhe com seu parceiro(a)</p>
          </div>
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, padding: '8px 12px',
              borderRadius: 'var(--radius-card)', cursor: 'pointer',
              background: 'rgba(139,92,246,0.1)', color: 'var(--color-accent-couple)',
              border: '1px solid rgba(139,92,246,0.2)',
              fontFamily: 'var(--font-sans)',
            }}
            onClick={() => navigator.clipboard.writeText(currentUser?.partnerCode ?? 'SOMUS-0001')}
          >
            <Copy size={13} />
            Copiar
          </button>
        </div>
      </div>
    </div>
  )
}
