import type { BankTransaction } from '../../types'
import { transactionHash } from './hash'

function parseBRNumber(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, '')
  if (!s) return null
  if (/^-?\d{1,3}(\.\d{3})*,\d{2}$/.test(s) || /^-?\d+,\d{2}$/.test(s)) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.'))
  }
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function parseBRDate(raw: string): string | null {
  const m = raw.trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/)
  if (!m) return null
  const d = m[1].padStart(2, '0')
  const mo = m[2].padStart(2, '0')
  let y = m[3]
  if (y.length === 2) y = `20${y}`
  return `${y}-${mo}-${d}`
}

const SKIP_LINE = /saldo|extrato\s*per[ií]odo|nome:|cpf|cnpj|id da conta|p[aá]gina\s+\d|id\s+tipo\s+valor/i

/**
 * Layout 99Pay (e similares):
 * ID TIPO VALOR HORÁRIO DESCRIÇÃO
 * 20260805... PIX PAGAMENTO -1.450,00 05/08/2026 11:03:02 PIX PAGAMENTO
 */
const LINE_99PAY =
  /^(\d{15,})\s+(.+?)\s+(-?\d{1,3}(?:\.\d{3})*,\d{2})\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2}:\d{2})\s*(.*)$/

/**
 * Fallback genérico: data + valor BR numa linha de texto de extrato.
 * Ex: 05/08/2026  PIX PAGAMENTO  -1.450,00
 */
const LINE_GENERIC =
  /(\d{2}\/\d{2}\/\d{4}).*?(-?\d{1,3}(?:\.\d{3})*,\d{2})\b/

/**
 * Parse texto já extraído de PDF de extrato bancário.
 * Prioriza layout 99Pay; cai para heurística genérica.
 */
export function parseStatementText(text: string): BankTransaction[] {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const txs: BankTransaction[] = []
  const seen = new Set<string>()

  for (const line of lines) {
    if (SKIP_LINE.test(line)) continue

    const m99 = line.match(LINE_99PAY)
    if (m99) {
      const tipo = m99[2].trim()
      const amount = parseBRNumber(m99[3])
      const date = parseBRDate(m99[4])
      const desc = (m99[6] || tipo).trim() || tipo
      if (amount === null || amount === 0 || !date) continue
      if (/saldo/i.test(tipo) || /saldo/i.test(desc)) continue

      const id = transactionHash(date, amount, `${m99[1]}|${desc}`)
      if (seen.has(id)) continue
      seen.add(id)
      txs.push({
        id,
        date,
        amount,
        description: desc || tipo,
        rawType: amount >= 0 ? 'credit' : 'debit',
      })
      continue
    }

    // Genérico só se a linha tiver cara de lançamento (evita ruído)
    if (!/\d{2}\/\d{2}\/\d{4}/.test(line) || !/-?\d+,\d{2}/.test(line)) continue
    const mg = line.match(LINE_GENERIC)
    if (!mg) continue
    const date = parseBRDate(mg[1])
    const amount = parseBRNumber(mg[2])
    if (!date || amount === null || amount === 0) continue
    const description = line
      .replace(mg[1], '')
      .replace(mg[2], '')
      .replace(/\d{2}:\d{2}:\d{2}/g, '')
      .replace(/\d{15,}/g, '')
      .replace(/\s+/g, ' ')
      .trim() || 'Lançamento'
    if (/saldo/i.test(description)) continue

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

  return txs
}
