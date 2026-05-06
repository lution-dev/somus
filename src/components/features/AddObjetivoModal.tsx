import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { formatCurrency } from '../../lib/calculations'
import { useImageUpload } from '../../hooks/useImageUpload'
import { ImageUp } from 'lucide-react'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'

interface Props {
  open: boolean
  onClose: () => void
  defaultIsCouple?: boolean
  /** Quando fornecido, entra em modo edição */
  editTarget?: import('../../types').Objetivo
  /** Callback chamado no lugar de addObjetivo quando em modo edição */
  onSave?: (updates: Partial<import('../../types').Objetivo>) => void
}

const ACCENT_COUPLE = '#8B5CF6'
const ACCENT_BLUE   = '#3B82F6'

export default function AddObjetivoModal({ open, onClose, defaultIsCouple = false, editTarget, onSave }: Props) {
  const isEditMode = !!editTarget
  const [isCouple, setIsCouple]     = useState(defaultIsCouple)
  const [name, setName]             = useState('')
  const amountInput                 = useCurrencyInput()
  const [months, setMonths]         = useState('')
  const [imageUrl, setImageUrl]     = useState<string | undefined>(undefined)

  const currentUser  = useAppStore(s => s.currentUser)
  const addObjetivo  = useAppStore(s => s.addObjetivo)
  const { upload, isProcessing } = useImageUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form whenever modal opens
  useEffect(() => {
    if (open) {
      if (editTarget) {
        // Edit mode: pre-fill fields
        setIsCouple(editTarget.isCouple ?? false)
        setName(editTarget.name)
        amountInput.setValue(editTarget.targetAmount)
        setMonths(String(editTarget.monthsToAchieve ?? ''))
        setImageUrl(editTarget.imageUrl)
      } else {
        setIsCouple(defaultIsCouple)
        setName('')
        amountInput.reset()
        setMonths('')
        setImageUrl(undefined)
      }
    }
  }, [open, defaultIsCouple, editTarget?.id])

  const numTarget = amountInput.numericValue
  const numMonths = parseInt(months) || 0
  const isValid   = name.trim() !== '' && numTarget > 0 && numMonths > 0

  // Derive targetDate from months
  const targetDate = numMonths > 0
    ? (() => {
        const d = new Date()
        d.setMonth(d.getMonth() + numMonths)
        return d.toISOString().slice(0, 10)
      })()
    : undefined

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await upload(file)
    if (result) setImageUrl(result.dataUrl)
    e.target.value = ''
  }

  function handleConfirm() {
    if (!isValid) return
    if (isEditMode && onSave) {
      onSave({
        name: name.trim(),
        targetAmount: numTarget,
        monthsToAchieve: numMonths,
        targetDate,
        imageUrl,
        isCouple,
      })
    } else {
      if (!currentUser) return
      addObjetivo({
        userId: currentUser.id,
        name: name.trim(),
        emoji: '🎯',
        targetAmount: numTarget,
        currentAmount: 0,
        targetDate,
        monthsToAchieve: numMonths,
        imageUrl,
        isCouple,
        movements: [],
        createdAt: new Date().toISOString().slice(0, 10),
      })
    }
    onClose()
  }

  const accentColor = isCouple ? ACCENT_COUPLE : ACCENT_BLUE
  const modalTitle  = isEditMode ? 'Editar Objetivo' : 'Novo Objetivo'
  const confirmBtn  = isEditMode ? 'Salvar alterações' : 'Enviar'

  return (
    <Dialog open={open} onClose={onClose} title={modalTitle} size="md">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageSelect}
      />

      {/* ── Toggle: Objetivo do Casal ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '12px 14px',
        marginBottom: 20,
      }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            Objetivo do Casal?
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>
            Ao marcar essa opção, será adicionado{'\n'}como Objetivo para os 2.
          </p>
        </div>
        {/* Toggle switch */}
        <button
          id="toggle-objetivo-casal"
          onClick={() => setIsCouple(v => !v)}
          aria-label="Objetivo do casal"
          style={{
            width: 44, height: 26, borderRadius: 13, flexShrink: 0,
            background: isCouple ? ACCENT_COUPLE : 'rgba(255,255,255,0.15)',
            border: 'none', cursor: 'pointer', padding: 3,
            display: 'flex', alignItems: 'center',
            justifyContent: isCouple ? 'flex-end' : 'flex-start',
            transition: 'background 200ms ease',
          }}
        >
          <span style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            display: 'block',
          }} />
        </button>
      </div>

      {/* ── Nome do Objetivo ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Objetivo</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Necessário</p>
        </div>
        <Input
          placeholder="Nome do objetivo"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      {/* ── Valor ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Valor</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Necessário</p>
        </div>
        <Input
          prefix="R$"
          inputMode="numeric"
          placeholder="0,00"
          value={amountInput.displayValue}
          onChange={amountInput.handleChange}
          style={{ fontSize: 18, fontWeight: 700 }}
        />
        {numTarget > 0 && numMonths > 0 && (
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
            ≈ {formatCurrency(numTarget / numMonths)}/mês para atingir
          </p>
        )}
      </div>

      {/* ── Meses para atingir ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Meses para atingir Objetivo</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Necessário</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={months}
            onChange={e => setMonths(e.target.value)}
            style={{ paddingRight: 60 }}
          />
          <span style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 13, color: 'var(--color-text-tertiary)', pointerEvents: 'none',
          }}>
            meses
          </span>
        </div>
        {numMonths > 0 && (
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '6px 0 0' }}>
            Previsão: {targetDate
              ? new Date(targetDate + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
              : '—'}
          </p>
        )}
      </div>

      {/* ── Capa ── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>Capa</p>
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', minHeight: 100, borderRadius: 'var(--radius-card)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: imageUrl ? 'transparent' : 'rgba(255,255,255,0.04)',
            border: `1px solid var(--color-border)`,
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
            opacity: isProcessing ? 0.5 : 1,
            transition: 'opacity 200ms ease',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="capa"
              style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.06)',
              }}>
                <ImageUp size={22} color="var(--color-text-tertiary)" />
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>
                {isProcessing ? 'Processando...' : 'Toque para adicionar imagem'}
              </p>
            </>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={onClose}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="md"
          fullWidth
          disabled={!isValid}
          onClick={handleConfirm}
          style={isValid ? { background: accentColor } : undefined}
        >
          {confirmBtn}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
