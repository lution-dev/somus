import { useState, useRef, useEffect, type ReactNode } from 'react'
import { useLocation } from 'wouter'
import { Home, ArrowLeftRight, BarChart3, Heart, MoreVertical, User, LogOut } from 'lucide-react'
import { BottomNav } from '../ui'
import type { NavItem } from '../ui'
import SomusLogo from '../ui/SomusLogo'
import PullToRefresh from '../ui/PullToRefresh'
import { useAuth } from '../../hooks/useAuth'

export const NAV_ITEMS: NavItem[] = [
  { path: '/home',     label: 'Home',       icon: <Home size={20} strokeWidth={1.75} />,          activeIcon: <Home size={20} strokeWidth={2} />,          activeFor: ['/relatorios/'] },
  { path: '/fluxo',   label: 'Fluxo',      icon: <ArrowLeftRight size={20} strokeWidth={1.75} />, activeIcon: <ArrowLeftRight size={20} strokeWidth={2} /> },
  { path: '/relatorios', label: 'Relatórios', icon: <BarChart3 size={20} strokeWidth={1.75} />,       activeIcon: <BarChart3 size={20} strokeWidth={2} /> },
  { path: '/casal',   label: 'Casal',      icon: <Heart size={20} strokeWidth={1.75} />,           activeIcon: <Heart size={20} strokeWidth={2} /> },
]

// ─── Sidebar Desktop ──────────────────────────────────────────────────────────
function Sidebar() {
  const [location, navigate] = useLocation()
  const { displayName, photoURL, email, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initials = (displayName ?? email ?? '?')
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

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
          const claimedByActiveFor = NAV_ITEMS.some(i => i.activeFor?.some(p => location.startsWith(p)))
          const active =
            location === item.path ||
            (!claimedByActiveFor && location.startsWith(item.path + '/')) ||
            (item.activeFor?.some(prefix => location.startsWith(prefix)) ?? false)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path, { replace: true })}
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

      {/* User footer */}
      <div ref={menuRef} style={{
        padding: '12px 12px', borderTop: '1px solid var(--color-border)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Clickable user area → profile */}
          <button
            onClick={() => navigate('/perfil')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0,
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
              textAlign: 'left', fontFamily: 'var(--font-sans)',
              borderRadius: 8, transition: 'background 120ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Avatar */}
            {photoURL ? (
              <img
                src={photoURL}
                alt=""
                referrerPolicy="no-referrer"
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  objectFit: 'cover', flexShrink: 0,
                  border: '2px solid var(--color-border)',
                }}
              />
            ) : (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--color-accent-primary)', color: 'white',
                fontSize: 12, fontWeight: 700,
              }}>
                {initials}
              </div>
            )}

            {/* Name + email */}
            <div style={{ minWidth: 0, flex: 1 }}>
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
          </button>

          {/* 3-dot menu trigger */}
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: menuOpen ? 'var(--color-bg-tertiary)' : 'transparent',
              border: 'none', cursor: 'pointer',
              color: 'var(--color-text-tertiary)',
              transition: 'background 120ms ease',
            }}
            onMouseEnter={e => { if (!menuOpen) e.currentTarget.style.background = 'var(--color-bg-tertiary)' }}
            onMouseLeave={e => { if (!menuOpen) e.currentTarget.style.background = 'transparent' }}
          >
            <MoreVertical size={15} />
          </button>
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <div style={{
            position: 'absolute',
            bottom: '100%', left: 8, right: 8,
            marginBottom: 6,
            borderRadius: 10,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            zIndex: 999,
            animation: 'sidebarMenuIn 120ms ease',
          }}>
            <style>{`
              @keyframes sidebarMenuIn {
                from { opacity: 0; transform: translateY(4px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
            <button
              onClick={() => { setMenuOpen(false); navigate('/perfil') }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', border: 'none',
                background: 'transparent', cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: 13, fontWeight: 500,
                color: 'var(--color-text-primary)',
                transition: 'background 100ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <User size={14} style={{ opacity: 0.6 }} />
              Ver perfil
            </button>
            <div style={{ height: 1, background: 'var(--color-border)' }} />
            <button
              onClick={() => { setMenuOpen(false); signOut() }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', border: 'none',
                background: 'transparent', cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: 13, fontWeight: 500,
                color: 'var(--color-danger)',
                transition: 'background 100ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={14} style={{ opacity: 0.7 }} />
              Sair
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

// ─── App Layout ───────────────────────────────────────────────────────────────
interface AppLayoutProps { children: ReactNode }

export function AppLayout({ children }: AppLayoutProps) {
  const mainRef = useRef<HTMLElement>(null)

  return (
    <>
      {/* CSS responsivo injetado */}
      <style>{`
        .somus-desktop { display: flex; }
        .somus-mobile  { display: none; }
        @media (max-width: 767px) {
          .somus-desktop { display: none !important; }
          .somus-mobile  { display: flex !important; }
        }
      `}</style>

      {/* Desktop: sidebar + conteúdo */}
      <div
        className="somus-desktop"
        style={{
          height: '100dvh',
          background: 'var(--color-bg-primary)',
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        <Sidebar />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'var(--color-bg-primary)',
        }}>
          <div style={{ width: '100%', maxWidth: 960, padding: '0 40px', flex: 1 }}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile: h-screen flex-col overflow-hidden — same pattern as Symera Layout */}
      <div
        className="somus-mobile"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          flexDirection: 'column',
          background: 'var(--color-bg-primary)',
          overflow: 'hidden',
        }}
      >
        <main
          ref={mainRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 80,
          }}
        >
          <PullToRefresh scrollRef={mainRef}>
            {children}
          </PullToRefresh>
        </main>
        <BottomNav items={NAV_ITEMS} />
      </div>
    </>
  )
}
