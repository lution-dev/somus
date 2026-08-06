import { useCallback, useRef, useState, type DragEvent, type ReactNode } from 'react'
import { useLocation } from 'wouter'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, AlertCircle, Landmark, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { PageHeader, Breadcrumb, ConfirmDialog } from '../components/ui'
import { useIsMobile } from '../hooks/useIsMobile'
import { useAppStore } from '../stores/useAppStore'
import {
  parseCsvDetailed,
  parseOfxDetailed,
  parsePdfDetailed,
  detectStatementFormat,
  bankLabel,
  EXTRATO_DRAFT_KEY,
  EXTRATO_DISMISS_PREFIX,
  type ExtratoDraft,
  type DetectedBank,
} from '../lib/statement'
import { previousYM, monthNameLong } from '../lib/months'
import type { BankTransaction } from '../types'

const HERO_BG = '#001442'
const ease = [0.25, 0.46, 0.45, 0.94] as const

export default function ExtratoUpload() {
  const [, navigate] = useLocation()
  const isMobile = useIsMobile()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const yearMonth = previousYM()
  const mesNome = monthNameLong(yearMonth)

  const userId = useAppStore(s => s.currentUser?.id ?? '')
  const removeStatementReconciliationForMonth = useAppStore(s => s.removeStatementReconciliationForMonth)
  const existingRec = useAppStore(s =>
    (s.statementReconciliations ?? []).find(
      r => r.userId === (s.currentUser?.id ?? '') && r.yearMonth === yearMonth,
    ) ?? null,
  )

  function clearDismissForMonth() {
    try {
      localStorage.removeItem(`${EXTRATO_DISMISS_PREFIX}${yearMonth}`)
    } catch { /* ignore */ }
  }

  function handleRemoveReconciliation() {
    if (!userId) return
    removeStatementReconciliationForMonth(userId, yearMonth)
    clearDismissForMonth()
    setConfirmRemove(false)
  }

  async function handleFile(file: File) {
    setError(null)
    setLoading(true)
    try {
      const lower = file.name.toLowerCase()
      let format: ExtratoDraft['sourceFormat'] | null = null
      let transactions: BankTransaction[] = []
      let detectedBank: DetectedBank = 'generic'
      let sourceLabel: string | undefined

      if (lower.endsWith('.pdf') || file.type === 'application/pdf') {
        format = 'pdf'
        const detailed = await parsePdfDetailed(await file.arrayBuffer())
        transactions = detailed.transactions
        detectedBank = detailed.detectedBank
        sourceLabel = bankLabel(detectedBank)
      } else {
        const content = await file.text()
        format = detectStatementFormat(file.name, content)
        if (!format || format === 'pdf') {
          setError('Esse arquivo ainda não encaixa. Use PDF, OFX, OFC ou CSV.')
          return
        }
        if (format === 'ofx') {
          const detailed = parseOfxDetailed(content)
          transactions = detailed.transactions
          detectedBank = detailed.detectedBank
          sourceLabel = detailed.orgLabel || bankLabel(detectedBank)
        } else {
          const detailed = parseCsvDetailed(content)
          transactions = detailed.transactions
          detectedBank = detailed.detectedBank
          sourceLabel = bankLabel(detectedBank)
        }
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
        sourceLabel,
        detectedBank,
        transactions: list,
      }
      sessionStorage.setItem(EXTRATO_DRAFT_KEY, JSON.stringify(draft))
      navigate('/extrato/revisao')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não deu pra ler esse arquivo.')
    } finally {
      setLoading(false)
      setDragging(false)
    }
  }

  const onDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!loading) setDragging(true)
  }, [loading])

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) setDragging(false)
  }, [])

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
    if (loading) return
    const f = e.dataTransfer.files?.[0]
    if (f) void handleFile(f)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  return (
    <div style={{
      minHeight: isMobile ? undefined : '100%',
      paddingBottom: isMobile ? 48 : 56,
      position: 'relative',
    }}>
      {!isMobile && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, height: 420,
            background: 'radial-gradient(circle at 50% -40px, #3B82F6 0%, transparent 68%)',
            opacity: 0.11,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {isMobile ? (
        <>
          <PageHeader title="Extrato" back backTo="/home" bg={HERO_BG} />
          <div style={{
            background: `linear-gradient(to bottom, ${HERO_BG} 0%, transparent 100%)`,
            padding: '4px 20px 28px',
          }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
            >
              <p className="section-label" style={{ margin: '0 0 8px', color: 'rgba(147,197,253,0.75)' }}>
                Conta corrente · {mesNome}
              </p>
              <h1 style={{
                fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em',
                color: 'var(--color-text-primary)', margin: '0 0 10px',
                fontFamily: 'var(--font-display)', lineHeight: 1.2,
              }}>
                Trazer o extrato pra base
              </h1>
              <p style={{
                fontSize: 14, color: 'rgba(226,232,240,0.72)', lineHeight: 1.55,
                margin: 0, maxWidth: 340,
              }}>
                A Somus reconhece o que já está lançado e ajuda a completar só o que falta.
              </p>
            </motion.div>
          </div>
        </>
      ) : (
        <div style={{ paddingTop: 28, marginBottom: 8, position: 'relative', zIndex: 1 }}>
          <Breadcrumb
            items={[
              { label: 'Home', href: '/home' },
              { label: 'Extrato' },
            ]}
            style={{ marginBottom: 28, opacity: 0.85 }}
          />
          <p className="section-label" style={{ margin: '0 0 10px' }}>
            Conta corrente · {mesNome}
          </p>
          <h1 style={{
            fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em',
            color: 'var(--color-text-primary)', margin: '0 0 10px',
            fontFamily: 'var(--font-display)', lineHeight: 1.2,
          }}>
            Trazer o extrato pra base
          </h1>
          <p style={{
            fontSize: 15, color: 'var(--color-text-secondary)', lineHeight: 1.55,
            margin: 0, maxWidth: 440,
          }}>
            A Somus reconhece o que já está lançado e ajuda a completar só o que falta.
          </p>
        </div>
      )}

      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: isMobile ? '0 16px' : '28px 0 0',
        maxWidth: isMobile ? undefined : 640,
        width: '100%',
      }}>
        {existingRec && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            style={{
              marginBottom: 20,
              padding: isMobile ? '16px' : '18px 20px',
              borderRadius: 16,
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.22)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: 'rgba(16,185,129,0.14)',
                border: '1px solid rgba(16,185,129,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle2 size={20} color="#34D399" strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  margin: '0 0 4px', fontSize: 14, fontWeight: 600,
                  color: 'var(--color-text-primary)',
                }}>
                  {mesNome} já está organizado
                </p>
                <p style={{
                  margin: '0 0 14px', fontSize: 13, color: 'var(--color-text-secondary)',
                  lineHeight: 1.5,
                }}>
                  {existingRec.sourceLabel ? `${existingRec.sourceLabel} · ` : ''}
                  {existingRec.matchedCount} reconhecidos
                  {existingRec.importedCount > 0 ? ` · ${existingRec.importedCount} lançados` : ''}
                  . Os lançamentos na base continuam. Remover só libera o mês pra enviar outro extrato.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(true)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    padding: '8px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Remover e enviar outro
                </button>
              </div>
            </div>
          </motion.div>
        )}

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

        <motion.button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease }}
          whileHover={loading || isMobile ? undefined : { scale: 1.005 }}
          whileTap={loading ? undefined : { scale: 0.995 }}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            padding: isMobile ? '44px 24px' : '64px 40px',
            minHeight: isMobile ? 200 : 260,
            borderRadius: 20,
            border: dragging
              ? '1.5px solid rgba(59,130,246,0.55)'
              : '1px dashed rgba(255,255,255,0.16)',
            background: dragging
              ? 'rgba(59,130,246,0.10)'
              : 'rgba(255,255,255,0.035)',
            backdropFilter: 'blur(20px) saturate(160%)',
            WebkitBackdropFilter: 'blur(20px) saturate(160%)',
            boxShadow: dragging
              ? 'inset 0 1px 0 rgba(255,255,255,0.10), 0 0 0 4px rgba(59,130,246,0.08)'
              : 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.18)',
            cursor: loading ? 'wait' : 'pointer',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-sans)',
            transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
            outline: 'none',
          }}
        >
          <div style={{
            width: isMobile ? 56 : 64,
            height: isMobile ? 56 : 64,
            borderRadius: 18,
            background: loading
              ? 'rgba(59,130,246,0.18)'
              : 'linear-gradient(145deg, rgba(59,130,246,0.18) 0%, rgba(37,99,235,0.08) 100%)',
            border: '1px solid rgba(59,130,246,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
          }}>
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: '2px solid rgba(59,130,246,0.25)',
                  borderTopColor: '#3B82F6',
                }}
              />
            ) : (
              <Upload size={isMobile ? 22 : 26} color="#3B82F6" strokeWidth={1.75} />
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{
              display: 'block',
              fontSize: isMobile ? 15 : 17,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
              marginBottom: 6,
            }}>
              {loading
                ? 'Lendo o arquivo…'
                : dragging
                  ? 'Solte pra continuar'
                  : isMobile
                    ? 'Escolher arquivo'
                    : 'Arraste o extrato aqui'}
            </span>
            {!loading && (
              <span style={{
                display: 'block',
                fontSize: 13,
                color: 'var(--color-text-tertiary)',
                lineHeight: 1.45,
              }}>
                {isMobile
                  ? 'PDF · OFX · OFC · CSV'
                  : 'Ou clique pra selecionar · PDF, OFX, OFC ou CSV'}
              </span>
            )}
          </div>
        </motion.button>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                marginTop: 16, padding: '14px 16px', borderRadius: 14,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          style={{
            marginTop: isMobile ? 28 : 36,
            padding: isMobile ? '18px 16px' : '22px 24px',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <p style={{
            fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)', margin: '0 0 14px',
          }}>
            Como funciona
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 14 : 20,
          }}>
            <HintRow
              icon={<Landmark size={16} color="#60A5FA" strokeWidth={1.75} />}
              title="De qualquer banco"
              body="99Pay, Inter, Nubank, Itaú, Santander e outros. Só conta corrente, sem fatura de cartão."
            />
            <HintRow
              icon={<ShieldCheck size={16} color="#10B981" strokeWidth={1.75} />}
              title="Sem duplicar"
              body="O que já está na base fica só pra conferir. Você lança apenas o que ainda falta."
            />
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={handleRemoveReconciliation}
        variant="warning"
        title={`Remover organização de ${mesNome}?`}
        description="Os lançamentos que já entraram na base continuam. Só some a marca de mês organizado, pra você poder enviar outro extrato."
        confirmLabel="Remover e liberar mês"
      />
    </div>
  )
}

function HintRow({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10, flexShrink: 0,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          margin: '0 0 4px', fontSize: 13, fontWeight: 600,
          color: 'var(--color-text-primary)',
        }}>
          {title}
        </p>
        <p style={{
          margin: 0, fontSize: 12.5, color: 'var(--color-text-tertiary)', lineHeight: 1.5,
        }}>
          {body}
        </p>
      </div>
    </div>
  )
}
