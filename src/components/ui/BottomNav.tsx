import { useLocation } from 'wouter'
import { motion } from 'framer-motion'

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
      className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-[var(--color-border)] pb-[var(--spacing-safe-bottom)]"
    >
      <div className="flex items-center justify-around px-2 h-16">
        {items.map((item) => {
          const isActive = location === item.path || location.startsWith(item.path + '/')
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full cursor-pointer select-none group"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--color-accent)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <motion.span
                animate={{
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
                className="transition-transform"
              >
                {(isActive && item.activeIcon) ? item.activeIcon : item.icon}
              </motion.span>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-tertiary)]'
                }`}
              >
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
