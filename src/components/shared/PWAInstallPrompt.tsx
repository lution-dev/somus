import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SomusLogo from '../ui/SomusLogo';

const STORAGE_KEY = 'somus-pwa-prompt-seen';

export function PWAInstallPrompt() {
  const { isInstallable, install, dismiss } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; }
    catch { return false; }
  });

  if (!isInstallable || isDismissed) return null;

  const markSeen = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
    setIsDismissed(true);
  };

  const handleInstall = async () => {
    await install();
    markSeen();
  };

  const handleDismiss = () => {
    markSeen();
    dismiss();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          width: 'min(400px, calc(100vw - 2rem))',
        }}
      >
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(14, 22, 42, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        }}>
          {/* Gradient accent top */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, var(--color-accent-primary), transparent)',
          }} />

          <div style={{
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}>
            {/* App icon */}
            <div style={{
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--color-bg-primary)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SomusLogo size={28} />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                lineHeight: 1.3,
                margin: 0,
              }}>
                Instalar Somus
              </p>
              <p style={{
                fontSize: 12,
                color: 'var(--color-text-tertiary)',
                marginTop: 2,
                lineHeight: 1.3,
                margin: '2px 0 0',
              }}>
                Acesse direto da tela inicial
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button
                onClick={handleInstall}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--font-sans)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#fff',
                  background: 'var(--color-accent-primary)',
                  border: 'none',
                  borderRadius: 99,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
              >
                <Download size={14} strokeWidth={2.5} />
                Instalar
              </button>

              <button
                onClick={handleDismiss}
                aria-label="Fechar"
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 99,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
