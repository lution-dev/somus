/**
 * E2E das regras de negócio do S-EXTRATO (conciliação mensal).
 *
 * Regras do usuário que ESTES testes travam:
 * 1. Extrato em PDF/OFX/CSV é lido
 * 2. Já lançado (mesmo valor + data) → "matched" mesmo com memo genérico (PIX PAGAMENTO)
 * 3. Não lançado → unmatched (pra mini-form)
 * 4. Entrada unmatched: pode ser renda OU divisão (coberto no contrato do import)
 * 5. Saída unmatched: vai pra divisão via import
 * 6. Data do lançamento importado vem do extrato
 * 7. 1 linha do extrato ↔ 1 lançamento (sem duplicar)
 * 8. Rendimento miúdo sugere ignorar
 * 9. Multi-banco (fixtures Inter/Itaú/Nubank/Santander/99Pay)
 *
 * Obrigatório rodar após qualquer mudança em src/lib/statement ou Extrato*.
 */
import { readFileSync } from 'node:fs'
import { describe, it, expect, beforeEach } from 'vitest'
import { parseStatementTextDetailed } from './parseStatementText'
import { parseCsvDetailed } from './parseCsv'
import { parseOfxDetailed } from './parseOfx'
import {
  matchTransactions,
  shouldSuggestIgnore,
  isGenericBankMemo,
} from './matchTransactions'
import { useAppStore } from '../../stores/useAppStore'
import type { BankTransaction, Entrada, SaidaFixa, SaidaVariavel, StatementImportItem } from '../../types'

const FIX = (name: string) =>
  readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')

function julyLaunchesFromStatement(txs: BankTransaction[]) {
  /** Simula: usuário lançou o mês inteiro com os MESMOS valores/datas, nomes reais. */
  const july = txs.filter(t => t.date.startsWith('2026-07') && Math.abs(t.amount) >= 10)
  const entradas: Entrada[] = []
  const saidasVariaveis: SaidaVariavel[] = []
  const saidasFixas: SaidaFixa[] = []

  for (const tx of july) {
    if (tx.amount > 0) {
      entradas.push({
        id: `e-sim-${tx.id}`,
        userId: 'u1',
        sourceId: '',
        sourceName: `Recebimento ${Math.abs(tx.amount)}`,
        amount: tx.amount,
        date: tx.date,
        distribution: [],
        status: 'realized',
        kind: 'distributable',
      })
    } else {
      saidasVariaveis.push({
        id: `sv-sim-${tx.id}`,
        userId: 'u1',
        divisaoId: 'cx-essencial',
        amount: Math.abs(tx.amount),
        description: `Gasto ${Math.abs(tx.amount)}`,
        category: 'teste',
        paymentMethod: 'pix',
        date: tx.date,
        status: 'realized',
      })
    }
  }

  return { entradas, saidasVariaveis, saidasFixas, july }
}

