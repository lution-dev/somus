/**
 * Somus Brand Icons — Proprietary SVG Iconography v2
 *
 * Refined geometry: Somus curves, precise proportions, atmospheric stroke weight.
 * Each icon accepts `size` and `color` props — drop-in for Lucide icons.
 */

interface BrandIconProps {
  size?: number
  color?: string
  style?: React.CSSProperties
  className?: string
}

// ── Essencial — graduated layers: foundation, structure, stability
// Refined: layers now use cubic curves for organic weight, tighter viewBox
function EssencialIcon({ size = 32, color = '#2384FF', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="12 12 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Outer container — rounded square with owned geometry */}
      <rect x="14" y="14" width="36" height="36" rx="9" stroke={c} strokeWidth="2.2" />
      {/* Bottom layer — full width, full opacity */}
      <path d="M20 40H44" stroke={c} strokeWidth="2.4" strokeLinecap="round"/>
      {/* Mid layer — tapering inward */}
      <path d="M23 33H41" stroke={c} strokeWidth="2.4" strokeLinecap="round" opacity="0.65"/>
      {/* Top layer — narrowest, lightest */}
      <path d="M26.5 26H37.5" stroke={c} strokeWidth="2.4" strokeLinecap="round" opacity="0.35"/>
    </svg>
  )
}

// ── Liberdade Financeira — flowing upward curve: growth, momentum, freedom
// Refined: smoother bezier, proportionally balanced arrowhead
function LiberdadeIcon({ size = 32, color = '#4DE2E2', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="10 16 44 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Main curve — cubic bezier for smooth Somus flow */}
      <path
        d="M13 42C18 42 20 30 26 30C32 30 32 42 38 42C44 42 46 22 51 18"
        stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Arrowhead — proportional 6x6 */}
      <path d="M46.5 22L51 18L55 22.5" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Objetivos — precision target: focus, direction, achievement
// Refined: 3-ring target with inner dot for fintech precision feel
function ObjetivosIcon({ size = 32, color = '#9B6BFF', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="10 10 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Outer ring */}
      <circle cx="32" cy="32" r="20" stroke={c} strokeWidth="2.2"/>
      {/* Mid ring */}
      <circle cx="32" cy="32" r="11" stroke={c} strokeWidth="2.2" opacity="0.55"/>
      {/* Inner dot — solid */}
      <circle cx="32" cy="32" r="3.5" fill={c}/>
      {/* Diagonal sight line */}
      <path d="M39.5 24.5L49 16" stroke={c} strokeWidth="2.2" strokeLinecap="round"/>
      {/* Arrowhead nub */}
      <path d="M45.5 16.5L49 16L48.5 19.5" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Educação — open book: knowledge, wisdom, growth
// Refined: cleaner V-spine, organic page curves, consistent weight
function EducacaoIcon({ size = 32, color = '#3ED6B7', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="14 16 36 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Left page — curves outward naturally */}
      <path
        d="M32 22C28 20 23 20 18 22V43C23 41 28 41 32 45"
        stroke={c} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Right page — mirror */}
      <path
        d="M32 22C36 20 41 20 46 22V43C41 41 36 41 32 45"
        stroke={c} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Spine — subtle opacity, sense of depth */}
      <path d="M32 22V45" stroke={c} strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
    </svg>
  )
}

// ── Dízimo — drop/heart: purpose, generosity, giving
// Refined: single unified bezier path for smooth teardrop, inner arc for depth
function DizimoIcon({ size = 32, color = '#E5B85C', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="14 11 36 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Teardrop — unified path: heart top + pointed base */}
      <path
        d="M32 50C32 50 16 38 16 26C16 18.3 23.2 13 32 13C40.8 13 48 18.3 48 26C48 38 32 50 32 50Z"
        stroke={c} strokeWidth="2.3" strokeLinejoin="round"
      />
      {/* Inner arc — depth and generosity */}
      <path
        d="M24.5 36C27 31.5 29.5 30 32 30C34.5 30 37 31.5 39.5 36"
        stroke={c} strokeWidth="2.1" strokeLinecap="round" opacity="0.55"
      />
    </svg>
  )
}

// ── Default — Somus diamond: neutral brand mark
function DefaultDivisaoIcon({ size = 24, color = '#2563EB', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <path d="M32 14L50 32L32 50L14 32L32 14Z" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Type compatible with Lucide icon usage ────────────────────────────────
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
