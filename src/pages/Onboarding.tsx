import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'wouter'
import { useAppStore } from '../stores/useAppStore'
import { useAuth } from '../hooks/useAuth'
import { useImageUpload } from '../hooks/useImageUpload'
import SomusLogo from '../components/ui/SomusLogo'
import { QRCodeSVG } from 'qrcode.react'
import type { User } from '../types'
import { getDivisaoIcon } from '../lib/icons'
import {
  Layout, PiggyBank, Eye, Target, TrendingUp, Leaf,
  Camera, Heart, Share2, Check, Loader2,
} from 'lucide-react'

// ─── Shared styles ────────────────────────────────────────────────────────────

const col: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center' }

// Premium solid button — sem gradient, iluminação atmosférica
const primaryBtn = (active = true): React.CSSProperties => ({
  width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', cursor: active ? 'pointer' : 'default',
  background: active ? '#2563EB' : 'rgba(255,255,255,0.06)',
  color: active ? '#fff' : 'rgba(255,255,255,0.3)',
  fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)',
  boxShadow: active
    ? '0 10px 30px rgba(37,99,235,0.22), inset 0 1px 0 rgba(255,255,255,0.12)'
    : 'none',
  transition: 'all 200ms ease',
  letterSpacing: '0.01em',
})
const coupleBtn = (): React.CSSProperties => ({
  width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', cursor: 'pointer',
  background: '#6D28D9',
  color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)',
  boxShadow: '0 10px 30px rgba(109,40,217,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
  transition: 'all 200ms ease',
  letterSpacing: '0.01em',
})
const ghostBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 14, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-sans)',
  padding: '10px 0', letterSpacing: '0.01em',
}

