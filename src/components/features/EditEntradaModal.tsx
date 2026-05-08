import { useState, useMemo, useEffect } from 'react'
import { useAppStore, selectCurrentIncomeSources } from '../../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../../lib/calculations'
import { Dialog, DialogFooter, Button, Input } from '../ui'
import type { Entrada } from '../../types'
import { useCurrencyInput } from '../../hooks/useCurrencyInput'

interface Props {
  open: boolean
  onClose: () => void
  entrada: Entrada | null
}

export default function EditEntradaModal({ open, onClose, entrada }: Props) {
  const amountInput                         = useCurrencyInput()
  const [sourceText, setSourceText]         = useState('')
  const [sourceId, setSourceId]             = useState('')
  const [sourceFocused, setSourceFocused]   = useState(false)
  const [date, setDate]                     = useState('')
  const [note, setNote]                     = useState('')

  const incomeSources = useAppStore(useShallow(selectCurrentIncomeSources))
  const editEntrada   = useAppStore(s => s.editEntrada)

  // Pré-preenche ao abrir
  useEffect(() => {
    if (open && entrada) {
      amountInput.setValue(entrada.amount)
      setSourceText(entrada.sourceName)
      const match = incomeSources.find(s => s.name.toLowerCase() === entrada.sourceName.toLowerCase())
      setSourceId(match?.id ?? '')
      setDate(entrada.date)
      setNote(entrada.note ?? '')
      setSourceFocused(false)
    }
  }, [open, entrada])

  const filteredSources = useMemo(() => {
    if (!sourceText.trim()) return incomeSources
    const q = sourceText.toLowerCase()
    return incomeSources.filter(s => s.name.toLowerCase().includes(q))
  }, [sourceText, incomeSources])

  function selectSource(src: { id: string; name: string }) {
    setSourceId(src.id)
    setSourceText(src.name)
    setSourceFocused(false)
  }

  function handleSourceChange(text: string) {
    setSourceText(text)
    setSourceId('')
    setSourceFocused(true)
    const exact = incomeSources.find(s => s.name.toLowerCase() === text.toLowerCase())
    if (exact) setSourceId(exact.id)
  }

  const numAmount = amountInput.numericValue
  const isValid   = numAmount > 0 && sourceText.trim()

  function handleSave() {
    if (!isValid || !entrada) return
    const src = incomeSources.find(s => s.id === sourceId)
    editEntrada(entrada.id, {
      amount:     numAmount,
      sourceName: src?.name ?? sourceText.trim(),
      date,
      note:       note || undefined,
    })
    onClose()
  }

  if (!entrada) return null

  return (
    <Dialog open={open} onClose={onClose} title="Editar Entrada" size="md">
      {/* Valor */}
      <div style={{ marginBottom: 12 }}>
        <Input
          label="Valor recebido"
          prefix="R$"
          inputMode="numeric"
          placeholder="0,00"
          value={amountInput.displayValue}
          onChange={amountInput.handleChange}
          style={{ fontSize: 20, fontWeight: 700 }}
        />
      </div>

      {/* Fonte de renda */}
      <div style={{ marginBottom: 12, position: 'relative' }}>
        <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>
          Fonte de renda
        </label>
        <input
          type="text"
          placeholder="Ex: Salário, Freelance..."
          value={sourceText}
          onChange={e => handleSourceChange(e.target.value)}
          onFocus={() => setSourceFocused(true)}
          onBlur={() => setTimeout(() => setSourceFocused(false), 150)}
          style={{
            width: '100%', padding: '10px 14px',
            fontSize: 16, fontFamily: 'var(--font-sans)',
            background: 'var(--color-bg-tertiary)',
            border: `1px solid ${sourceId ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
            borderRadius: 12,
            color: 'var(--color-text-primary)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {sourceFocused && filteredSources.length > 0 && (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '100%',
            marginTop: 4, zIndex: 50,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {filteredSources.map(src => (
              <button
                key={src.id}
                onMouseDown={e => { e.preventDefault(); selectSource(src) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '10px 14px',
                  fontSize: 14, fontFamily: 'var(--font-sans)',
                  background: sourceId === src.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-primary)',
                  borderBottom: '1px solid var(--color-border)',
                  textAlign: 'left',
                }}
              >
                {src.color && (
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: src.color, flexShrink: 0 }} />
                )}
                {src.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Data */}
      <div style={{ marginBottom: 12 }}>
        <Input
          label="Data"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {/* Observação */}
      <div style={{ marginBottom: 16 }}>
        <Input
          label="Observação (opcional)"
          placeholder="Ex: bônus extra, freelance..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      <DialogFooter>
        <Button variant="primary" size="md" fullWidth disabled={!isValid} onClick={handleSave}>
          Salvar — {numAmount > 0 ? formatCurrency(numAmount) : 'R$ 0,00'}
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onClose}>Cancelar</Button>
      </DialogFooter>
    </Dialog>
  )
}
