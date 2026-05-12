import { SomusLogoIcon } from '../../lib/icons'

interface SomusLogoProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function SomusLogo({ size = 24, className, style }: SomusLogoProps) {
  return <SomusLogoIcon size={size} className={className} style={style} />
}
