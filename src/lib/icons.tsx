/**
 * Somus Brand Icons — official SVG icons per App Design System
 *
 * Each icon accepts `size` and `color` (override) props,
 * making them drop-in replacements for Lucide icons.
 */

interface BrandIconProps {
  size?: number
  color?: string
  style?: React.CSSProperties
  className?: string
}

// Essencial — triângulo: fundação, estabilidade, estrutura
function EssencialIcon({ size = 24, color = '#22D3EE', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <path d="M18 46L32 20L46 46" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// Liberdade Financeira — curva ascendente: crescimento, evolução
function LiberdadeIcon({ size = 24, color = '#4DE2E2', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <path d="M14 40C20 28 28 28 32 40C36 52 44 52 50 24" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M46 28L50 24L54 28" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// Objetivos — círculos concêntricos: direção, foco
function ObjetivosIcon({ size = 24, color = '#8B5CF6', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <circle cx="32" cy="32" r="16" stroke={c} strokeWidth="2.5"/>
      <circle cx="32" cy="32" r="7"  stroke={c} strokeWidth="2.5"/>
    </svg>
  )
}

// Educação — livro aberto: aprendizado, sabedoria
function EducacaoIcon({ size = 24, color = '#F59E0B', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <path d="M18 22C18 20.9 18.9 20 20 20H30C33.3 20 36 22.7 36 26V44H24C20.7 44 18 41.3 18 38V22Z" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M46 22C46 20.9 45.1 20 44 20H34C30.7 20 28 22.7 28 26V44H40C43.3 44 46 41.3 46 38V22Z" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
    </svg>
  )
}

// Dízimo — cruz minimalista: propósito, generosidade
function DizimoIcon({ size = 24, color = '#10B981', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <path d="M32 16V48" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 28H44" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

// Default — losango: identidade genérica
function DefaultDivisaoIcon({ size = 24, color = '#2563EB', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <path d="M32 14L50 32L32 50L14 32L32 14Z" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Type compatible with Lucide icon usage ───────────────────────────────
type BrandIcon = (props: BrandIconProps) => JSX.Element

/**
 * Maps divisao IDs → official brand icon component + brand color.
 * Drop-in replacement for Lucide icons: <Icon size={22} style={{ color }} />
 */
export const DIVISAO_ICONS: Record<string, { icon: BrandIcon; color: string }> = {
  'cx-essencial': { icon: EssencialIcon,  color: '#22D3EE' }, // cyan — fundação
  'cx-reserva':   { icon: LiberdadeIcon,  color: '#4DE2E2' }, // cyan — liberdade financeira
  'cx-objetivos': { icon: ObjetivosIcon,  color: '#8B5CF6' }, // lilás — foco
  'cx-educacao':  { icon: EducacaoIcon,   color: '#F59E0B' }, // âmbar — aprendizado
  'cx-dizimo':    { icon: DizimoIcon,     color: '#10B981' }, // verde — propósito
}

/**
 * Gets the brand SVG icon + color for a divisao ID.
 * Usage: const { Icon, color } = getDivisaoIcon(id)
 *        <Icon size={22} style={{ color }} />
 */
export function getDivisaoIcon(divisaoId: string): { Icon: BrandIcon; color: string } {
  const match = DIVISAO_ICONS[divisaoId]
  return match
    ? { Icon: match.icon, color: match.color }
    : { Icon: DefaultDivisaoIcon, color: '#2563EB' }
}

/**
 * Gets just the brand color for a divisao ID.
 */
export function getDivisaoColor(divisaoId: string): string {
  return DIVISAO_ICONS[divisaoId]?.color ?? '#2563EB'
}
