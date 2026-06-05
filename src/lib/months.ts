// ── Shared month utilities ────────────────────────────────────────────────────

export function currentYM(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const mes = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'short' })
  const mesCapit = mes.replace('.', '')
  return `${mesCapit.charAt(0).toUpperCase() + mesCapit.slice(1)} ${y}`
}
