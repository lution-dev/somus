import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import { formatCurrency } from '../../lib/calculations'
import { useImageUpload } from '../../hooks/useImageUpload'
import { Camera, Target } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

const ACCENT = 'var(--color-accent-couple)'
const ACCENT_HEX = '#8B5CF6'

const EMOJI_OPTIONS = ['🏠', '✈️', '💍', '🚗', '📱', '💻', '🎓', '👶', '🏖️', '💰', '🛋️', '🎯', '🏋️', '🌍', '🎸']

export default function AddObjetivoModal({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [targetAmount, setTargetAmount] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const currentUser = useAppStore(s => s.currentUser)
  const addObjetivo = useAppStore(s => s.addObjetivo)
  const { upload, isProcessing } = useImageUpload()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName('')
      setEmoji('🎯')
      setTargetAmount('')
      setTargetDate('')
      setImageUrl(undefined)
      setShowEmojiPicker(false)
    }
  }, [open])

  const numTarget = parseFloat(targetAmount.replace(',', '.')) || 0
  const isValid = name.trim() !== '' && numTarget > 0

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await upload(file)
    if (result) setImageUrl(result.dataUrl)
    e.target.value = ''
  }

  function handleConfirm() {
    if (!isValid || !currentUser) return
    addObjetivo({
      userId: currentUser.id,
      name: name.trim(),
      emoji,
      targetAmount: numTarget,
      currentAmount: 0,
      targetDate: targetDate || undefined,
      imageUrl,
      movements: [],
      createdAt: new Date().toISOString().slice(0, 10),
    })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="Novo Objetivo" size="md">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageSelect}
      />

      {/* ── Foto + Emoji row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        {/* Foto */}
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 72, height: 72, borderRadius: 20, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 4,
            background: imageUrl ? 'transparent' : `${ACCENT_HEX}12`,
            border: imageUrl ? 'none' : `2px dashed ${ACCENT_HEX}50`,
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
            opacity: isProcessing ? 0.5 : 1,
            transition: 'opacity 200ms ease',
          }}
        >
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt="capa"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }}
              />
              <div style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 20, height: 20, borderRadius: '50%',
                background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Camera size={10} color="white" />
              </div>
            </>
          ) : (
            <>
              <Camera size={20} color={ACCENT} />
              <span style={{ fontSize: 9, color: 'var(--color-text-tertiary)', textAlign: 'center', lineHeight: 1 }}>
                Foto
              </span>
            </>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 2px' }}>
            Imagem de Capa
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>
            Toque para adicionar uma foto ao objetivo
          </p>
        </div>
      </div>

      {/* ── Emoji picker ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Emoji</p>
          <button
            onClick={() => setShowEmojiPicker(v => !v)}
            style={{
              fontSize: 24, lineHeight: 1, background: 'none', border: 'none',
              cursor: 'pointer', padding: '4px 8px',
              borderRadius: 8, transition: 'background 150ms ease',
            }}
          >
            {emoji}
          </button>
        </div>
        {showEmojiPicker && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--color-border)',
            borderRadius: 12, padding: 10,
          }}>
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                onClick={() => { setEmoji(e); setShowEmojiPicker(false) }}
                style={{
                  fontSize: 22, background: emoji === e ? `${ACCENT_HEX}20` : 'none',
                  border: `1.5px solid ${emoji === e ? ACCENT_HEX : 'transparent'}`,
                  borderRadius: 8, cursor: 'pointer', padding: '4px 6px',
                  transition: 'all 120ms ease',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Nome ── */}
      <div style={{ marginBottom: 16 }}>
        <Input
          label="Nome do objetivo"
          placeholder="Ex: Casa própria, Viagem, Casamento..."
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      {/* ── Meta ── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Meta</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Necessário</p>
        </div>
        <Input
          prefix="R$"
          type="number"
          inputMode="decimal"
          placeholder="0,00"
          value={targetAmount}
          onChange={e => setTargetAmount(e.target.value)}
          style={{ fontSize: 20, fontWeight: 700 }}
        />
        {numTarget > 0 && (
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 6, margin: '6px 0 0' }}>
            Meta: {formatCurrency(numTarget)}
          </p>
        )}
      </div>

      {/* ── Data alvo (opcional) ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Data Alvo</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Opcional</p>
        </div>
        <Input
          type="date"
          value={targetDate}
          onChange={e => setTargetDate(e.target.value)}
        />
      </div>

      <DialogFooter>
        <Button
          variant="primary"
          size="md"
          fullWidth
          disabled={!isValid}
          onClick={handleConfirm}
          style={isValid ? { background: ACCENT_HEX } : undefined}
        >
          {isValid ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={16} />
              Criar Objetivo — {formatCurrency(numTarget)}
            </span>
          ) : (
            'Criar Objetivo'
          )}
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>
          Cancelar
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
