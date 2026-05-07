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
import { DIVISAO_ICONS } from './lib/icons'
import type { Divisao } from './types'

// Pages
import Home          from './pages/Home'
import Fluxo         from './pages/Fluxo'
import Relatorios     from './pages/Relatorios'
import DivisaoDetalhe from './pages/DivisaoDetalhe'
import Casal         from './pages/Casal'
import ObjetivoDetalhe from './pages/ObjetivoDetalhe'
import Onboarding    from './pages/Onboarding'
import Perfil        from './pages/Perfil'
import Login         from './pages/Login'
import InviteAccept  from './pages/InviteAccept'

export default function App() {
  const isOnboarded   = useAppStore(s => s.isOnboarded)
  const currentUser   = useAppStore(s => s.currentUser)
  const divisoesLen  = useAppStore(s => s.divisoes.length)
  const hasLivre      = useAppStore(s => s.divisoes.some(cx => cx.id === 'cx-livre'))
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [location, navigate] = useLocation()

  // SW update strategy: check for new version every 60s.
  // registerType 'autoUpdate' handles skipWaiting + reload automatically.
  // The interval ensures mobile PWA checks for updates even if backgrounded.
  useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        registration.update()
        setInterval(() => registration.update(), 60_000)
      }
    },
  })

  // Runtime data hygiene (divisoes backfill + cx-livre cleanup)
  useEffect(() => {
    if (!isOnboarded) return
    const userId = currentUser?.id ?? ''

    if (divisoesLen === 0) {
      const defaultDivisoes: Divisao[] = DIVISAO_ORDER.map((id, i) => {
        const info = DIVISAO_INFO[id]
        const icon = DIVISAO_ICONS[id]
        return {
          id, userId, name: info.name, emoji: '',
          percentage: info.pct, balance: 0,
          color: icon?.color ?? '#64748B',
          isDefault: true, order: i, movements: [],
        }
      })
      useAppStore.setState({ divisoes: defaultDivisoes })
      return
    }

    if (hasLivre) {
      const all = useAppStore.getState().divisoes
      const livreBalance = all.find(cx => cx.id === 'cx-livre')?.balance ?? 0
      const cleaned = all
        .filter(cx => cx.id !== 'cx-livre')
        .map(cx => cx.id === 'cx-reserva'
          ? { ...cx, percentage: 10, balance: cx.balance + livreBalance }
          : cx
        )
      useAppStore.setState({ divisoes: cleaned })
    }
  }, [isOnboarded, divisoesLen, hasLivre, currentUser])

  // BIDIRECTIONAL routing guard:
  // - Not onboarded + not on /onboarding → send to onboarding
  // - Onboarded + on /onboarding → send to home (covers cross-device sync)
  useEffect(() => {
    if (authLoading || !isAuthenticated) return

    if (!isOnboarded && location !== '/onboarding') {
      navigate('/onboarding')
    } else if (isOnboarded && location === '/onboarding') {
      navigate('/home')
    }
  }, [isOnboarded, isAuthenticated, authLoading, location, navigate])

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
        <Route path="/convite/:code" component={InviteAccept} />

        <Route>
          <AppLayout>
            <Switch>
              <Route path="/home" component={Home} />
              <Route path="/fluxo" component={Fluxo} />
              <Route path="/divisoes/:id" component={DivisaoDetalhe} />
              <Route path="/divisoes" component={Relatorios} />
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
