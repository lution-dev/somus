/** Hash estável e legível para identificar uma linha do extrato. */
export function transactionHash(date: string, amount: number, description: string): string {
  const normDesc = description.trim().toLowerCase().replace(/\s+/g, ' ')
  const cents = Math.round(amount * 100)
  const raw = `${date}|${cents}|${normDesc}`
  let h = 0
  for (let i = 0; i < raw.length; i++) {
    h = ((h << 5) - h) + raw.charCodeAt(i)
    h |= 0
  }
  return `tx-${(h >>> 0).toString(36)}-${Math.abs(cents)}`
}
