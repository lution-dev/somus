import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { TrendingUp, Users, Shield, Loader2, Heart, PiggyBank, BarChart3, CheckCircle2, Lock } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'
import SomusLogo from '../components/ui/SomusLogo'

/* ── Helpers ────────────────────────────────────────────────── */
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

/* ── Data ───────────────────────────────────────────────────── */
const FEATURES = [
  { icon: TrendingUp, label: 'Organize suas divisões', desc: 'Gerencie entradas e distribua com propósito.', color: '#60A5FA', glow: '35,132,255' },
  { icon: Users, label: 'Construção em conjunto', desc: 'Planejamento a dois, sempre sincronizado.', color: '#F472B6', glow: '244,114,182' },
  { icon: Shield, label: 'Seus dados, sua base', desc: 'Criptografia de ponta a ponta. Simples assim.', color: '#22D3EE', glow: '34,211,238' },
]
const STATS = [
  { icon: PiggyBank, value: 'Divisões', label: 'Cada parte tem um lugar', color: '#22D3EE' },
  { icon: Heart, value: 'Casal', label: 'Juntos é mais leve', color: '#F472B6' },
  { icon: BarChart3, value: 'Fluxo', label: 'Mês a mês, com equilíbrio', color: '#60A5FA' },
]

/* ── Motion variants (brand: calm, 0.35s ease) ─────────────── */
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] } },
}
const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
}

