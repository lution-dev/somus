import type { BankTransaction } from '../../types'
import { transactionHash } from './hash'
import {
  parseBRNumber,
  parseBRDate,
  normalizeSpaces,
  SKIP_LINE,
  detectBank,
  type DetectedBank,
} from './shared'

export interface StatementParseResult {
  transactions: BankTransaction[]
  detectedBank: DetectedBank
  strategy: string
}

type LineParser = (line: string) => BankTransaction | null

/** Valor BR: 1.234,56 ou 3500,00. Evita match parcial tipo 500 dentro de 3500. */
const MONEY = String.raw`-?(?:\d{1,3}(?:\.\d{3})+|\d+),\d{2}`
const MONEY_ABS = String.raw`(?:\d{1,3}(?:\.\d{3})+|\d+),\d{2}`

function pushUnique(txs: BankTransaction[], seen: Set<string>, tx: BankTransaction) {
  if (seen.has(tx.id)) return
  seen.add(tx.id)
  txs.push(tx)
}

const parse99PayLine: LineParser = (line) => {
  const m = line.match(
    new RegExp(String.raw`^(\d{15,})\s+(.+?)\s+(${MONEY})\s+(\d{2}/\d{2}/\d{4})\s+(\d{2}:\d{2}:\d{2})\s*(.*)$`),
  )
  if (!m) return null
  const tipo = m[2].trim()
  const amount = parseBRNumber(m[3])
  const date = parseBRDate(m[4])
  const desc = (m[6] || tipo).trim() || tipo
  if (amount === null || amount === 0 || !date) return null
  if (/saldo/i.test(tipo) || /saldo/i.test(desc)) return null
  return {
    id: transactionHash(date, amount, `${m[1]}|${desc}`),
    date,
    amount,
    description: desc || tipo,
    rawType: amount >= 0 ? 'credit' : 'debit',
  }
}

const parseDateDescAmountLine: LineParser = (line) => {
  const m = line.match(
    new RegExp(
      String.raw`^(\d{2}/\d{2}/\d{2,4})\s+(.+?)\s+(R\$\s*)?(${MONEY})(?:\s+(R\$\s*)?(${MONEY}))?\s*$`,
      'i',
    ),
  )
  if (!m) return null
  const date = parseBRDate(m[1])
  if (!date) return null
  const amount = parseBRNumber(m[4])
  if (amount === null || amount === 0) return null

  let description = normalizeSpaces(m[2]).replace(/^[-–—]\s*/, '').trim()
  if (!description || /saldo/i.test(description)) return null

  return {
    id: transactionHash(date, amount, description),
    date,
    amount,
    description,
    rawType: amount >= 0 ? 'credit' : 'debit',
  }
}

const parseDateDescAmountCD: LineParser = (line) => {
  const m = line.match(
    new RegExp(
      String.raw`^(\d{2}/\d{2}/\d{2,4})\s+(.+?)\s+(R\$\s*)?(${MONEY_ABS})\s+([CD])\s*$`,
      'i',
    ),
  )
  if (!m) return null
  const date = parseBRDate(m[1])
  const abs = parseBRNumber(m[4])
  if (!date || abs === null || abs === 0) return null
  const amount = m[5].toUpperCase() === 'D' ? -Math.abs(abs) : Math.abs(abs)
  const description = normalizeSpaces(m[2])
  if (!description || /saldo/i.test(description)) return null
  return {
    id: transactionHash(date, amount, description),
    date,
    amount,
    description,
    rawType: amount >= 0 ? 'credit' : 'debit',
  }
}

const parseNubankishLine: LineParser = (line) => {
  const m = line.match(
    new RegExp(
      String.raw`^(\d{1,2}\s+[A-Za-zÀ-ú]{3}\.?\s+\d{2,4})\s+(.+?)\s+-?\s*R\$\s*(${MONEY})\s*$`,
      'i',
    ),
  )
  if (!m) return null
  const date = parseBRDate(m[1])
  const hadMinus = /-\s*R\$/i.test(line) || /R\$\s*-/.test(line)
  let amount = parseBRNumber(m[3])
  if (amount === null || amount === 0 || !date) return null
  if (hadMinus && amount > 0) amount = -amount
  const description = normalizeSpaces(m[2])
  if (!description || /saldo/i.test(description)) return null
  return {
    id: transactionHash(date, amount, description),
    date,
    amount,
    description,
    rawType: amount >= 0 ? 'credit' : 'debit',
  }
}

