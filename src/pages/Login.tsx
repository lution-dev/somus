import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { TrendingUp, Users, Lock, Loader2, Heart, PiggyBank, BarChart3 } from 'lucide-react'
import { useIsMobile } from '../hooks/useIsMobile'

/* ── Somus Logo (from favicon.svg) ──────────────────────────── */
function SomusLogo({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size * (484 / 271)} viewBox="0 0 271 484" fill="none">
      <path d="M19.63 285.794C22.7195 281.292 25.7976 276.765 29.2984 271.617C34.6697 276.872 39.6392 281.662 44.5282 286.534C51.1244 293.106 57.5384 299.867 64.281 306.283C66.8479 308.726 66.8484 310.584 65.3399 313.644C48.0552 348.697 56.435 388.651 86.4327 413.152C91.6293 417.396 97.954 420.259 104.161 423.762C104.565 423.765 104.525 423.779 104.743 424.102C120.058 430.745 135.674 432.74 151.779 429.615C189.121 422.368 215.173 392.906 217.477 354.812C218.352 340.338 216.006 326.273 208.248 313.635C208.226 313.7 208.319 313.597 208.3 313.211C204.298 307.126 201.024 300.727 196.215 295.84C164.411 263.519 132.454 231.345 100.156 199.521C89.0664 188.594 82.0359 176.166 80.582 160.192C80.6084 157.104 80.5596 154.5 80.646 151.458C82.6261 144.148 84.4709 137.277 86.3105 130.403C86.3052 130.4 86.3121 130.411 86.6323 130.217C89.2345 126.523 91.5166 123.021 93.9982 119.214C98.0156 122.726 101.224 125.531 104.523 128.665C105.309 129.532 106.004 130.07 106.699 130.608C115.202 139.317 123.628 148.102 132.22 156.722C164.273 188.879 196.173 221.191 228.534 253.036C253.561 277.664 267.612 307.113 270.418 342.459C270.601 346.108 270.58 349.379 270.537 353.573C270.015 359.644 270.13 364.946 268.892 369.91C265.838 382.15 262.163 394.236 258.737 406.384C258.737 406.384 258.82 406.439 258.478 406.6C254.674 412.82 251.389 418.989 247.712 424.915C239.581 438.018 228.243 448.188 216.715 458.155C216.715 458.155 216.769 458.204 216.38 458.219C205.784 463.935 195.576 469.636 185.368 475.338C185.368 475.338 185.463 475.384 185.029 475.33C161.87 483.409 138.516 486.521 114.768 481.736C102.566 479.278 90.8 474.66 78.8369 471.018C78.8369 471.018 78.7848 471.115 78.72 470.858C78.399 470.299 78.0876 470.223 77.7212 470.372C77.7212 470.372 77.324 470.028 76.8352 469.701C67.3571 463.284 57.5815 458.067 49.5868 450.872C40.5228 442.713 33.0542 432.783 24.892 423.623C24.892 423.623 24.8704 423.654 24.8905 423.649C16.2141 408.586 9.02095 392.913 6.12013 375.618C5.00108 368.947 4.51827 362.168 3.54048 355.055C3.3925 352.121 3.4496 349.57 3.61614 346.161C4.5424 338.399 4.44582 331.228 6.36919 324.647C10.2034 311.528 15.1472 298.733 19.6327 285.805C19.6327 285.805 19.6186 285.77 19.63 285.794Z" fill="url(#s0)"/>
      <path d="M250.936 198.206C247.847 202.708 244.769 207.235 241.268 212.383C235.897 207.128 230.927 202.338 226.038 197.466C219.442 190.894 213.028 184.133 206.285 177.717C203.719 175.274 203.718 173.416 205.227 170.356C222.511 135.303 214.131 95.3485 184.134 70.8482C178.937 66.604 172.612 63.741 166.405 60.2375C166.001 60.235 166.042 60.2209 165.823 59.8984C150.508 53.2555 134.892 51.2597 118.788 54.3852C81.4452 61.6324 55.3937 91.0938 53.0895 129.188C52.214 143.662 54.56 157.727 62.318 170.365C62.3403 170.3 62.2479 170.403 62.2664 170.789C66.2689 176.874 69.5426 183.273 74.3519 188.16C106.155 220.481 138.112 252.655 170.411 284.479C181.5 295.406 188.531 307.834 189.984 323.808C189.958 326.896 190.007 329.5 189.92 332.542C187.94 339.852 186.095 346.723 184.256 353.597C184.261 353.6 184.254 353.589 183.934 353.783C181.332 357.477 179.05 360.979 176.568 364.786C172.551 361.274 169.342 358.469 166.043 355.335C165.257 354.468 164.562 353.93 163.867 353.392C155.365 344.683 146.938 335.898 138.346 327.278C106.293 295.121 74.393 262.809 42.0325 230.964C17.0055 206.336 2.95453 176.887 0.148713 141.541C-0.0350717 137.892 -0.0131558 134.621 0.0294755 130.427C0.551131 124.356 0.43627 119.054 1.67474 114.09C4.72857 101.849 8.40364 89.7639 11.829 77.616C11.829 77.616 11.7461 77.5611 12.0882 77.4C15.8928 71.1801 19.1772 65.0109 22.8542 59.0853C30.9854 45.9815 42.3232 35.8116 53.8517 25.8451C53.8517 25.8451 53.7976 25.7955 54.186 25.7808C64.7823 20.0648 74.9902 14.3635 85.1981 8.66214C85.1981 8.66214 85.1038 8.61554 85.5376 8.67017C108.697 0.590607 132.05 -2.52106 155.798 2.26361C168 4.72195 179.766 9.34012 191.73 12.9822C191.73 12.9822 191.782 12.8847 191.846 13.1421C192.167 13.7012 192.479 13.7772 192.845 13.6277C192.845 13.6277 193.242 13.9724 193.731 14.2989C203.209 20.716 212.985 25.9328 220.98 33.1284C230.044 41.2865 237.512 51.2171 245.674 60.3771C245.674 60.3771 245.696 60.3459 245.676 60.3513C254.352 75.4142 261.545 91.087 264.446 108.382C265.565 115.053 266.048 121.832 267.026 128.945C267.174 131.879 267.117 134.43 266.95 137.839C266.024 145.601 266.121 152.772 264.197 159.353C260.363 172.472 255.419 185.267 250.934 198.195C250.934 198.195 250.948 198.23 250.936 198.206Z" fill="url(#s1)"/>
      <defs>
        <linearGradient id="s0" x1="210.784" y1="445.758" x2="98.0485" y2="119.214" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2384FF"/><stop offset="0.514423" stopColor="#7CCBFF"/>
        </linearGradient>
        <linearGradient id="s1" x1="0" y1="182.393" x2="267.111" y2="182.393" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7CCBFF"/><stop offset="1" stopColor="#2384FF"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

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
