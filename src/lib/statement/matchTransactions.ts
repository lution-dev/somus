import type {
  BankTransaction,
  Entrada,
  EntradaFixa,
  SaidaFixa,
  SaidaVariavel,
  StatementLinkedEntity,
  StatementMatchStatus,
} from '../../types'
import { getEffectiveAmount, isPaidForMonth } from '../calculations'

export interface MatchResult {
  transaction: BankTransaction
  status: StatementMatchStatus
  linkedEntity?: StatementLinkedEntity
  /** quão forte foi o match (debug / UI futura) */
  confidence?: 'high' | 'medium' | 'low'
}

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function fuzzyNameMatch(a: string, b: string): boolean {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (!na || !nb) return false
  if (na === nb) return true
  if (na.includes(nb) || nb.includes(na)) return true
  const ta = new Set(na.split(' ').filter(t => t.length > 2))
  const tb = new Set(nb.split(' ').filter(t => t.length > 2))
  if (ta.size === 0 || tb.size === 0) return false
  let hit = 0
  for (const t of ta) if (tb.has(t)) hit++
  return hit / Math.min(ta.size, tb.size) >= 0.5
}

/**
 * Memos bancários genéricos (99Pay e similares) NÃO devem impedir match.
 * A inteligência principal é valor + data.
 */
export function isGenericBankMemo(description: string): boolean {
  const n = normalizeName(description)
  return /^(pix( pagamento| recebido| enviado| qr)?|ted|doc|tef|pagam(ento)?( boleto| fatura)?( celcoin)?|transferencia( propria)?|cre rcmp( direta)?( cli)?|cashback( \d+)?|pagamento|compra( com)?( cartao)?|debito automatico)$/.test(n)
    || /^(pix|ted|doc|pagam|cre rcmp|cashback)\b/.test(n)
}

function amountClose(a: number, b: number, tol = 0.5): boolean {
  return Math.abs(Math.abs(a) - Math.abs(b)) <= tol
}

function daysApart(a: string, b: string): number {
  const da = new Date(a + 'T12:00:00').getTime()
  const db = new Date(b + 'T12:00:00').getTime()
  if (!Number.isFinite(da) || !Number.isFinite(db)) return 999
  return Math.round(Math.abs(da - db) / 86_400_000)
}

const DATE_WINDOW_DAYS = 3

export interface MatchInput {
  transactions: BankTransaction[]
  yearMonth: string
  entradas: Entrada[]
  entradasFixas: EntradaFixa[]
  saidasFixas: SaidaFixa[]
  saidasVariaveis: SaidaVariavel[]
}

interface Candidate {
  entity: StatementLinkedEntity
  score: number
  /** ids extras a marcar como usados (ex: sv-fixed ↔ saidaFixa) */
  alsoUse?: Array<{ kind: 'sf' | 'sv' | 'ef' | 'e'; id: string }>
}

function scoreCandidate(opts: {
  txDate: string
  launchDate: string
  txAmount: number
  launchAmount: number
  txDesc: string
  launchName: string
}): number | null {
  const { txDate, launchDate, txAmount, launchAmount, txDesc, launchName } = opts
  if (!amountClose(txAmount, launchAmount)) return null

  const days = daysApart(txDate, launchDate)
  if (days > DATE_WINDOW_DAYS) return null

  let score = 100
  // Valor exato vale mais
  if (Math.abs(Math.abs(txAmount) - Math.abs(launchAmount)) < 0.01) score += 40
  // Data exata / proximidade
  score += Math.max(0, 30 - days * 10)

  const nameHit = fuzzyNameMatch(txDesc, launchName)
  const generic = isGenericBankMemo(txDesc)
  if (nameHit) score += 50
  else if (!generic) {
    // Memo do banco tem texto específico que não bateu com o lançamento:
    // ainda permite match por valor+data, mas com score menor
    score -= 15
  }
  // Memo genérico + valor+data = match válido (caso 99Pay)

  return score
}

function parseFixedSvId(svId: string): { sfId: string; yearMonth: string } | null {
  const m = svId.match(/^sv-fixed-(.+)-(\d{4}-\d{2})$/)
  if (!m) return null
  return { sfId: m[1], yearMonth: m[2] }
}

function parseFixedEntradaId(entradaId: string): { efId: string; yearMonth: string } | null {
  const m = entradaId.match(/^e-fixed-(.+)-(\d{4}-\d{2})$/)
  if (!m) return null
  return { efId: m[1], yearMonth: m[2] }
}

/**
 * Matching inteligente: valor + data são suficientes.
 * Nome é bônus. Memos genéricos (PIX PAGAMENTO etc.) não bloqueiam.
 * 1 lançamento ↔ 1 linha do extrato.
 */
