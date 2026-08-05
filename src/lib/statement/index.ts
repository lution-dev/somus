export { parseCsv } from './parseCsv'
export { parseOfx, detectStatementFormat } from './parseOfx'
export { matchTransactions } from './matchTransactions'
export type { MatchResult, MatchInput } from './matchTransactions'
export { suggestName } from './suggestName'
export { transactionHash } from './hash'

export const EXTRATO_DRAFT_KEY = 'somus:extrato-draft'
export const EXTRATO_DISMISS_PREFIX = 'somus:extrato-dismiss:'

export interface ExtratoDraft {
  yearMonth: string
  sourceFormat: 'ofx' | 'csv'
  fileName: string
  transactions: import('../../types').BankTransaction[]
}
