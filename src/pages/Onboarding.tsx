import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import { useAppStore } from '../stores/useAppStore'
import { useAuth } from '../hooks/useAuth'
import { useImageUpload } from '../hooks/useImageUpload'
import SomusLogo from '../components/ui/SomusLogo'
import type { User } from '../types'
import { getDivisaoIcon } from '../lib/icons'
import {
  Layout, PiggyBank, Eye, Target, TrendingUp, Leaf,
  Camera, Heart, Share2, Check, Loader2,
} from 'lucide-react'

// ─── Shared styles ────────────────────────────────────────────────────────────

const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center' }
const btn = (bg: string, color = '#fff'): React.CSSProperties => ({
  width: '100%', padding: '14px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
  background: bg, color, fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)',
  transition: 'opacity 150ms ease',
})
const ghostBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 14, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-sans)',
  padding: '10px 0',
}

// ─── Step 1: Welcome ──────────────────────────────────────────────────────────

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ ...col, gap: 0, minHeight: '100%', justifyContent: 'center', padding: '40px 0' }}>
      {/* Atmospheric glow layers */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
          animation: 'onb-breathe 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)',
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          animation: 'onb-breathe 3s ease-in-out infinite 0.5s',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 32, animation: 'onb-logo-breathe 3s ease-in-out infinite', position: 'relative', zIndex: 1 }}
      >
        <SomusLogo size={72} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{
          fontSize: 28, fontWeight: 700, textAlign: 'center', lineHeight: 1.3,
          color: 'var(--color-text-primary)', margin: '0 0 12px', position: 'relative', zIndex: 1,
        }}
      >
        Sua vida financeira,<br />mais clara e organizada.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        style={{
          fontSize: 15, textAlign: 'center', lineHeight: 1.6,
          color: 'var(--color-text-secondary)', margin: '0 0 48px', position: 'relative', zIndex: 1,
        }}
      >
        A Somus ajuda você a construir<br />uma organização financeira mais leve.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        style={{ width: '100%', position: 'relative', zIndex: 1 }}
      >
        <button onClick={onNext} style={btn('var(--color-accent-primary)')}>Começar</button>
      </motion.div>

      <style>{`
        @keyframes onb-breathe {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
          50% { transform: translateX(-50%) scale(1.3); opacity: 0.7; }
        }
        @keyframes onb-logo-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes onb-spin { to { transform: rotate(360deg); } }
        @keyframes onb-pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          50% { box-shadow: 0 0 0 14px rgba(59,130,246,0); }
        }
        @keyframes onb-dual-approach {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-12px); }
        }
        @keyframes onb-dual-approach-r {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(12px); }
        }
        @keyframes onb-bar-breathe {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.78; }
        }
      `}</style>
    </div>
  )
}

// ─── Step 2: Seu Espaço ───────────────────────────────────────────────────────

function Step2({
  name, setName, avatar, setAvatar, onNext,
}: {
  name: string; setName: (v: string) => void
  avatar: string; setAvatar: (v: string) => void
  onNext: () => void
}) {
  const { upload, isProcessing } = useImageUpload()
  const [confirmed, setConfirmed] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await upload(file)
    if (result) setAvatar(result.dataUrl)
  }

  function handleNext() {
    setConfirmed(true)
    setTimeout(onNext, 450)
  }

  const initials = name.trim().charAt(0).toUpperCase() || '?'
  const isGooglePhoto = avatar.startsWith('https://')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Avatar */}
      <div style={{ ...col, gap: 12 }}>
        <div
          style={{
            width: 88, height: 88, borderRadius: '50%',
            background: avatar ? 'transparent' : 'var(--color-accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 700, color: '#fff', position: 'relative',
            overflow: 'hidden',
            animation: confirmed ? 'onb-pulse-glow 0.4s ease-out' : undefined,
            transition: 'box-shadow 300ms ease',
          }}
        >
          {isProcessing
            ? <Loader2 size={28} style={{ animation: 'onb-spin 0.8s linear infinite' }} />
            : avatar
              ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials
          }
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{ ...ghostBtn, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
        >
          <Camera size={14} />
          {isGooglePhoto ? 'Foto do Google · Trocar' : avatar ? 'Trocar foto' : 'Adicionar foto'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Como você gostaria de ser chamado(a)?
        </label>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Lucas, Ana, Duda..."
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) handleNext() }}
          style={{
            background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
            borderRadius: 12, padding: '14px 16px', fontSize: 16,
            color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)',
            outline: 'none', width: '100%', boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={handleNext}
        disabled={!name.trim()}
        style={{
          ...btn(name.trim() ? 'var(--color-accent-primary)' : 'var(--color-bg-tertiary)',
            name.trim() ? '#fff' : 'var(--color-text-tertiary)'),
          cursor: name.trim() ? 'pointer' : 'default',
        }}
      >
        Continuar
      </button>
    </div>
  )
}

