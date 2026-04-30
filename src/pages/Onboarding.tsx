import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import { useAppStore } from '../stores/useAppStore'
import { Button, Input } from '../components/ui'
import type { User } from '../types'
import {
  Hand,
  Users,
  Wallet,
  Receipt,
  Plane,
  DollarSign,
  HandHeart,
  Shield,
  Target,
  Home,
  BookOpen,
  Sparkles,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={center}>
        <div style={iconCircle('rgba(59,130,246,0.12)')}>
          <Hand size={28} color="var(--color-accent-primary)" />
        </div>
        <h2 style={heading}>Bem-vindo ao Somus</h2>
        <p style={sub}>Finanças do casal, simplificadas.</p>
      </div>
      <Input label="Seu nome" placeholder="Ex: Lucas Pires" value={name} onChange={e => setName(e.target.value)} />
      <Button variant="primary" fullWidth disabled={!name.trim()} onClick={onNext}>Continuar</Button>
    </div>
  )
}

// ─── Passo 2: Parceiro ────────────────────────────────────────────────────────

function Step2({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={center}>
        <div style={iconCircle('rgba(139,92,246,0.12)')}>
          <Users size={28} color="var(--color-accent-couple)" />
        </div>
        <h2 style={heading}>Convidar parceiro(a)</h2>
        <p style={sub}>Conecte sua conta para uma visão financeira compartilhada.</p>
      </div>
      <div style={{
        background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)', padding: 16, textAlign: 'center',
      }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '0 0 4px' }}>Seu código de convite</p>
        <p style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-accent-couple)', margin: 0 }}>SOMUS-0001</p>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '8px 0 0' }}>Compartilhe este código com seu parceiro(a)</p>
      </div>
      <Button variant="couple" fullWidth onClick={onNext}>Continuar</Button>
      <button onClick={onSkip} style={{
        fontSize: 14, color: 'var(--color-text-tertiary)', cursor: 'pointer',
        textDecoration: 'underline', textAlign: 'center', background: 'none', border: 'none',
        fontFamily: 'var(--font-sans)',
      }}>
        Fazer solo por enquanto
      </button>
    </div>
  )
}

// ─── Passo 3: Fontes de renda ─────────────────────────────────────────────────

function Step3({ onNext }: { onNext: () => void }) {
  const sources = [
    { name: 'Lidtek — Salário', type: 'Variável', amount: 'R$ 5.000' },
    { name: 'Lidtek — Lucro',   type: 'Variável', amount: 'R$ 2.000' },
    { name: 'Glide',            type: 'Variável', amount: 'R$ 1.500' },
    { name: 'Mentorias',        type: 'Variável', amount: 'R$ 700'   },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={center}>
        <div style={iconCircle('rgba(16,185,129,0.12)')}>
          <DollarSign size={28} color="var(--color-success)" />
        </div>
        <h2 style={heading}>Fontes de renda</h2>
        <p style={sub}>Suas fontes pré-configuradas (você pode editar depois)</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sources.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)', padding: '12px 16px',
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{s.name}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>{s.type}</p>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-lucas)', margin: 0 }}>~{s.amount}</p>
          </div>
        ))}
      </div>
      <Button variant="lucas" fullWidth onClick={onNext}>Ficou bom!</Button>
    </div>
  )
}

// ─── Passo 4: Caixinhas ───────────────────────────────────────────────────────

function Step4({ onNext }: { onNext: () => void }) {
  const caixinhas = [
    { icon: HandHeart, name: 'Dízimo',              pct: 10, color: '#F59E0B' },
    { icon: Shield,    name: 'Reserva Emergência',  pct: 8,  color: '#10B981' },
    { icon: Target,    name: 'Objetivos',            pct: 20, color: '#8B5CF6' },
    { icon: Home,      name: 'Essencial',            pct: 55, color: '#3B82F6' },
    { icon: BookOpen,  name: 'Educação',             pct: 5,  color: '#06B6D4' },
    { icon: Sparkles,  name: 'Livre',                pct: 2,  color: '#EC4899' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={center}>
        <div style={iconCircle('rgba(59,130,246,0.12)')}>
          <Wallet size={28} color="var(--color-accent-primary)" />
        </div>
        <h2 style={heading}>Suas caixinhas</h2>
        <p style={sub}>Método Nati Arcuri — adaptado para você</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {caixinhas.map((cx, i) => {
          const IconComp = cx.icon
          return (
            <div key={i} style={{
              background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-card)', padding: 12,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: `${cx.color}15`,
              }}>
                <IconComp size={16} style={{ color: cx.color }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cx.name}</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-accent-primary)', margin: 0 }}>{cx.pct}%</p>
              </div>
            </div>
          )
        })}
      </div>
      <Button variant="primary" fullWidth onClick={onNext}>Adorei!</Button>
    </div>
  )
}

