/** Helpers compartilhados dos parsers de extrato (PDF/CSV/OFX). */

export function parseBRNumber(raw: string): number | null {
  let s = raw.trim().replace(/R\$\s?/gi, '').replace(/\s/g, '')
  if (!s) return null

  // (1.234,56) → negativo
  const paren = s.match(/^\((.+)\)$/)
  if (paren) s = `-${paren[1]}`

  if (/^-?\d{1,3}(\.\d{3})*,\d{2}$/.test(s) || /^-?\d+,\d{2}$/.test(s)) {
    return parseFloat(s.replace(/\./g, '').replace(',', '.'))
  }
  if (/^-?\d{1,3}(,\d{3})*\.\d{2}$/.test(s)) {
    return parseFloat(s.replace(/,/g, ''))
  }
  if (/^-?\d+\.\d{2}$/.test(s) || /^-?\d+$/.test(s)) {
    return parseFloat(s)
  }
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

const MONTH_MAP: Record<string, string> = {
  jan: '01', fev: '02', feb: '02', mar: '03', abr: '04', apr: '04',
  mai: '05', may: '05', jun: '06', jul: '07', ago: '08', aug: '08',
  set: '09', sep: '09', out: '10', oct: '10', nov: '11', dez: '12', dec: '12',
}

export function parseBRDate(raw: string): string | null {
  const s = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)

  // DD/MM/YYYY | DD-MM-YYYY | DD.MM.YYYY
  const m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/)
  if (m) {
    const d = m[1].padStart(2, '0')
    const mo = m[2].padStart(2, '0')
    let y = m[3]
    if (y.length === 2) y = `20${y}`
    return `${y}-${mo}-${d}`
  }

  // "02 AGO 2026" / "02 AGO 26"
  const m2 = s.match(/^(\d{1,2})\s+([A-Za-zÀ-ú]{3})\.?\s+(\d{2,4})/i)
  if (m2) {
    const key = m2[2].normalize('NFD').replace(/\p{M}/gu, '').slice(0, 3).toLowerCase()
    const mo = MONTH_MAP[key]
    if (!mo) return null
    let y = m2[3]
    if (y.length === 2) y = `20${y}`
    return `${y}-${mo}-${m2[1].padStart(2, '0')}`
  }

  return null
}

export function normalizeSpaces(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

export const SKIP_LINE =
  /saldo(\s|$)|extrato\s*per[ií]odo|nome:|cpf|cnpj|id da conta|p[aá]gina\s+\d|id\s+tipo\s+valor|total\s+de\s+lan[cç]|ag[eê]ncia|conta\s*corrente\s*:|banco\s*:|emiss[aã]o|cliente\s*:/i

export type DetectedBank =
  | '99pay'
  | 'inter'
  | 'nubank'
  | 'itau'
  | 'santander'
  | 'generic'

export function detectBank(text: string): DetectedBank {
  const t = text.toLowerCase()
  if (/99\s*pay|99pay|celcoin/.test(t)) return '99pay'
  if (/banco\s+inter|inter\s+medium|bancointer|inter\.it/.test(t)) return 'inter'
  if (/nubank|nu\s+pagamentos|nu\s+financeir/.test(t)) return 'nubank'
  if (/ita[uú]|banco\s+ita[uú]|itau\s+unibanco/.test(t)) return 'itau'
  if (/santander|banco\s+santander/.test(t)) return 'santander'
  // 99Pay layout fingerprint even without brand name
  if (/id\s+tipo\s+valor\s+hor[aá]rio\s+descri/i.test(text)) return '99pay'
  return 'generic'
}

export function bankLabel(bank: DetectedBank): string {
  switch (bank) {
    case '99pay': return '99Pay'
    case 'inter': return 'Inter'
    case 'nubank': return 'Nubank'
    case 'itau': return 'Itaú'
    case 'santander': return 'Santander'
    default: return 'Banco'
  }
}
