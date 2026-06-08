import { Heart, Target } from 'lucide-react'
import { formatCurrency } from '../../lib/calculations'
import type { Objetivo } from '../../types'

interface ObjetivoCardProps {
  obj: Objetivo
  onNavigate: (id: string) => void
  onAction: (obj: Objetivo) => void
  accentColor?: string
  hideCasalBadge?: boolean
  compact?: boolean
}

export default function ObjetivoCard({ obj, onNavigate, onAction, accentColor = 'var(--color-accent-primary)', hideCasalBadge = false, compact = false }: ObjetivoCardProps) {
  const pct = obj.targetAmount > 0 ? Math.min(100, (obj.currentAmount / obj.targetAmount) * 100) : 0
  const remaining = Math.max(0, obj.targetAmount - obj.currentAmount)
  const finalAccent = obj.isCouple ? 'var(--color-accent-couple)' : accentColor
  const isComplete = remaining <= 0 && obj.targetAmount > 0

  // Glow progressivo no TRACK (não no fill) — não quebra o layout
  const trackGlow = isComplete
    ? '0 0 8px rgba(139,92,246,0.7), 0 0 16px rgba(139,92,246,0.3)'
    : pct >= 75
      ? '0 0 5px rgba(139,92,246,0.45)'
      : pct >= 40
        ? '0 0 3px rgba(139,92,246,0.25)'
        : 'none'

  const barGradient = isComplete
    ? 'linear-gradient(90deg, #8B5CF6, #22D3EE)'
    : pct >= 75
      ? `linear-gradient(90deg, ${finalAccent}, #22D3EEaa)`
      : finalAccent

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => onNavigate(obj.id)}
        style={{
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          background: 'var(--color-bg-secondary)',
          border: isComplete
            ? '1px solid rgba(139,92,246,0.4)'
            : `1px solid ${obj.isCouple ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 16,
          padding: 0,
          fontFamily: 'var(--font-sans)',
          overflow: 'hidden',
          transition: 'transform 150ms ease, border-color 150ms ease',
          boxShadow: isComplete ? '0 2px 16px rgba(139,92,246,0.1)' : 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = isComplete
            ? 'rgba(139,92,246,0.6)'
            : obj.isCouple ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isComplete
            ? 'rgba(139,92,246,0.4)'
            : obj.isCouple ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.08)'
        }}
      >
        {/* Imagem ou placeholder */}
        {obj.imageUrl ? (
          <div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden' }}>
            <img
              src={obj.imageUrl}
              alt={obj.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0.15) 100%)'
            }} />
            {obj.isCouple && !hideCasalBadge && (
              <div style={{
                position: 'absolute', top: 10, left: 14,
                background: 'rgba(139,92,246,0.85)', backdropFilter: 'blur(8px)',
                borderRadius: 20, padding: '3px 8px',
                display: 'flex', alignItems: 'center', gap: 4
              }}>
                <Heart size={10} color="white" fill="white" />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>Casal</span>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: compact ? 10 : 14, left: compact ? 12 : 16, right: compact ? 12 : 16 }}>
              <p style={{
                fontSize: compact ? 14 : 18, fontWeight: 700, color: 'white', margin: 0,
                textShadow: '0 2px 6px rgba(0,0,0,0.7)',
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3,
              }}>
                {obj.name}
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '16px 14px 12px',
            background: `linear-gradient(135deg, ${finalAccent}12 0%, ${finalAccent}05 100%)`,
            borderBottom: `1px solid ${finalAccent}15`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${finalAccent}18`, border: `1px solid ${finalAccent}25`
              }}>
                <Target size={20} color={finalAccent} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                <p style={{
                  fontSize: compact ? 14 : 16, fontWeight: 700, color: 'var(--color-text-primary)',
                  margin: '0 0 3px', display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3,
                }}>
                  {obj.name}
                </p>
                {obj.isCouple && !hideCasalBadge && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Heart size={10} color="var(--color-accent-couple)" fill="var(--color-accent-couple)" />
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-accent-couple)' }}>Casal</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer do card */}
        <div style={{ padding: compact ? '10px 12px 12px' : '14px 16px 16px' }}>
          {/* Barra de progresso */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{
              flex: 1, height: compact ? 4 : 6,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 9999, overflow: 'hidden',
              boxShadow: trackGlow,
            }}>
              <div style={{
                height: '100%', borderRadius: 9999,
                background: barGradient,
                width: `${pct}%`,
                transition: 'width 600ms ease',
              }} />
            </div>
            {!isComplete && (
              <span style={{ fontSize: compact ? 11 : 13, fontWeight: 700, color: finalAccent, flexShrink: 0 }}>
                {Math.round(pct)}%
              </span>
            )}
          </div>

          {/* Dados — 2 linhas fixas para manter altura igual */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 3 : 4 }}>
            {/* Linha 1: sempre "CONSTRUÍDO" + valor */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 4 }}>
              <p style={{
                fontSize: compact ? 9 : 12, fontWeight: 700, margin: 0, flexShrink: 0,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                color: isComplete ? 'var(--color-accent-couple)' : 'var(--color-text-tertiary)',
                whiteSpace: 'nowrap',
              }}>
                {isComplete ? 'Construído ✨' : 'Construído'}
              </p>
              <p style={{
                fontSize: compact ? 11 : 16, fontWeight: 700, margin: 0,
                color: 'var(--color-text-primary)',
                minWidth: 0, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {formatCurrency(obj.currentAmount)}
              </p>
            </div>

            {/* Linha 2: "RESTAM" + restante | ou texto de continuidade */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: isComplete ? 'flex-end' : 'space-between', gap: 4 }}>
              {!isComplete && (
                <p style={{
                  fontSize: compact ? 9 : 12, fontWeight: 600, margin: 0, flexShrink: 0,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap',
                }}>
                  Restam
                </p>
              )}
              <p style={{
                fontSize: isComplete ? (compact ? 10 : 13) : (compact ? 11 : 16), fontWeight: isComplete ? 400 : 600,
                margin: 0, minWidth: 0,
                color: isComplete ? 'rgba(139,92,246,0.75)' : 'var(--color-text-secondary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontStyle: isComplete ? 'italic' : 'normal',
              }}>
                {isComplete ? 'Próximos passos →' : formatCurrency(remaining)}
              </p>
            </div>

            {/* Frase de prazo — "Você chega lá em..." */}
            {!isComplete && (() => {
              if (obj.targetDate) {
                const target = new Date(obj.targetDate + 'T12:00:00')
                const today = new Date(); today.setHours(0, 0, 0, 0)
                const monthsLeft = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
                if (monthsLeft <= 0) return (
                  <p style={{ fontSize: compact ? 9 : 11, color: 'var(--color-warning)', margin: '6px 0 0', fontStyle: 'italic', lineHeight: 1.4 }}>
                    O prazo original passou. Vale redefinir.
                  </p>
                )
                const formatted = target.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                return (
                  <p style={{ fontSize: compact ? 9 : 11, color: 'var(--color-text-tertiary)', margin: '6px 0 0', fontStyle: 'italic', lineHeight: 1.4 }}>
                    Você chega lá em {formatted}.
                  </p>
                )
              }
              if (obj.monthsToAchieve && obj.currentAmount < obj.targetAmount) {
                const base = obj.createdAt ? new Date(obj.createdAt) : new Date()
                const endDate = new Date(base)
                endDate.setMonth(endDate.getMonth() + obj.monthsToAchieve)
                const formatted = endDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                return (
                  <p style={{ fontSize: compact ? 9 : 11, color: 'var(--color-text-tertiary)', margin: '6px 0 0', fontStyle: 'italic', lineHeight: 1.4 }}>
                    Você chega lá em {formatted}.
                  </p>
                )
              }
              return null
            })()}
          </div>
        </div>
      </button>

      {/* Botão ⋯ — sempre no canto superior direito, fora da imagem */}
      <button
        onClick={e => { e.stopPropagation(); onAction(obj) }}
        style={{
          position: 'absolute', top: 10, right: 10,
          width: 28, height: 28, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer', color: 'white',
          fontSize: 16, fontWeight: 700, lineHeight: 1, zIndex: 2
        }}
        aria-label="Opções do objetivo"
      >
        ⋯
      </button>
    </div>
  )
}