// ─── Step 3: Objetivo Principal ───────────────────────────────────────────────

const GOALS = [
  { id: 'organizacao',  label: 'Mais organização',     Icon: Layout    },
  { id: 'economizar',   label: 'Economizar',            Icon: PiggyBank },
  { id: 'clareza',      label: 'Ter mais clareza',      Icon: Eye       },
  { id: 'objetivos',    label: 'Planejar objetivos',    Icon: Target    },
  { id: 'patrimonio',   label: 'Construir patrimônio',  Icon: TrendingUp},
  { id: 'dividas',      label: 'Sair das dívidas',      Icon: Leaf      },
]

function Step3({ goal, setGoal, onNext }: { goal: string; setGoal: (v: string) => void; onNext: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px', lineHeight: 1.3 }}>
          O que você gostaria de<br />construir daqui pra frente?
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)', margin: 0 }}>
          Sem compromisso — você pode mudar isso a qualquer hora.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {GOALS.map(({ id, label, Icon }, i) => {
          const active = goal === id
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => setGoal(id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 10,
                padding: '18px 12px', borderRadius: 16, cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600,
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                background: active ? 'rgba(59,130,246,0.08)' : 'var(--color-bg-secondary)',
                border: `1.5px solid ${active ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                boxShadow: active ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
                transform: active ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 200ms ease',
                textAlign: 'center',
              }}
            >
              <Icon size={22} color={active ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)'} />
              {label}
            </motion.button>
          )
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!goal}
        style={{
          ...btn(goal ? 'var(--color-accent-primary)' : 'var(--color-bg-tertiary)',
            goal ? '#fff' : 'var(--color-text-tertiary)'),
          cursor: goal ? 'pointer' : 'default',
        }}
      >
        Continuar
      </button>
    </div>
  )
}

// ─── Step 4: Método Somus ─────────────────────────────────────────────────────

const DIVISOES_SHOW = [
  { id: 'cx-essencial', pct: 55 },
  { id: 'cx-objetivos', pct: 20 },
  { id: 'cx-reserva',   pct: 10 },
  { id: 'cx-educacao',  pct: 5  },
]

function Step4({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px', lineHeight: 1.3 }}>
          Seu dinheiro organizado<br />de forma simples.
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DIVISOES_SHOW.map(({ id, pct }, i) => {
          const { Icon, color } = getDivisaoIcon(id)
          const names: Record<string, string> = {
            'cx-essencial': 'Essencial',
            'cx-objetivos': 'Objetivos',
            'cx-reserva':   'Liberdade Financeira',
            'cx-educacao':  'Educação',
          }
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.12, duration: 0.4 }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14, padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {names[id]}
                </span>
                <span style={{
                  fontSize: 16, fontWeight: 700, color,
                  background: `${color}15`, padding: '2px 10px', borderRadius: 8,
                }}>
                  {pct}%
                </span>
              </div>
              {/* Animated bar */}
              <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    height: '100%', borderRadius: 99, background: color,
                    animation: 'onb-bar-breathe 3s ease-in-out infinite',
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      <p style={{ fontSize: 14, textAlign: 'center', color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: 0 }}>
        A Somus ajuda você a visualizar,<br />organizar e construir com mais equilíbrio.
      </p>

      <button onClick={onNext} style={btn('var(--color-accent-primary)')}>
        Entendi, vamos lá!
      </button>
    </div>
  )
}

// ─── Step 5: Conexão Compartilhada ────────────────────────────────────────────

function Step5({ partnerCode, onFinish }: { partnerCode: string; onFinish: () => void }) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const text = `Vem construir comigo no Somus!\nhttps://somus.vercel.app/convite/${partnerCode}`
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center' }}>
      {/* Dual glow visual */}
      <div style={{ position: 'relative', width: 120, height: 64 }}>
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: 64, height: 64, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 70%)',
          animation: 'onb-dual-approach 3s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 64, height: 64, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
          animation: 'onb-dual-approach-r 3s ease-in-out infinite',
        }} />
        {/* Connection line + heart */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 120 64">
          <path d="M 32 32 Q 60 16 88 32" stroke="rgba(139,92,246,0.2)" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
        </svg>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4, type: 'spring' }}
          style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <Heart size={16} color="#8B5CF6" fill="#8B5CF6" />
        </motion.div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 12px', lineHeight: 1.3 }}>
          E se tudo isso pudesse ser<br />construído junto com alguém?
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Cada pessoa mantém seu próprio espaço,<br />
          mas vocês também podem compartilhar objetivos,<br />
          planejamento e construção financeira.
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={handleShare}
          style={btn('linear-gradient(135deg, #7C3AED, #8B5CF6)')}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? 'Link copiado!' : 'Convidar parceiro(a)'}
          </span>
        </button>
        <button onClick={onFinish} style={ghostBtn}>
          Fazer isso depois
        </button>
      </div>
    </div>
  )
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep]   = useState(0)
  const [name, setName]   = useState('')
  const [avatar, setAvatar] = useState('')
  const [goal, setGoal]   = useState('')
  const dirRef = useRef<1 | -1>(1)

  const [, navigate]       = useLocation()
  const completeOnboarding = useAppStore(s => s.completeOnboarding)
  const { uid, displayName, email, photoURL } = useAuth()

  // Auto-popula com os dados do Google assim que disponíveis
  useEffect(() => {
    if (photoURL && !avatar) setAvatar(photoURL)
  }, [photoURL])       // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (displayName && !name) setName(displayName.split(' ')[0])
  }, [displayName])    // eslint-disable-line react-hooks/exhaustive-deps

  const totalSteps = 5

  function goNext() { dirRef.current = 1;  setStep(s => Math.min(s + 1, totalSteps - 1)) }
  function goBack() { dirRef.current = -1; setStep(s => Math.max(s - 1, 0)) }

  function handleFinish() {
    const userId = uid ?? `user-${Date.now()}`
    const partnerCode = Date.now().toString(36).slice(-4).toUpperCase()

    const user: User = {
      id: userId,
      name: name || displayName || 'Usuário',
      email: email ?? '',
      avatar: avatar || photoURL || undefined,
      partnerCode,
      goal: goal || undefined,
    }

    completeOnboarding(user, { incomeSources: [], saidasFixas: [], objetivos: [] })

    if (uid) {
      import('../lib/firestoreService').then(({ saveStateToFirestore }) => {
        saveStateToFirestore(uid, useAppStore.getState() as import('../types').AppState)
          .then(() => localStorage.setItem('somus-firebase-migrated', uid))
          .catch(() => {})
      })
    }

    navigate('/home')
  }

  const partnerCode = Date.now().toString(36).slice(-4).toUpperCase()

  const steps = [
    <Step1 key={0} onNext={goNext} />,
    <Step2 key={1} name={name} setName={setName} avatar={avatar} setAvatar={setAvatar} onNext={goNext} />,
    <Step3 key={2} goal={goal} setGoal={setGoal} onNext={goNext} />,
    <Step4 key={3} onNext={goNext} />,
    <Step5 key={4} partnerCode={partnerCode} onFinish={handleFinish} />,
  ]

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 24px 40px',
      background: 'var(--color-bg-primary)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Progress dots */}
      {step > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, alignSelf: 'center' }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 99,
              width: i === step ? 28 : 6,
              background: i < step
                ? 'var(--color-accent-primary)'
                : i === step
                  ? 'var(--color-accent-primary)'
                  : 'rgba(255,255,255,0.12)',
              transition: 'all 300ms ease',
            }} />
          ))}
        </div>
      )}

      {/* Step content */}
      <div style={{ width: '100%', maxWidth: 400 }}>
        <AnimatePresence mode="wait" custom={dirRef.current}>
          <motion.div
            key={step}
            custom={dirRef.current}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 48 }),
              center: { opacity: 1, x: 0 },
              exit:  (d: number) => ({ opacity: 0, x: d * -48 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back button */}
      {step > 0 && (
        <button
          onClick={goBack}
          style={{ ...ghostBtn, marginTop: 20, fontSize: 14 }}
        >
          ← Voltar
        </button>
      )}
    </div>
  )
}