const parseGenericLine: LineParser = (line) => {
  if (!/\d{2}\/\d{2}\/\d{2,4}/.test(line) || !/\d+,\d{2}/.test(line)) return null

  const dateMatch = line.match(/(\d{2}\/\d{2}\/\d{2,4})/)
  if (!dateMatch) return null
  const date = parseBRDate(dateMatch[1])
  if (!date) return null

  const moneyRe = new RegExp(MONEY, 'g')
  const moneys = line.match(moneyRe) ?? []
  if (moneys.length === 0) return null

  const amountStr = moneys.find(v => v.startsWith('-')) ?? moneys[0]
  if (!amountStr) return null
  const amount = parseBRNumber(amountStr)
  if (amount === null || amount === 0) return null

  let description = line
    .replace(dateMatch[1], '')
    .replace(/\d{2}:\d{2}:\d{2}/g, '')
    .replace(/\d{15,}/g, '')
    .replace(moneyRe, '')
    .replace(/R\$/gi, '')
    .replace(/\b[CD]\b/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'Lançamento'
  if (/saldo/i.test(description)) return null

  return {
    id: transactionHash(date, amount, description),
    date,
    amount,
    description,
    rawType: amount >= 0 ? 'credit' : 'debit',
  }
}

function runParser(lines: string[], parser: LineParser): BankTransaction[] {
  const txs: BankTransaction[] = []
  const seen = new Set<string>()
  for (const line of lines) {
    if (SKIP_LINE.test(line)) continue
    const tx = parser(line)
    if (tx) pushUnique(txs, seen, tx)
  }
  return txs
}

function strategiesFor(bank: DetectedBank): Array<{ name: string; parser: LineParser }> {
  const all = [
    { name: '99pay', parser: parse99PayLine },
    { name: 'date-desc-amount', parser: parseDateDescAmountLine },
    { name: 'date-desc-cd', parser: parseDateDescAmountCD },
    { name: 'nubankish', parser: parseNubankishLine },
    { name: 'generic', parser: parseGenericLine },
  ]

  const preferred: Record<DetectedBank, string[]> = {
    '99pay': ['99pay', 'generic'],
    inter: ['date-desc-amount', 'date-desc-cd', 'generic'],
    nubank: ['nubankish', 'date-desc-amount', 'generic'],
    itau: ['date-desc-cd', 'date-desc-amount', 'generic'],
    santander: ['date-desc-amount', 'date-desc-cd', 'generic'],
    generic: ['99pay', 'date-desc-amount', 'date-desc-cd', 'nubankish', 'generic'],
  }

  return preferred[bank]
    .map(name => all.find(s => s.name === name)!)
    .filter(Boolean)
}

export function parseStatementText(text: string): BankTransaction[] {
  return parseStatementTextDetailed(text).transactions
}

export function parseStatementTextDetailed(text: string): StatementParseResult {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map(l => normalizeSpaces(l))
    .filter(Boolean)

  const detectedBank = detectBank(text)
  let best: StatementParseResult = {
    transactions: [],
    detectedBank,
    strategy: 'none',
  }

  const tryAll = [
    ...strategiesFor(detectedBank),
    { name: '99pay', parser: parse99PayLine },
    { name: 'date-desc-amount', parser: parseDateDescAmountLine },
    { name: 'date-desc-cd', parser: parseDateDescAmountCD },
    { name: 'nubankish', parser: parseNubankishLine },
    { name: 'generic', parser: parseGenericLine },
  ]

  const seenStrategies = new Set<string>()
  for (const s of tryAll) {
    if (seenStrategies.has(s.name)) continue
    seenStrategies.add(s.name)
    const txs = runParser(lines, s.parser)
    if (txs.length > best.transactions.length) {
      best = { transactions: txs, detectedBank, strategy: s.name }
    }
  }

  return best
}
