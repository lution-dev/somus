import { Heart, Target } from 'lucide-react'
import { formatCurrency } from '../../lib/calculations'
import type { Objetivo } from '../../types'

interface ObjetivoCardProps {
  obj: Objetivo
  onNavigate: (id: string) => void
  onAction: (obj: Objetivo) => void
  accentColor?: string
}

export default function ObjetivoCard({ obj, onNavigate, onAction, accentColor = 'var(--color-accent-primary)' }: ObjetivoCardProps) {
  const pct = obj.targetAmount > 0 ? Math.min(100, (obj.currentAmount / obj.targetAmount) * 100) : 0
  const remaining = Math.max(0, obj.targetAmount - obj.currentAmount)
  const finalAccent = obj.isCouple ? 'var(--color-accent-couple)' : accentColor

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => onNavigate(obj.id)}
        style={{
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          background: 'var(--color-bg-secondary)',
          border: `1px solid ${obj.isCouple ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 16,
          padding: 0,
          fontFamily: 'var(--font-sans)',
          overflow: 'hidden',
          transition: 'transform 150ms ease, border-color 150ms ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = obj.isCouple ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = obj.isCouple ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.08)'
        }}
      >
        {obj.imageUrl ? (
          <div style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden' }}>
            <img 
              src={obj.imageUrl} 
              alt={obj.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)' 
            }} />
            
            {obj.isCouple && (
              <div style={{ 
                position: 'absolute', 
                top: 10, 
                left: 14, 
                background: 'rgba(139,92,246,0.85)', 
                backdropFilter: 'blur(8px)', 
                borderRadius: 20, 
                padding: '3px 8px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4 
              }}>
                <Heart size={10} color="white" fill="white" />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'white' }}>Casal</span>
              </div>
            )}

            <div style={{ 
              position: 'absolute', 
              bottom: 12, 
              left: 14, 
              right: 14, 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-end' 
            }}>
              <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                <p style={{ 
                  fontSize: 16, 
                  fontWeight: 700, 
                  color: 'white', 
                  margin: 0, 
                  textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {obj.name}
                </p>
              </div>
              <span style={{ 
                fontSize: 14, 
                fontWeight: 800, 
                color: 'white', 
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                flexShrink: 0 
              }}>
                {Math.round(pct)}%
              </span>
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
                width: 38, 
                height: 38, 
                borderRadius: 12, 
                flexShrink: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: `${finalAccent}18`, 
                border: `1px solid ${finalAccent}25` 
              }}>
                <Target size={20} color={finalAccent} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <p style={{ 
                    fontSize: 15, 
                    fontWeight: 700, 
                    color: 'var(--color-text-primary)', 
                    margin: 0, 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {obj.name}
                  </p>
                </div>
                {obj.isCouple && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Heart size={10} color="var(--color-accent-couple)" fill="var(--color-accent-couple)" />
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-accent-couple)' }}>Casal</span>
                  </div>
                )}
              </div>
              <span style={{ 
                fontSize: 15, 
                fontWeight: 800, 
                color: finalAccent, 
                flexShrink: 0,
                paddingTop: 2
              }}>
                {Math.round(pct)}%
              </span>
            </div>
          </div>
        )}

        <div style={{ padding: '12px 14px' }}>
          <div style={{ 
            height: 5, 
            background: 'rgba(255,255,255,0.06)', 
            borderRadius: 9999, 
            overflow: 'hidden', 
            marginBottom: 10 
          }}>
            <div style={{ 
              height: '100%', 
              borderRadius: 9999, 
              background: finalAccent, 
              width: `${pct}%`, 
              transition: 'width 600ms ease' 
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <p style={{ 
                fontSize: 10, 
                color: 'var(--color-text-tertiary)', 
                margin: '0 0 1px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.04em', 
                fontWeight: 600 
              }}>
                Guardado
              </p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                {formatCurrency(obj.currentAmount)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ 
                fontSize: 10, 
                color: 'var(--color-text-tertiary)', 
                margin: '0 0 1px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.04em', 
                fontWeight: 600 
              }}>
                Faltam
              </p>
              <p style={{ 
                fontSize: 13, 
                fontWeight: 600, 
                color: remaining > 0 ? 'var(--color-text-secondary)' : 'var(--color-success)', 
                margin: 0 
              }}>
                {remaining > 0 ? formatCurrency(remaining) : '✓ Meta'}
              </p>
            </div>
          </div>
        </div>
      </button>

      <button
        onClick={e => { e.stopPropagation(); onAction(obj) }}
        style={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          width: 28, 
          height: 28, 
          borderRadius: 8, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'rgba(0,0,0,0.45)', 
          backdropFilter: 'blur(8px)', 
          border: '1px solid rgba(255,255,255,0.12)', 
          cursor: 'pointer', 
          color: 'white', 
          fontSize: 16, 
          fontWeight: 700, 
          lineHeight: 1,
          zIndex: 2
        }}
        aria-label="Opções do objetivo"
      >
        ⋯
      </button>
    </div>
  )
}
