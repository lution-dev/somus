import type { ReactNode } from 'react'
import { BottomNav } from '../ui'
import type { NavItem } from '../ui'

// ─── Ícones SVG inline ────────────────────────────────────────────────────────

const HomeIcon = ({ filled = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const FluxoIcon = ({ filled = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const CaixinhasIcon = ({ filled = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  </svg>
)

const CasalIcon = ({ filled = false }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  {
    path: '/home',
    label: 'Home',
    icon: <HomeIcon />,
    activeIcon: <HomeIcon filled />,
  },
  {
    path: '/fluxo',
    label: 'Fluxo',
    icon: <FluxoIcon />,
    activeIcon: <FluxoIcon filled />,
  },
  {
    path: '/caixinhas',
    label: 'Caixinhas',
    icon: <CaixinhasIcon />,
    activeIcon: <CaixinhasIcon filled />,
  },
  {
    path: '/casal',
    label: 'Casal',
    icon: <CasalIcon />,
    activeIcon: <CasalIcon filled />,
  },
]

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-dvh bg-[var(--color-bg-primary)]">
      {/* Content area — padded for bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <BottomNav items={NAV_ITEMS} />
    </div>
  )
}
