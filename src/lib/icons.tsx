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

// Essencial — camadas horizontais: fundação, estabilidade, estrutura
function EssencialIcon({ size = 24, color = '#2384FF', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <path d="M18 42H46" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M22 34H42" stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M26 26H38" stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      <rect x="16" y="16" width="32" height="32" rx="10" stroke={c} strokeWidth="2.5"/>
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

// Objetivos — alvo com linha: direção, foco
function ObjetivosIcon({ size = 24, color = '#9B6BFF', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <circle cx="32" cy="32" r="18" stroke={c} strokeWidth="2.5"/>
      <circle cx="32" cy="32" r="8"  stroke={c} strokeWidth="2.5" opacity="0.6"/>
      <path d="M32 32L46 18" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

// Educação — livro aberto estilizado: aprendizado, sabedoria
function EducacaoIcon({ size = 24, color = '#3ED6B7', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <path d="M18 22C22 20 27 20 32 24C37 20 42 20 46 22"
            stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 22V42C22 40 27 40 32 44C37 40 42 40 46 42V22"
            stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M32 24V44"
            stroke={c} strokeWidth="2.5" opacity="0.45" strokeLinecap="round"/>
    </svg>
  )
}

// Dízimo — coração/gota: propósito, generosidade, espiritualidade
function DizimoIcon({ size = 24, color = '#E5B85C', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <path d="M32 14C40 14 46 20 46 28C46 40 32 50 32 50C32 50 18 40 18 28C18 20 24 14 32 14Z"
            stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M24 38C27 34 29 32 32 32C35 32 37 34 40 38"
            stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
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
  'cx-essencial': { icon: EssencialIcon,  color: '#2384FF' }, // azul — camadas, fundação
  'cx-reserva':   { icon: LiberdadeIcon,  color: '#4DE2E2' }, // cyan — liberdade financeira
  'cx-objetivos': { icon: ObjetivosIcon,  color: '#9B6BFF' }, // lilás — alvo, foco
  'cx-educacao':  { icon: EducacaoIcon,   color: '#3ED6B7' }, // verde-azulado — sabedoria
  'cx-dizimo':    { icon: DizimoIcon,     color: '#E5B85C' }, // dourado — propósito
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
