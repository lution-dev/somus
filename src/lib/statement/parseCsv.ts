import type { BankTransaction } from '../../types'
import { transactionHash } from './hash'

function parseBRNumber(raw: string): number | null {
  const s = raw.trim().replace(/R\$\s?/gi, '').replace(/\s/g, '')
  if (!s) return null
  // 1.234,56 ou -1.234,56
  if (/^-?\d{1,3}(\.\d{3})*,\d{2}$/.test(s) || /^-?\d+,\d{2}$/.test(s)) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.'))
  }
  // 1234.56
  if (/^-?\d+\.\d{2}$/.test(s) || /^-?\d+$/.test(s)) {
    return parseFloat(s)
  }
  // 1,234.56 (US)
  if (/^-?\d{1,3}(,\d{3})*\.\d{2}$/.test(s)) {
    return parseFloat(s.replace(/,/g, ''))
  }
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function parseBRDate(raw: string): string | null {
  const s = raw.trim()
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  // DD/MM/YYYY or DD-MM-YYYY
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/)
  if (!m) return null
  const d = m[1].padStart(2, '0')
  const mo = m[2].padStart(2, '0')
  let y = m[3]
  if (y.length === 2) y = `20${y}`
  return `${y}-${mo}-${d}`
}

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

function scoreHeader(cells: string[]): { dateIdx: number; amountIdx: number; descIdx: number; debitIdx: number; creditIdx: number } {
  const lower = cells.map(c => c.toLowerCase().normalize('NFD').replace(/\p{M}/gu, ''))
  const find = (...keys: string[]) => lower.findIndex(c => keys.some(k => c.includes(k)))

  const dateIdx = find('data', 'date', 'dt')
  const amountIdx = find('valor', 'amount', 'montante', 'vlr')
  const descIdx = find('descricao', 'descri', 'historico', 'histórico', 'memo', 'lancamento', 'lançamento', 'nome', 'estabelecimento')
  const debitIdx = find('debito', 'débito', 'saida', 'saída')
  const creditIdx = find('credito', 'crédito', 'entrada')

  return { dateIdx, amountIdx, descIdx, debitIdx, creditIdx }
}

/**
 * Parser CSV genérico (pt-BR). Funciona com ; , ou tab.
 * Sem amostra do banco piloto ainda: heurística de colunas.
 */
export function parseCsv(content: string): BankTransaction[] {
  const text = content.replace(/^\uFEFF/, '').trim()
  if (!text) return []

  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length < 2) return []

  const delim = detectDelimiter(lines[0])
  const header = splitLine(lines[0], delim)
  const { dateIdx, amountIdx, descIdx, debitIdx, creditIdx } = scoreHeader(header)

  const hasSplitAmount = debitIdx >= 0 && creditIdx >= 0
  if (dateIdx < 0 || descIdx < 0 || (amountIdx < 0 && !hasSplitAmount)) {
    throw new Error('CSV sem colunas de data, valor ou descrição reconhecíveis.')
  }

  const txs: BankTransaction[] = []

  for (let i = 1; i < lines.length; i++) {
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
    }
    if (amount === null || amount === 0) continue

    const description = (cells[descIdx] ?? '').trim() || 'Lançamento'
    const id = transactionHash(date, amount, description)
    txs.push({
      id,
      date,
      amount,
      description,
      rawType: amount >= 0 ? 'credit' : 'debit',
    })
  }

  return txs
}
