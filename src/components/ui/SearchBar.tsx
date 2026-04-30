import { Search } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Procurar' }: Props) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
      padding: '0 12px', marginBottom: 16,
    }}>
      <Search size={16} color="var(--color-text-tertiary)" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1, padding: '10px 0', fontSize: 14,
          background: 'none', border: 'none', outline: 'none',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-sans)',
        }}
      />
    </div>
  )
}
