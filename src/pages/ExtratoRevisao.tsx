import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useLocation } from 'wouter'
import { motion } from 'framer-motion'
import { Check, EyeOff } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { PageHeader, Button, Breadcrumb } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
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
  buildImportItemsFromMatches,
  EXTRATO_DRAFT_KEY,
  type ExtratoDraft,
  type MatchResult,
} from '../lib/statement'
import type { StatementImportItem } from '../types'

const HERO_BG = '#001442'
const ease = [0.25, 0.46, 0.45, 0.94] as const

interface RowState {
  ignored: boolean
  name: string
  amount: number
  date: string
  incomeKind: 'distributable' | 'direct'
  divisaoId: string
}

export default function ExtratoRevisao() {
  const [, navigate] = useLocation()
  const isMobile = useIsMobile()
  const [draft, setDraft] = useState<ExtratoDraft | null>(null)
  const [rows, setRows] = useState<Record<string, RowState>>({})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [showMatched, setShowMatched] = useState(false)

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

  function buildImportItems(): StatementImportItem[] {
    return buildImportItemsFromMatches(matches, rows)
  }

  function handleConfirm() {
    if (!draft || !currentUser) return
    setSaving(true)

    const items = buildImportItems()
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
      <div style={{
        padding: isMobile ? 32 : '48px 0',
        color: 'var(--color-text-tertiary)',
        fontSize: 14,
      }}>
        Carregando…
      </div>
    )
  }

  if (done) {
    return (
      <div style={{
        position: 'relative',
        minHeight: isMobile ? undefined : '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '64px 24px' : '80px 0',
        textAlign: 'center',
      }}>
        {!isMobile && (
          <div
            aria-hidden
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 360,
              background: 'radial-gradient(circle at 50% -40px, #10B981 0%, transparent 68%)',
              opacity: 0.08, pointerEvents: 'none',
            }}
          />
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease }}
          style={{ position: 'relative', zIndex: 1, maxWidth: 400 }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: '0 auto 20px',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>
            <Check size={28} color="var(--color-success)" strokeWidth={2} />
          </div>
          <h2 style={{
            fontSize: isMobile ? 22 : 26, fontWeight: 600,
            color: 'var(--color-text-primary)', margin: '0 0 10px',
            fontFamily: 'var(--font-display)', letterSpacing: '-0.02em',
          }}>
            Extrato organizado
          </h2>
          <p style={{
            fontSize: 14, color: 'var(--color-text-secondary)',
            margin: '0 0 28px', lineHeight: 1.55,
          }}>
            O que faltava entrou na sua base. O que já estava continua como estava.
          </p>
          <Button onClick={() => navigate('/home')}>Voltar pra Home</Button>
        </motion.div>
      </div>
    )
  }

  const mesNome = monthNameLong(draft.yearMonth)
  const metaLine = [
    mesNome,
    draft.sourceLabel,
    draft.fileName,
  ].filter(Boolean).join(' · ')

  return (
    <div style={{
      position: 'relative',
      paddingBottom: isMobile ? 110 : 48,
      minHeight: isMobile ? undefined : '100%',
    }}>
      {!isMobile && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: 380,
            background: 'radial-gradient(circle at 50% -40px, #3B82F6 0%, transparent 68%)',
            opacity: 0.1,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {isMobile ? (
        <>
          <PageHeader title="Revisar extrato" back backTo="/extrato" bg={HERO_BG} />
          <div style={{
            background: `linear-gradient(to bottom, ${HERO_BG} 0%, transparent 100%)`,
            padding: '4px 20px 20px',
          }}>
            <p style={{
              fontSize: 12, color: 'rgba(148,163,184,0.9)', margin: '0 0 8px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {metaLine}
            </p>
            <h1 style={{
              fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em',
              color: 'var(--color-text-primary)', margin: '0 0 6px',
              fontFamily: 'var(--font-display)',
            }}>
              {pendingCount} pra lançar
            </h1>
            <p style={{
              fontSize: 13, color: 'rgba(226,232,240,0.68)', margin: 0, lineHeight: 1.45,
            }}>
              {matched.length > 0
                ? `${matched.length} já na base ficam no final. Sem relançar.`
                : 'Só o que ainda não está no Somus.'}
            </p>
          </div>
        </>
      ) : (
        <div style={{ paddingTop: 28, marginBottom: 8, position: 'relative', zIndex: 1 }}>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/home' },
              { label: 'Extrato', href: '/extrato' },
              { label: 'Revisar' },
            ]}
            style={{ marginBottom: 24, opacity: 0.85 }}
          />
          <p style={{
            fontSize: 13, color: 'var(--color-text-tertiary)', margin: '0 0 8px',
          }}>
            {metaLine}
          </p>
          <h1 style={{
            fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em',
            color: 'var(--color-text-primary)', margin: '0 0 8px',
            fontFamily: 'var(--font-display)',
          }}>
            {pendingCount} pra lançar
            {matched.length > 0 ? (
              <span style={{
                fontWeight: 500, fontSize: 18, color: 'var(--color-text-tertiary)',
                marginLeft: 12,
              }}>
                · {matched.length} já na base
              </span>
            ) : null}
          </h1>
          <p style={{
            fontSize: 14, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5,
            maxWidth: 480,
          }}>
            Em cima só o que ainda não está no Somus. O que já bateu fica no final, só pra conferir.
          </p>
        </div>
      )}

      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: isMobile ? '8px 16px 0' : '20px 0 0',
        maxWidth: isMobile ? undefined : 720,
        width: '100%',
      }}>
        {/* 1º: unmatched */}
        {unmatched.length > 0 && (
          <section style={{ marginBottom: 28 }}>
            <h3 style={sectionLabelStyle}>Pra lançar</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : unmatched.length > 1 ? '1fr 1fr' : '1fr',
              gap: isMobile ? 12 : 14,
            }}>
              {unmatched.map(m => {
                const tx = m.transaction
                const row = rows[tx.id]
                if (!row) return null
                const isIncome = tx.amount > 0

                return (
                  <div
                    key={tx.id}
                    style={{
                      padding: isMobile ? 14 : 18,
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.035)',
                      backdropFilter: 'blur(12px)',
                      border: row.ignored
                        ? '1px solid rgba(255,255,255,0.05)'
                        : '1px solid rgba(255,255,255,0.09)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                      opacity: row.ignored ? 0.55 : 1,
                      gridColumn: !isMobile && unmatched.length > 1 && isIncome && row.incomeKind === 'direct'
                        ? '1 / -1'
                        : undefined,
                    }}
                  >
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 12,
                    }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.04em',
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

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: 10,
                          marginTop: 10,
                        }}>
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
          <p style={{
            fontSize: 14, color: 'var(--color-text-secondary)',
            lineHeight: 1.55, marginBottom: 24,
            padding: isMobile ? 0 : '8px 0',
          }}>
            Tudo nesse extrato já estava na sua base. Nada novo pra lançar. Pode confirmar pra marcar o mês como organizado.
          </p>
        )}

        {/* 2º: matched — final, colapsado */}
        {matched.length > 0 && (
          <section style={{ marginBottom: 28, opacity: 0.9 }}>
            <button
              type="button"
              onClick={() => setShowMatched(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '0 0 12px', fontFamily: 'var(--font-sans)',
              }}
            >
              <h3 style={{ ...sectionLabelStyle, margin: 0 }}>
                Já na sua base · {matched.length} (não mexe)
              </h3>
              <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                {showMatched ? 'ocultar' : 'ver'}
              </span>
            </button>
            {showMatched && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 8,
              }}>
                {matched.map(m => (
                  <div
                    key={m.transaction.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 12,
                      background: 'rgba(16,185,129,0.06)',
                      border: '1px solid rgba(16,185,129,0.16)',
                      pointerEvents: 'none',
                    }}
                  >
                    <Check size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontSize: 14, fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {m.linkedEntity?.label ?? m.transaction.description}
                      </p>
                      <p style={{
                        margin: '2px 0 0', fontSize: 12, color: 'var(--color-text-tertiary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {m.transaction.description} · já lançado
                      </p>
                    </div>
                    <span style={{
                      fontSize: 14, fontWeight: 600, flexShrink: 0,
                      color: m.transaction.amount >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                    }}>
                      {formatCurrency(Math.abs(m.transaction.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Desktop / tablet CTA in-flow — não atravessa a sidebar */}
        {!isMobile && (
          <div style={{
            position: 'sticky',
            bottom: 0,
            padding: '20px 0 8px',
            background: 'linear-gradient(to top, var(--color-bg-primary) 55%, transparent)',
            zIndex: 20,
          }}>
            <Button fullWidth disabled={saving} onClick={handleConfirm}>
              {pendingCount > 0
                ? `Confirmar ${pendingCount} lançamento${pendingCount === 1 ? '' : 's'}`
                : 'Marcar mês como organizado'}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile: fixed bottom bar within phone chrome */}
      {isMobile && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, var(--color-bg-primary) 60%, transparent)',
          zIndex: 40,
        }}>
          <Button fullWidth disabled={saving} onClick={handleConfirm}>
            {pendingCount > 0
              ? `Confirmar ${pendingCount} lançamento${pendingCount === 1 ? '' : 's'}`
              : 'Marcar mês como organizado'}
          </Button>
        </div>
      )}
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

const sectionLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'var(--color-text-tertiary)',
  margin: '0 0 12px',
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
