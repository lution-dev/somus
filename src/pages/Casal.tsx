import { motion } from 'framer-motion'
import { useAppStore } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { ProgressBar } from '../components/ui'

export default function Casal() {
  const currentUser = useAppStore(s => s.currentUser)
  const partner     = useAppStore(s => s.partner)
  const objetivos   = useAppStore(useShallow(s => s.objetivos))
  const caixinhas   = useAppStore(useShallow(s => s.caixinhas))

  const lucasBalance  = caixinhas.filter(cx => cx.userId === 'lucas').reduce((s, cx) => s + cx.balance, 0)
  const mirianBalance = 2850 * 0.8 // Estimado (Mírian sem dados completos)
  const totalCouple   = lucasBalance + mirianBalance

  return (
    <div className="min-h-full pb-6">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-gradient-couple">Casal</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Visão consolidada</p>
      </div>

      {/* Total casal */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mb-4 rounded-[var(--radius-xl)] p-5 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 50%, rgba(236,72,153,0.2) 100%)', border: '1px solid rgba(139,92,246,0.35)' }}
      >
        <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(ellipse at center, #8B5CF6, transparent)' }} />
        <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest font-semibold mb-1 relative">Patrimônio do casal</p>
        <p className="text-4xl font-extrabold text-white mb-2 relative">{formatCurrency(totalCouple)}</p>
        <div className="flex gap-4 relative">
          <div>
            <p className="text-xs text-[var(--color-accent-lucas)]">Lucas</p>
            <p className="text-sm font-bold text-white">{formatCurrency(lucasBalance)}</p>
          </div>
          <div className="w-px bg-[rgba(255,255,255,0.15)]" />
          <div>
            <p className="text-xs text-[var(--color-accent-mirian)]">Mírian</p>
            <p className="text-sm font-bold text-white">{formatCurrency(mirianBalance)}</p>
          </div>
        </div>
      </motion.div>

      {/* Perfis */}
      <div className="grid grid-cols-2 gap-3 mx-4 mb-5">
        {[
          { user: currentUser, accent: 'var(--color-accent-lucas)', bal: lucasBalance },
          { user: partner,     accent: 'var(--color-accent-mirian)', bal: mirianBalance },
        ].map(({ user, accent, bal }, i) => user ? (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4"
            style={{ borderColor: `${accent}40` }}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mb-2 text-white"
              style={{ background: accent }}>
              {user.name.charAt(0)}
            </div>
            <p className="text-sm font-bold text-[var(--color-text-primary)] truncate">{user.name.split(' ')[0]}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-2">{user.context === 'lucas' ? 'Renda variável' : 'Renda fixa'}</p>
            <p className="text-base font-extrabold" style={{ color: accent }}>{formatCurrency(bal)}</p>
          </motion.div>
        ) : null)}
      </div>

      {/* Objetivos do casal */}
      {objetivos.length > 0 && (
        <div className="mx-4">
          <h2 className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold mb-2">Objetivos</h2>
          <div className="flex flex-col gap-2.5">
            {objetivos.map((obj, i) => {
              const pct = Math.min(100, (obj.currentAmount / obj.targetAmount) * 100)
              return (
                <motion.div
                  key={obj.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{obj.emoji}</span>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">{obj.name}</p>
                    </div>
                    <p className="text-sm font-bold text-[var(--color-accent-couple)]">{Math.round(pct)}%</p>
                  </div>
                  <ProgressBar value={pct} variant="couple" size="sm" animated={false} />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-[var(--color-text-tertiary)]">{formatCurrency(obj.currentAmount)}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{formatCurrency(obj.targetAmount)}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Código de parceiro */}
      <div className="mx-4 mt-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4">
        <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide font-semibold mb-1">Seu código de convite</p>
        <p className="text-lg font-mono font-bold text-[var(--color-accent-couple)]">{currentUser?.partnerCode ?? 'SOMUS-0000'}</p>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Compartilhe com seu parceiro(a) para conectar as contas</p>
      </div>
    </div>
  )
}
