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
  /** Show Somus logo on the left (only when back is false) */
  showLogo?: boolean
  /** Hide rightAction on mobile — used when the AppLayout overlay already renders the avatar */
  hideRightOnMobile?: boolean
}

const HEADER_H = 56

export function PageHeader({ title, back, backTo, rightAction, bg, height, showLogo, hideRightOnMobile }: PageHeaderProps) {
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
          background: bg || 'rgba(9, 18, 35, 0.88)',
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
          {/* Left: back button OR logo */}
          {back ? (
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
          ) : showLogo ? (
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }} className="somus-desktop">
              {/* Inline Somus logo — objectBoundingBox gradient works at any size */}
              <svg width="20" height="21" viewBox="0 0 895 928" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <path d="M539.089 2.206L542.761 5.66257C544.368 7.17438 545.279 9.28234 545.279 11.4882V178.851C545.279 180.894 544.497 182.859 543.095 184.344L539.146 188.525C537.635 190.125 535.531 191.032 533.33 191.032H324.279C276.945 192.198 182.379 225.332 190.779 346.532C194.779 388.032 227.079 471.032 324.279 471.032C419.539 471.032 535.706 476.795 584.86 479.849C585.939 479.858 586.914 479.922 587.779 480.032C586.834 479.972 585.861 479.911 584.86 479.849C571.171 479.73 540.778 488.454 507.779 525.532C463.279 575.532 418.779 620.532 324.279 635.032C229.779 649.532 24.2786 571.532 1.27857 346.532C-9.22143 241.532 45.7786 116.032 135.779 54.0316C207.779 4.43159 267.779 -0.468384 324.279 0.0315582L533.606 0.0315952C535.644 0.0315956 537.605 0.809306 539.089 2.206Z" fill="url(#logo_g1)"/>
                <path d="M587.779 480.032C574.279 478.532 404.279 470.032 317.279 471.032C345.679 469.031 358.279 465.032 370.779 454.532C386.148 442.176 409.305 415.84 429.279 393.532C435.816 386.23 445.381 377.128 449.779 372.032C495.379 324.432 560.945 312.032 587.779 311.532C794.779 303.032 880.779 480.032 892.779 576.032C912.379 816.432 723.779 924.254 618.779 925.532C536.612 926.532 373.379 928.432 369.779 926.032C366.179 923.632 365.279 922.532 365.279 916.532V763.551C365.279 760.048 366.809 756.719 369.469 754.44L372.408 751.92C374.583 750.056 377.353 749.032 380.218 749.032H596.431C597.327 749.032 598.242 748.928 599.114 748.723C703.442 724.232 722.625 630.235 705.779 576.032C682.779 502.032 629.279 483.032 587.779 480.032Z" fill="url(#logo_g2)"/>
                <defs>
                  <linearGradient id="logo_g1" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                    <stop stopColor="#5B79FF"/>
                    <stop offset="1" stopColor="#1E40D1"/>
                  </linearGradient>
                  <linearGradient id="logo_g2" x1="1" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                    <stop stopColor="#28C9DF"/>
                    <stop offset="1" stopColor="#0197D3"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          ) : null}

          {/* Title */}
          <div style={{ flex: 1, textAlign: back ? 'center' : 'left', minWidth: 0 }}>
            <p style={{
              fontSize: showLogo ? 16 : 18, fontWeight: 600,
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
            <div style={{ flexShrink: 0 }} className={hideRightOnMobile ? 'somus-desktop' : undefined}>
              {rightAction}
            </div>
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
