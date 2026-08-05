import type { BankTransaction } from '../../types'
import { transactionHash } from './hash'

function stripTags(xml: string): string {
  return xml.replace(/<[^>]+>/g, '').trim()
}

function parseOfxDate(raw: string): string | null {
  // YYYYMMDD or YYYYMMDDHHMMSS[...]
  const m = raw.trim().match(/^(\d{4})(\d{2})(\d{2})/)
  if (!m) return null
  return `${m[1]}-${m[2]}-${m[3]}`
}

function parseOfxAmount(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, '').replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/**
 * Parser OFX/OFC (SGML ou XML). Extrai STMTTRN do banco.
 */
export function parseOfx(content: string): BankTransaction[] {
  const text = content.trim()
  if (!text) return []

  // Aceita OFX1 (SGML) e OFX2 (XML)
  const blocks = text.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi)
    ?? text.match(/<STMTTRN>[\s\S]*?(?=<STMTTRN>|<\/BANKTRANLIST>|$)/gi)
  if (!blocks || blocks.length === 0) {
    throw new Error('OFX sem lançamentos (STMTTRN) reconhecíveis.')
  }

  const txs: BankTransaction[] = []

  for (const block of blocks) {
    const get = (tag: string): string => {
      // XML: <TAG>value</TAG>  ou SGML: <TAG>value
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

export function detectStatementFormat(filename: string, content: string): 'ofx' | 'csv' | null {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.ofx') || lower.endsWith('.ofc')) return 'ofx'
  if (lower.endsWith('.csv') || lower.endsWith('.txt')) {
    // OFX mislabeled as txt
    if (/OFXHEADER|<OFX|<STMTTRN/i.test(content)) return 'ofx'
    return 'csv'
  }
  if (/OFXHEADER|<OFX|<STMTTRN/i.test(content)) return 'ofx'
  if (/[;,]/.test(content.split('\n')[0] ?? '')) return 'csv'
  return null
}
