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

// ─── Passo 1: Identidade ──────────────────────────────────────────────────────

function Step1({ name, setName, onNext }: { name: string; setName: (v: string) => void; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(59,130,246,0.12)] flex items-center justify-center mb-4">
          <Hand size={28} className="text-[var(--color-accent)]" />
        </div>
        <h2 className="text-2xl font-extrabold text-center text-[var(--color-text-primary)]">Bem-vindo ao Somus</h2>
        <p className="text-sm text-center text-[var(--color-text-secondary)] mt-2">Finanças do casal, simplificadas.</p>
      </div>
      <Input label="Seu nome" placeholder="Ex: Lucas Pires" value={name} onChange={e => setName(e.target.value)} />
      <Button variant="primary" fullWidth disabled={!name.trim()} onClick={onNext}>Continuar</Button>
    </div>
  )
}

// ─── Passo 2: Parceiro ────────────────────────────────────────────────────────

function Step2({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(139,92,246,0.12)] flex items-center justify-center mb-4">
          <Users size={28} className="text-[var(--color-accent-couple)]" />
        </div>
        <h2 className="text-2xl font-extrabold text-center text-[var(--color-text-primary)]">Convidar parceiro(a)</h2>
        <p className="text-sm text-center text-[var(--color-text-secondary)] mt-2">
          Conecte sua conta para uma visão financeira compartilhada.
        </p>
      </div>
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border-strong)] rounded-[var(--radius-lg)] p-4 text-center">
        <p className="text-xs text-[var(--color-text-tertiary)] mb-1">Seu código de convite</p>
        <p className="text-xl font-mono font-bold text-[var(--color-accent-couple)]">SOMUS-0001</p>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-2">Compartilhe este código com seu parceiro(a)</p>
      </div>
      <Button variant="couple" fullWidth onClick={onNext}>Continuar</Button>
      <button onClick={onSkip} className="text-sm text-[var(--color-text-tertiary)] cursor-pointer underline text-center">
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.12)] flex items-center justify-center mb-4">
          <DollarSign size={28} className="text-[var(--color-success)]" />
        </div>
        <h2 className="text-2xl font-extrabold text-center text-[var(--color-text-primary)]">Fontes de renda</h2>
        <p className="text-sm text-center text-[var(--color-text-secondary)] mt-2">Suas fontes pré-configuradas (você pode editar depois)</p>
      </div>
      <div className="flex flex-col gap-2">
        {sources.map((s, i) => (
          <div key={i} className="flex items-center justify-between bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{s.name}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">{s.type}</p>
            </div>
            <p className="text-sm font-bold text-[var(--color-accent-lucas)]">~{s.amount}</p>
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(59,130,246,0.12)] flex items-center justify-center mb-4">
          <Wallet size={28} className="text-[var(--color-accent)]" />
        </div>
        <h2 className="text-2xl font-extrabold text-center text-[var(--color-text-primary)]">Suas caixinhas</h2>
        <p className="text-sm text-center text-[var(--color-text-secondary)] mt-2">Método Nati Arcuri — adaptado para você</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {caixinhas.map((cx, i) => {
          const IconComp = cx.icon
          return (
            <div key={i} className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-3 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                style={{ background: `${cx.color}15` }}>
                <IconComp size={16} style={{ color: cx.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">{cx.name}</p>
                <p className="text-lg font-extrabold text-[var(--color-accent)]">{cx.pct}%</p>
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(239,68,68,0.12)] flex items-center justify-center mb-4">
          <Receipt size={28} className="text-[var(--color-danger)]" />
        </div>
        <h2 className="text-2xl font-extrabold text-center text-[var(--color-text-primary)]">Saídas fixas</h2>
        <p className="text-sm text-center text-[var(--color-text-secondary)] mt-2">Contas recorrentes pré-cadastradas</p>
      </div>
      <div className="flex flex-col gap-2">
        {contas.map((c, i) => (
          <div key={i} className="flex items-center justify-between bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-md)] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{c.name}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">Dia {c.dia}</p>
            </div>
            <p className="text-sm font-bold text-[var(--color-danger)]">{c.amount}</p>
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
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[rgba(139,92,246,0.12)] flex items-center justify-center mb-4">
          <Plane size={28} className="text-[var(--color-accent-couple)]" />
        </div>
        <h2 className="text-2xl font-extrabold text-center text-[var(--color-text-primary)]">Seu primeiro objetivo</h2>
        <p className="text-sm text-center text-[var(--color-text-secondary)] mt-2">Viagem Europa — R$ 15.000 — Jun/2027</p>
      </div>
      <div className="bg-gradient-to-br from-[rgba(139,92,246,0.15)] to-[rgba(59,130,246,0.15)] border border-[rgba(139,92,246,0.25)] rounded-[var(--radius-xl)] p-5 text-center">
        <div className="w-14 h-14 rounded-full bg-[rgba(139,92,246,0.15)] flex items-center justify-center mx-auto mb-3">
          <Plane size={24} className="text-[var(--color-accent-couple)]" />
        </div>
        <p className="text-xl font-bold text-white">Viagem Europa</p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Meta: R$ 15.000</p>
        <div className="mt-3 h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
          <div className="h-full w-[20.8%] rounded-full bg-gradient-to-r from-[var(--color-accent-lucas)] to-[var(--color-accent-couple)]" />
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1.5">R$ 3.120 de R$ 15.000 — 20,8%</p>
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
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 bg-[var(--color-bg-primary)]">
      {/* Barra de progresso do wizard */}
      <div className="flex gap-1.5 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-400"
            style={{
              width: i === step ? '2rem' : '0.5rem',
              background: i <= step ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
            }}
          />
        ))}
      </div>

      {/* Conteúdo do step */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back btn */}
      {step > 0 && (
        <button
          onClick={() => setStep(s => s - 1)}
          className="mt-6 text-xs text-[var(--color-text-tertiary)] cursor-pointer underline"
        >
          Voltar
        </button>
      )}
    </div>
  )
}
