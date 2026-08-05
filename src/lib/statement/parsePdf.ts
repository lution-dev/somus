import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { BankTransaction } from '../../types'
import { parseStatementText } from './parseStatementText'

GlobalWorkerOptions.workerSrc = pdfWorker

/**
 * Extrai texto de um PDF (pdfjs-dist, gratuita) e parseia lançamentos.
 * Funciona com PDFs com texto selecionável (ex: extrato 99Pay).
 * PDFs só-imagem (scan) não têm texto e vão falhar com mensagem clara.
 */
export async function parsePdf(data: ArrayBuffer): Promise<BankTransaction[]> {
  const loadingTask = getDocument({ data: new Uint8Array(data) })
  const pdf = await loadingTask.promise

  const chunks: string[] = []
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    let lastY: number | null = null
    let line = ''
    for (const item of content.items) {
      if (!('str' in item)) continue
      const y = 'transform' in item && Array.isArray(item.transform) ? Number(item.transform[5]) : 0
      if (lastY !== null && Math.abs(y - lastY) > 4) {
        chunks.push(line)
        line = ''
      }
      line += (line ? ' ' : '') + String(item.str)
      lastY = y
    }
    if (line) chunks.push(line)
    chunks.push('\n')
  }

  const text = chunks.join('\n')
  if (!text.replace(/\s/g, '')) {
    throw new Error('Esse PDF não tem texto pra ler (pode ser só imagem). Tente OFX, CSV ou um PDF com texto selecionável.')
  }

  const txs = parseStatementText(text)
  if (txs.length === 0) {
    throw new Error('Li o PDF, mas não reconheci lançamentos. Se for outro banco, manda um exemplo pra calibrar.')
  }
  return txs
}
