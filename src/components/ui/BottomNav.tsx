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
    /*
      position:fixed funciona corretamente agora porque removemos
      body { position: fixed } do CSS — que era o causador do bug no iOS PWA.
      O scroll lock do body já é garantido pelo .somus-mobile (overflow: hidden).
      Padrão idêntico ao GQB Consultoria que funciona corretamente.
    */
    <nav
      aria-label="Navegação principal"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0, right: 0,
        zIndex: 40,
        /* Scrim acima do pill — sem padding embaixo (pill cobre até o fundo) */
        padding: '12px 16px 0',
        background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 100%)',
        pointerEvents: 'none',
      }}
    >
      {/* Pill que se estende pela safe area como tab bar nativa iOS */}
      <div style={{
        background: 'rgba(23,23,23,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderBottom: 'none',
        /* Topo arredondado, base quadrada para encostar no fundo da tela */
        borderRadius: '20px 20px 0 0',
        /* Padding bottom = safe area → ícones ficam acima do home indicator */
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        pointerEvents: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 4px', height: 56 }}>
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
                  gap: 3, flex: 1, height: '100%', cursor: 'pointer',
                  background: 'none', border: 'none', fontFamily: 'var(--font-sans)',
                  color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)',
                  transition: 'color 150ms ease',
                }}
              >
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
      </div>
    </nav>
  )
}

export type { NavItem, BottomNavProps }