// ─── Passo 5: Saídas fixas ────────────────────────────────────────────────────

function Step5({ onNext }: { onNext: () => void }) {
  const contas = [
    { name: 'Aluguel', amount: 'R$ 601', dia: 10 },
    { name: 'Claro',   amount: 'R$ 175', dia: 15 },
    { name: 'Enel',    amount: 'R$ ~200', dia: 20 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={center}>
        <div style={iconCircle('rgba(239,68,68,0.12)')}>
          <Receipt size={28} color="var(--color-danger)" />
        </div>
        <h2 style={heading}>Saídas fixas</h2>
        <p style={sub}>Contas recorrentes pré-cadastradas</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {contas.map((c, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)', padding: '12px 16px',
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{c.name}</p>
              <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: 0 }}>Dia {c.dia}</p>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-danger)', margin: 0 }}>{c.amount}</p>
          </div>
        ))}
      </div>
      <Button variant="primary" fullWidth onClick={onNext}>Confirmar</Button>
    </div>
  )
}

// ─── Passo 6: Primeiro objetivo ───────────────────────────────────────────────

function Step6({ onFinish }: { onFinish: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={center}>
        <div style={iconCircle('rgba(139,92,246,0.12)')}>
          <Plane size={28} color="var(--color-accent-couple)" />
        </div>
        <h2 style={heading}>Seu primeiro objetivo</h2>
        <p style={sub}>Viagem Europa — R$ 15.000 — Jun/2027</p>
      </div>
      <div style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid rgba(139,92,246,0.25)',
        borderRadius: 'var(--radius-card)', padding: 20, textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: 'rgba(139,92,246,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
        }}>
          <Plane size={24} color="var(--color-accent-couple)" />
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Viagem Europa</p>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>Meta: R$ 15.000</p>
        <div style={{ marginTop: 12, height: 6, background: 'var(--color-bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '20.8%', borderRadius: 4, background: 'var(--color-accent-couple)' }} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '6px 0 0' }}>R$ 3.120 de R$ 15.000 — 20,8%</p>
      </div>
      <Button variant="couple" fullWidth onClick={onFinish}>
        Vamos começar!
      </Button>
    </div>
  )
}

// ─── Onboarding orchestrator ──────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [, navigate]    = useLocation()
  const completeOnboarding = useAppStore(s => s.completeOnboarding)

  const totalSteps = 6

  function handleFinish() {
    const user: User = {
      id: 'lucas',
      name: name || 'Lucas',
      email: 'lucas@lidtek.com.br',
      context: 'lucas',
      partnerCode: 'SOMUS-0001',
    }
    completeOnboarding(user)
    navigate('/home')
  }

  const steps = [
    <Step1 key={0} name={name} setName={setName} onNext={() => setStep(1)} />,
    <Step2 key={1} onNext={() => setStep(2)} onSkip={() => setStep(2)} />,
    <Step3 key={2} onNext={() => setStep(3)} />,
    <Step4 key={3} onNext={() => setStep(4)} />,
    <Step5 key={4} onNext={() => setStep(5)} />,
    <Step6 key={5} onFinish={handleFinish} />,
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
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back btn */}
      {step > 0 && (
        <button
          onClick={() => setStep(s => s - 1)}
          style={{
            marginTop: 24, fontSize: 12, color: 'var(--color-text-tertiary)',
            cursor: 'pointer', textDecoration: 'underline', background: 'none',
            border: 'none', fontFamily: 'var(--font-sans)',
          }}
        >
          Voltar
        </button>
      )}
    </div>
  )
}
