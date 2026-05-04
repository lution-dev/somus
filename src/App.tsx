import { useEffect } from 'react'
import { Route, Switch, Redirect } from 'wouter'
import { useAppStore } from './stores/useAppStore'
import { useAuth } from './hooks/useAuth'
import { AppLayout } from './components/layout/AppLayout'
import { PWAInstallPrompt } from './components/shared/PWAInstallPrompt'
import { FirebaseSyncProvider } from './hooks/useFirebaseSync'
import SomusLogo from './components/ui/SomusLogo'
import { DIVISAO_ORDER, DIVISAO_INFO } from './lib/divisoes'
import { CAIXINHA_ICONS } from './lib/icons'
import type { Caixinha } from './types'

// Pages
import Home          from './pages/Home'
import Fluxo         from './pages/Fluxo'
import Caixinhas     from './pages/Caixinhas'
import CaixinhaDetalhe from './pages/CaixinhaDetalhe'
import Casal         from './pages/Casal'
import ObjetivoDetalhe from './pages/ObjetivoDetalhe'
import Onboarding    from './pages/Onboarding'
import Perfil        from './pages/Perfil'
import Login         from './pages/Login'

export default function App() {
  // Stable selectors
  const isOnboarded   = useAppStore(s => s.isOnboarded)
  const currentUser   = useAppStore(s => s.currentUser)
  // Derive stable primitives to use as effect deps (avoid full array in deps)
  const caixinhasLen  = useAppStore(s => s.caixinhas.length)
  const hasLivre      = useAppStore(s => s.caixinhas.some(cx => cx.id === 'cx-livre'))
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Runtime data hygiene: runs only when structural issues exist.
  // Uses stable primitive deps to avoid triggering on every state change.
  useEffect(() => {
    if (!isOnboarded) return
    const userId = currentUser?.id ?? ''

    // 1. Backfill: create default caixinhas if user has none
    if (caixinhasLen === 0) {
      const defaultCaixinhas: Caixinha[] = DIVISAO_ORDER.map((id, i) => {
        const info = DIVISAO_INFO[id]
        const icon = CAIXINHA_ICONS[id]
        return {
          id,
          userId,
          name: info.name,
          emoji: '',
          percentage: info.pct,
          balance: 0,
          color: icon?.color ?? '#64748B',
          isDefault: true,
          order: i,
          movements: [],
        }
      })
      useAppStore.setState({ caixinhas: defaultCaixinhas })
      return
    }

    // 2. Cleanup: remove cx-livre if it still exists (Firestore may have old data)
    if (hasLivre) {
      const all = useAppStore.getState().caixinhas
      const livreBalance = all.find(cx => cx.id === 'cx-livre')?.balance ?? 0
      const cleaned = all
        .filter(cx => cx.id !== 'cx-livre')
        .map(cx => cx.id === 'cx-reserva'
          ? { ...cx, percentage: 10, balance: cx.balance + livreBalance }
          : cx
        )
      useAppStore.setState({ caixinhas: cleaned })
    }
  }, [isOnboarded, caixinhasLen, hasLivre, currentUser])

  // Auth loading — show nothing (avoids flash)
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-primary)',
      }}>
        <div style={{
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <SomusLogo size={48} />
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
          }
        `}</style>
      </div>
    )
  }

  // Not authenticated — show login
  if (!isAuthenticated) {
    return <Login />
  }

  // Authenticated — wrap with sync and show app
  return (
    <FirebaseSyncProvider>
      <Switch>
        {/* Onboarding — outside AppLayout */}
        <Route path="/onboarding" component={Onboarding} />

        {/* App pages — always mounted inside AppLayout */}
        <Route>
          <AppLayout>
            <Switch>
              <Route path="/home" component={Home} />
              <Route path="/fluxo" component={Fluxo} />
              <Route path="/caixinhas/:id" component={CaixinhaDetalhe} />
              <Route path="/caixinhas" component={Caixinhas} />
              <Route path="/casal/objetivo/:id" component={ObjetivoDetalhe} />
              <Route path="/casal" component={Casal} />
              <Route path="/perfil" component={Perfil} />

              {/* Fallback — redirect to home or onboarding */}
              <Route>
                <Redirect to={isOnboarded ? '/home' : '/onboarding'} />
              </Route>
            </Switch>
            {isOnboarded && <PWAInstallPrompt />}
          </AppLayout>
        </Route>
      </Switch>
    </FirebaseSyncProvider>
  )
}
