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

const sizeStyles = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  full: 'max-w-full mx-3',
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={[
              'relative z-10 w-full glass rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)]',
              'shadow-[var(--shadow-lg)] overflow-hidden',
              sizeStyles[size],
            ].join(' ')}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-[var(--color-border-strong)]" />
            </div>

            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-start justify-between px-5 pt-4 pb-2">
                <div>
                  {title && (
                    <h2 className="text-lg font-bold text-[var(--color-text-primary)]">{title}</h2>
                  )}
                  {description && (
                    <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{description}</p>
                  )}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    aria-label="Fechar"
                    className="ml-4 mt-0.5 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer shrink-0"
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
            <div className="px-5 pb-5 pt-2">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function DialogFooter({ children, className = '', ...props }: DialogFooterProps) {
  return (
    <div className={`flex flex-col-reverse sm:flex-row gap-2 mt-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
