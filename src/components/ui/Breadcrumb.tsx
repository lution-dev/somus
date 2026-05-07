import { Fragment } from 'react'
import { useLocation } from 'wouter'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  /** If provided, renders this item as a clickable link */
  href?: string
  /** Optional leading element (icon, colored dot, etc.) */
  icon?: React.ReactNode
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  style?: React.CSSProperties
}

export function Breadcrumb({ items, style }: BreadcrumbProps) {
  const [, navigate] = useLocation()

  return (
    <nav
      aria-label="Breadcrumb"
      style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', ...style }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <Fragment key={i}>
            {i > 0 && (
              <ChevronRight
                size={13}
                style={{ color: 'var(--color-text-tertiary)', flexShrink: 0, margin: '0 2px' }}
              />
            )}
            {isLast ? (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 14, fontWeight: 600,
                color: 'var(--color-text-primary)',
                padding: '2px 4px',
              }}>
                {item.icon}
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => navigate(item.href!)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14, fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  padding: '2px 4px', borderRadius: 6,
                  transition: 'color 120ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-secondary)'}
              >
                {item.icon}
                {item.label}
              </button>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
