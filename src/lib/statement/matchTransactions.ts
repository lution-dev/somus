import type {
  BankTransaction,
  Entrada,
  EntradaFixa,
  SaidaFixa,
  SaidaVariavel,
  StatementLinkedEntity,
  StatementMatchStatus,
} from '../../types'
import { getEffectiveAmount, isPaidForMonth } from '../calculations'

export interface MatchResult {
  transaction: BankTransaction
  status: StatementMatchStatus
  linkedEntity?: StatementLinkedEntity
}

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function fuzzyNameMatch(a: string, b: string): boolean {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (!na || !nb) return false
  if (na === nb) return true
  if (na.includes(nb) || nb.includes(na)) return true
  // token overlap
  const ta = new Set(na.split(' ').filter(t => t.length > 2))
  const tb = new Set(nb.split(' ').filter(t => t.length > 2))
  if (ta.size === 0 || tb.size === 0) return false
  let hit = 0
  for (const t of ta) if (tb.has(t)) hit++
  return hit / Math.min(ta.size, tb.size) >= 0.5
}

function amountClose(a: number, b: number, tol = 0.5): boolean {
  return Math.abs(Math.abs(a) - Math.abs(b)) <= tol
}

function dateClose(a: string, b: string, days = 2): boolean {
  const da = new Date(a + 'T12:00:00').getTime()
  const db = new Date(b + 'T12:00:00').getTime()
  if (!Number.isFinite(da) || !Number.isFinite(db)) return false
  return Math.abs(da - db) <= days * 86_400_000
}

export interface MatchInput {
  transactions: BankTransaction[]
  yearMonth: string
  entradas: Entrada[]
  entradasFixas: EntradaFixa[]
  saidasFixas: SaidaFixa[]
  saidasVariaveis: SaidaVariavel[]
}

/**
 * Matching puro: primeira vitória. Não muta estado.
 */
export function matchTransactions(input: MatchInput): MatchResult[] {
  const { transactions, yearMonth, entradas, entradasFixas, saidasFixas, saidasVariaveis } = input

  const usedEntrada = new Set<string>()
  const usedEf = new Set<string>()
  const usedSf = new Set<string>()
  const usedSv = new Set<string>()

  return transactions.map((tx) => {
    const abs = Math.abs(tx.amount)
    const isCredit = tx.amount > 0

    if (!isCredit) {
      // 1. Saída fixa paga no mês
      for (const sf of saidasFixas) {
        if (usedSf.has(sf.id)) continue
        if (!isPaidForMonth(sf, yearMonth)) continue
        const eff = getEffectiveAmount(sf, yearMonth)
        if (!amountClose(abs, eff)) continue
        if (!fuzzyNameMatch(tx.description, sf.name)) continue
        usedSf.add(sf.id)
        return {
          transaction: tx,
          status: 'matched' as const,
          linkedEntity: { kind: 'saidaFixa', id: sf.id, label: sf.name },
        }
      }

      // 4. Saída variável
      for (const sv of saidasVariaveis) {
        if (usedSv.has(sv.id)) continue
        if (sv.status === 'pending') continue
        if (!sv.date.startsWith(yearMonth)) continue
        if (!amountClose(abs, sv.amount)) continue
        if (!dateClose(tx.date, sv.date)) continue
        if (!fuzzyNameMatch(tx.description, sv.description)) continue
        usedSv.add(sv.id)
        return {
          transaction: tx,
          status: 'matched' as const,
          linkedEntity: { kind: 'saidaVariavel', id: sv.id, label: sv.description },
        }
      }
    } else {
      // 2. Entrada fixa recebida
      for (const ef of entradasFixas) {
        if (usedEf.has(ef.id)) continue
        const paidDate = ef.payments?.[yearMonth]
        if (!paidDate) continue
        const eff = ef.monthlyAmountOverrides?.[yearMonth] ?? ef.amount
        if (!amountClose(abs, eff)) continue
        if (!fuzzyNameMatch(tx.description, ef.name)) continue
        usedEf.add(ef.id)
        return {
          transaction: tx,
          status: 'matched' as const,
          linkedEntity: { kind: 'entradaFixa', id: ef.id, label: ef.name },
        }
      }

      // 3. Entrada avulsa
      for (const e of entradas) {
        if (usedEntrada.has(e.id)) continue
        if (e.status === 'pending') continue
        if (!e.date.startsWith(yearMonth)) continue
        if (!amountClose(abs, e.amount)) continue
        if (!dateClose(tx.date, e.date)) continue
        if (!fuzzyNameMatch(tx.description, e.sourceName)) continue
        usedEntrada.add(e.id)
        return {
          transaction: tx,
          status: 'matched' as const,
          linkedEntity: { kind: 'entrada', id: e.id, label: e.sourceName },
        }
      }
    }

    return { transaction: tx, status: 'unmatched' as const }
  })
}
