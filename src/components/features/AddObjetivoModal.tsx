import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { formatCurrency } from '../../lib/calculations'
import { RefreshCw, Camera } from 'lucide-react'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'
import ImageCropPicker from '../ui/ImageCropPicker'

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
  const [cropSrc, setCropSrc]       = useState<string | null>(null)

  const currentUser  = useAppStore(s => s.currentUser)
  const addObjetivo  = useAppStore(s => s.addObjetivo)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset form whenever modal opens
  useEffect(() => {
    if (open) {
      if (editTarget) {
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (ev.target?.result) setCropSrc(ev.target.result as string)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleConfirm() {
    if (!isValid) return
    const baseData = {
      name: name.trim(),
      targetAmount: numTarget,
      monthsToAchieve: numMonths,
      targetDate,
      imageUrl,
      isCouple,
    }

    if (isEditMode && onSave) {
      onSave(baseData as any)
    } else {
      if (!currentUser) return
      addObjetivo({
        ...baseData,
        userId: currentUser.id,
        emoji: '🎯',
        currentAmount: 0,
        movements: [],
        createdAt: new Date().toISOString().slice(0, 10),
      } as any)
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
        onChange={handleFileChange}
      />

      {/* Image crop picker overlay */}
      {cropSrc && (
        <ImageCropPicker
          imageSrc={cropSrc}
          aspect={2.5}
          onConfirm={(dataUrl) => {
            setImageUrl(dataUrl)
            setCropSrc(null)
          }}
          onCancel={() => setCropSrc(null)}
        />
      )}

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

      {/* ── Capa (Integrated Image Picker) ── */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>Capa</p>
        <div
          onClick={() => !imageUrl && fileInputRef.current?.click()}
          style={{
            width: '100%', minHeight: 100, borderRadius: 'var(--radius-card)',
            background: imageUrl ? 'transparent' : 'rgba(255,255,255,0.04)',
            border: `1px solid var(--color-border)`,
            cursor: imageUrl ? 'default' : 'pointer', position: 'relative', overflow: 'hidden',
            transition: 'all 200ms ease',
          }}
        >
          {imageUrl ? (
            <div style={{ position: 'relative', height: 140 }}>
              <img
                src={imageUrl}
                alt="capa"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />
              <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 10,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={13} /> Trocar
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 0', gap: 8,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
              }}>
                <Camera size={20} color="var(--color-accent-couple)" />
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 500, margin: 0 }}>Toque para adicionar foto</p>
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
        <Button
          variant="primary" size="md" fullWidth disabled={!isValid}
          onClick={handleConfirm}
          style={isValid ? { background: accentColor } : undefined}
        >
          {confirmBtn}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}