import { useEffect } from 'react'
import { Route, Switch, Redirect } from 'wouter'
import { useLocation } from 'wouter'
import { useRegisterSW } from 'virtual:pwa-register/react'
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
  const caixinhasLen  = useAppStore(s => s.caixinhas.length)
  const hasLivre      = useAppStore(s => s.caixinhas.some(cx => cx.id === 'cx-livre'))
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [, navigate] = useLocation()

  // Force reload when a new Service Worker version is available
  // This ensures the PWA always runs the latest code after deployment
  useRegisterSW({
    onNeedRefresh() {
      // New SW waiting — force immediate reload
      window.location.reload()
    },
  })

  // Runtime data hygiene
  useEffect(() => {
    if (!isOnboarded) return
    const userId = currentUser?.id ?? ''

    if (caixinhasLen === 0) {
      const defaultCaixinhas: Caixinha[] = DIVISAO_ORDER.map((id, i) => {
        const info = DIVISAO_INFO[id]
        const icon = CAIXINHA_ICONS[id]
        return {
          id, userId, name: info.name, emoji: '',
          percentage: info.pct, balance: 0,
          color: icon?.color ?? '#64748B',
          isDefault: true, order: i, movements: [],
        }
      })
      useAppStore.setState({ caixinhas: defaultCaixinhas })
      return
    }

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

  // Redirect to onboarding from any route when not onboarded
  useEffect(() => {
    if (!isOnboarded && isAuthenticated && !authLoading) {
      navigate('/onboarding')
    }
  }, [isOnboarded, isAuthenticated, authLoading, navigate])

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-primary)',
      }}>
        <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
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

  if (!isAuthenticated) return <Login />

  return (
    <FirebaseSyncProvider>
      <Switch>
        <Route path="/onboarding" component={Onboarding} />
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
