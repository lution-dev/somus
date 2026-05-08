import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import { useAppStore } from './stores/useAppStore'

// TEMP: expose store for one-time data fix (remove after)
if (import.meta.env.DEV) {
  // @ts-ignore
  window.__somusStore = useAppStore
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
