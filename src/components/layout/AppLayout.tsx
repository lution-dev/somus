import type { ReactNode } from 'react'
import { useLocation } from 'wouter'
import { Home, ArrowLeftRight, Wallet, Heart } from 'lucide-react'
import { BottomNav } from '../ui'
import type { NavItem } from '../ui'

export const NAV_ITEMS: NavItem[] = [
  { path: '/home',      label: 'Home',      icon: <Home size={20} strokeWidth={1.75} />,           activeIcon: <Home size={20} strokeWidth={2} /> },
  { path: '/fluxo',     label: 'Fluxo',     icon: <ArrowLeftRight size={20} strokeWidth={1.75} />,  activeIcon: <ArrowLeftRight size={20} strokeWidth={2} /> },
  { path: '/caixinhas', label: 'Caixinhas', icon: <Wallet size={20} strokeWidth={1.75} />,          activeIcon: <Wallet size={20} strokeWidth={2} /> },
  { path: '/casal',     label: 'Casal',     icon: <Heart size={20} strokeWidth={1.75} />,           activeIcon: <Heart size={20} strokeWidth={2} /> },
]

// ─── Sidebar Desktop ──────────────────────────────────────────────────────────
function Sidebar() {
  const [location, navigate] = useLocation()

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
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: 'var(--color-accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>S</span>
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
        }}>
          <div style={{ width: '100%', maxWidth: 1200, padding: '0 32px', flex: 1 }}>
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
