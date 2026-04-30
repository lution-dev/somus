import { formatCurrency } from '../../lib/calculations'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MonthGroup<T> {
  key: string
  label: string
  total: number
  items: T[]
}

// ─── Grouping utility ───────────────────────────────────────────────────────

/**
 * Groups items by month, sorted descending (newest first).
 * @param items Array of objects with a `date` (YYYY-MM-DD) and `amount` (number) field
 * @param getDate Accessor for the date string
 * @param getAmount Accessor for the amount (can be negative for expenses)
 */
export function groupByMonth<T>(
  items: T[],
  getDate: (item: T) => string,
  getAmount: (item: T) => number,
): MonthGroup<T>[] {
  const map = new Map<string, MonthGroup<T>>()
  const sorted = [...items].sort((a, b) => getDate(b).localeCompare(getDate(a)))

  for (const item of sorted) {
    const d = new Date(getDate(item) + 'T12:00:00')
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    if (!map.has(key)) map.set(key, { key, label, total: 0, items: [] })
    const group = map.get(key)!
    group.total += getAmount(item)
    group.items.push(item)
  }

  return Array.from(map.values())
}

// ─── Month header component ─────────────────────────────────────────────────

/**
 * Compact month divider: "abril 2026  +R$ 7.000,00"
 * Renders as a subtle section separator between items in any list.
 */
export function MonthHeader({
  label, total, type = 'income',
}: {
  label: string
  total: number
  type?: 'income' | 'expense' | 'mixed'
}) {
  const color =
    type === 'income' ? 'var(--color-success)'
    : type === 'expense' ? 'var(--color-danger)'
    : total >= 0 ? 'var(--color-success)' : 'var(--color-danger)'

  const prefix =
    type === 'income' ? '+'
    : type === 'expense' ? '−'
    : total >= 0 ? '+' : ''

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 16px',
      background: 'var(--color-bg-tertiary)',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <span style={{
        fontSize: 12, fontWeight: 600,
        color: 'var(--color-text-secondary)',
        textTransform: 'capitalize',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 12, fontWeight: 700, color,
      }}>
        {prefix}{formatCurrency(Math.abs(total))}
      </span>
    </div>
  )
}
