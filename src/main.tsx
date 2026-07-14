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

// ── PWA Screen Orientation Unlock ──
// Libera o PWA em devices que mantiveram o manifest antigo em cache (portrait)
// sem precisar reinstalar o aplicativo.
function unlockOrientation() {
  if (screen.orientation && typeof screen.orientation.unlock === 'function') {
    try {
      screen.orientation.unlock()
    } catch (err) {
      // Ignora erro silenciamente se não for suportado ou barrado
    }
  }
}
// Tenta no boot
unlockOrientation()
// Retenta no primeiro gesto (necessário em alguns Androids)
window.addEventListener('pointerdown', function onFirstTouch() {
  unlockOrientation()
  window.removeEventListener('pointerdown', onFirstTouch)
}, { once: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
