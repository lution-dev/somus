export { parseCsv, parseCsvDetailed } from './parseCsv'
export { parseOfx, parseOfxDetailed, detectStatementFormat } from './parseOfx'
export { parsePdf, parsePdfDetailed } from './parsePdf'
export { parseStatementText, parseStatementTextDetailed } from './parseStatementText'
export type { StatementParseResult } from './parseStatementText'
export { matchTransactions, shouldSuggestIgnore, isGenericBankMemo } from './matchTransactions'
export type { MatchResult, MatchInput } from './matchTransactions'
export {
  buildImportItemsFromMatches,
  orderMatchesForReview,
  assertNoMatchedInImport,
} from './buildImportItems'
export type { ImportRowDraft } from './buildImportItems'
export { suggestName } from './suggestName'
export { transactionHash } from './hash'
export { detectBank, bankLabel } from './shared'
export type { DetectedBank } from './shared'

export const EXTRATO_DRAFT_KEY = 'somus:extrato-draft'
export const EXTRATO_DISMISS_PREFIX = 'somus:extrato-dismiss:'

export interface ExtratoDraft {
  yearMonth: string
  sourceFormat: 'ofx' | 'csv' | 'pdf'
  fileName: string
  sourceLabel?: string
  detectedBank?: string
  transactions: import('../../types').BankTransaction[]
}
