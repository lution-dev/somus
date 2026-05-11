import {
  HandHeart,
  Shield,
  Target,
  Home,
  BookOpen,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

/**
 * Maps divisao IDs to their icon + accent color.
 * Colors aligned to Somus App Design System official palette.
 */
export const DIVISAO_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  'cx-dizimo':    { icon: HandHeart,  color: '#10B981' }, // verde — propósito, generosidade
  'cx-reserva':   { icon: TrendingUp, color: '#4DE2E2' }, // cyan — liberdade financeira
  'cx-objetivos': { icon: Target,     color: '#8B5CF6' }, // lilás — direção, foco
  'cx-essencial': { icon: Home,       color: '#22D3EE' }, // cyan — fundação, estabilidade
  'cx-educacao':  { icon: BookOpen,   color: '#F59E0B' }, // âmbar — aprendizado, sabedoria
}

/**
 * Gets the icon component + brand color for a divisao ID.
 * Falls back to neutral when ID is not recognized.
 */
export function getDivisaoIcon(divisaoId: string): { Icon: LucideIcon; color: string } {
  const match = DIVISAO_ICONS[divisaoId]
  return match
    ? { Icon: match.icon, color: match.color }
    : { Icon: Target, color: '#64748B' }
}

/**
 * Gets the brand color for a known divisao ID (for backgrounds, borders, etc.)
 */
export function getDivisaoColor(divisaoId: string): string {
  return DIVISAO_ICONS[divisaoId]?.color ?? '#64748B'
}
