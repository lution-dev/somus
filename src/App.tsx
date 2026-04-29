import { Route, Switch, Redirect } from 'wouter'
import { useAppStore } from './stores/useAppStore'
import { AppLayout } from './components/layout/AppLayout'

// Pages
import Home          from './pages/Home'
import Fluxo         from './pages/Fluxo'
import Caixinhas     from './pages/Caixinhas'
import CaixinhaDetalhe from './pages/CaixinhaDetalhe'
import Casal         from './pages/Casal'
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
            {/* Fallback */}
            <Route>
              <Redirect to="/home" />
            </Route>
          </Switch>
        </AppLayout>
      ) : (
        <Route>
          <Redirect to="/onboarding" />
        </Route>
      )}
    </Switch>
  )
}
