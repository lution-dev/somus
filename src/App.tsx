import { Route, Switch, Redirect } from 'wouter'
import { useAppStore } from './stores/useAppStore'
import { AppLayout } from './components/layout/AppLayout'
import { PWAInstallPrompt } from './components/shared/PWAInstallPrompt'

// Pages
import Home          from './pages/Home'
import Fluxo         from './pages/Fluxo'
import Caixinhas     from './pages/Caixinhas'
import CaixinhaDetalhe from './pages/CaixinhaDetalhe'
import Casal         from './pages/Casal'
import ObjetivoDetalhe from './pages/ObjetivoDetalhe'
import Onboarding    from './pages/Onboarding'

export default function App() {
  const isOnboarded = useAppStore(s => s.isOnboarded)

  return (
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
  )
}

