import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Wallet, Shield, Smartphone, Loader2 } from 'lucide-react'

const FEATURES = [
  { icon: Wallet, text: 'Controle financeiro do casal' },
  { icon: Shield, text: 'Dados seguros na nuvem' },
  { icon: Smartphone, text: 'Acesse de qualquer dispositivo' },
]

export default function Login() {
  const { signInWithGoogle, signInAnon, isLoading, error } = useAuth()

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      background: 'var(--color-bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo + Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-couple) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 32px rgba(59,130,246,0.25)',
        }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: 'white' }}>S</span>
        </div>
        <h1 style={{
          fontSize: 28, fontWeight: 700,
          color: 'var(--color-text-primary)',
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
        }}>
          Somus
        </h1>
        <p style={{
          fontSize: 14, color: 'var(--color-text-secondary)',
          margin: 0, maxWidth: 280, lineHeight: 1.5,
        }}>
          Planejamento financeiro inteligente para casais
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          display: 'flex', flexDirection: 'column', gap: 12,
          marginBottom: 40, width: '100%', maxWidth: 320,
        }}
      >
        {FEATURES.map(({ icon: Icon, text }, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(59,130,246,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={16} color="var(--color-accent)" />
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: 0 }}>
              {text}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Login buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {/* Google Sign In */}
        <button
          onClick={signInWithGoogle}
          disabled={isLoading}
          style={{
            width: '100%', padding: '14px 20px',
            borderRadius: 14,
            background: 'white',
            color: '#1f1f1f',
            border: 'none',
            cursor: isLoading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontSize: 15, fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            transition: 'transform 100ms ease, box-shadow 200ms ease',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            opacity: isLoading ? 0.7 : 1,
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isLoading ? (
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          Entrar com Google
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          margin: '4px 0',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ou</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        {/* Skip (anonymous) */}
        <button
          onClick={signInAnon}
          disabled={isLoading}
          style={{
            width: '100%', padding: '12px 20px',
            borderRadius: 14,
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            cursor: isLoading ? 'wait' : 'pointer',
            fontSize: 14, fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            transition: 'all 200ms ease',
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          Continuar sem login
        </button>

        {/* Error message */}
        {error && (
          <p style={{
            fontSize: 12, color: 'var(--color-danger)',
            textAlign: 'center', margin: '8px 0 0',
          }}>
            {error}
          </p>
        )}
      </motion.div>

      {/* Footer */}
      <p style={{
        fontSize: 11, color: 'var(--color-text-tertiary)',
        position: 'absolute', bottom: 24,
        textAlign: 'center',
      }}>
        Seus dados ficam seguros no Firebase
      </p>

      {/* Spin keyframe (inline) */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