describe('S-EXTRATO E2E — regras do produto', () => {
  describe('RN: parsers multi-formato / multi-banco', () => {
    it('lê PDF-texto 99Pay (fixture) e extrai lançamentos de julho', () => {
      const r = parseStatementTextDetailed(FIX('sample-99pay.txt'))
      expect(r.detectedBank).toBe('99pay')
      const july = r.transactions.filter(t => t.date.startsWith('2026-07'))
      expect(july.length).toBeGreaterThan(40)
      expect(july.some(t => t.description === 'PIX PAGAMENTO')).toBe(true)
      expect(july.some(t => t.description === 'PIX RECEBIDO')).toBe(true)
    })

    it('lê layout Inter (texto)', () => {
      const r = parseStatementTextDetailed(FIX('sample-inter.txt'))
      expect(r.detectedBank).toBe('inter')
      expect(r.transactions.length).toBe(6)
      expect(r.transactions.find(t => t.amount === 3500)?.date).toBe('2026-07-01')
    })

    it('lê layout Itaú C/D', () => {
      const r = parseStatementTextDetailed(FIX('sample-itau.txt'))
      expect(r.detectedBank).toBe('itau')
      expect(r.transactions.map(t => t.amount)).toEqual([-20, 3000, -175, -50, 1.25])
    })

    it('lê layout Nubank', () => {
      const r = parseStatementTextDetailed(FIX('sample-nubank.txt'))
      expect(r.detectedBank).toBe('nubank')
      expect(r.transactions.length).toBe(5)
    })

    it('lê CSV Inter com Débito/Crédito', () => {
      const r = parseCsvDetailed(FIX('sample-inter.csv'))
      expect(r.transactions.map(t => t.amount)).toEqual([3500, -601, -187.45, 420, -175])
    })

    it('lê OFX Santander', () => {
      const r = parseOfxDetailed(FIX('sample-santander.ofx'))
      expect(r.orgLabel).toMatch(/Santander/i)
      expect(r.transactions.map(t => t.amount)).toEqual([2800, -601, -175])
    })
  })

  describe('RN: matching valor+data (memo genérico NÃO bloqueia)', () => {
    it('PIX PAGAMENTO casa com lançamento de nome diferente (Aluguel)', () => {
      const result = matchTransactions({
        yearMonth: '2026-07',
        transactions: [
          { id: 'tx1', date: '2026-07-20', amount: -601, description: 'PIX PAGAMENTO' },
        ],
        entradas: [],
        entradasFixas: [],
        saidasFixas: [{
          id: 'sf-aluguel',
          userId: 'u1',
          name: 'Aluguel',
          amount: 601,
          dueDay: 20,
          paymentMethod: 'pix',
          divisaoId: 'cx-essencial',
          autoDebit: false,
          payments: { '2026-07': '2026-07-20' },
          category: 'moradia',
        }],
        saidasVariaveis: [],
      })
      expect(result[0].status).toBe('matched')
      expect(result[0].linkedEntity?.label).toBe('Aluguel')
      expect(isGenericBankMemo('PIX PAGAMENTO')).toBe(true)
    })

    it('PIX RECEBIDO casa com salário já lançado', () => {
      const result = matchTransactions({
        yearMonth: '2026-07',
        transactions: [
          { id: 'tx1', date: '2026-07-03', amount: 3052.99, description: 'PIX RECEBIDO' },
        ],
        entradas: [{
          id: 'e1',
          userId: 'u1',
          sourceId: '',
          sourceName: 'Salário Lidtek',
          amount: 3052.99,
          date: '2026-07-03',
          distribution: [],
          status: 'realized',
        }],
        entradasFixas: [],
        saidasFixas: [],
        saidasVariaveis: [],
      })
      expect(result[0].status).toBe('matched')
      expect(result[0].linkedEntity?.label).toBe('Salário Lidtek')
    })

    it('1↔1: dois PIX iguais de -20 casam com dois lançamentos distintos', () => {
      const result = matchTransactions({
        yearMonth: '2026-07',
        transactions: [
          { id: 'a', date: '2026-07-10', amount: -20, description: 'PIX PAGAMENTO' },
          { id: 'b', date: '2026-07-29', amount: -20, description: 'PIX PAGAMENTO' },
        ],
        entradas: [],
        entradasFixas: [],
        saidasFixas: [],
        saidasVariaveis: [
          { id: 'sv1', userId: 'u1', divisaoId: 'cx-essencial', amount: 20, description: 'Padaria', category: 'x', paymentMethod: 'pix', date: '2026-07-10', status: 'realized' },
          { id: 'sv2', userId: 'u1', divisaoId: 'cx-essencial', amount: 20, description: 'Café', category: 'x', paymentMethod: 'pix', date: '2026-07-29', status: 'realized' },
        ],
      })
      expect(result.every(r => r.status === 'matched')).toBe(true)
      const labels = result.map(r => r.linkedEntity?.label).sort()
      expect(labels).toEqual(['Café', 'Padaria'])
    })

    it('não rematch o mesmo lançamento em duas linhas', () => {
      const result = matchTransactions({
        yearMonth: '2026-07',
        transactions: [
          { id: 'a', date: '2026-07-20', amount: -601, description: 'PIX PAGAMENTO' },
          { id: 'b', date: '2026-07-21', amount: -601, description: 'PIX PAGAMENTO' },
        ],
        entradas: [],
        entradasFixas: [],
        saidasFixas: [],
        saidasVariaveis: [
          { id: 'sv1', userId: 'u1', divisaoId: 'cx-essencial', amount: 601, description: 'Aluguel', category: 'x', paymentMethod: 'pix', date: '2026-07-20', status: 'realized' },
        ],
      })
      const matched = result.filter(r => r.status === 'matched')
      const unmatched = result.filter(r => r.status === 'unmatched')
      expect(matched).toHaveLength(1)
      expect(unmatched).toHaveLength(1)
    })
  })

  describe('RN: mês quase todo lançado (cenário real do usuário)', () => {
    it('99Pay julho: se tudo ≥R$10 foi lançado, quase tudo fica matched', () => {
      const parsed = parseStatementTextDetailed(FIX('sample-99pay.txt'))
      const { entradas, saidasVariaveis, saidasFixas, july } = julyLaunchesFromStatement(parsed.transactions)

      const material = july.filter(t => Math.abs(t.amount) >= 10)
      const results = matchTransactions({
        yearMonth: '2026-07',
        transactions: material,
        entradas,
        entradasFixas: [],
        saidasFixas,
        saidasVariaveis,
      })

      const matched = results.filter(r => r.status === 'matched')
      const unmatched = results.filter(r => r.status === 'unmatched')

      // Regra: o que já foi lançado com mesmo valor+data TEM que aparecer matched
      expect(matched.length).toBe(material.length)
      expect(unmatched.length).toBe(0)

      // Labels são os nomes do Somus (não o memo do banco)
      expect(matched.every(m => m.linkedEntity?.label && !isGenericBankMemo(m.linkedEntity.label))).toBe(true)
    })

    it('rendimentos miúdos sugerem ignorar', () => {
      expect(shouldSuggestIgnore({
        id: 'x', date: '2026-07-28', amount: 0.91, description: 'CRE RCMP DIRETA CLI',
      })).toBe(true)
      expect(shouldSuggestIgnore({
        id: 'y', date: '2026-07-20', amount: -601, description: 'PIX PAGAMENTO',
      })).toBe(false)
    })
  })

  describe('RN: import grava com data do extrato (store)', () => {
    beforeEach(() => {
      useAppStore.setState({
        isOnboarded: true,
        currentUser: { id: 'u1', name: 'Test', email: 't@t.com' },
        partner: null,
        viewContext: 'personal',
        incomeSources: [],
        entradas: [],
        entradasFixas: [],
        divisoes: [
          { id: 'cx-dizimo', userId: 'u1', name: 'Dízimo', emoji: '', percentage: 10, balance: 0, color: '#fff', isDefault: true, order: 0, movements: [] },
          { id: 'cx-essencial', userId: 'u1', name: 'Essencial', emoji: '', percentage: 55, balance: 1000, color: '#fff', isDefault: true, order: 1, movements: [] },
          { id: 'cx-objetivos', userId: 'u1', name: 'Objetivos', emoji: '', percentage: 20, balance: 0, color: '#fff', isDefault: true, order: 2, movements: [] },
          { id: 'cx-reserva', userId: 'u1', name: 'Liberdade', emoji: '', percentage: 10, balance: 0, color: '#fff', isDefault: true, order: 3, movements: [] },
          { id: 'cx-educacao', userId: 'u1', name: 'Educação', emoji: '', percentage: 5, balance: 0, color: '#fff', isDefault: true, order: 4, movements: [] },
        ],
        saidasFixas: [],
        saidasVariaveis: [],
        objetivos: [],
        statementReconciliations: [],
      })
    })

    it('saída unmatched importa com data do extrato na divisão escolhida', () => {
      const items: StatementImportItem[] = [{
        transactionId: 'tx1',
        date: '2026-07-18',
        amount: 362.38,
        name: 'Mercado',
        direction: 'expense',
        divisaoId: 'cx-essencial',
      }]
      useAppStore.getState().importStatementTransactions(items)
      const sv = useAppStore.getState().saidasVariaveis
      expect(sv).toHaveLength(1)
      expect(sv[0].date).toBe('2026-07-18')
      expect(sv[0].amount).toBe(362.38)
      expect(sv[0].description).toBe('Mercado')
      expect(sv[0].divisaoId).toBe('cx-essencial')
    })

    it('entrada unmatched como renda distribui nas divisões', () => {
      const items: StatementImportItem[] = [{
        transactionId: 'tx2',
        date: '2026-07-03',
        amount: 3000,
        name: 'Salário',
        direction: 'income',
        incomeKind: 'distributable',
      }]
      useAppStore.getState().importStatementTransactions(items)
      const entradas = useAppStore.getState().entradas
      expect(entradas).toHaveLength(1)
      expect(entradas[0].date).toBe('2026-07-03')
      expect(entradas[0].kind).toBe('distributable')
      expect(entradas[0].distribution.length).toBeGreaterThan(1)
      // Dízimo primeiro (RN08)
      expect(entradas[0].distribution[0].divisaoName.toLowerCase()).toContain('dízimo')
    })

    it('entrada unmatched direta vai só pra uma divisão', () => {
      useAppStore.getState().importStatementTransactions([{
        transactionId: 'tx3',
        date: '2026-07-22',
        amount: 100,
        name: 'Reembolso',
        direction: 'income',
        incomeKind: 'direct',
        divisaoId: 'cx-essencial',
      }])
      const e = useAppStore.getState().entradas[0]
      expect(e.kind).toBe('direct')
      expect(e.targetDivisaoId).toBe('cx-essencial')
      expect(e.date).toBe('2026-07-22')
    })

    it('ignored não grava lançamento', () => {
      useAppStore.getState().importStatementTransactions([{
        transactionId: 'tx4',
        date: '2026-07-28',
        amount: 0.91,
        name: 'CRE RCMP',
        direction: 'income',
        incomeKind: 'distributable',
        ignored: true,
      }])
      expect(useAppStore.getState().entradas).toHaveLength(0)
      expect(useAppStore.getState().saidasVariaveis).toHaveLength(0)
    })

    it('reconcile marca o mês (banner some)', () => {
      useAppStore.getState().addStatementReconciliation({
        userId: 'u1',
        yearMonth: '2026-07',
        uploadedAt: '2026-08-05',
        sourceFormat: 'pdf',
        sourceLabel: '99Pay',
        accountKind: 'checking',
        transactionCount: 10,
        matchedCount: 8,
        importedCount: 2,
        ignoredCount: 0,
        transactionHashes: ['a', 'b'],
      })
      const recs = useAppStore.getState().statementReconciliations
      expect(recs.some(r => r.yearMonth === '2026-07' && r.userId === 'u1')).toBe(true)
    })
  })
})
