import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Check } from 'lucide-react'
import type { Objetivo } from '../../types'
import { formatCurrency } from '../../lib/calculations'

interface RedistItem {
  objetivoId: string
  objetivoName: string
  amount: number
}

interface Props {
  open: boolean
  onClose: () => void
  originObjetivo: Objetivo
  allObjetivos: Objetivo[]
  onConfirm: (items: RedistItem[]) => void
}

function AmountInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    if (value === 0) setDisplay('')
  }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw === '') { setDisplay(''); onChange(0); return }
    const n = parseInt(raw, 10) / 100
    setDisplay(n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    onChange(n)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="0,00"
      value={display}
      onChange={handleChange}
      style={{
        width: 90, background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 8, padding: '6px 8px',
        fontSize: 14, fontWeight: 600,
        color: value > 0 ? 'var(--color-accent-couple)' : 'var(--color-text-secondary)',
        fontFamily: 'var(--font-sans)', outline: 'none', textAlign: 'right',
      }}
    />
  )
}

export default function RedistribuirModal({ open, onClose, originObjetivo, allObjetivos, onConfirm }: Props) {
  const others = allObjetivos.filter(o => o.id !== originObjetivo.id)
  const [amounts, setAmounts] = useState<Record<string, number>>({})

  useEffect(() => { if (open) setAmounts({}) }, [open])

  const total = Object.values(amounts).reduce((s, v) => s + v, 0)
  const remainingAfter = originObjetivo.currentAmount - total
  const isValid = total > 0 && total <= originObjetivo.currentAmount

  function handleConfirm() {
    if (!isValid) return
    const items: RedistItem[] = Object.entries(amounts)
      .filter(([, v]) => v > 0)
      .map(([id, amount]) => ({
        objetivoId: id,
        objetivoName: others.find(o => o.id === id)?.name ?? '',
        amount,
      }))
    onConfirm(items)
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9500, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)', borderRadius: '28px 28px 0 0',
        maxHeight: '88dvh', overflowY: 'auto',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Redistribuir patrimônio</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>
              Disponível: {formatCurrency(originObjetivo.currentAmount)}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '0 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>Distribuindo</p>
            <p style={{ fontSize: 11, fontWeight: 600, margin: 0, color: total > originObjetivo.currentAmount ? 'var(--color-danger)' : 'var(--color-accent-couple)' }}>
              {formatCurrency(total)} de {formatCurrency(originObjetivo.currentAmount)}
            </p>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 99 }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: total > originObjetivo.currentAmount ? 'var(--color-danger)' : 'linear-gradient(90deg, #8B5CF6, #22D3EE)',
              width: `${Math.min(100, (total / Math.max(originObjetivo.currentAmount, 1)) * 100)}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Outros objetivos */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {others.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '20px 0' }}>
              Nenhum outro objetivo disponível para redistribuição.
            </p>
          ) : (
            others.map(obj => (
              <div key={obj.id} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)',
                borderRadius: 12, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ fontSize: 20 }}>{obj.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{obj.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>atual: {formatCurrency(obj.currentAmount)}</p>
                </div>
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>R$</span>
                  <AmountInput value={amounts[obj.id] ?? 0} onChange={v => setAmounts(prev => ({ ...prev, [obj.id]: v }))} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preview emocional */}
        {isValid && (
          <div style={{ margin: '0 20px 20px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent-couple)', margin: '0 0 10px' }}>
              Depois dessa redistribuição:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(amounts).filter(([, v]) => v > 0).map(([id, v]) => {
                const obj = others.find(o => o.id === id)
                if (!obj) return null
                return (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>{obj.name}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#10B981', margin: 0 }}>ficará com {formatCurrency(obj.currentAmount + v)}</p>
                  </div>
                )
              })}
              {remainingAfter > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>{originObjetivo.name} (restante)</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>{formatCurrency(remainingAfter)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botão confirmar */}
        <div style={{ padding: '0 20px' }}>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: isValid ? 'var(--color-accent-couple)' : 'rgba(255,255,255,0.06)',
              border: 'none', cursor: isValid ? 'pointer' : 'not-allowed',
              color: isValid ? 'white' : 'var(--color-text-tertiary)',
              fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.3s ease',
              boxShadow: isValid ? '0 8px 24px rgba(139,92,246,0.3)' : 'none',
            }}
          >
            <Check size={16} />
            Confirmar redistribuição
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
