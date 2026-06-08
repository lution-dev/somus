/**
 * Somus Brand Icons — Proprietary SVG Iconography v2
 *
 * Refined geometry: Somus curves, precise proportions, atmospheric stroke weight.
 * Each icon accepts `size` and `color` props — drop-in for Lucide icons.
 */
import React from 'react'

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
function LiberdadeIcon({ size = 32, color = '#4DE2E2', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 512 342" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Main curve */}
      <path
        d="M13.9636 327.364C72.1454 327.364 95.4182 187.727 165.236 187.727C235.055 187.727 235.055 327.364 304.873 327.364C374.691 327.364 397.964 94.6363 456.145 48.0908"
        stroke={c} strokeWidth="27.9273" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Arrowhead */}
      <path
        d="M402.363 42.7258L468.895 20.7739L490.847 87.3062"
        stroke={c} strokeWidth="27.9273" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Objetivos — precision target: focus, direction, achievement
function ObjetivosIcon({ size = 32, color = '#9B6BFF', style, className }: BrandIconProps) {
  const c = style?.color ?? color
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      {/* Outer ring */}
      <path d="M256 488.727C384.532 488.727 488.727 384.532 488.727 256C488.727 127.468 384.532 23.2727 256 23.2727C127.468 23.2727 23.2727 127.468 23.2727 256C23.2727 384.532 127.468 488.727 256 488.727Z" stroke={c} strokeWidth="25.6"/>
      {/* Mid ring */}
      <path opacity="0.55" d="M256 384C326.692 384 384 326.692 384 256C384 185.308 326.692 128 256 128C185.308 128 128 185.308 128 256C128 326.692 185.308 384 256 384Z" stroke={c} strokeWidth="25.6"/>
      {/* Inner dot — solid */}
      <path d="M256 296.727C278.493 296.727 296.727 278.493 296.727 256C296.727 233.507 278.493 215.273 256 215.273C233.507 215.273 215.273 233.507 215.273 256C215.273 278.493 233.507 296.727 256 296.727Z" fill={c}/>
      {/* Diagonal sight line */}
      <path d="M306 202L473 53" stroke={c} strokeWidth="25.6" strokeLinecap="round"/>
      {/* Arrowhead */}
      <path d="M413 45.8571L489 35L478.143 111" stroke={c} strokeWidth="25.6" strokeLinecap="round" strokeLinejoin="round"/>
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

// ── Somus Official Logo
export function SomusLogoIcon({ size = 120, style, className }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 895 928" fill="none" xmlns="http://www.w3.org/2000/svg" style={style} className={className}>
      <path d="M539.089 2.206L542.761 5.66257C544.368 7.17438 545.279 9.28234 545.279 11.4882V178.851C545.279 180.894 544.497 182.859 543.095 184.344L539.146 188.525C537.635 190.125 535.531 191.032 533.33 191.032H324.279C276.945 192.198 182.379 225.332 190.779 346.532C194.779 388.032 227.079 471.032 324.279 471.032C419.539 471.032 535.706 476.795 584.86 479.849C585.939 479.858 586.914 479.922 587.779 480.032C586.834 479.972 585.861 479.911 584.86 479.849C571.171 479.73 540.778 488.454 507.779 525.532C463.279 575.532 418.779 620.532 324.279 635.032C229.779 649.532 24.2786 571.532 1.27857 346.532C-9.22143 241.532 45.7786 116.032 135.779 54.0316C207.779 4.43159 267.779 -0.468384 324.279 0.0315582L533.606 0.0315952C535.644 0.0315956 537.605 0.809306 539.089 2.206Z" fill="url(#paint0_linear_8_17)"/>
      <path d="M587.779 480.032C574.279 478.532 404.279 470.032 317.279 471.032C345.679 469.031 358.279 465.032 370.779 454.532C386.148 442.176 409.305 415.84 429.279 393.532C435.816 386.23 445.381 377.128 449.779 372.032C495.379 324.432 560.945 312.032 587.779 311.532C794.779 303.032 880.779 480.032 892.779 576.032C912.379 816.432 723.779 924.254 618.779 925.532C536.612 926.532 373.379 928.432 369.779 926.032C366.179 923.632 365.279 922.532 365.279 916.532V763.551C365.279 760.048 366.809 756.719 369.469 754.44L372.408 751.92C374.583 750.056 377.353 749.032 380.218 749.032H596.431C597.327 749.032 598.242 748.928 599.114 748.723C703.442 724.232 722.625 630.235 705.779 576.032C682.779 502.032 629.279 483.032 587.779 480.032Z" fill="url(#paint1_linear_8_17)"/>
      <defs>
        <linearGradient id="paint0_linear_8_17" x1="167.279" y1="35.5316" x2="494.779" y2="552.032" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5B79FF"/>
          <stop offset="1" stopColor="#1E40D1"/>
        </linearGradient>
        <linearGradient id="paint1_linear_8_17" x1="893.779" y1="669.032" x2="371.779" y2="747.532" gradientUnits="userSpaceOnUse">
          <stop stopColor="#28C9DF"/>
          <stop offset="1" stopColor="#0197D3"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── Type compatible with Lucide icon usage ────────────────────────────────
type BrandIcon = (props: BrandIconProps) => React.JSX.Element

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
