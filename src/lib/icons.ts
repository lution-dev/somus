import {
  HandHeart,
  Shield,
  Target,
  Home,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'

/**
 * Maps divisao IDs to their Lucide icon + accent color.
 * Replaces all emoji usage per UI/UX skill anti-pattern rules.
 */
export const DIVISAO_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  'cx-dizimo':    { icon: HandHeart, color: '#F59E0B' },
  'cx-reserva':   { icon: Shield,    color: '#10B981' },
  'cx-objetivos': { icon: Target,    color: '#8B5CF6' },
  'cx-essencial': { icon: Home,      color: '#3B82F6' },
  'cx-educacao':  { icon: BookOpen,  color: '#06B6D4' },
}

/**
 * Gets the Lucide icon component for a divisao, with fallback.
 */
export function getDivisaoIcon(divisaoId: string): { Icon: LucideIcon; color: string } {
  const match = DIVISAO_ICONS[divisaoId]
  return match
    ? { Icon: match.icon, color: match.color }
    : { Icon: Target, color: '#64748B' }
}
