import type { BankTransaction, StatementImportItem } from '../../types'
import type { MatchResult } from './matchTransactions'

export interface ImportRowDraft {
  ignored?: boolean
  name?: string
  amount?: number
  date?: string
  incomeKind?: 'distributable' | 'direct'
  divisaoId?: string
}

/**
 * Monta o payload de import: APENAS unmatched.
 * Matched nunca entram → evita duplicar o que já está na base.
 */
export function buildImportItemsFromMatches(
  matches: MatchResult[],
  rows: Record<string, ImportRowDraft> = {},
): StatementImportItem[] {
  return matches
    .filter(m => m.status === 'unmatched')
    .map(m => {
      const tx = m.transaction
      const row = rows[tx.id] ?? {}
      const isIncome = tx.amount > 0
      return {
        transactionId: tx.id,
        date: row.date ?? tx.date,
        amount: row.amount ?? Math.abs(tx.amount),
        name: row.name ?? tx.description,
        direction: (isIncome ? 'income' : 'expense') as 'income' | 'expense',
        incomeKind: isIncome ? (row.incomeKind ?? 'distributable') : undefined,
        divisaoId: (!isIncome || row.incomeKind === 'direct') ? row.divisaoId : undefined,
        ignored: row.ignored ?? false,
      }
    })
}

/** Ordem de exibição: unmatched primeiro, matched no final. */
export function orderMatchesForReview(matches: MatchResult[]): {
  unmatched: MatchResult[]
  matched: MatchResult[]
} {
  return {
    unmatched: matches.filter(m => m.status === 'unmatched'),
    matched: matches.filter(m => m.status === 'matched'),
  }
}

export function assertNoMatchedInImport(
  matches: MatchResult[],
  items: StatementImportItem[],
): boolean {
  const matchedIds = new Set(
    matches.filter(m => m.status === 'matched').map(m => m.transaction.id),
  )
  return items.every(i => !matchedIds.has(i.transactionId))
}

/** helper tipado pra testes */
export type { BankTransaction }
