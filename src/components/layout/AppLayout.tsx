import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import { Home, ArrowLeftRight, BarChart3, Heart, MoreVertical, User, LogOut } from 'lucide-react'
import { BottomNav } from '../ui'
import type { NavItem } from '../ui'
import SomusLogo from '../ui/SomusLogo'
import PullToRefresh from '../ui/PullToRefresh'
import { useAuth } from '../../hooks/useAuth'
import UserMenu from '../ui/UserMenu'

export const NAV_ITEMS: NavItem[] = [
  { path: '/home',       label: 'Home',        icon: <Home size={20} strokeWidth={1.5} />,          activeIcon: <Home size={20} strokeWidth={1.75} />,          activeFor: ['/relatorios/'] },
  { path: '/fluxo',     label: 'Fluxo',       icon: <ArrowLeftRight size={20} strokeWidth={1.5} />, activeIcon: <ArrowLeftRight size={20} strokeWidth={1.75} /> },
  { path: '/relatorios', label: 'Relatórios', icon: <BarChart3 size={20} strokeWidth={1.5} />,      activeIcon: <BarChart3 size={20} strokeWidth={1.75} /> },
  { path: '/casal',     label: 'Casal',       icon: <Heart size={20} strokeWidth={1.5} />,           activeIcon: <Heart size={20} strokeWidth={1.75} /> },
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
      background: 'rgba(11, 18, 32, 0.6)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex', flexDirection: 'column',
      height: '100dvh', position: 'sticky', top: 0, flexShrink: 0,
      zIndex: 10,
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SomusLogo size={28} />
          <div>
            <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2, margin: 0, letterSpacing: '-0.02em' }}>Somus</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
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
        padding: '10px 10px', borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.015)',
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
                  boxShadow: '0 0 0 2px rgba(59,130,246,0.4)',
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


// ─── Page Transition ────────────────────────────────────────────────────────
// Profundidade da rota — abas = 0, detalhes = 1
function getDepth(path: string): number {
  if (path.startsWith('/casal/objetivo/')) return 1
  if (path.startsWith('/relatorios/') && path !== '/relatorios') return 1
  return 0
}

function PageTransition({ children }: { children: ReactNode }) {
  const [location] = useLocation()
  const prevLocation = useRef(location)
  const direction = useRef<'push' | 'pop' | 'tab'>('tab')

  if (location !== prevLocation.current) {
    const prevDepth = getDepth(prevLocation.current)
    const nextDepth = getDepth(location)
    direction.current = nextDepth > prevDepth ? 'push' : nextDepth < prevDepth ? 'pop' : 'tab'
    prevLocation.current = location
  }

  const d = direction.current
  const slideX = d === 'push' ? '18%' : d === 'pop' ? '-18%' : 0
  const exitX  = d === 'push' ? '-10%' : d === 'pop' ? '10%' : 0

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location}
        initial={{ opacity: 0, x: slideX }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: exitX }}
        transition={{ duration: d === 'tab' ? 0.15 : 0.25, ease: [0.32, 0.72, 0, 1] }}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
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
          position: 'relative',
        }}
      >
        {/* Global ambient radial glow — visible through the glass sidebar */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: 600,
          background: 'radial-gradient(circle at 30% -100px, #3B82F6 0%, transparent 60%)',
          opacity: 0.07,
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <Sidebar />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'transparent',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ width: '100%', maxWidth: 960, padding: '0 40px', flex: 1 }}>
            <PageTransition>{children}</PageTransition>
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
        {/* Persistent avatar overlay — outside PageTransition so it never disappears during tab switches */}
        <div style={{
          position: 'absolute',
          top: `calc(env(safe-area-inset-top, 0px) + 12px)`,
          right: 16,
          zIndex: 100,
          pointerEvents: 'auto',
        }}>
          <UserMenu variant="hero" />
        </div>

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
            <PageTransition>{children}</PageTransition>
          </PullToRefresh>
        </main>
        <BottomNav items={NAV_ITEMS} />
      </div>
    </>
  )
}
