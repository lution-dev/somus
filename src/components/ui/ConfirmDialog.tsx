/**
 * ConfirmDialog — Alerta de confirmação com descrição de consequências.
 * Usado para ações destrutivas (exclusão, reset, etc.)
 */
import { Dialog, DialogFooter, Button } from './index'
import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmLabel?: string
  variant?: 'danger' | 'warning'
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  description = 'Esta ação não pode ser desfeita.',
  confirmLabel = 'Confirmar',
  variant = 'danger',
}: Props) {
  const accentColor = variant === 'danger' ? '#EF4444' : '#F59E0B'

  function handleConfirm() {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="" size="sm">
      {/* Icon + Title */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 12, paddingBottom: 20, textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${accentColor}18`,
          border: `1.5px solid ${accentColor}30`,
        }}>
          <AlertTriangle size={26} color={accentColor} strokeWidth={2} />
        </div>

        <div>
          <p style={{
            fontSize: 16, fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: '0 0 8px',
          }}>
            {title}
          </p>
          <p style={{
            fontSize: 13, color: 'var(--color-text-secondary)',
            margin: 0, lineHeight: 1.5,
          }}>
            {description}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleConfirm}
          style={{ background: accentColor }}
        >
          {confirmLabel}
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>
          Cancelar
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
