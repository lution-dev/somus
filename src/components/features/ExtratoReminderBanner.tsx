import { useState, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import { FileText, X } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { useIsMobile } from '../../hooks/useIsMobile'
import { previousYM, monthNameLong, todayBR } from '../../lib/months'
import { EXTRATO_DISMISS_PREFIX } from '../../lib/statement'

const DISMISS_DAYS = 3

function isDismissed(yearMonth: string): boolean {
  try {
    const raw = localStorage.getItem(`${EXTRATO_DISMISS_PREFIX}${yearMonth}`)
    if (!raw) return false
    return raw > todayBR()
  } catch {
    return false
  }
}

function dismissForDays(yearMonth: string, days = DISMISS_DAYS) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const until = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  localStorage.setItem(`${EXTRATO_DISMISS_PREFIX}${yearMonth}`, until)
}

/**
 * Banner calmo na Home: pede o extrato do mês anterior se ainda não reconciliado.
 * Dismiss esconde por 3 dias e volta no mesmo mês.
 */
export default function ExtratoReminderBanner() {
  const [, navigate] = useLocation()
  const isMobile = useIsMobile()
  const yearMonth = previousYM()
  const userId = useAppStore(s => s.currentUser?.id ?? '')
  const reconciliations = useAppStore(s => s.statementReconciliations ?? [])

  const alreadyDone = reconciliations.some(
    r => r.userId === userId && r.yearMonth === yearMonth,
  )

  const [hidden, setHidden] = useState(() => isDismissed(yearMonth))

  if (alreadyDone || hidden) return null

  const mesNome = monthNameLong(yearMonth)

  function handleDismiss() {
    dismissForDays(yearMonth)
    setHidden(true)
  }

  return (
    <AnimatePresence>
      <motion.div
        key="extrato-banner"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          background: 'rgba(255,255,255,0.035)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          border: '1px solid rgba(59,130,246,0.18)',
          borderRadius: 16,
          padding: isMobile ? '16px' : '18px 20px',
          marginTop: 16,
          marginBottom: 0,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
          maxWidth: isMobile ? undefined : 720,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 14 : 18,
          flexWrap: isMobile ? undefined : 'nowrap',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FileText size={18} color="var(--color-accent-blue-light)" strokeWidth={1.75} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)',
              margin: '0 0 4px', letterSpacing: '-0.01em',
            }}>
              Organizar o mês passado
            </p>
            <p style={{
              fontSize: 13, color: 'var(--color-text-secondary)',
              margin: isMobile ? '0 0 14px' : '0', lineHeight: 1.5,
              maxWidth: 520,
            }}>
              Quando quiser, envie o extrato de {mesNome}. A Somus reconhece o que já está na base e ajuda a completar o resto.
            </p>
            {isMobile && (
              <button
                type="button"
                onClick={() => navigate('/extrato')}
                style={ctaStyle}
              >
                Enviar extrato
              </button>
            )}
          </div>
          {!isMobile && (
            <button
              type="button"
              onClick={() => navigate('/extrato')}
              style={{ ...ctaStyle, flexShrink: 0 }}
            >
              Enviar extrato
            </button>
          )}
          <button
            type="button"
            aria-label="Dispensar por agora"
            onClick={handleDismiss}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-tertiary)', padding: 4, flexShrink: 0,
              alignSelf: isMobile ? 'flex-start' : 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

const ctaStyle: CSSProperties = {
  background: 'rgba(59,130,246,0.18)',
  color: 'var(--color-accent-blue-light)',
  border: '1px solid rgba(59,130,246,0.32)',
  borderRadius: 10,
  padding: '9px 16px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
}
