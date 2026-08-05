import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import { FileText, X } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
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
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(245,158,11,0.22)',
          borderRadius: 16,
          padding: '18px 16px',
          marginTop: 16,
          marginBottom: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(245,158,11,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <FileText size={20} color="var(--color-warning)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)',
              margin: '0 0 4px',
            }}>
              Organizar o mês passado
            </p>
            <p style={{
              fontSize: 13, color: 'var(--color-text-secondary)',
              margin: '0 0 12px', lineHeight: 1.5,
            }}>
              Quando quiser, envie o extrato de {mesNome} em OFX ou CSV. A Somus reconhece o que já está na sua base e ajuda a completar o resto.
            </p>
            <p style={{
              fontSize: 11, color: 'var(--color-text-tertiary)',
              margin: '0 0 14px',
            }}>
              Aceitos: OFX, OFC ou CSV. Conta corrente.
            </p>
            <button
              type="button"
              onClick={() => navigate('/extrato')}
              style={{
                background: 'rgba(245,158,11,0.2)',
                color: '#FBBF24',
                border: '1px solid rgba(245,158,11,0.35)',
                borderRadius: 10,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Enviar extrato
            </button>
          </div>
          <button
            type="button"
            aria-label="Dispensar por agora"
            onClick={handleDismiss}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-tertiary)', padding: 4, flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
