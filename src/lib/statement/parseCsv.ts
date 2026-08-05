import type { BankTransaction } from '../../types'
import { transactionHash } from './hash'
import { parseBRNumber, parseBRDate, detectBank, type DetectedBank } from './shared'

function detectDelimiter(headerLine: string): string {
  const semis = (headerLine.match(/;/g) || []).length
  const commas = (headerLine.match(/,/g) || []).length
  const tabs = (headerLine.match(/\t/g) || []).length
  if (tabs >= semis && tabs >= commas && tabs > 0) return '\t'
  if (semis >= commas) return ';'
  return ','
}

function splitLine(line: string, delim: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (ch === delim && !inQuotes) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur.trim())
  return out
}

function normHeader(c: string): string {
  return c.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
}

/**
 * Aliases de colunas usados por Inter, Nubank, Itaú, Santander, Conta Azul, etc.
 */
function scoreHeader(cells: string[]): {
  dateIdx: number
  amountIdx: number
  descIdx: number
  debitIdx: number
  creditIdx: number
  typeIdx: number
} {
  const lower = cells.map(normHeader)
  const find = (...keys: string[]) =>
    lower.findIndex(c => keys.some(k => c === k || c.includes(k)))

  const dateIdx = find(
    'data lancamento', 'data da transacao', 'data transacao', 'data',
    'date', 'dt lancamento', 'dt.', 'dt ',
  )
  const amountIdx = find(
    'valor (r$)', 'valor r$', 'valor', 'amount', 'montante', 'vlr', 'quantia',
  )
  const descIdx = find(
    'descricao', 'descri', 'historico', 'titulo', 'titulo da transacao',
    'memo', 'lancamento', 'nome', 'estabelecimento', 'detalhe', 'favorecido',
    'identificador', 'origem/destino', 'categoria',
  )
  const debitIdx = find('debito', 'saida', 'valor debito')
  const creditIdx = find('credito', 'entrada', 'valor credito')
  const typeIdx = find('tipo', 'natureza', 'c/d', 'cd', 'entrada/saida')

  return { dateIdx, amountIdx, descIdx, debitIdx, creditIdx, typeIdx }
}

export interface CsvParseResult {
  transactions: BankTransaction[]
  detectedBank: DetectedBank
}

/**
 * Parser CSV multi-banco (pt-BR). ; , ou tab.
 * Cobre exports típicos de Inter, Nubank, Itaú, Santander e planilhas genéricas.
 */
export function parseCsv(content: string): BankTransaction[] {
  return parseCsvDetailed(content).transactions
}

export function parseCsvDetailed(content: string): CsvParseResult {
  const text = content.replace(/^\uFEFF/, '').trim()
  const detectedBank = detectBank(text)
  if (!text) return { transactions: [], detectedBank }

  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length < 2) {
    throw new Error('CSV sem linhas de lançamento. Confira se o arquivo está completo.')
  }

  // Alguns exports têm linhas de cabeçalho antes da tabela (Inter/Itaú)
  let headerIdx = 0
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const cells = splitLine(lines[i], detectDelimiter(lines[i]))
    const score = scoreHeader(cells)
    const hits =
      (score.dateIdx >= 0 ? 1 : 0) +
      (score.descIdx >= 0 ? 1 : 0) +
      (score.amountIdx >= 0 || (score.debitIdx >= 0 && score.creditIdx >= 0) ? 1 : 0)
    if (hits >= 2) {
      headerIdx = i
      break
    }
  }

  const delim = detectDelimiter(lines[headerIdx])
  const header = splitLine(lines[headerIdx], delim)
  const { dateIdx, amountIdx, descIdx, debitIdx, creditIdx, typeIdx } = scoreHeader(header)

  const hasSplitAmount = debitIdx >= 0 && creditIdx >= 0
  if (dateIdx < 0 || (amountIdx < 0 && !hasSplitAmount)) {
    throw new Error('CSV sem colunas de data ou valor reconhecíveis. Use um export do banco com essas colunas.')
  }
  // descrição pode faltar: usa outra coluna ou "Lançamento"
  const effectiveDescIdx = descIdx >= 0 ? descIdx : header.findIndex((_, i) => i !== dateIdx && i !== amountIdx)

  const txs: BankTransaction[] = []
  const seen = new Set<string>()

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cells = splitLine(lines[i], delim)
    const date = parseBRDate(cells[dateIdx] ?? '')
    if (!date) continue

    let amount: number | null = null
    if (hasSplitAmount) {
      const debit = parseBRNumber(cells[debitIdx] ?? '')
      const credit = parseBRNumber(cells[creditIdx] ?? '')
      if (credit && credit !== 0) amount = Math.abs(credit)
      else if (debit && debit !== 0) amount = -Math.abs(debit)
    } else {
      amount = parseBRNumber(cells[amountIdx] ?? '')
      if (amount !== null && typeIdx >= 0) {
        const t = (cells[typeIdx] ?? '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{M}/gu, '')
          .trim()
        if (/^(d|debito|saida|despesa|-)$/i.test(t) && amount > 0) amount = -amount
        if (/^(c|credito|entrada|receita|\+)$/i.test(t) && amount < 0) amount = Math.abs(amount)
      }
    }
    if (amount === null || amount === 0) continue

    const description =
      (effectiveDescIdx >= 0 ? cells[effectiveDescIdx] : '')?.trim() || 'Lançamento'
    if (/^saldo/i.test(description)) continue

    const id = transactionHash(date, amount, description)
    if (seen.has(id)) continue
    seen.add(id)
    txs.push({
      id,
      date,
      amount,
      description,
      rawType: amount >= 0 ? 'credit' : 'debit',
    })
  }

  if (txs.length === 0) {
    throw new Error('CSV lido, mas sem lançamentos reconhecíveis. Confira o formato do export.')
  }

  return { transactions: txs, detectedBank }
}
