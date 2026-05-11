/**
 * DivisaoIcon — Official brand SVG icons per Somus App Design System
 * Maps division names/keywords → brand icon with correct colors
 */

interface DivisaoIconProps {
  name: string
  size?: number
  className?: string
}

type IconKey = 'essencial' | 'liberdade' | 'objetivo' | 'educacao' | 'dizimo' | 'investimento' | 'default'

function matchIcon(name: string): IconKey {
  const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (n.includes('essencial') || n.includes('moradia') || n.includes('casa') || n.includes('alimenta')) return 'essencial'
  if (n.includes('liberdade') || n.includes('reserva') || n.includes('emergencia') || n.includes('poupan')) return 'liberdade'
  if (n.includes('objetivo') || n.includes('meta') || n.includes('sonho')) return 'objetivo'
  if (n.includes('educa') || n.includes('curso') || n.includes('livro') || n.includes('estudo')) return 'educacao'
  if (n.includes('dizimo') || n.includes('oferta') || n.includes('doacao') || n.includes('igreja')) return 'dizimo'
  if (n.includes('invest') || n.includes('acoes') || n.includes('renda') || n.includes('riqueza')) return 'liberdade'
  return 'default'
}

export function DivisaoIcon({ name, size = 32, className }: DivisaoIconProps) {
  const key = matchIcon(name)
  const s = size
  const sw = 2.5

  const icons: Record<IconKey, JSX.Element> = {
    // Essencial — triângulo: fundação, estabilidade, estrutura
    essencial: (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M18 46L32 20L46 46" stroke="#22D3EE" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),

    // Liberdade Financeira — curva ascendente: crescimento, evolução
    liberdade: (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M14 40C20 28 28 28 32 40C36 52 44 52 50 24" stroke="#4DE2E2" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M46 28L50 24L54 28" stroke="#4DE2E2" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),

    // Objetivo — círculos concêntricos: direção, foco
    objetivo: (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="32" cy="32" r="16" stroke="#8B5CF6" strokeWidth={sw}/>
        <circle cx="32" cy="32" r="7" stroke="#8B5CF6" strokeWidth={sw}/>
      </svg>
    ),

    // Educação — livro aberto: aprendizado, sabedoria
    educacao: (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M18 22C18 20.9 18.9 20 20 20H30C33.3 20 36 22.7 36 26V44H24C20.7 44 18 41.3 18 38V22Z" stroke="#F59E0B" strokeWidth={sw} strokeLinejoin="round"/>
        <path d="M46 22C46 20.9 45.1 20 44 20H34C30.7 20 28 22.7 28 26V44H40C43.3 44 46 41.3 46 38V22Z" stroke="#F59E0B" strokeWidth={sw} strokeLinejoin="round"/>
      </svg>
    ),

    // Dízimo — cruz minimalista: propósito, generosidade
    dizimo: (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M32 16V48" stroke="#10B981" strokeWidth={sw} strokeLinecap="round"/>
        <path d="M20 28H44" stroke="#10B981" strokeWidth={sw} strokeLinecap="round"/>
      </svg>
    ),

    // Default — losango: versatilidade, identidade
    default: (
      <svg width={s} height={s} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M32 14L50 32L32 50L14 32L32 14Z" stroke="#2563EB" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  }

  return icons[key]
}

export default DivisaoIcon
