import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import { useAppStore } from '../stores/useAppStore'
import { useAuth } from '../hooks/useAuth'
import { Button, Input } from '../components/ui'
import SomusLogo from '../components/ui/SomusLogo'
import type { User } from '../types'
import { DIVISAO_INFO, DIVISAO_ORDER } from '../lib/divisoes'
import { getDivisaoIcon } from '../lib/icons'
import {
  Users,
  Wallet,
  Receipt,
  Plane,
  DollarSign,
  Copy,
  Share2,
  Check,
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

const center: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center' }
const iconCircle = (bg: string): React.CSSProperties => ({
  width: 64, height: 64, borderRadius: '50%', background: bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
})
const heading: React.CSSProperties = { fontSize: 24, fontWeight: 700, textAlign: 'center', color: 'var(--color-text-primary)', margin: 0 }
const sub: React.CSSProperties = { fontSize: 14, textAlign: 'center', color: 'var(--color-text-secondary)', margin: '8px 0 0' }

// ─── Passo 1: Identidade ──────────────────────────────────────────────────────

function Step1({ name, setName, onNext }: { name: string; setName: (v: string) => void; onNext: () => void }) {
  return (
    <form onSubmit={e => { e.preventDefault(); if (name.trim()) onNext() }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={center}>
        <div style={{ marginBottom: 16 }}>
          <SomusLogo size={56} />
        </div>
        <h2 style={heading}>Bem-vindo ao Somus</h2>
        <p style={sub}>Finanças do casal, simplificadas.</p>
      </div>
      <Input label="Seu nome" placeholder="Ex: Lucas Pires" value={name} onChange={e => setName(e.target.value)} />
      <Button variant="primary" fullWidth disabled={!name.trim()} type="submit">Continuar</Button>
    </form>
  )
}

// ─── Passo 2: Parceiro ────────────────────────────────────────────────────────

function Step2({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [copied, setCopied] = useState(false)
  const code = useAppStore.getState().currentUser?.partnerCode ?? '0001'

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleShare() {
    const text = `💜 Entra comigo no Somus!\n\nhttps://somus.vercel.app/convite/${code}`
    if (navigator.share) {
      navigator.share({ title: 'Somus', text }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <form onSubmit={e => { e.preventDefault(); onNext() }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={center}>
        <div style={iconCircle('rgba(139,92,246,0.12)')}>
          <Users size={28} color="var(--color-accent-couple)" />
        </div>
        <h2 style={heading}>Convidar parceiro(a)</h2>
        <p style={sub}>Conecte sua conta para uma visão financeira compartilhada.</p>
      </div>
      <div style={{
        background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)', padding: 20, textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '0 0 6px' }}>Seu código de convite</p>
        <p style={{ fontSize: 24, fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-accent-couple)', margin: 0, letterSpacing: 2 }}>{code}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={handleCopy} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 0', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
            background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.12)',
            color: copied ? 'var(--color-success)' : 'var(--color-accent-couple)',
            border: 'none', borderRadius: 10, cursor: 'pointer', transition: 'all 200ms',
          }}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar código'}
          </button>
          <button onClick={handleShare} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '10px 0', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
            background: 'rgba(139,92,246,0.12)', color: 'var(--color-accent-couple)',
            border: 'none', borderRadius: 10, cursor: 'pointer',
          }}>
            <Share2 size={14} />
            Compartilhar
          </button>
        </div>
      </div>
      <Button variant="couple" fullWidth type="submit">Continuar</Button>
      <button onClick={onSkip} type="button" style={{
        fontSize: 14, color: 'var(--color-text-tertiary)', cursor: 'pointer',
        textDecoration: 'underline', textAlign: 'center', background: 'none', border: 'none',
        fontFamily: 'var(--font-sans)',
      }}>
        Fazer solo por enquanto
      </button>
    </form>
  )
}

// ─── Editable list item ───────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-card)', padding: '10px 12px',
}

const inlineInput: React.CSSProperties = {
  background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
  borderRadius: 8, padding: '6px 10px', fontSize: 13, fontFamily: 'var(--font-sans)',
  color: 'var(--color-text-primary)', outline: 'none', width: '100%', boxSizing: 'border-box',
}

const iconBtn = (color: string): React.CSSProperties => ({
  width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: 'none', cursor: 'pointer', color, flexShrink: 0,
})

// ─── Passo 3: Fontes de renda ─────────────────────────────────────────────────

type SourceItem = { id: string; name: string; amount: string }
type ContaItem  = { id: string; name: string; amount: string; dia: string }
type GoalItem   = { id: string; name: string; target: string; deadline: string }

function Step3({ sources, setSources, onNext }: { sources: SourceItem[]; setSources: React.Dispatch<React.SetStateAction<SourceItem[]>>; onNext: () => void }) {
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')

  function startEdit(src: typeof sources[0]) {
    setEditId(src.id); setEditName(src.name); setEditAmount(src.amount)
  }
  function saveEdit() {
    if (!editName.trim()) return
    setSources(s => s.map(x => x.id === editId ? { ...x, name: editName.trim(), amount: editAmount } : x))
    setEditId(null)
  }
  function addNew() {
    const id = String(Date.now())
    setSources(s => [...s, { id, name: '', amount: '' }])
    setEditId(id); setEditName(''); setEditAmount('')
  }
  function remove(id: string) {
    setSources(s => s.filter(x => x.id !== id))
    if (editId === id) setEditId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={center}>
        <div style={iconCircle('rgba(16,185,129,0.12)')}>
          <DollarSign size={28} color="var(--color-success)" />
        </div>
        <h2 style={heading}>Fontes de renda</h2>
        <p style={sub}>Configure suas fontes de renda</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sources.map(s => (
          editId === s.id ? (
            <div key={s.id} style={{ ...cardStyle, flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
              <input style={inlineInput} placeholder="Nome da fonte" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flexShrink: 0 }}>R$</span>
                <input style={{ ...inlineInput, width: 100 }} type="number" inputMode="decimal" placeholder="0" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
                <button onClick={saveEdit} style={iconBtn('var(--color-success)')}><Check size={16} /></button>
                <button onClick={() => setEditId(null)} style={iconBtn('var(--color-text-tertiary)')}><X size={16} /></button>
              </div>
            </div>
          ) : (
            <div key={s.id} style={cardStyle}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name || '(sem nome)'}</p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-lucas)', marginRight: 4, flexShrink: 0 }}>
                ~R$ {Number(s.amount || 0).toLocaleString('pt-BR')}
              </span>
              <button onClick={() => startEdit(s)} style={iconBtn('var(--color-accent-primary)')}><Pencil size={14} /></button>
              <button onClick={() => remove(s.id)} style={iconBtn('var(--color-danger)')}><Trash2 size={14} /></button>
            </div>
          )
        ))}
        <button onClick={addNew} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '10px', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
          background: 'rgba(16,185,129,0.08)', color: 'var(--color-success)',
          border: '1px dashed rgba(16,185,129,0.3)', borderRadius: 'var(--radius-card)', cursor: 'pointer',
        }}>
          <Plus size={14} /> Adicionar fonte
        </button>
      </div>
      <Button variant="primary" fullWidth onClick={onNext} type="button">Continuar</Button>
    </div>
  )
}

