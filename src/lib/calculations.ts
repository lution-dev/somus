import type { Divisao, DivisaoDistributionItem, SaidaFixa, Entrada, MonthSummary } from '../types'

// ─── Formatação ─────────────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatCurrencyCompact(value: number): string {
  if (value >= 1000) {
    return `R$\u00a0${(value / 1000).toFixed(1).replace('.', ',')}k`
  }
  return formatCurrency(value)
}

// ─── Distribuição automática por divisao ────────────────────────────────────

export function calculateDistribution(
  amount: number,
  divisoes: Divisao[]
): DivisaoDistributionItem[] {
  const sorted = [...divisoes].sort((a, b) => a.order - b.order)
  const totalPct = sorted.reduce((sum, cx) => sum + cx.percentage, 0)

  let remaining = amount
  const result: DivisaoDistributionItem[] = []

  sorted.forEach((cx, idx) => {
    const isLast = idx === sorted.length - 1
    const raw = (cx.percentage / totalPct) * amount
    const allocated = isLast ? Math.round(remaining * 100) / 100 : Math.round(raw * 100) / 100
    remaining -= allocated
    result.push({
      divisaoId: cx.id,
      divisaoName: cx.name,
      amount: allocated,
      percentage: cx.percentage,
    })
  })

  // RN08: Move dízimo para o início
  const dizimoIdx = result.findIndex(item => item.divisaoName.toLowerCase().includes('dízimo') || item.divisaoName.toLowerCase().includes('dizimo'))
  if (dizimoIdx > 0) {
    const [dizimo] = result.splice(dizimoIdx, 1)
    result.unshift(dizimo)
  }

  return result
}

// ─── Resumo do mês ───────────────────────────────────────────────────────────

export function getMonthSummary(
  entradas: Entrada[],
  saidasFixas: SaidaFixa[],
  divisoes: Divisao[],
  expectedMonthlyIncome: number,
  month?: string   // 'YYYY-MM', defaults to current
): MonthSummary {
  const target = month || new Date().toISOString().slice(0, 7)

  const totalIncome = entradas
    .filter(e => e.date.startsWith(target))
    .reduce((sum, e) => sum + e.amount, 0)

  const totalExpenses = saidasFixas
    .filter(sf => sf.paidDates.some(d => d.startsWith(target)))
    .reduce((sum, sf) => sum + sf.amount, 0)

  const availableBalance = divisoes.reduce((sum, cx) => sum + cx.balance, 0)

  return {
    totalIncome,
    totalExpenses,
    availableBalance,
    expectedMonthlyIncome,
    incomeProgress: expectedMonthlyIncome > 0 ? Math.min(100, (totalIncome / expectedMonthlyIncome) * 100) : 0,
  }
}

// ─── Data helpers ────────────────────────────────────────────────────────────

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10)
}

export function isFuture(dateStr: string): boolean {
  return dateStr > new Date().toISOString().slice(0, 10)
}

export function getDaysUntil(day: number): number {
  const today = new Date()
  const target = new Date(today.getFullYear(), today.getMonth(), day)
  if (target < today) target.setMonth(target.getMonth() + 1)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function isPaidThisMonth(paidDates: string[]): boolean {
  const currentMonth = new Date().toISOString().slice(0, 7)
  return paidDates.some(d => d.startsWith(currentMonth))
}

/**
 * Retorna o valor efetivo de uma SaidaFixa para um dado mês (YYYY-MM).
 * Se o usuário sobrescreveu o valor para aquele mês, usa o override.
 * Caso contrário, usa o valor base (sf.amount).
 */
export function getEffectiveAmount(sf: SaidaFixa, yearMonth?: string): number {
  const ym = yearMonth ?? new Date().toISOString().slice(0, 7)
  return sf.monthlyAmountOverrides?.[ym] ?? sf.amount
}

export function getDueDayLabel(dueDay: number): string {
  const days = getDaysUntil(dueDay)
  if (days === 0) return 'Vence hoje'
  if (days === 1) return 'Vence amanhã'
  if (days <= 7) return `Vence em ${days} dias`
  return `Dia ${dueDay}`
}

// ─── Alertas ─────────────────────────────────────────────────────────────────

export function shouldAlertLowBalance(divisao: Divisao, expectedIncome: number): boolean {
  const expectedBalance = (divisao.percentage / 100) * expectedIncome
  return divisao.balance < expectedBalance * 0.5 && expectedBalance > 0
}

export function shouldRedirectReserva(divisao: Divisao): boolean {
  // RN05: Reserva atingiu R$10k → sugerir redirecionar
  return (divisao.targetAmount !== undefined) && divisao.balance >= divisao.targetAmount
}

// ─── Valores futuros (RN06) ──────────────────────────────────────────────────
// Retorna true se o valor é projetado (não confirmado)
export function isFutureValue(_date: string): boolean {
  return isFuture(_date)
}

export function formatFutureAmount(value: number): string {
  return `~\u00a0${formatCurrency(value)}`
}

// ─── Cor por contexto ────────────────────────────────────────────────────────

export const CONTEXT_COLORS = {
  lucas:  { accent: '#5B9CF6', glow: 'rgba(91,156,246,0.3)',  text: 'text-[var(--color-accent-lucas)]' },
  mirian: { accent: '#EC4899', glow: 'rgba(236,72,153,0.3)', text: 'text-[var(--color-accent-mirian)]' },
  couple: { accent: '#8B5CF6', glow: 'rgba(139,92,246,0.3)', text: 'text-[var(--color-accent-couple)]' },
} as const
