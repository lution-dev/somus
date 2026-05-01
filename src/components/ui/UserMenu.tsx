import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAuth } from '../../hooks/useAuth'
import { User, LogOut } from 'lucide-react'

/**
 * Avatar button that opens a small popover with profile + logout options.
 * Used in both the desktop Sidebar and the mobile Home header.
 */
export default function UserMenu({ variant = 'default' }: { variant?: 'default' | 'hero' }) {
  const { displayName, photoURL, email, signOut } = useAuth()
  const [, navigate] = useLocation()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initials = (displayName ?? email ?? '?')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const isHero = variant === 'hero'
  const avatarSize = isHero ? 32 : 34

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          borderRadius: '50%', display: 'flex',
        }}
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt=""
            referrerPolicy="no-referrer"
            style={{
              width: avatarSize, height: avatarSize, borderRadius: '50%',
              objectFit: 'cover',
              border: isHero
                ? '2px solid rgba(255,255,255,0.2)'
                : '2px solid var(--color-border)',
            }}
          />
        ) : (
          <div style={{
            width: avatarSize, height: avatarSize, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isHero ? 'rgba(255,255,255,0.15)' : 'var(--color-accent-primary)',
            color: 'white', fontSize: 13, fontWeight: 700,
          }}>
            {initials}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: isHero ? undefined : '100%',
          top: isHero ? '100%' : undefined,
          right: 0,
          marginBottom: isHero ? 0 : 8,
          marginTop: isHero ? 8 : 0,
          width: 220,
          borderRadius: 12,
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
          overflow: 'hidden',
          zIndex: 999,
          animation: 'userMenuFadeIn 150ms ease',
        }}>
          <style>{`
            @keyframes userMenuFadeIn {
              from { opacity: 0; transform: translateY(${isHero ? '-4px' : '4px'}); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* User info header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            {photoURL ? (
              <img
                src={photoURL}
                alt=""
                referrerPolicy="no-referrer"
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  objectFit: 'cover', flexShrink: 0,
                  border: '2px solid var(--color-border)',
                }}
              />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--color-accent-primary)', color: 'white',
                fontSize: 14, fontWeight: 700,
              }}>
                {initials}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)',
                margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {displayName ?? 'Usuário'}
              </p>
              {email && (
                <p style={{
                  fontSize: 11, color: 'var(--color-text-tertiary)',
                  margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {email}
                </p>
              )}
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: '4px 0' }}>
            <MenuItem
              icon={<User size={15} />}
              label="Ver perfil"
              onClick={() => { setOpen(false); navigate('/perfil') }}
            />
            <MenuItem
              icon={<LogOut size={15} />}
              label="Sair"
              danger
              onClick={() => { setOpen(false); signOut() }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon, label, onClick, danger }: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', border: 'none',
        background: 'transparent', cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
        fontSize: 13, fontWeight: 500,
        color: danger ? 'var(--color-danger)' : 'var(--color-text-primary)',
        transition: 'background 120ms ease',
      }}
      onMouseEnter={e => e.currentTarget.style.background = danger
        ? 'rgba(239,68,68,0.08)'
        : 'var(--color-bg-tertiary)'
      }
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{ display: 'flex', opacity: 0.7 }}>{icon}</span>
      {label}
    </button>
  )
}