// ─── Passo 4: Divisões ────────────────────────────────────────────────────────

function Step4({ onNext }: { onNext: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={center}>
        <div style={iconCircle('rgba(59,130,246,0.12)')}>
          <Wallet size={28} color="var(--color-accent-primary)" />
        </div>
        <h2 style={heading}>Suas Divisões</h2>
        <p style={sub}>Método Natália Arcuri — adaptado para vocês. Toque em qualquer divisão para entender o porquê.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DIVISAO_ORDER.map((id) => {
          const info = DIVISAO_INFO[id]
          const { Icon, color } = getDivisaoIcon(id)
          const isOpen = expandedId === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setExpandedId(isOpen ? null : id)}
              style={{
                background: 'var(--color-bg-secondary)',
                border: `1px solid ${isOpen ? color + '40' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-card)', padding: 12,
                display: 'flex', flexDirection: 'column', gap: isOpen ? 10 : 0,
                cursor: 'pointer', width: '100%', textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                transition: 'border-color 200ms ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: `${color}15`,
                }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{info.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>{info.short}</p>
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color, flexShrink: 0 }}>{info.pct}%</span>
              </div>
              {isOpen && (
                <div style={{
                  padding: '8px 0 0 42px',
                  fontSize: 12, lineHeight: 1.5,
                  color: 'var(--color-text-secondary)',
                }}>
                  {info.detail}
                </div>
              )}
            </button>
          )
        })}
      </div>
      <Button variant="primary" fullWidth onClick={onNext} type="button">Adorei!</Button>
    </div>
  )
}

// ─── Passo 5: Saídas fixas ────────────────────────────────────────────────────

function Step5({ contas, setContas, onNext }: { contas: ContaItem[]; setContas: React.Dispatch<React.SetStateAction<ContaItem[]>>; onNext: () => void }) {
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editDia, setEditDia] = useState('')

  function startEdit(c: typeof contas[0]) {
    setEditId(c.id); setEditName(c.name); setEditAmount(c.amount); setEditDia(c.dia)
  }
  function saveEdit() {
    if (!editName.trim()) return
    setContas(s => s.map(x => x.id === editId ? { ...x, name: editName.trim(), amount: editAmount, dia: editDia } : x))
    setEditId(null)
  }
  function addNew() {
    const id = String(Date.now())
    setContas(s => [...s, { id, name: '', amount: '', dia: '' }])
    setEditId(id); setEditName(''); setEditAmount(''); setEditDia('')
  }
  function remove(id: string) {
    setContas(s => s.filter(x => x.id !== id))
    if (editId === id) setEditId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={center}>
        <div style={iconCircle('rgba(239,68,68,0.12)')}>
          <Receipt size={28} color="var(--color-danger)" />
        </div>
        <h2 style={heading}>Saídas fixas</h2>
        <p style={sub}>Contas recorrentes do mês</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {contas.map(c => (
          editId === c.id ? (
            <div key={c.id} style={{ ...cardStyle, flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
              <input style={inlineInput} placeholder="Nome da conta" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flexShrink: 0 }}>R$</span>
                <input style={{ ...inlineInput, width: 80 }} type="number" inputMode="decimal" placeholder="0" value={editAmount} onChange={e => setEditAmount(e.target.value)} />
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flexShrink: 0 }}>Dia</span>
                <input style={{ ...inlineInput, width: 50 }} type="number" inputMode="numeric" placeholder="1" value={editDia} onChange={e => setEditDia(e.target.value)} />
                <button onClick={saveEdit} style={iconBtn('var(--color-success)')}><Check size={16} /></button>
                <button onClick={() => setEditId(null)} style={iconBtn('var(--color-text-tertiary)')}><X size={16} /></button>
              </div>
            </div>
          ) : (
            <div key={c.id} style={cardStyle}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{c.name || '(sem nome)'}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Dia {c.dia || '?'}</p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-danger)', marginRight: 4, flexShrink: 0 }}>
                R$ {Number(c.amount || 0).toLocaleString('pt-BR')}
              </span>
              <button onClick={() => startEdit(c)} style={iconBtn('var(--color-accent-primary)')}><Pencil size={14} /></button>
              <button onClick={() => remove(c.id)} style={iconBtn('var(--color-danger)')}><Trash2 size={14} /></button>
            </div>
          )
        ))}
        <button onClick={addNew} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '10px', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
          background: 'rgba(239,68,68,0.06)', color: 'var(--color-danger)',
          border: '1px dashed rgba(239,68,68,0.25)', borderRadius: 'var(--radius-card)', cursor: 'pointer',
        }}>
          <Plus size={14} /> Adicionar conta
        </button>
      </div>
      <Button variant="primary" fullWidth onClick={onNext} type="button">Confirmar</Button>
    </div>
  )
}

// ─── Passo 6: Primeiro objetivo ───────────────────────────────────────────────

function Step6({ goals, setGoals, onFinish }: { goals: GoalItem[]; setGoals: React.Dispatch<React.SetStateAction<GoalItem[]>>; onFinish: () => void }) {
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editTarget, setEditTarget] = useState('')
  const [editDeadline, setEditDeadline] = useState('')

  function startEdit(g: typeof goals[0]) {
    setEditId(g.id); setEditName(g.name); setEditTarget(g.target); setEditDeadline(g.deadline)
  }
  function saveEdit() {
    if (!editName.trim()) return
    setGoals(s => s.map(x => x.id === editId ? { ...x, name: editName.trim(), target: editTarget, deadline: editDeadline } : x))
    setEditId(null)
  }
  function addNew() {
    const id = String(Date.now())
    setGoals(s => [...s, { id, name: '', target: '', deadline: '' }])
    setEditId(id); setEditName(''); setEditTarget(''); setEditDeadline('')
  }
  function remove(id: string) {
    setGoals(s => s.filter(x => x.id !== id))
    if (editId === id) setEditId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={center}>
        <div style={iconCircle('rgba(139,92,246,0.12)')}>
          <Plane size={28} color="var(--color-accent-couple)" />
        </div>
        <h2 style={heading}>Seus objetivos</h2>
        <p style={sub}>O que vocês querem conquistar?</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {goals.map(g => (
          editId === g.id ? (
            <div key={g.id} style={{ ...cardStyle, flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
              <input style={inlineInput} placeholder="Ex: Viagem Europa" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flexShrink: 0 }}>R$</span>
                <input style={{ ...inlineInput, width: 90 }} type="number" inputMode="decimal" placeholder="0" value={editTarget} onChange={e => setEditTarget(e.target.value)} />
                <input style={{ ...inlineInput, flex: 1 }} type="month" value={editDeadline} onChange={e => setEditDeadline(e.target.value)} />
                <button onClick={saveEdit} style={iconBtn('var(--color-success)')}><Check size={16} /></button>
                <button onClick={() => setEditId(null)} style={iconBtn('var(--color-text-tertiary)')}><X size={16} /></button>
              </div>
            </div>
          ) : (
            <div key={g.id} style={{
              ...cardStyle,
              border: '1px solid rgba(139,92,246,0.25)',
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{g.name || '(sem nome)'}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>
                  R$ {Number(g.target || 0).toLocaleString('pt-BR')}
                  {g.deadline && ` · ${g.deadline.replace('-', '/')}`}
                </p>
              </div>
              <button onClick={() => startEdit(g)} style={iconBtn('var(--color-accent-primary)')}><Pencil size={14} /></button>
              <button onClick={() => remove(g.id)} style={iconBtn('var(--color-danger)')}><Trash2 size={14} /></button>
            </div>
          )
        ))}
        <button onClick={addNew} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '10px', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
          background: 'rgba(139,92,246,0.06)', color: 'var(--color-accent-couple)',
          border: '1px dashed rgba(139,92,246,0.25)', borderRadius: 'var(--radius-card)', cursor: 'pointer',
        }}>
          <Plus size={14} /> Adicionar objetivo
        </button>
      </div>
      <Button variant="couple" fullWidth onClick={onFinish} type="button">
        Vamos começar!
      </Button>
    </div>
  )
}

// ─── Onboarding orchestrator ──────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  // Lifted state — survives step navigation
  const [sources, setSources] = useState<SourceItem[]>([
    { id: '1', name: 'Salário CLT', amount: '3000' },
    { id: '2', name: 'Freelance',   amount: '1000' },
  ])
  const [contas,  setContas]  = useState<ContaItem[]>([
    { id: '1', name: 'Aluguel / Financiamento', amount: '800', dia: '10' },
    { id: '2', name: 'Internet / Telefone',      amount: '120', dia: '15' },
    { id: '3', name: 'Energia elétrica',         amount: '150', dia: '20' },
  ])
  const [goals,   setGoals]   = useState<GoalItem[]>([
    { id: '1', name: 'Fundo de emergência', target: '10000', deadline: '' },
    { id: '2', name: 'Viagem dos sonhos',   target: '5000',  deadline: '' },
  ])

  const [, navigate]       = useLocation()
  const completeOnboarding = useAppStore(s => s.completeOnboarding)
  const dirRef = useRef<1 | -1>(1)
  const { uid, displayName, email, photoURL } = useAuth()

  const totalSteps = 6
  function goNext() { dirRef.current = 1; setStep(s => s + 1) }
  function goBack() { dirRef.current = -1; setStep(s => s - 1) }

  function handleFinish() {
    const userId = uid ?? `user-${Date.now()}`
    const user: User = {
      id: userId,
      name: name || displayName || 'Usuário',
      email: email ?? '',
      avatar: photoURL ?? undefined,
      partnerCode: Date.now().toString(36).slice(-4).toUpperCase(),
    }
    const incomeSources = sources
      .filter(s => s.name.trim())
      .map(s => ({
        userId,
        name: s.name.trim(),
        type: 'fixed' as const,
        expectedAmount: parseFloat(s.amount) || 0,
      }))
    const saidasFixas = contas
      .filter(c => c.name.trim())
      .map(c => ({
        userId,
        name: c.name.trim(),
        amount: parseFloat(c.amount) || 0,
        dueDay: parseInt(c.dia) || 1,
        paymentMethod: 'auto_debit' as const,
        divisaoId: 'cx-essencial',
        autoDebit: false,
        category: 'Conta fixa',
      }))
    const objetivos = goals
      .filter(g => g.name.trim())
      .map(g => ({
        userId,
        name: g.name.trim(),
        emoji: '🎯',
        targetAmount: parseFloat(g.target) || 0,
        targetDate: g.deadline || undefined,
      }))
    completeOnboarding(user, { incomeSources, saidasFixas, objetivos })

    // Save to Firestore IMMEDIATELY — do not rely on the 3s debounce.
    // If the page reloads before debounce fires, the migration would find
    // Firestore empty and trigger a false reset (double onboarding bug).
    if (uid) {
      const finalState = useAppStore.getState()
      import('../lib/firestoreService').then(({ saveStateToFirestore }) => {
        saveStateToFirestore(uid, finalState as import('../types').AppState)
          .then(() => {
            localStorage.setItem('somus-firebase-migrated', uid)
          })
          .catch(() => {}) // Firestore write will be retried by debounced save
      })
    }

    navigate('/home')
  }

  const steps = [
    <Step1 key={0} name={name} setName={setName} onNext={goNext} />,
    <Step2 key={1} onNext={goNext} onSkip={goNext} />,
    <Step3 key={2} sources={sources} setSources={setSources} onNext={goNext} />,
    <Step4 key={3} onNext={goNext} />,
    <Step5 key={4} contas={contas} setContas={setContas} onNext={goNext} />,
    <Step6 key={5} goals={goals} setGoals={setGoals} onFinish={handleFinish} />,
  ]

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
      background: 'var(--color-bg-primary)',
    }}>
      {/* Barra de progresso do wizard */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 4, borderRadius: 99,
              width: i === step ? 32 : 8,
              background: i <= step ? 'var(--color-accent-primary)' : 'var(--color-bg-tertiary)',
              transition: 'all 300ms ease',
            }}
          />
        ))}
      </div>

      {/* Conteúdo do step */}
      <div style={{ width: '100%', maxWidth: 384 }}>
        <AnimatePresence mode="wait" custom={dirRef.current}>
          <motion.div
            key={step}
            custom={dirRef.current}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 60 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -60 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back btn */}
      {step > 0 && (
        <button
          onClick={goBack}
          style={{
            marginTop: 24, fontSize: 14, fontWeight: 500,
            color: 'var(--color-text-secondary)',
            cursor: 'pointer', background: 'none',
            border: 'none', fontFamily: 'var(--font-sans)',
            padding: '8px 20px', borderRadius: 'var(--radius-button)',
            transition: 'color 150ms ease',
          }}
        >
          ← Voltar
        </button>
      )}
    </div>
  )
}
