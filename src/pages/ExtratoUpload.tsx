import { useRef, useState } from 'react'
import { useLocation } from 'wouter'
import { Upload, AlertCircle } from 'lucide-react'
import { PageHeader } from '../components/ui'
import {
  parseCsv,
  parseOfx,
  parsePdf,
  detectStatementFormat,
  EXTRATO_DRAFT_KEY,
  type ExtratoDraft,
} from '../lib/statement'
import { previousYM, monthNameLong } from '../lib/months'
import type { BankTransaction } from '../types'

export default function ExtratoUpload() {
  const [, navigate] = useLocation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const yearMonth = previousYM()
  const mesNome = monthNameLong(yearMonth)

  async function handleFile(file: File) {
    setError(null)
    setLoading(true)
    try {
      const lower = file.name.toLowerCase()
      let format: ExtratoDraft['sourceFormat'] | null = null
      let transactions: BankTransaction[] = []

      if (lower.endsWith('.pdf') || file.type === 'application/pdf') {
        format = 'pdf'
        const buffer = await file.arrayBuffer()
        transactions = await parsePdf(buffer)
      } else {
        const content = await file.text()
        format = detectStatementFormat(file.name, content)
        if (!format || format === 'pdf') {
          setError('Esse arquivo ainda não encaixa. Use PDF, OFX, OFC ou CSV.')
          return
        }
        transactions = format === 'ofx' ? parseOfx(content) : parseCsv(content)
      }

      const inMonth = transactions.filter(t => t.date.startsWith(yearMonth))
      const list = inMonth.length > 0 ? inMonth : transactions

      if (list.length === 0) {
        setError('Não achei lançamentos nesse arquivo. Confira se é o extrato certo.')
        return
      }

      const draft: ExtratoDraft = {
        yearMonth,
        sourceFormat: format,
        fileName: file.name,
        transactions: list,
      }
      sessionStorage.setItem(EXTRATO_DRAFT_KEY, JSON.stringify(draft))
      navigate('/extrato/revisao')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não deu pra ler esse arquivo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <PageHeader title="Extrato" back backTo="/home" />

      <div style={{ padding: '8px 16px 24px' }}>
        <h1 style={{
          fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)',
          margin: '8px 0 8px',
        }}>
          Trazer o extrato pra base
        </h1>
        <p style={{
          fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5,
          margin: '0 0 8px',
        }}>
          Arquivo da conta corrente de {mesNome} em PDF, OFX ou CSV. Sem fatura de cartão.
        </p>
        <p style={{
          fontSize: 12, color: 'var(--color-text-tertiary)', margin: '0 0 24px',
        }}>
          Aceitos: PDF, OFX, OFC ou CSV.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.ofx,.ofc,.csv,.txt,application/pdf,text/csv,application/x-ofx,application/vnd.intu.qfx"
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void handleFile(f)
            e.target.value = ''
          }}
        />

        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '48px 24px',
            borderRadius: 16,
            border: '1px dashed rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.03)',
            cursor: loading ? 'wait' : 'pointer',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(59,130,246,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Upload size={24} color="var(--color-accent-primary)" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {loading ? 'Lendo arquivo…' : 'Escolher arquivo'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            PDF · OFX · OFC · CSV
          </span>
        </button>

        {error && (
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            marginTop: 16, padding: '12px 14px', borderRadius: 12,
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <AlertCircle size={16} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.45 }}>
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
