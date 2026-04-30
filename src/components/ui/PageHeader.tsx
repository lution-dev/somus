import { useLocation } from 'wouter'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Show back arrow and navigate back */
  back?: boolean
  /** Custom back path (default: browser back) */
  backTo?: string
  /** Right-side action element */
  rightAction?: React.ReactNode
  /** Make the header transparent (for pages with hero cards) */
  transparent?: boolean
}

export function PageHeader({ title, subtitle, back, backTo, rightAction, transparent }: PageHeaderProps) {
  const [, navigate] = useLocation()

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      window.history.back()
    }
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: transparent ? 'transparent' : 'var(--color-bg-primary)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          padding: '0 16px',
          gap: 12,
        }}
      >
        {/* Left: back button or spacer */}
        {back ? (
          <button
            onClick={handleBack}
            aria-label="Voltar"
            style={{
              width: 36, height: 36, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)',
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
        ) : (
          <div style={{ width: 36, flexShrink: 0 }} />
        )}

        {/* Center: title */}
        <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          <p style={{
            fontSize: 16, fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0, lineHeight: 1.2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {title}
          </p>
          {subtitle && (
            <p style={{
              fontSize: 12, color: 'var(--color-text-secondary)',
              margin: '2px 0 0', lineHeight: 1,
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: action or spacer */}
        {rightAction ? (
          <div style={{ flexShrink: 0 }}>{rightAction}</div>
        ) : (
          <div style={{ width: 36, flexShrink: 0 }} />
        )}
      </div>

      {/* Bottom border */}
      {!transparent && (
        <div style={{ height: 1, background: 'var(--color-border)', opacity: 0.5 }} />
      )}
    </header>
  )
}
