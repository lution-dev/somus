import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { HTMLAttributes, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  showClose?: boolean
}

const SIZE_WIDTHS = { sm: 384, md: 448, lg: 512, full: '100%' }
const MOBILE_BP = 768

function getIsMobile() {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BP
}

export function Dialog({
  open, onClose, title, description, children,
  size = 'md', showClose = true,
}: DialogProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    const mainEl = document.querySelector('.somus-mobile > main') as HTMLElement | null
    if (mainEl) mainEl.style.overflowY = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (mainEl) mainEl.style.overflowY = 'auto'
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  const isMobile = getIsMobile()
  const hasHeader = !!(title || showClose)

  const content = (
    <AnimatePresence>
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: isMobile ? 0 : 24,
          }}
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              touchAction: 'none',
              willChange: 'opacity',
            }}
            onClick={onClose}
          />

          {/* Panel — flex column so header stays fixed and content scrolls */}
          <motion.div
            initial={isMobile ? { opacity: 0, y: 32 } : { opacity: 0, scale: 0.97, y: 8 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { opacity: 0, y: 20 } : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              position: 'relative', zIndex: 10, width: '100%',
              maxWidth: SIZE_WIDTHS[size],
              maxHeight: isMobile ? '90dvh' : '80dvh',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(20, 20, 20, 0.7)',
              backdropFilter: 'blur(28px) saturate(200%)',
              WebkitBackdropFilter: 'blur(28px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: isMobile ? '28px 28px 0 0' : 24,
              overflow: 'hidden',
              boxShadow: isMobile ? '0 -8px 32px rgba(0,0,0,0.35)' : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 24px 64px rgba(0,0,0,0.5)',
              willChange: 'transform, opacity',
            }}
          >
            {/* Drag handle (mobile only) */}
            {isMobile && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, flexShrink: 0 }}>
                <div style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--color-border)' }} />
              </div>
            )}

            {/* Header — fixed at top */}
            {hasHeader && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                padding: isMobile ? '16px 20px 12px' : '20px 24px 12px',
                flexShrink: 0,
                borderBottom: title ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
              }}>
                <div>
                  {title && (
                    <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{title}</h2>
                  )}
                  {description && (
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>{description}</p>
                  )}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    aria-label="Fechar"
                    style={{
                      marginLeft: 16, padding: 6, borderRadius: 8,
                      color: 'var(--color-text-tertiary)', background: 'none', border: 'none',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Scrollable content area */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch' as any,
              overscrollBehavior: 'contain',
              padding: isMobile
                ? `${hasHeader ? 16 : 8}px 20px calc(24px + env(safe-area-inset-bottom, 0px))`
                : `${hasHeader ? 16 : 8}px 24px 24px`,
            }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogFooter({ children, className = '', style, ...props }: DialogFooterProps) {
  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
