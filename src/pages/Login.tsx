import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { TrendingUp, Users, Lock, Loader2, Heart, PiggyBank, BarChart3 } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'
import SomusLogo from '../components/ui/SomusLogo'

/* ── Feature data ───────────────────────────────────────────── */
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

/* ── Feature data ───────────────────────────────────────────── */
const FEATURES = [
  { icon: TrendingUp,  label: 'Controle financeiro',     desc: 'Gerencie entradas e distribua automaticamente' },
  { icon: Users,       label: 'Feito para casais',       desc: 'Planejamento a dois, sempre sincronizado' },
  { icon: Lock,        label: 'Seguro na nuvem',         desc: 'Seus dados protegidos e acessíveis' },
]

const STATS = [
  { icon: PiggyBank,  value: 'Divisões',    label: 'Método Natália Arcuri' },
  { icon: Heart,      value: 'Casal',         label: 'Objetivos juntos' },
  { icon: BarChart3,  value: 'Fluxo',         label: 'Controle mensal' },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
}

/* ── Main Component ─────────────────────────────────────────── */
export default function Login() {
  const { signInWithGoogle, isLoading, error } = useAuth()
  const isMobile = useIsMobile()

  /* ─── RIGHT PANEL (Login Form) ─── used in both layouts ─── */
  const loginPanel = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{
        width: '100%',
        maxWidth: isMobile ? 340 : 380,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Logo — only on mobile (desktop has it in left panel) */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 36 }}
        >
          <div style={{
            margin: '0 auto 16px', width: 72, height: 72,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 22, background: 'rgba(35,132,255,0.08)',
            border: '1px solid rgba(35,132,255,0.12)',
          }}>
            <SomusLogo size={34} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 4px', letterSpacing: '-0.03em' }}>Somus</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>Finanças do casal, simplificadas.</p>
        </motion.div>
      )}

      {/* Desktop heading */}
      {!isMobile && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 6px' }}>Bem-vindo ao Somus</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Entre com sua conta Google para sincronizar seus dados em todos os dispositivos.
          </p>
        </div>
      )}

      {/* Features — mobile only */}
      {isMobile && (
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <motion.div key={label} variants={fadeUp} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(35,132,255,0.12), rgba(139,92,246,0.08))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={16} color="#60A5FA" strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '1px 0 0' }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Google CTA */}
      <button
        onClick={signInWithGoogle}
        disabled={isLoading}
        id="btn-google-signin"
        style={{
          width: '100%', padding: '15px 20px', borderRadius: 14,
          background: 'white', color: '#1f1f1f', border: 'none',
          cursor: isLoading ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-sans)',
          transition: 'transform 120ms ease, box-shadow 200ms ease',
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

      {/* Error */}
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
          fontSize: 12, color: 'var(--color-danger)', textAlign: 'center', margin: '12px 0 0',
          padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8,
        }}>
          {error}
        </motion.p>
      )}

      {/* Footer */}
      <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textAlign: 'center', marginTop: isMobile ? 32 : 24 }}>
        Somus © {new Date().getFullYear()}
      </p>
    </motion.div>
  )

  /* ─── MOBILE LAYOUT ────────────────────────────────────────── */
  if (isMobile) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px 32px',
        background: 'var(--color-bg-primary)', position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)',
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(35,132,255,0.10) 0%, rgba(124,203,255,0.04) 40%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {loginPanel}
        <style>{`@keyframes somus-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  /* ─── DESKTOP LAYOUT — Split screen ────────────────────────── */
  return (
    <div style={{
      minHeight: '100dvh', display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--color-bg-primary)',
    }}>
      {/* LEFT PANEL — Branding */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 48px',
        background: 'linear-gradient(160deg, #040A16 0%, #060D1C 40%, #081220 100%)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
      }}>
        {/* Ambient glows */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(35,132,255,0.10) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -150, left: -50,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}
        >
          <div style={{
            margin: '0 auto 20px', width: 96, height: 96,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 28,
            background: 'rgba(35,132,255,0.06)',
            border: '1px solid rgba(35,132,255,0.12)',
            backdropFilter: 'blur(12px)',
          }}>
            <SomusLogo size={48} />
          </div>
          <h1 style={{
            fontSize: 36, fontWeight: 700, color: 'var(--color-text-primary)',
            margin: '0 0 8px', letterSpacing: '-0.03em',
          }}>
            Somus
          </h1>
          <p style={{
            fontSize: 16, color: 'var(--color-text-secondary)',
            margin: 0, lineHeight: 1.5, maxWidth: 320,
          }}>
            Finanças do casal, simplificadas.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={stagger} initial="hidden" animate="show"
          style={{
            display: 'flex', flexDirection: 'column', gap: 12,
            width: '100%', maxWidth: 360, position: 'relative', zIndex: 1,
          }}
        >
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <motion.div
              key={label} variants={fadeUp}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(35,132,255,0.12), rgba(139,92,246,0.08))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color="#60A5FA" strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{label}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '2px 0 0', lineHeight: 1.4 }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{
            display: 'flex', gap: 24, marginTop: 40,
            position: 'relative', zIndex: 1,
          }}
        >
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={value} style={{ textAlign: 'center' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 8px',
              }}>
                <Icon size={18} color="var(--color-text-secondary)" strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{value}</p>
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>{label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* RIGHT PANEL — Login Form */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 48px',
        position: 'relative',
      }}>
        {/* Subtle ambient */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(35,132,255,0.04) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
          {loginPanel}
        </div>
      </div>

      <style>{`@keyframes somus-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
