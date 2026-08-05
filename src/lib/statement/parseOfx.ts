import type { BankTransaction } from '../../types'
import { transactionHash } from './hash'
import { detectBank, type DetectedBank } from './shared'

function stripTags(xml: string): string {
  return xml.replace(/<[^>]+>/g, '').trim()
}

function parseOfxDate(raw: string): string | null {
  const m = raw.trim().match(/^(\d{4})(\d{2})(\d{2})/)
  if (!m) return null
  return `${m[1]}-${m[2]}-${m[3]}`
}

function parseOfxAmount(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, '').replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export interface OfxParseResult {
  transactions: BankTransaction[]
  detectedBank: DetectedBank
  orgLabel?: string
}

/**
 * Parser OFX/OFC (SGML ou XML). Formato padrão entre bancos BR
 * (Inter, Itaú, Santander, Nubank quando disponível, etc.).
 */
export function parseOfx(content: string): BankTransaction[] {
  return parseOfxDetailed(content).transactions
}

export function parseOfxDetailed(content: string): OfxParseResult {
  const text = content.trim()
  const detectedBank = detectBank(text)
  if (!text) return { transactions: [], detectedBank }

  const org =
    text.match(/<ORG>([^<\n]+)/i)?.[1]?.trim() ||
    text.match(/<FI>\s*<ORG>([^<\n]+)/i)?.[1]?.trim() ||
    text.match(/<BANKID>([^<\n]+)/i)?.[1]?.trim()

  const blocks = text.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi)
    ?? text.match(/<STMTTRN>[\s\S]*?(?=<STMTTRN>|<\/BANKTRANLIST>|$)/gi)
  if (!blocks || blocks.length === 0) {
    throw new Error('OFX sem lançamentos (STMTTRN) reconhecíveis.')
  }

  const txs: BankTransaction[] = []
  const seen = new Set<string>()

  for (const block of blocks) {
    const get = (tag: string): string => {
      const xml = block.match(new RegExp(`<${tag}>([^<]*)`, 'i'))
      return xml ? xml[1].trim() : ''
    }

    const dateRaw = get('DTPOSTED') || get('DTUSER') || get('DTAVAIL')
    const date = parseOfxDate(dateRaw)
    if (!date) continue

    const amount = parseOfxAmount(get('TRNAMT'))
    if (amount === null || amount === 0) continue

    const description =
      get('MEMO') || get('NAME') || get('PAYEE') || stripTags(get('TRNTYPE')) || 'Lançamento'

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

  return { transactions: txs, detectedBank, orgLabel: org }
}

export function detectStatementFormat(filename: string, content: string): 'ofx' | 'csv' | 'pdf' | null {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.ofx') || lower.endsWith('.ofc')) return 'ofx'
  if (lower.endsWith('.csv') || lower.endsWith('.txt')) {
    if (/OFXHEADER|<OFX|<STMTTRN/i.test(content)) return 'ofx'
    return 'csv'
  }
  if (/OFXHEADER|<OFX|<STMTTRN/i.test(content)) return 'ofx'
  if (/[;,]/.test(content.split('\n')[0] ?? '')) return 'csv'
  return null
}
