import { useLocation } from 'wouter'
import { ChevronLeft } from 'lucide-react'

interface PageHeaderProps {
  title: string
  /** Show back arrow and navigate back */
  back?: boolean
  /** Custom back path (default: browser back) */
  backTo?: string
  /** Right-side action element */
  rightAction?: React.ReactNode
  /** Custom background color (for hero headers) */
  bg?: string
  /** Extra height for the spacer (default: 56) */
  height?: number
}

const HEADER_H = 56

export function PageHeader({ title, back, backTo, rightAction, bg, height }: PageHeaderProps) {
  const [, navigate] = useLocation()
  const h = height ?? HEADER_H

  const handleBack = () => {
    if (backTo) {
      navigate(backTo)
    } else {
      window.history.back()
    }
  }

  return (
    <>
      {/* Sticky header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          /* When bg is provided: solid exact color to merge with the gradient below.
             When no bg: Liquid Glass dark overlay. */
          background: bg || 'rgba(11, 18, 32, 0.82)',
          backdropFilter: bg ? 'none' : 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: bg ? 'none' : 'blur(24px) saturate(180%)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          borderBottom: 'none',
          boxShadow: 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: h,
            padding: '0 16px',
            gap: 12,
          }}
        >
          {/* Left: back button */}
          {back && (
            <button
              onClick={handleBack}
              aria-label="Voltar"
              style={{
                width: 36, height: 36, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer', color: 'var(--color-text-primary)',
                flexShrink: 0,
              }}
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
          )}

          {/* Title */}
          <div style={{ flex: 1, textAlign: back ? 'center' : 'left', minWidth: 0 }}>
            <p style={{
              fontSize: 18, fontWeight: 600,
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-primary)',
              margin: 0, lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {title}
            </p>
          </div>

          {/* Right: action or spacer (only when back to balance centering) */}
          {rightAction ? (
            <div style={{ flexShrink: 0 }}>{rightAction}</div>
          ) : back ? (
            <div style={{ width: 36, flexShrink: 0 }} />
          ) : null}
        </div>

        {/* Bottom border */}
        {/* Bottom border - managed by header style now */}
      </header>
    </>
  )
}
