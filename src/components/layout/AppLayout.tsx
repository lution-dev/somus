import type { ReactNode } from 'react'
import { useLocation } from 'wouter'
import { Home, ArrowLeftRight, Wallet, Heart, LogOut } from 'lucide-react'
import { BottomNav } from '../ui'
import type { NavItem } from '../ui'
import SomusLogo from '../ui/SomusLogo'
import { useAuth } from '../../hooks/useAuth'

export const NAV_ITEMS: NavItem[] = [
  { path: '/home',      label: 'Home',      icon: <Home size={20} strokeWidth={1.75} />,           activeIcon: <Home size={20} strokeWidth={2} /> },
  { path: '/fluxo',     label: 'Fluxo',     icon: <ArrowLeftRight size={20} strokeWidth={1.75} />,  activeIcon: <ArrowLeftRight size={20} strokeWidth={2} /> },
  { path: '/caixinhas', label: 'Divisões', icon: <Wallet size={20} strokeWidth={1.75} />,          activeIcon: <Wallet size={20} strokeWidth={2} /> },
  { path: '/casal',     label: 'Casal',     icon: <Heart size={20} strokeWidth={1.75} />,           activeIcon: <Heart size={20} strokeWidth={2} /> },
]

// ─── Sidebar Desktop ──────────────────────────────────────────────────────────
function Sidebar() {
  const [location, navigate] = useLocation()
  const { displayName, photoURL, email, signOut } = useAuth()

  const initials = (displayName ?? email ?? '?')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside style={{
      width: 220, minWidth: 220,
      background: 'var(--color-bg-sidebar)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column',
      height: '100dvh', position: 'sticky', top: 0, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SomusLogo size={28} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2, margin: 0 }}>Somus</p>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', lineHeight: 1.3, margin: 0 }}>Finanças do casal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const active = location === item.path || location.startsWith(item.path + '/')
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={active ? 'nav-item nav-item--active' : 'nav-item'}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>
                {active ? item.activeIcon : item.icon}
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* User profile footer */}
      <div style={{
        padding: '14px 14px', borderTop: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {/* Avatar */}
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName ?? ''}
            referrerPolicy="no-referrer"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              objectFit: 'cover', flexShrink: 0,
              border: '2px solid var(--color-border)',
            }}
          />
        ) : (
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-accent-primary)', color: 'white',
            fontSize: 13, fontWeight: 700,
          }}>
            {initials}
          </div>
        )}

        {/* Name + email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)',
            margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {displayName ?? 'Usuário'}
          </p>
          {email && (
            <p style={{
              fontSize: 10, color: 'var(--color-text-tertiary)',
              margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {email}
            </p>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={signOut}
          title="Sair"
          style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: '1px solid var(--color-border)',
            cursor: 'pointer', color: 'var(--color-text-tertiary)',
            transition: 'background 150ms ease, color 150ms ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
            e.currentTarget.style.color = 'var(--color-danger)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--color-text-tertiary)'
            e.currentTarget.style.borderColor = 'var(--color-border)'
          }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}

// ─── App Layout ───────────────────────────────────────────────────────────────
interface AppLayoutProps { children: ReactNode }

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      {/* CSS responsivo injetado */}
      <style>{`
        .somus-desktop { display: flex; }
        .somus-mobile  { display: none; }
        @media (max-width: 767px) {
          .somus-desktop { display: none; }
          .somus-mobile  { display: flex; }
        }
      `}</style>

      {/* Desktop: sidebar + conteúdo */}
      <div
        className="somus-desktop"
        style={{
          minHeight: '100dvh',
          background: 'var(--color-bg-primary)',
          flexDirection: 'row',
          alignItems: 'stretch',
        }}
      >
        <Sidebar />
        <div style={{
          flex: 1,
          minHeight: '100dvh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'var(--color-bg-primary)',
        }}>
          <div style={{ width: '100%', maxWidth: 960, padding: '0 40px', flex: 1 }}>
            {children}
          </div>
        </div>
      </div>

      {/* Mobile: sem sidebar, com bottom nav */}
      <div
        className="somus-mobile"
        style={{ minHeight: '100dvh', flexDirection: 'column', background: 'var(--color-bg-primary)' }}
      >
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))' }}>
          {children}
        </main>
        <BottomNav items={NAV_ITEMS} />
      </div>
    </>
  )
}
