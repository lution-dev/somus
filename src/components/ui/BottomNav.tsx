import { useLocation } from 'wouter'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  activeIcon?: React.ReactNode
  /** Extra path prefixes that count as active for this tab */
  activeFor?: string[]
}

interface BottomNavProps {
  items: NavItem[]
}

export function BottomNav({ items }: BottomNavProps) {
  const [location, navigate] = useLocation()

  return (
    <nav
      aria-label="Navegação principal"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        /* Floating pill: margin lifts it above the home indicator */
        margin: '0 16px calc(env(safe-area-inset-bottom, 0px) / 2 + 4px)',
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.08)',
        /* Glassmorphism */
        background: 'rgba(23,23,23,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Nav buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 4px', height: 56 }}>
        {items.map((item) => {
          // If any item claims this route via activeFor, suppress startsWith for the rest
          const claimedByActiveFor = items.some(i => i.activeFor?.some(p => location.startsWith(p)))
          const isActive =
            location === item.path ||
            (!claimedByActiveFor && location.startsWith(item.path + '/')) ||
            (item.activeFor?.some(prefix => location.startsWith(prefix)) ?? false)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path, { replace: true })}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, flex: 1, height: '100%', cursor: 'pointer',
                background: 'none', border: 'none', fontFamily: 'var(--font-sans)',
                color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)',
                transition: 'color 150ms ease',
              }}
            >
              <span style={{ display: 'flex', position: 'relative' }}>
                {(isActive && item.activeIcon) ? item.activeIcon : item.icon}
              </span>
              <span style={{
                fontSize: 10, fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)',
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export type { NavItem, BottomNavProps }
