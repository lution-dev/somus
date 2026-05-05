import { useEffect, useCallback } from 'react'
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
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  const isMobile = getIsMobile()

  return (
    <AnimatePresence>
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex',
          alignItems: isMobile ? 'flex-end' : 'center',
          justifyContent: 'center',
          padding: isMobile ? 0 : 24,
        }} role="dialog" aria-modal="true">
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
            }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={isMobile ? { opacity: 0, y: 60 } : { opacity: 0, scale: 0.95 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, scale: 1 }}
            exit={isMobile ? { opacity: 0, y: 40 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'relative', zIndex: 10, width: '100%',
              maxWidth: SIZE_WIDTHS[size],
              maxHeight: isMobile ? '90dvh' : '80dvh',
              overflowY: 'auto',
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: isMobile ? '20px 20px 0 0' : 16,
              overflow: 'hidden',
              boxShadow: isMobile ? 'none' : '0 16px 48px rgba(0,0,0,0.4)',
            }}
          >
            {/* Drag handle (mobile only) */}
            {isMobile && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
                <div style={{ width: 40, height: 4, borderRadius: 99, background: 'var(--color-border)' }} />
              </div>
            )}

            {/* Header */}
            {(title || showClose) && (
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: isMobile ? '16px 20px 8px' : '20px 24px 8px' }}>
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

            {/* Content */}
            <div style={{ padding: isMobile ? '8px 20px calc(20px + env(safe-area-inset-bottom, 0px))' : '8px 24px 24px' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
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