// ─── Step 1: Welcome ──────────────────────────────────────────────────────────

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div style={{ ...col, gap: 0, minHeight: '100%', justifyContent: 'center', padding: '40px 0' }}>
      {/* Atmospheric glow layers — cinematográfico */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Outer ambient — enorme e suave */}
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 60%)',
          animation: 'onb-breathe 5s ease-in-out infinite',
        }} />
        {/* Inner core — mais concentrado */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.28) 0%, transparent 65%)',
          animation: 'onb-breathe 3.5s ease-in-out infinite 0.8s',
        }} />
        {/* Subtle purple accent — profundidade */}
        <div style={{
          position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(109,40,217,0.10) 0%, transparent 70%)',
          animation: 'onb-breathe 6s ease-in-out infinite 1.2s',
        }} />
      </div>

      {/* R-08: Atmospheric blur depth layer */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        background: 'rgba(8,17,32,0.25)',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, transparent 40%, black 80%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, transparent 40%, black 80%)',
      }} />

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
        <button onClick={onNext} style={primaryBtn()}>Começar</button>
      </motion.div>

      <style>{`
        @keyframes onb-breathe {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 1; }
          50% { transform: translateX(-50%) scale(1.18); opacity: 0.75; }
        }
        @keyframes onb-logo-breathe {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(37,99,235,0.3)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 24px rgba(37,99,235,0.55)); }
        }
        @keyframes onb-spin { to { transform: rotate(360deg); } }
        @keyframes onb-pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          50% { box-shadow: 0 0 0 14px rgba(59,130,246,0); }
        }
        @keyframes onb-dual-approach {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-14px); }
        }
        @keyframes onb-dual-approach-r {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(14px); }
        }
        @keyframes onb-bar-breathe {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.75; }
        }
        @keyframes onb-dot-breathe {
          0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.5); }
          50% { box-shadow: 0 0 0 4px rgba(37,99,235,0); }
        }
        @keyframes onb-bar-glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.25); }
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
        style={primaryBtn(!!name.trim())}
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
                color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                background: active
                  ? 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.04) 100%)'
                  : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${active ? 'rgba(59,130,246,0.65)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: active
                  ? '0 0 0 4px rgba(59,130,246,0.1), inset 0 0 24px rgba(59,130,246,0.05)'
                  : 'none',
                transform: active ? 'scale(1.03)' : 'scale(1)',
                transition: 'all 220ms cubic-bezier(0.34,1.2,0.64,1)',
                textAlign: 'center',
              }}
            >
              <Icon
                size={22}
                style={{
                  color: active ? '#60A5FA' : 'rgba(255,255,255,0.3)',
                  transform: active ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 220ms cubic-bezier(0.34,1.2,0.64,1)',
                }}
              />
              {label}
            </motion.button>
          )
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!goal}
        style={primaryBtn(!!goal)}
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
  { id: 'cx-dizimo',    pct: 10 },
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
            'cx-dizimo':    'Dízimo',
            'cx-educacao':  'Educação',
          }
          const descs: Record<string, string> = {
            'cx-essencial': 'O que sustenta sua rotina.',
            'cx-objetivos': 'O que você quer construir.',
            'cx-reserva':   'Seu futuro com mais tranquilidade.',
            'cx-dizimo':    'Generosidade e propósito.',
            'cx-educacao':  'Crescimento contínuo.',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', display: 'block', marginBottom: 1 }}>
                    {names[id]}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontWeight: 400 }}>
                    {descs[id]}
                  </span>
                </div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + i * 0.14, duration: 0.5 }}
                  style={{ fontSize: 15, fontWeight: 700, color,
                    background: `${color}18`, padding: '2px 10px', borderRadius: 8, flexShrink: 0 }}
                >
                  {pct}%
                </motion.span>
              </div>
              {/* Animated bar with glow */}
              <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.45 + i * 0.14, duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    height: '100%', borderRadius: 99,
                    background: color,
                    boxShadow: `0 0 8px ${color}80`,
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

      <button onClick={onNext} style={primaryBtn()}>Entendi, vamos lá!</button>
    </div>
  )
}

// ─── Step 5: Conexão Compartilhada (3 sub-telas) ─────────────────────────────

function Step5({ partnerCode, onFinish, onBack: _onBack }: { partnerCode: string; onFinish: () => void; onBack: () => void }) {
  const [subStep, setSubStep] = useState<0 | 1 | 2>(0)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [laterMsg, setLaterMsg] = useState(false)

  const inviteLink = `https://somus.vercel.app/convite/${partnerCode}`
  const inviteText = `Vem construir comigo no Somus!\n${inviteLink}`

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: 'Somus', text: inviteText })
        .then(() => setSubStep(2))   // B2-FIX: só avança se o share foi concluído
        .catch(() => {})             // cancelou — fica na 5B
    } else {
      navigator.clipboard.writeText(inviteText).then(() => {
        setCopied(true)
        setTimeout(() => { setCopied(false); setSubStep(2) }, 1800)
      })
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteText).then(() => {
      setCopied(true)
      setTimeout(() => { setCopied(false); setSubStep(2) }, 1800)
    })
  }

  function handleLater() {
    setLaterMsg(true)
    setTimeout(onFinish, 1900)
  }

  // ── Dual glow visual ──────────────────────────────────────────────────────
  const DualGlow = () => (
    <div style={{ position: 'relative', width: 140, height: 80, flexShrink: 0 }}>
      <div style={{
        position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
        width: 180, height: 120, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(109,40,217,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 72, height: 72, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.45) 0%, transparent 70%)',
        animation: 'onb-dual-approach 3.5s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 72, height: 72, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(109,40,217,0.45) 0%, transparent 70%)',
        animation: 'onb-dual-approach-r 3.5s ease-in-out infinite',
      }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 140 80">
        <path d="M 36 40 Q 70 18 104 40" stroke="rgba(139,92,246,0.18)" strokeWidth="1" fill="none" strokeDasharray="5 4" />
      </svg>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <Heart size={16} color="#A78BFA" fill="#A78BFA" />
      </motion.div>
    </div>
  )

  // ── QR Code modal overlay ─────────────────────────────────────────────────
  if (showQR) return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: 0, textAlign: 'center' }}>
        Escaneie para construir junto
      </h2>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 20,
        boxShadow: '0 0 40px rgba(109,40,217,0.2)',
      }}>
        <QRCodeSVG value={inviteLink} size={180} />
      </div>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0, textAlign: 'center' }}>
        {inviteLink}
      </p>
      <button onClick={() => { setShowQR(false); setSubStep(2) }} style={coupleBtn()}>
        Feito
      </button>
      <button onClick={() => setShowQR(false)} style={{ ...ghostBtn, marginTop: 4 }}>← Voltar
      </button>
    </motion.div>
  )

  // ── Sub-tela 5C — Confirmação ─────────────────────────────────────────────
  if (subStep === 2) return (
    <motion.div
      key="step5c"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}
    >
      <DualGlow />
      <div style={{ textAlign: 'center' }}>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.95)', margin: '0 0 12px', lineHeight: 1.3 }}
        >
          Seu espaço compartilhado<br />está pronto para começar.
        </motion.h2>
      </div>
      <button onClick={onFinish} style={coupleBtn()}>Entrar na Somus</button>
    </motion.div>
  )

  // ── Sub-tela 5B — Compartilhar ────────────────────────────────────────────
  if (subStep === 1) return (
    <motion.div
      key="step5b"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.32 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
    >
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <DualGlow />
      </motion.div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.9)', margin: '0 0 6px', lineHeight: 1.3 }}>
          Convide alguém para construir<br />junto com você.
        </h2>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={handleShare} style={coupleBtn()}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Share2 size={16} /> Compartilhar link
          </span>
        </button>
        <button onClick={handleCopy} style={{
          ...coupleBtn(),
          background: copied ? 'rgba(16,185,129,0.8)' : 'rgba(109,40,217,0.5)',
          boxShadow: 'none',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {copied ? <><Check size={16} /> Copiado!</> : <><Check size={16} /> Copiar convite</>}
          </span>
        </button>
        <button onClick={() => setShowQR(true)} style={{
          ...ghostBtn,
          padding: '10px 0',
          color: 'rgba(167,139,250,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
          </svg>
          Ver QR Code
        </button>
      </div>
      <button onClick={handleLater} style={ghostBtn}>Fazer isso depois</button>
      <button onClick={() => setSubStep(0)} style={{ ...ghostBtn, fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>← Voltar</button>
    </motion.div>
  )

  // ── Sub-tela 5A — Preview ─────────────────────────────────────────────────
  if (laterMsg) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}
    >
      <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>
        Você poderá fazer isso a qualquer momento.
      </p>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
        Seu espaço individual já está pronto.
      </p>
    </motion.div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'center' }}>
      <DualGlow />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 16px', lineHeight: 1.3 }}>
          E se tudo isso pudesse ser<br />construído junto com alguém?
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.6 }}>
          Cada pessoa mantém seu próprio espaço.
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: '8px 0 0', lineHeight: 1.5 }}>
          Mas vocês podem compartilhar objetivos e construção financeira.
        </p>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={() => setSubStep(1)} style={coupleBtn()}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Heart size={16} /> Convidar parceiro(a)
          </span>
        </button>
        <button onClick={handleLater} style={ghostBtn}>Fazer isso depois</button>
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
  const [exiting, setExiting] = useState(false)
  const dirRef = useRef<1 | -1>(1)
  // B1-FIX: partnerCode estável — gerado uma única vez, nunca muda a cada render
  const partnerCodeRef = useRef(Date.now().toString(36).slice(-4).toUpperCase())

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
    setExiting(true)
    setTimeout(() => {
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
    }, 680)
  }

  const partnerCode = partnerCodeRef.current

  const steps = [
    <Step1 key={0} onNext={goNext} />,
    <Step2 key={1} name={name} setName={setName} avatar={avatar} setAvatar={setAvatar} onNext={goNext} />,
    <Step3 key={2} goal={goal} setGoal={setGoal} onNext={goNext} />,
    <Step4 key={3} onNext={goNext} />,
    <Step5 key={4} partnerCode={partnerCode} onFinish={handleFinish} onBack={goBack} />,
  ]

  return (
    <motion.div
      animate={exiting ? { opacity: 0, filter: 'blur(16px)' } : { opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.65, ease: [0.55, 0, 1, 0.45] }}
      style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 24px 40px',
        background: 'radial-gradient(circle at 50% 0%, rgba(37,99,235,0.28) 0%, transparent 40%), linear-gradient(180deg, #081120 0%, #050816 100%)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Exit glow expansion */}
      {exiting && (
        <motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 5, opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute', top: '40%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 200, height: 200, borderRadius: '50%', pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 60%)',
          }}
        />
      )}
      {/* Progress dots — premium */}
      {step > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 32, alignSelf: 'center' }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{
              height: 4, borderRadius: 99,
              width: i === step ? 32 : 6,
              background: i <= step ? '#2563EB' : 'rgba(255,255,255,0.1)',
              animation: i === step ? 'onb-dot-breathe 2.5s ease-in-out infinite' : 'none',
              transition: 'all 350ms cubic-bezier(0.34,1.56,0.64,1)',
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

      {/* Back button — hidden on step 4 (Step5 manages its own back) */}
      {step > 0 && step < 4 && (
        <button
          onClick={goBack}
          style={{ ...ghostBtn, marginTop: 20, fontSize: 14 }}
        >
          ← Voltar
        </button>
      )}
    </motion.div>
  )
}
