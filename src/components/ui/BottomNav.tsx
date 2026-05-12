import { useLocation } from 'wouter'
import { motion } from 'framer-motion'
import { haptic } from '../../lib/haptic'

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
        border: '1px solid rgba(255,255,255,0.06)',
        /* Glassmorphism */
        background: 'rgba(8, 14, 28, 0.55)',
        backdropFilter: 'blur(32px) saturate(160%)',
        WebkitBackdropFilter: 'blur(32px) saturate(160%)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 24px rgba(0, 0, 0, 0.4)',
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
          const activeColor = item.path === '/casal'
            ? 'var(--color-accent-couple)'
            : 'var(--color-accent-primary)'
          return (
            <motion.button
              key={item.path}
              onPointerDown={() => haptic.selection()}
              onClick={() => navigate(item.path, { replace: true })}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              whileTap={{ scale: 0.91 }}
              transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, flex: 1, height: '100%', cursor: 'pointer',
                background: 'none', border: 'none', fontFamily: 'var(--font-sans)',
                color: isActive ? activeColor : 'var(--color-text-tertiary)',
                transition: 'color 150ms ease',
              }}
            >
            <span style={{ display: 'flex', position: 'relative', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {(isActive && item.activeIcon) ? item.activeIcon : item.icon}
              </span>
              <span style={{
                fontSize: 10, fontWeight: isActive ? 600 : 500,
                color: isActive ? activeColor : 'var(--color-text-tertiary)',
                transition: 'margin 150ms ease',
              }}>
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}

export type { NavItem, BottomNavProps }
