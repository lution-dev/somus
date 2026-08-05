/**
 * E2E com o PDF real da 99Pay.
 * No Node, pdfjs-dist precisa de DOM — então extraímos o texto com pypdf
 * (mesmo conteúdo que o browser lê via pdfjs) e rodamos parse + matching.
 */
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it, expect } from 'vitest'
import { parseStatementTextDetailed } from './parseStatementText'
import { matchTransactions } from './matchTransactions'
import type { Entrada, SaidaVariavel } from '../../types'

const REAL_PDF =
  '/home/ubuntu/.cursor/projects/workspace/uploads/statement_7c535d74-a52d-2af7-d946-8783fd711da3_-_LUCAS_1e4d.pdf'

function extractTextWithPyPdf(pdfPath: string): string {
  const out = join(tmpdir(), `somus-pdf-${Date.now()}.txt`)
  const py = `
from pypdf import PdfReader
r = PdfReader(${JSON.stringify(pdfPath)})
text = "\\n".join((p.extract_text() or "") for p in r.pages)
open(${JSON.stringify(out)}, "w").write(text)
print(len(text))
`
  execFileSync('python3', ['-c', py], { stdio: ['ignore', 'pipe', 'pipe'] })
  const text = readFileSync(out, 'utf8')
  try { unlinkSync(out) } catch { /* ignore */ }
  return text
}

describe('S-EXTRATO E2E — PDF real 99Pay', () => {
  it.skipIf(!existsSync(REAL_PDF))(
    'PDF real → texto → matching valor+data no mês de julho',
    () => {
      const text = extractTextWithPyPdf(REAL_PDF)
      expect(text.length).toBeGreaterThan(1000)

      const parsed = parseStatementTextDetailed(text)
      expect(parsed.detectedBank).toBe('99pay')
      expect(parsed.transactions.length).toBeGreaterThan(50)

      const july = parsed.transactions.filter(t => t.date.startsWith('2026-07'))
      expect(july.length).toBeGreaterThan(40)

      // Cenário do usuário: mês quase todo já lançado (mesmos valores/datas, nomes diferentes)
      const material = july.filter(t => Math.abs(t.amount) >= 10)
      const entradas: Entrada[] = material
        .filter(t => t.amount > 0)
        .map(t => ({
          id: `e-${t.id}`,
          userId: 'u1',
          sourceId: '',
          sourceName: `Entrada ${t.amount}`,
          amount: t.amount,
          date: t.date,
          distribution: [],
          status: 'realized' as const,
        }))
      const saidasVariaveis: SaidaVariavel[] = material
        .filter(t => t.amount < 0)
        .map(t => ({
          id: `sv-${t.id}`,
          userId: 'u1',
          divisaoId: 'cx-essencial',
          amount: Math.abs(t.amount),
          description: `Saída ${Math.abs(t.amount)}`,
          category: 'teste',
          paymentMethod: 'pix' as const,
          date: t.date,
          status: 'realized' as const,
        }))

      const results = matchTransactions({
        yearMonth: '2026-07',
        transactions: material,
        entradas,
        entradasFixas: [],
        saidasFixas: [],
        saidasVariaveis,
      })

      const matched = results.filter(r => r.status === 'matched')
      expect(matched.length).toBe(material.length)
      expect(
        matched.every(m =>
          m.linkedEntity?.label.startsWith('Entrada') ||
          m.linkedEntity?.label.startsWith('Saída'),
        ),
      ).toBe(true)
    },
  )
})
