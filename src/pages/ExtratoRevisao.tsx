import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useLocation } from 'wouter'
import { Check, EyeOff } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { PageHeader, Button } from '../components/ui'
import {
  useAppStore,
  selectCurrentDivisoes,
  selectCurrentEntradas,
  selectCurrentEntradasFixas,
  selectCurrentSaidasFixas,
} from '../stores/useAppStore'
import { formatCurrency } from '../lib/calculations'
import { monthNameLong, todayBR } from '../lib/months'
import { getDivisaoIcon } from '../lib/icons'
import {
  matchTransactions,
  suggestName,
  shouldSuggestIgnore,
  EXTRATO_DRAFT_KEY,
  type ExtratoDraft,
  type MatchResult,
} from '../lib/statement'
import type { StatementImportItem } from '../types'

interface RowState {
  ignored: boolean
  name: string
  amount: number
  date: string
  /** income only */
  incomeKind: 'distributable' | 'direct'
  divisaoId: string
}

export default function ExtratoRevisao() {
  const [, navigate] = useLocation()
  const [draft, setDraft] = useState<ExtratoDraft | null>(null)
  const [rows, setRows] = useState<Record<string, RowState>>({})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const currentUser = useAppStore(s => s.currentUser)
  const divisoes = useAppStore(useShallow(selectCurrentDivisoes))
  const entradas = useAppStore(useShallow(selectCurrentEntradas))
  const entradasFixas = useAppStore(useShallow(selectCurrentEntradasFixas))
  const saidasFixas = useAppStore(useShallow(selectCurrentSaidasFixas))
  const saidasVariaveis = useAppStore(useShallow(s =>
    s.saidasVariaveis.filter(sv => sv.userId === (s.currentUser?.id ?? '')),
  ))
  const importStatementTransactions = useAppStore(s => s.importStatementTransactions)
  const addStatementReconciliation = useAppStore(s => s.addStatementReconciliation)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(EXTRATO_DRAFT_KEY)
      if (!raw) {
        navigate('/extrato')
        return
      }
      const parsed = JSON.parse(raw) as ExtratoDraft
      setDraft(parsed)
    } catch {
      navigate('/extrato')
    }
  }, [navigate])

  const matches: MatchResult[] = useMemo(() => {
    if (!draft) return []
    return matchTransactions({
      transactions: draft.transactions,
      yearMonth: draft.yearMonth,
      entradas,
      entradasFixas,
      saidasFixas,
      saidasVariaveis,
    })
  }, [draft, entradas, entradasFixas, saidasFixas, saidasVariaveis])

  useEffect(() => {
    if (!draft || Object.keys(rows).length > 0) return
    const init: Record<string, RowState> = {}
    const defaultDiv = divisoes.find(d => d.id === 'cx-essencial')?.id ?? divisoes[0]?.id ?? ''
    for (const m of matches) {
      if (m.status !== 'unmatched') continue
      const tx = m.transaction
      init[tx.id] = {
        ignored: shouldSuggestIgnore(tx),
        name: suggestName(tx.description),
        amount: Math.abs(tx.amount),
        date: tx.date,
        incomeKind: 'distributable',
        divisaoId: defaultDiv,
      }
    }
    setRows(init)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, draft, divisoes])

  const matched = matches.filter(m => m.status === 'matched')
  const unmatched = matches.filter(m => m.status === 'unmatched')

  const pendingCount = unmatched.filter(m => !rows[m.transaction.id]?.ignored).length

  function updateRow(id: string, patch: Partial<RowState>) {
    setRows(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  function handleConfirm() {
    if (!draft || !currentUser) return
    setSaving(true)

    const items: StatementImportItem[] = unmatched.map(m => {
      const tx = m.transaction
      const row = rows[tx.id]
      const isIncome = tx.amount > 0
      return {
        transactionId: tx.id,
        date: row?.date ?? tx.date,
        amount: row?.amount ?? Math.abs(tx.amount),
        name: row?.name ?? tx.description,
        direction: isIncome ? 'income' : 'expense',
        incomeKind: isIncome ? (row?.incomeKind ?? 'distributable') : undefined,
        divisaoId: (!isIncome || row?.incomeKind === 'direct') ? row?.divisaoId : undefined,
        ignored: row?.ignored ?? false,
      }
    })

    importStatementTransactions(items)

    const imported = items.filter(i => !i.ignored).length
    const ignored = items.filter(i => i.ignored).length

    addStatementReconciliation({
      userId: currentUser.id,
      yearMonth: draft.yearMonth,
      uploadedAt: todayBR(),
      sourceFormat: draft.sourceFormat,
      sourceLabel: draft.sourceLabel,
      accountKind: 'checking',
      transactionCount: draft.transactions.length,
      matchedCount: matched.length,
      importedCount: imported,
      ignoredCount: ignored,
      transactionHashes: draft.transactions.map(t => t.id),
    })

    sessionStorage.removeItem(EXTRATO_DRAFT_KEY)
    setSaving(false)
    setDone(true)
  }

  if (!draft) {
    return (
      <div style={{ padding: 32, color: 'var(--color-text-tertiary)', fontSize: 14 }}>
        Carregando…
      </div>
    )
  }

  if (done) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
          background: 'rgba(16,185,129,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={28} color="var(--color-success)" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
          Extrato organizado
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
          O que faltava entrou na sua base. O que já estava continua como estava.
        </p>
        <Button onClick={() => navigate('/home')}>Voltar pra Home</Button>
      </div>
    )
  }

  const mesNome = monthNameLong(draft.yearMonth)

  return (
    <div style={{ paddingBottom: 100 }}>
      <PageHeader title="Revisar extrato" back backTo="/extrato" />

      <div style={{ padding: '8px 16px 0' }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>
          {mesNome}
          {draft.sourceLabel ? ` · ${draft.sourceLabel}` : ''}
          {' · '}
          {draft.fileName}
        </p>
        <p style={{ fontSize: 14, color: 'var(--color-text-primary)', fontWeight: 500, margin: '0 0 20px' }}>
          {matched.length} já na base · {pendingCount} pra lançar
        </p>

        {matched.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h3 style={{
              fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
              color: 'var(--color-text-tertiary)', margin: '0 0 12px',
            }}>
              Já na sua base
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {matched.map(m => (
                <div
                  key={m.transaction.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12,
                    background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.18)',
                  }}
                >
                  <Check size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {m.linkedEntity?.label ?? m.transaction.description}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                      {m.transaction.description}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: m.transaction.amount >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                  }}>
                    {formatCurrency(Math.abs(m.transaction.amount))}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {unmatched.length > 0 && (
          <section>
            <h3 style={{
              fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
              color: 'var(--color-text-tertiary)', margin: '0 0 12px',
            }}>
              Pra lançar
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {unmatched.map(m => {
                const tx = m.transaction
                const row = rows[tx.id]
                if (!row) return null
                const isIncome = tx.amount > 0

                return (
                  <div
                    key={tx.id}
                    style={{
                      padding: 14, borderRadius: 14,
                      background: 'rgba(255,255,255,0.04)',
                      border: row.ignored
                        ? '1px solid rgba(255,255,255,0.06)'
                        : '1px solid rgba(255,255,255,0.1)',
                      opacity: row.ignored ? 0.55 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
                        color: isIncome ? 'var(--color-success)' : 'var(--color-danger)',
                      }}>
                        {isIncome ? 'Entrada' : 'Saída'}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateRow(tx.id, { ignored: !row.ignored })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: 12, color: 'var(--color-text-tertiary)',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        <EyeOff size={12} />
                        {row.ignored ? 'Desfazer' : 'Ignorar'}
                      </button>
                    </div>

                    {!row.ignored && (
                      <>
                        <label style={labelStyle}>Nome</label>
                        <input
                          value={row.name}
                          onChange={e => updateRow(tx.id, { name: e.target.value })}
                          style={inputStyle}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
                          <div>
                            <label style={labelStyle}>Valor</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={row.amount}
                              onChange={e => updateRow(tx.id, { amount: Number(e.target.value) || 0 })}
                              style={inputStyle}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>Data</label>
                            <input
                              type="date"
                              value={row.date}
                              onChange={e => updateRow(tx.id, { date: e.target.value })}
                              style={inputStyle}
                            />
                          </div>
                        </div>

                        {isIncome ? (
                          <div style={{ marginTop: 12 }}>
                            <label style={labelStyle}>Como lançar</label>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                              <Chip
                                active={row.incomeKind === 'distributable'}
                                onClick={() => updateRow(tx.id, { incomeKind: 'distributable' })}
                                label="Renda"
                              />
                              <Chip
                                active={row.incomeKind === 'direct'}
                                onClick={() => updateRow(tx.id, { incomeKind: 'direct' })}
                                label="Uma divisão"
                              />
                            </div>
                            {row.incomeKind === 'direct' && (
                              <DivisaoPicker
                                value={row.divisaoId}
                                onChange={id => updateRow(tx.id, { divisaoId: id })}
                                divisoes={divisoes}
                              />
                            )}
                          </div>
                        ) : (
                          <div style={{ marginTop: 12 }}>
                            <label style={labelStyle}>Divisão</label>
                            <DivisaoPicker
                              value={row.divisaoId}
                              onChange={id => updateRow(tx.id, { divisaoId: id })}
                              divisoes={divisoes}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {row.ignored && (
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-tertiary)' }}>
                        {row.name} · {formatCurrency(row.amount)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {unmatched.length === 0 && matched.length > 0 && (
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
            Tudo nesse extrato já estava na sua base. Pode confirmar pra marcar o mês como organizado.
          </p>
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(to top, var(--color-bg-primary) 60%, transparent)',
        zIndex: 40,
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <Button
            fullWidth
            disabled={saving}
            onClick={handleConfirm}
          >
            {pendingCount > 0
              ? `Confirmar ${pendingCount} lançamento${pendingCount === 1 ? '' : 's'}`
              : 'Marcar mês como organizado'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: '8px 12px',
        borderRadius: 10,
        border: active ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
        background: active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.03)',
        color: active ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {label}
    </button>
  )
}

function DivisaoPicker({
  value,
  onChange,
  divisoes,
}: {
  value: string
  onChange: (id: string) => void
  divisoes: { id: string; name: string }[]
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {divisoes.map(d => {
        const { color } = getDivisaoIcon(d.id)
        const active = value === d.id
        return (
          <button
            key={d.id}
            type="button"
            onClick={() => onChange(d.id)}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              border: active ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.1)',
              background: active ? `${color}22` : 'rgba(255,255,255,0.03)',
              color: active ? color : 'var(--color-text-secondary)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {d.name}
          </button>
        )
      })}
    </div>
  )
}

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--color-text-tertiary)',
  marginBottom: 6,
}

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: 'var(--color-text-primary)',
  fontSize: 14,
  fontFamily: 'var(--font-sans)',
  outline: 'none',
}
