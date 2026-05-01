import { useAuth } from '../hooks/useAuth'
import { useAppStore } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { PageHeader } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import { Mail, User, Shield, Smartphone, LogOut } from 'lucide-react'

export default function Perfil() {
  const { displayName, photoURL, email, signOut, uid } = useAuth()
  const isMobile = useIsMobile()
  const currentUser = useAppStore(useShallow(s => s.currentUser))

  const initials = (displayName ?? email ?? '?')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div style={{ minHeight: '100%', paddingBottom: 32 }}>
      {isMobile && (
        <PageHeader title="Perfil" back backTo="/home" />
      )}

      {!isMobile && (
        <div style={{ paddingTop: 32, marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            Perfil
          </h1>
        </div>
      )}

      {/* Profile card */}
      <div style={{
        padding: isMobile ? '0 16px' : 0,
      }}>
        <div style={{
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
          overflow: 'hidden',
        }}>
          {/* Avatar + Name header */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '32px 20px 24px',
            background: 'linear-gradient(180deg, rgba(59,130,246,0.06) 0%, transparent 100%)',
            borderBottom: '1px solid var(--color-border)',
          }}>
            {photoURL ? (
              <img
                src={photoURL}
                alt=""
                referrerPolicy="no-referrer"
                style={{
                  width: 80, height: 80, borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--color-border)',
                  marginBottom: 14,
                }}
              />
            ) : (
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--color-accent-primary)', color: 'white',
                fontSize: 28, fontWeight: 700, marginBottom: 14,
              }}>
                {initials}
              </div>
            )}
            <h2 style={{
              fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)',
              margin: '0 0 4px', textAlign: 'center',
            }}>
              {displayName ?? 'Usuário'}
            </h2>
            {email && (
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
                {email}
              </p>
            )}
          </div>

          {/* Info rows */}
          <div>
            <InfoRow
              icon={<User size={16} />}
              label="Nome no app"
              value={currentUser?.name ?? displayName ?? '—'}
            />
            <InfoRow
              icon={<Mail size={16} />}
              label="Email"
              value={email ?? '—'}
            />
            <InfoRow
              icon={<Shield size={16} />}
              label="Provedor"
              value="Google"
            />
            <InfoRow
              icon={<Smartphone size={16} />}
              label="ID do usuário"
              value={uid ? `${uid.slice(0, 8)}...${uid.slice(-4)}` : '—'}
              muted
            />
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={signOut}
          style={{
            width: '100%', marginTop: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '14px 20px', borderRadius: 'var(--radius-card)',
            border: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.06)',
            color: 'var(--color-danger)',
            fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
            transition: 'background 150ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
        >
          <LogOut size={16} />
          Sair da conta
        </button>

        <p style={{
          fontSize: 11, color: 'var(--color-text-tertiary)',
          textAlign: 'center', marginTop: 24,
        }}>
          Somus MVP · v0.2
        </p>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value, muted }: {
  icon: React.ReactNode
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 20px',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <span style={{ display: 'flex', color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>{label}</p>
        <p style={{
          fontSize: 14, fontWeight: 500, margin: 0,
          color: muted ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: muted ? 'monospace' : 'inherit',
        }}>
          {value}
        </p>
      </div>
    </div>
  )
}