/* ── Gradient heading style ────────────────────────────────── */
const gradientText: React.CSSProperties = {
  background: 'linear-gradient(135deg, #22D3EE, #3B82F6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

/* ── Atmospheric Waves (CSS keyframes injected) ────────────── */
const waveCSS = `
@keyframes somus-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes wave-drift {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(-20px) translateY(-8px); }
}
@keyframes wave-drift-2 {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(15px) translateY(-6px); }
}
@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.85; }
}
@keyframes float-logo {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}
`

/* ── Atmospheric Wave Layer ────────────────────────────────── */
function AtmosphericWaves() {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Base atmospheric glow */}
      <div style={{
        position: 'absolute', bottom: 0, left: '-10%', right: '-10%', height: 200,
        background: 'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(35,132,255,0.12) 0%, transparent 70%)',
      }} />

      {/* SVG Wave Mesh — luminous wave lines */}
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{
          position: 'absolute', bottom: -20, left: '-5%', right: '-5%',
          width: '110%', height: 240, opacity: 1,
        }}
      >
        <defs>
          <filter id="wave-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="wave-glow-strong">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(35,132,255,0)" />
            <stop offset="30%" stopColor="rgba(35,132,255,0.3)" />
            <stop offset="50%" stopColor="rgba(34,211,238,0.4)" />
            <stop offset="70%" stopColor="rgba(35,132,255,0.3)" />
            <stop offset="100%" stopColor="rgba(35,132,255,0)" />
          </linearGradient>
          <linearGradient id="wave-grad-2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34,211,238,0)" />
            <stop offset="20%" stopColor="rgba(34,211,238,0.2)" />
            <stop offset="50%" stopColor="rgba(59,130,246,0.3)" />
            <stop offset="80%" stopColor="rgba(34,211,238,0.2)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </linearGradient>
          <linearGradient id="wave-grad-3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59,130,246,0)" />
            <stop offset="40%" stopColor="rgba(59,130,246,0.15)" />
            <stop offset="60%" stopColor="rgba(35,132,255,0.2)" />
            <stop offset="100%" stopColor="rgba(59,130,246,0)" />
          </linearGradient>
        </defs>

        {/* Wave 1 — primary, most visible */}
        <path
          d="M0,220 C120,180 240,260 360,220 C480,180 600,240 720,200 C840,160 960,230 1080,210 C1200,190 1320,250 1440,220 L1440,320 L0,320 Z"
          fill="url(#wave-grad-1)"
          fillOpacity="0.08"
          style={{ animation: 'wave-drift 8s ease-in-out infinite' }}
        />
        <path
          d="M0,220 C120,180 240,260 360,220 C480,180 600,240 720,200 C840,160 960,230 1080,210 C1200,190 1320,250 1440,220"
          fill="none"
          stroke="url(#wave-grad-1)"
          strokeWidth="1.5"
          filter="url(#wave-glow)"
          style={{ animation: 'wave-drift 8s ease-in-out infinite' }}
        />

        {/* Wave 2 — secondary */}
        <path
          d="M0,250 C180,210 300,270 480,240 C660,210 780,260 960,230 C1140,200 1260,260 1440,240 L1440,320 L0,320 Z"
          fill="url(#wave-grad-2)"
          fillOpacity="0.06"
          style={{ animation: 'wave-drift-2 10s ease-in-out infinite' }}
        />
        <path
          d="M0,250 C180,210 300,270 480,240 C660,210 780,260 960,230 C1140,200 1260,260 1440,240"
          fill="none"
          stroke="url(#wave-grad-2)"
          strokeWidth="1"
          filter="url(#wave-glow)"
          style={{ animation: 'wave-drift-2 10s ease-in-out infinite' }}
        />

        {/* Wave 3 — tertiary, subtle */}
        <path
          d="M0,270 C200,240 400,280 600,260 C800,240 1000,275 1200,255 C1300,245 1380,265 1440,260"
          fill="none"
          stroke="url(#wave-grad-3)"
          strokeWidth="0.8"
          filter="url(#wave-glow)"
          style={{ animation: 'wave-drift 12s ease-in-out infinite reverse' }}
        />

        {/* Wave 4 — bright accent line */}
        <path
          d="M0,235 C160,200 320,260 480,230 C640,200 800,250 960,220 C1120,190 1280,240 1440,225"
          fill="none"
          stroke="url(#wave-grad-1)"
          strokeWidth="0.6"
          filter="url(#wave-glow-strong)"
          opacity="0.7"
          style={{ animation: 'wave-drift-2 14s ease-in-out infinite' }}
        />
      </svg>

      {/* Particle dots */}
      <div style={{
        position: 'absolute', bottom: 60, left: '20%',
        width: 3, height: 3, borderRadius: '50%',
        background: 'rgba(34,211,238,0.4)',
        boxShadow: '0 0 8px rgba(34,211,238,0.3)',
        animation: 'glow-pulse 4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: 90, left: '55%',
        width: 2, height: 2, borderRadius: '50%',
        background: 'rgba(35,132,255,0.5)',
        boxShadow: '0 0 6px rgba(35,132,255,0.3)',
        animation: 'glow-pulse 5s ease-in-out infinite 1s',
      }} />
      <div style={{
        position: 'absolute', bottom: 45, left: '75%',
        width: 2.5, height: 2.5, borderRadius: '50%',
        background: 'rgba(34,211,238,0.35)',
        boxShadow: '0 0 10px rgba(34,211,238,0.25)',
        animation: 'glow-pulse 6s ease-in-out infinite 2s',
      }} />
      <div style={{
        position: 'absolute', bottom: 110, left: '35%',
        width: 2, height: 2, borderRadius: '50%',
        background: 'rgba(59,130,246,0.4)',
        boxShadow: '0 0 6px rgba(59,130,246,0.3)',
        animation: 'glow-pulse 3.5s ease-in-out infinite 0.5s',
      }} />
      <div style={{
        position: 'absolute', bottom: 70, left: '88%',
        width: 1.5, height: 1.5, borderRadius: '50%',
        background: 'rgba(35,132,255,0.45)',
        boxShadow: '0 0 5px rgba(35,132,255,0.3)',
        animation: 'glow-pulse 5s ease-in-out infinite 3s',
      }} />
    </div>
  )
}

