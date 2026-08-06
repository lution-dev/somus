// ── Shared date/month utilities ───────────────────────────────────────────────
// IMPORTANTE: nunca usar new Date().toISOString() para obter a data atual —
// toISOString() retorna UTC, causando virada de dia às 21h no Brasil (UTC-3).
// Sempre usar as funções abaixo que lêem o horário LOCAL do dispositivo.

/**
 * Retorna a data de hoje no fuso local como "YYYY-MM-DD".
 * Substitui: new Date().toISOString().slice(0, 10)
 */
export function todayBR(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Retorna o ano-mês atual no fuso local como "YYYY-MM".
 * Substitui: new Date().toISOString().slice(0, 7)
 */
export function currentYM(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
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

/** Mês civil anterior ao atual (fuso local), ex: '2026-07' */
export function previousYM(from?: string): string {
  return shiftMonth(from ?? currentYM(), -1)
}

/** Nome do mês por extenso em pt-BR, ex: "Julho" */
export function monthNameLong(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const raw = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}
