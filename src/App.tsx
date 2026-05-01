import { Route, Switch, Redirect } from 'wouter'
import { useAppStore } from './stores/useAppStore'
import { useAuth } from './hooks/useAuth'
import { AppLayout } from './components/layout/AppLayout'
import { PWAInstallPrompt } from './components/shared/PWAInstallPrompt'
import { FirebaseSyncProvider } from './hooks/useFirebaseSync'

// Pages
import Home          from './pages/Home'
import Fluxo         from './pages/Fluxo'
import Caixinhas     from './pages/Caixinhas'
import CaixinhaDetalhe from './pages/CaixinhaDetalhe'
import Casal         from './pages/Casal'
import ObjetivoDetalhe from './pages/ObjetivoDetalhe'
import Onboarding    from './pages/Onboarding'
import Login         from './pages/Login'

export default function App() {
  const isOnboarded = useAppStore(s => s.isOnboarded)
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  // Auth loading — show nothing (avoids flash)
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg-primary)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-couple) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>S</span>
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
        {/* Onboarding — sempre acessível */}
        <Route path="/onboarding" component={Onboarding} />

        {/* Redirect root */}
        <Route path="/">
          <Redirect to={isOnboarded ? '/home' : '/onboarding'} />
        </Route>

        {/* App protegido */}
        {isOnboarded ? (
          <AppLayout>
            <Switch>
              <Route path="/home"              component={Home} />
              <Route path="/fluxo"             component={Fluxo} />
              <Route path="/caixinhas"         component={Caixinhas} />
              <Route path="/caixinhas/:id"     component={CaixinhaDetalhe} />
              <Route path="/casal"             component={Casal} />
              <Route path="/casal/objetivo/:id" component={ObjetivoDetalhe} />
              {/* Fallback */}
              <Route>
                <Redirect to="/home" />
              </Route>
            </Switch>
            {/* PWA Install hint — aparece 1x, depois some pra sempre */}
            <PWAInstallPrompt />
          </AppLayout>
        ) : (
          <Route>
            <Redirect to="/onboarding" />
          </Route>
        )}
      </Switch>
    </FirebaseSyncProvider>
  )
}