export function matchTransactions(input: MatchInput): MatchResult[] {
  const { transactions, yearMonth, entradas, entradasFixas, saidasFixas, saidasVariaveis } = input

  const usedEntrada = new Set<string>()
  const usedEf = new Set<string>()
  const usedSf = new Set<string>()
  const usedSv = new Set<string>()

  function markUsed(c: Candidate) {
    const { kind, id } = c.entity
    if (kind === 'entrada') usedEntrada.add(id)
    if (kind === 'entradaFixa') usedEf.add(id)
    if (kind === 'saidaFixa') usedSf.add(id)
    if (kind === 'saidaVariavel') usedSv.add(id)
    for (const extra of c.alsoUse ?? []) {
      if (extra.kind === 'e') usedEntrada.add(extra.id)
      if (extra.kind === 'ef') usedEf.add(extra.id)
      if (extra.kind === 'sf') usedSf.add(extra.id)
      if (extra.kind === 'sv') usedSv.add(extra.id)
    }
  }

  return transactions.map((tx) => {
    const abs = Math.abs(tx.amount)
    const isCredit = tx.amount > 0
    const candidates: Candidate[] = []

    if (!isCredit) {
      // Saídas fixas pagas no mês
      for (const sf of saidasFixas) {
        if (usedSf.has(sf.id)) continue
        if (!isPaidForMonth(sf, yearMonth)) continue
        const paidDate = sf.payments?.[yearMonth] ?? `${yearMonth}-15`
        const eff = getEffectiveAmount(sf, yearMonth)
        const score = scoreCandidate({
          txDate: tx.date,
          launchDate: paidDate,
          txAmount: abs,
          launchAmount: eff,
          txDesc: tx.description,
          launchName: sf.name,
        })
        if (score === null) continue
        const svId = `sv-fixed-${sf.id}-${yearMonth}`
        candidates.push({
          entity: { kind: 'saidaFixa', id: sf.id, label: sf.name },
          score,
          alsoUse: usedSv.has(svId) ? undefined : [{ kind: 'sv', id: svId }],
        })
      }

      // Saídas variáveis (inclui sv-fixed de contas pagas)
      for (const sv of saidasVariaveis) {
        if (usedSv.has(sv.id)) continue
        if (sv.status === 'pending') continue
        if (!sv.date.startsWith(yearMonth)) continue
        const score = scoreCandidate({
          txDate: tx.date,
          launchDate: sv.date,
          txAmount: abs,
          launchAmount: sv.amount,
          txDesc: tx.description,
          launchName: sv.description,
        })
        if (score === null) continue

        const fixed = parseFixedSvId(sv.id)
        const alsoUse: Candidate['alsoUse'] = []
        if (fixed && !usedSf.has(fixed.sfId)) {
          alsoUse.push({ kind: 'sf', id: fixed.sfId })
        }

        candidates.push({
          entity: { kind: 'saidaVariavel', id: sv.id, label: sv.description },
          score: fixed ? score + 5 : score, // leve preferência se veio de fixa (nome real)
          alsoUse,
        })
      }
    } else {
      // Entradas fixas recebidas
      for (const ef of entradasFixas) {
        if (usedEf.has(ef.id)) continue
        const paidDate = ef.payments?.[yearMonth]
        if (!paidDate) continue
        const eff = ef.monthlyAmountOverrides?.[yearMonth] ?? ef.amount
        const score = scoreCandidate({
          txDate: tx.date,
          launchDate: paidDate,
          txAmount: abs,
          launchAmount: eff,
          txDesc: tx.description,
          launchName: ef.name,
        })
        if (score === null) continue
        const eId = `e-fixed-${ef.id}-${yearMonth}`
        candidates.push({
          entity: { kind: 'entradaFixa', id: ef.id, label: ef.name },
          score,
          alsoUse: usedEntrada.has(eId) ? undefined : [{ kind: 'e', id: eId }],
        })
      }

      // Entradas avulsas / e-fixed
      for (const e of entradas) {
        if (usedEntrada.has(e.id)) continue
        if (e.status === 'pending') continue
        if (!e.date.startsWith(yearMonth)) continue
        const score = scoreCandidate({
          txDate: tx.date,
          launchDate: e.date,
          txAmount: abs,
          launchAmount: e.amount,
          txDesc: tx.description,
          launchName: e.sourceName,
        })
        if (score === null) continue

        const fixed = parseFixedEntradaId(e.id)
        const alsoUse: Candidate['alsoUse'] = []
        if (fixed && !usedEf.has(fixed.efId)) {
          alsoUse.push({ kind: 'ef', id: fixed.efId })
        }

        candidates.push({
          entity: { kind: 'entrada', id: e.id, label: e.sourceName },
          score: fixed ? score + 5 : score,
          alsoUse,
        })
      }
    }

    if (candidates.length === 0) {
      return { transaction: tx, status: 'unmatched' as const }
    }

    candidates.sort((a, b) => b.score - a.score)
    const best = candidates[0]

    // Score mínimo: valor+data na janela (sem nome) ainda passa
    if (best.score < 80) {
      return { transaction: tx, status: 'unmatched' as const }
    }

    markUsed(best)

    const confidence: MatchResult['confidence'] =
      best.score >= 160 ? 'high' : best.score >= 120 ? 'medium' : 'low'

    return {
      transaction: tx,
      status: 'matched' as const,
      linkedEntity: best.entity,
      confidence,
    }
  })
}

/** Rendimentos automáticos miúdos → sugerir ignorar na UI */
export function shouldSuggestIgnore(tx: BankTransaction): boolean {
  const n = normalizeName(tx.description)
  if (Math.abs(tx.amount) < 10 && /cre rcmp|rendimento|juros|cashback|remuneracao/.test(n)) {
    return true
  }
  return false
}
