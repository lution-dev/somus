import { motion } from 'framer-motion'
import { useAppStore } from '../stores/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCurrency } from '../lib/calculations'
import { ProgressBar } from '../components/ui'
import { Target, Plane, Car, Share2, Copy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const OBJ_ICONS: Record<string, LucideIcon> = {
  'obj-viagem': Plane,
  'obj-carro': Car,
}
function getObjIcon(id: string): LucideIcon { return OBJ_ICONS[id] || Target }

export default function Casal() {
  const currentUser = useAppStore(s => s.currentUser)
  const partner     = useAppStore(s => s.partner)
  const objetivos   = useAppStore(useShallow(s => s.objetivos))
  const caixinhas   = useAppStore(useShallow(s => s.caixinhas))

  const lucasBalance  = caixinhas.filter(cx => cx.userId === 'lucas').reduce((s, cx) => s + cx.balance, 0)
  const mirianBalance = 2850 * 0.8
  const totalCouple   = lucasBalance + mirianBalance
  const lucasPct      = totalCouple > 0 ? (lucasBalance / totalCouple) * 100 : 50
  const mirianPct     = 100 - lucasPct

  const profiles = [
    { user: currentUser, accent: 'var(--color-accent-lucas)', balance: lucasBalance, tipo: 'Renda variável' },
    { user: partner,     accent: 'var(--color-accent-mirian)', balance: mirianBalance, tipo: 'Renda fixa' },
  ]

  return (
    <div className="min-h-full pb-6 px-4 pt-12 md:pt-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gradient-couple">Casal</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Visão consolidada</p>
      </div>

      {/* Card total */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[var(--radius-xl)] p-5 mb-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(91,156,246,0.08) 0%, var(--color-bg-secondary) 50%, rgba(236,72,153,0.08) 100%)',
          border: '1px solid rgba(139,92,246,0.2)',
        }}
      >
        <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1">Patrimônio do casal</p>
        <p className="text-[2rem] font-extrabold text-white mb-4 tracking-tight">{formatCurrency(totalCouple)}</p>

        {/* Barra de contribuição */}
        <div className="flex rounded-full overflow-hidden mb-3" style={{ height: '8px', background: 'var(--color-bg-tertiary)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${lucasPct}%` }}
            transition={{ duration: 0.8, ease: [0.25,0.46,0.45,0.94] }}
            style={{ background: 'var(--color-accent-lucas)', height: '100%' }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${mirianPct}%` }}
            transition={{ duration: 0.8, ease: [0.25,0.46,0.45,0.94], delay: 0.1 }}
            style={{ background: 'var(--color-accent-mirian)', height: '100%' }}
          />
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-5">
          {profiles.map(({ user, accent, balance }) => user ? (
            <div key={user.id} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: accent }} />
              <div>
                <p className="text-xs text-[var(--color-text-secondary)]">{user.name.split(' ')[0]}</p>
                <p className="text-sm font-bold text-white">{formatCurrency(balance)}</p>
              </div>
            </div>
          ) : null)}
        </div>
      </motion.div>

      {/* Cards de perfil */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {profiles.map(({ user, accent, balance, tipo }, i) => user ? (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-[var(--radius-lg)] p-4"
            style={{ background: 'var(--color-bg-card)', border: `1px solid ${accent}25` }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm mb-2.5"
              style={{ background: accent }}
            >
              {user.name.charAt(0)}
            </div>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{user.name.split(' ')[0]}</p>
            <p className="text-xs text-[var(--color-text-secondary)] mb-2">{tipo}</p>
            <p className="text-base font-bold" style={{ color: accent }}>{formatCurrency(balance)}</p>
          </motion.div>
        ) : null)}
      </div>

      {/* Objetivos */}
      {objetivos.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] mb-3 flex items-center gap-1.5">
            <Target size={13} />
            Objetivos do casal
          </p>
          <div className="flex flex-col gap-2.5">
            {objetivos.map((obj, i) => {
              const pct     = Math.min(100, (obj.currentAmount / obj.targetAmount) * 100)
              const ObjIcon = getObjIcon(obj.id)
              return (
                <motion.div
                  key={obj.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-[var(--radius-lg)] p-4"
                  style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(139,92,246,0.12)' }}
                      >
                        <ObjIcon size={17} style={{ color: 'var(--color-accent-couple)' }} />
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{obj.name}</p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-accent-couple)' }}>
                      {Math.round(pct)}%
                    </p>
                  </div>

                  <ProgressBar value={pct} variant="couple" size="sm" animated={false} />

                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-[var(--color-text-secondary)]">{formatCurrency(obj.currentAmount)}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">meta {formatCurrency(obj.targetAmount)}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Código de convite */}
      <div
        className="rounded-[var(--radius-lg)] p-4"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1 flex items-center gap-1.5">
              <Share2 size={12} />
              Código de convite
            </p>
            <p className="text-xl font-bold font-mono" style={{ color: 'var(--color-accent-couple)' }}>
              {currentUser?.partnerCode ?? 'SOMUS-0001'}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Compartilhe com seu parceiro(a)</p>
          </div>
          <button
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-[var(--radius-md)] cursor-pointer transition-all duration-150"
            style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--color-accent-couple)', border: '1px solid rgba(139,92,246,0.2)' }}
            onClick={() => navigator.clipboard.writeText(currentUser?.partnerCode ?? 'SOMUS-0001')}
          >
            <Copy size={13} />
            Copiar
          </button>
        </div>
      </div>
    </div>
  )
}