/* ════════════════════════════════════════════════════════════ */
export default function Login() {
  const { signInWithGoogle, isLoading, error } = useAuth()
  const isMobile = useIsMobile()

  /* ─── MOBILE ─────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 28px 40px', position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg, #050816 0%, #0A1020 100%)',
      }}>
        <style>{waveCSS}</style>

        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(35,132,255,0.12) 0%, rgba(34,211,238,0.04) 40%, transparent 70%)',
          pointerEvents: 'none', animation: 'glow-pulse 6s ease-in-out infinite',
        }} />

        <AtmosphericWaves />

        {/* Content */}
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 360, position: 'relative', zIndex: 1 }}
        >
          {/* Logo */}
          <motion.div variants={scaleIn} style={{ marginBottom: 12, animation: 'float-logo 5s ease-in-out infinite' }}>
            <SomusLogo size={72} />
          </motion.div>

          <motion.h1 variants={fadeUp} style={{
            fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)',
            margin: '0 0 20px', letterSpacing: '-0.03em',
          }}>Somus</motion.h1>

          {/* Heading with gradient */}
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginBottom: 8 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.25 }}>
              Finanças do casal,<br />
              <span style={gradientText}>construídas juntos.</span>
            </h2>
          </motion.div>

          <motion.p variants={fadeUp} style={{
            fontSize: 14, color: 'var(--color-text-secondary)', textAlign: 'center',
            margin: '0 0 48px', lineHeight: 1.5, maxWidth: 280,
          }}>
            A base pra organizar, equilibrar e construir com mais clareza.
          </motion.p>

          {/* Google CTA — dark glass on mobile */}
          <motion.div variants={fadeUp} style={{ width: '100%' }}>
            <button
              onClick={signInWithGoogle}
              disabled={isLoading}
              id="btn-google-signin"
              style={{
                width: '100%', padding: '16px 24px', borderRadius: 16,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
                color: 'var(--color-text-primary)',
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)',
                transition: 'all 0.35s ease',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {isLoading ? <Loader2 size={20} style={{ animation: 'somus-spin 0.8s linear infinite' }} /> : <GoogleLogo />}
              Entrar com Google
            </button>
          </motion.div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
              fontSize: 12, color: 'var(--color-danger)', textAlign: 'center', margin: '12px 0 0',
              padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8,
            }}>{error}</motion.p>
          )}

          {/* Security info */}
          <motion.div variants={fadeUp} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', gap: 6, marginTop: 24, padding: '0 4px',
          }}>
            <Lock size={15} color="var(--color-text-tertiary)" strokeWidth={1.5} />
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>
              Seus dados estão protegidos
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5 }}>
              Criptografia de ponta a ponta. Simples assim.
            </p>
          </motion.div>

          {/* Footer */}
          <motion.div variants={fadeUp} style={{ textAlign: 'center', marginTop: 40 }}>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '0 0 4px' }}>
              Somus © {new Date().getFullYear()}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0 }}>
              Ao continuar, você concorda com nossos{' '}
              <span style={{ color: '#22D3EE' }}>Termos de Uso</span> e{' '}
              <span style={{ color: '#22D3EE' }}>Política de Privacidade</span>.
            </p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  /* ─── DESKTOP — Split screen ─────────────────────────────── */
  return (
    <div style={{
      minHeight: '100dvh', display: 'grid',
      gridTemplateColumns: '1fr 1.2fr',
      background: 'linear-gradient(180deg, #050816 0%, #0A1020 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{waveCSS}</style>

      {/* Ambient glows — span full width */}
      <div style={{
        position: 'absolute', top: -120, left: -80,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(35,132,255,0.10) 0%, transparent 60%)',
        pointerEvents: 'none', animation: 'glow-pulse 7s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: -150, right: -50,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 60%)',
        pointerEvents: 'none', animation: 'glow-pulse 9s ease-in-out infinite reverse',
      }} />

      {/* Waves span full width behind both panels */}
      <AtmosphericWaves />

      {/* ── LEFT PANEL — Branding ─────────────────────────── */}
      <div style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 56px',
        zIndex: 1,
      }}>

        <motion.div
          variants={stagger} initial="hidden" animate="show"
          style={{ position: 'relative', zIndex: 1, maxWidth: 440 }}
        >
          {/* Logo inline */}
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <SomusLogo size={36} />
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>Somus</span>
          </motion.div>

          {/* Heading */}
          <motion.div variants={fadeUp} style={{ marginBottom: 12 }}>
            <h1 style={{ fontSize: 38, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.2, letterSpacing: '-0.03em' }}>
              Finanças do casal,<br />
              <span style={gradientText}>construídas juntos.</span>
            </h1>
          </motion.div>

          <motion.p variants={fadeUp} style={{
            fontSize: 15, color: 'var(--color-text-secondary)',
            margin: '0 0 40px', lineHeight: 1.6, maxWidth: 340,
          }}>
            A base pra organizar, equilibrar e construir uma vida financeira com mais clareza.
          </motion.p>

          {/* Feature Cards */}
          <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
            {FEATURES.map(({ icon: Icon, label, desc, color, glow }) => (
              <motion.div
                key={label} variants={fadeUp}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '16px 18px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(8px)',
                  cursor: 'default',
                  transition: 'all 0.35s ease',
                }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)', y: -2 }}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: 14, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(10,18,40,0.9), rgba(15,25,50,0.8))',
                  border: `1px solid rgba(${glow},0.25)`,
                  boxShadow: `0 0 16px rgba(${glow},0.15), inset 0 1px 0 rgba(255,255,255,0.05)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} color={color} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '2px 0 0', lineHeight: 1.4 }}>{desc}</p>
                </div>

              </motion.div>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} style={{
            display: 'flex', gap: 0,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            {STATS.map(({ icon: Icon, value, label, color }, i) => (
              <div key={value} style={{
                flex: 1, textAlign: 'center', padding: '16px 12px',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: `0 0 10px ${color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px',
                }}>
                  <Icon size={16} color={color} strokeWidth={1.5} />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{value}</p>
                <p style={{ fontSize: 10, color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL — Login Form ──────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px', position: 'relative',
        zIndex: 1,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            width: '100%', maxWidth: 500,
            padding: '52px 44px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 24,
            backdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}
        >

          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 8px', textAlign: 'center' }}>
            Sua base começa aqui.
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: '0 0 32px', textAlign: 'center', lineHeight: 1.5 }}>
            Entre com o Google e comece a construir com mais clareza.
          </p>

          {/* Google CTA — white on desktop */}
          <button
            onClick={signInWithGoogle}
            disabled={isLoading}
            id="btn-google-signin"
            style={{
              width: '100%', padding: '15px 24px', borderRadius: 14,
              background: 'white', color: '#1f1f1f', border: 'none',
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)',
              transition: 'all 0.25s ease',
              boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isLoading ? <Loader2 size={20} style={{ animation: 'somus-spin 0.8s linear infinite' }} /> : <GoogleLogo />}
            Entrar com Google
          </button>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
              fontSize: 12, color: 'var(--color-danger)', textAlign: 'center', margin: '12px 0 0',
              padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, width: '100%',
            }}>{error}</motion.p>
          )}

          {/* Separator + Security card */}
          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0 16px' }} />

          <div style={{
            width: '100%', padding: '14px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Lock size={16} color="var(--color-text-secondary)" strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                Seus dados estão protegidos
              </p>
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '2px 0 0', lineHeight: 1.4 }}>
                Criptografia de ponta a ponta. Simples assim.
              </p>
            </div>
            <CheckCircle2 size={20} color="#22D3EE" strokeWidth={1.5} style={{ flexShrink: 0 }} />
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '0 0 4px' }}>
              Somus © {new Date().getFullYear()}
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: 0, lineHeight: 1.5 }}>
              Ao continuar, você concorda com nossos{' '}
              <span style={{ color: '#22D3EE' }}>Termos de Uso</span> e{' '}
              <span style={{ color: '#22D3EE' }}>Política de Privacidade</span>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
