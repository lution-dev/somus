import type { ReactNode } from 'react'
import { useLocation } from 'wouter'
import { motion } from 'framer-motion'
import { Home, ArrowLeftRight, Wallet, Heart } from 'lucide-react'
import { BottomNav } from '../ui'
import type { NavItem } from '../ui'

export const NAV_ITEMS: NavItem[] = [
  { path: '/home',      label: 'Home',      icon: <Home size={20} strokeWidth={1.75} />,           activeIcon: <Home size={20} strokeWidth={2.2} /> },
  { path: '/fluxo',     label: 'Fluxo',     icon: <ArrowLeftRight size={20} strokeWidth={1.75} />,  activeIcon: <ArrowLeftRight size={20} strokeWidth={2.2} /> },
  { path: '/caixinhas', label: 'Caixinhas', icon: <Wallet size={20} strokeWidth={1.75} />,          activeIcon: <Wallet size={20} strokeWidth={2.2} /> },
  { path: '/casal',     label: 'Casal',     icon: <Heart size={20} strokeWidth={1.75} />,           activeIcon: <Heart size={20} strokeWidth={2.2} /> },
]

// ─── Sidebar Desktop ──────────────────────────────────────────────────────────
function Sidebar() {
  const [location, navigate] = useLocation()

  return (
    <aside style={{
      width: 220, minWidth: 220,
      background: 'var(--color-bg-secondary)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column',
      height: '100dvh', position: 'sticky', top: 0, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #5B9CF6, #93C5FD)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: 14, fontFamily: 'inherit' }}>S</span>
          </div>
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
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 12, border: 'none',
                background: active ? 'rgba(91,156,246,0.12)' : 'transparent',
                color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontSize: 14, fontWeight: active ? 600 : 500,
                fontFamily: 'inherit', cursor: 'pointer',
                textAlign: 'left', width: '100%',
                transition: 'background 150ms, color 150ms',
              }}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  style={{
                    position: 'absolute', left: 0, top: 8, bottom: 8,
                    width: 3, borderRadius: 99, background: 'var(--color-accent)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span style={{ flexShrink: 0, marginLeft: 4, display: 'flex' }}>
                {active ? item.activeIcon : item.icon}
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>Somus MVP · v0.1</p>
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
          alignItems: 'flex-start',
        }}
      >
        <Sidebar />
        {/* Área à direita da sidebar: flex 1 = preenche todo o espaço restante */}
        <div style={{
          flex: 1,
          minHeight: '100dvh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', /* centraliza o filho dentro da area disponivel */
        }}>
          {/* Container com largura maxima, ocupa o espaço de forma centralizada */}
          <div style={{ width: '100%', maxWidth: 680, padding: '0 24px', flex: 1 }}>
            {children}
          </div>
        </div>
      </div>

      {/* Mobile: sem sidebar, com bottom nav */}
      <div
        className="somus-mobile"
        style={{ minHeight: '100dvh', flexDirection: 'column', background: 'var(--color-bg-primary)' }}
      >
        <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}>
          {children}
        </main>
        <BottomNav items={NAV_ITEMS} />
      </div>
    </>
  )
}
