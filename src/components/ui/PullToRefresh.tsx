import { useRef, useState, useCallback, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  /** The scrollable container ref — needed to check scrollTop */
  scrollRef: React.RefObject<HTMLElement | null>
}

const THRESHOLD = 80  // px to pull before triggering refresh
const MAX_PULL  = 120 // max visual pull distance

export default function PullToRefresh({ children, scrollRef }: Props) {
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (refreshing) return
    const scroller = scrollRef.current
    if (!scroller || scroller.scrollTop > 5) return
    startY.current = e.touches[0].clientY
    pulling.current = true
  }, [refreshing, scrollRef])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return
    const scroller = scrollRef.current
    if (!scroller || scroller.scrollTop > 5) {
      pulling.current = false
      setPullY(0)
      return
    }
    const delta = e.touches[0].clientY - startY.current
    if (delta < 0) {
      pulling.current = false
      setPullY(0)
      return
    }
    // Dampen the pull (logarithmic feel)
    const dampened = Math.min(MAX_PULL, delta * 0.45)
    setPullY(dampened)
  }, [refreshing, scrollRef])

  const onTouchEnd = useCallback(() => {
    if (!pulling.current) return
    pulling.current = false
    if (pullY >= THRESHOLD) {
      setRefreshing(true)
      setPullY(THRESHOLD * 0.6) // keep indicator visible during reload
      // Small delay so the user sees the spinner
      setTimeout(() => window.location.reload(), 400)
    } else {
      setPullY(0)
    }
  }, [pullY])

  const progress = Math.min(1, pullY / THRESHOLD)
  const showIndicator = pullY > 10

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ display: 'contents' }}
    >
      {/* Pull indicator */}
      {showIndicator && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: pullY,
            overflow: 'hidden',
            flexShrink: 0,
            transition: pulling.current ? 'none' : 'height 250ms ease',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--color-bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: progress,
              transform: `rotate(${progress * 360}deg)`,
              transition: pulling.current ? 'none' : 'all 250ms ease',
              animation: refreshing ? 'ptr-spin 700ms linear infinite' : 'none',
            }}
          >
            <RefreshCw size={16} color="var(--color-accent-primary)" strokeWidth={2.5} />
          </div>
        </div>
      )}

      {/* Inline keyframes */}
      <style>{`
        @keyframes ptr-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {children}
    </div>
  )
}
