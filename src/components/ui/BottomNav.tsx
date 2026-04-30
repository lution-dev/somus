import { useLocation } from 'wouter'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  activeIcon?: React.ReactNode
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
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'var(--color-bg-primary)',
        borderTop: '1px solid var(--color-border)',
        paddingBottom: 'var(--safe-bottom)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px', height: 64 }}>
        {items.map((item) => {
          const isActive = location === item.path || location.startsWith(item.path + '/')
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2, flex: 1, height: '100%', cursor: 'pointer',
                background: 'none', border: 'none', fontFamily: 'var(--font-sans)',
                color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)',
                position: 'relative',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%', background: 'var(--color-accent-primary)',
                }} />
              )}
              <span style={{ display: 'flex' }}>
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
