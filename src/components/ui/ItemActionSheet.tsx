import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Trash2, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ActionSheetAction {
  label: string
  icon: LucideIcon
  color?: string
  onClick: () => void
}

interface Props {
  open: boolean
  onClose: () => void
  onEdit?: () => void
  onDelete?: () => void
  title: string
  subtitle?: string
  actions?: ActionSheetAction[]
}

const MOBILE_BP = 768
function getIsMobile() {
  return typeof window !== 'undefined' && window.innerWidth < MOBILE_BP
}

export default function ItemActionSheet({ open, onClose, onEdit, onDelete, title, subtitle, actions }: Props) {
  useEffect(() => {
    if (!open) return
    const mainEl = document.querySelector('.somus-mobile > main') as HTMLElement | null
    if (mainEl) mainEl.style.overflowY = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      if (mainEl) mainEl.style.overflowY = 'auto'
      document.body.style.overflow = ''
    }
  }, [open])

  const actionList: ActionSheetAction[] = actions ?? [
    ...(onEdit ? [{ label: 'Editar', icon: Pencil, color: 'var(--color-accent-primary)', onClick: onEdit }] : []),
    ...(onDelete ? [{ label: 'Excluir', icon: Trash2, color: 'var(--color-danger)', onClick: onDelete }] : []),
  ]

  const isMobile = getIsMobile()

  const content = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 9000,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: isMobile ? 'none' : 'blur(4px)',
              touchAction: 'none',
            }}
          />

          {/* Sheet / Dialog */}
          <motion.div
            key="sheet"
            initial={isMobile ? { y: '100%', opacity: 0.6 } : { opacity: 0, scale: 0.97, y: 8 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isMobile ? { y: '100%', opacity: 0 } : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}300 }
              : { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
            }
            style={{
              position: 'fixed',
              zIndex: 9001,
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              ...(isMobile ? {
                bottom: 0, left: 0, right: 0,
                borderRadius: '28px 28px 0 0',
                paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
              } : {
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                borderRadius: 16,
                width: '100%',
                maxWidth: 340,
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
              }),
            }}
          >
            {/* Handle (mobile only) */}
            {isMobile && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
              </div>
            )}

            {/* Header */}
            <div style={{ padding: isMobile ? '4px 20px 16px' : '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{
                  fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{title}</p>
                {subtitle && (
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-secondary)', flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Actions */}
            <div style={{ padding: '0 16px', paddingBottom: isMobile ? 0 : 16 }}>
              {actionList.map((action, i) => {
                const Icon = action.icon
                const isFirst = i === 0
                const isLast = i === actionList.length - 1
                return (
                  <button
                    key={action.label}
                    onClick={() => { onClose(); action.onClick() }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                      padding: '14px 16px', fontSize: 15, fontWeight: 500,
                      background: 'rgba(255,255,255,0.04)',
                      border: 'none', cursor: 'pointer',
                      borderRadius: isFirst && isLast ? 12
                        : isFirst ? '12px 12px 0 0'
                        : isLast ? '0 0 12px 12px' : 0,
                      borderBottom: isLast ? 'none' : '1px solid var(--color-border)',
                      color: action.color || 'var(--color-text-primary)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <Icon size={18} />
                    {action.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}
