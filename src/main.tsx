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
  if (window.screen && window.screen.orientation && typeof window.screen.orientation.unlock === 'function') {
    try {
      window.screen.orientation.unlock()
    } catch (err) {
      // Ignora erro
    }
  }
}
// Tenta no boot
unlockOrientation()
// Retenta no primeiro gesto (alguns browsers exigem user gesture rigoroso)
const handleGesture = () => {
  unlockOrientation()
  window.removeEventListener('click', handleGesture)
  window.removeEventListener('touchstart', handleGesture)
  window.removeEventListener('pointerdown', handleGesture)
}
window.addEventListener('click', handleGesture, { once: true })
window.addEventListener('touchstart', handleGesture, { once: true })
window.addEventListener('pointerdown', handleGesture, { once: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
