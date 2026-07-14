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
  const s = window.screen as any
  if (s.orientation) {
    // Tenta destravar (remove locks programáticos)
    if (typeof s.orientation.unlock === 'function') {
      try { s.orientation.unlock() } catch (err) {}
    }
    // O pulo do gato: para sobrepor o manifesto (WebAPK no Android), precisamos forçar 'any'
    if (typeof s.orientation.lock === 'function') {
      try { s.orientation.lock('any').catch(() => {}) } catch (err) {}
    }
  }
  // Fallbacks antigos
  if (typeof s.unlockOrientation === 'function') {
    try { s.unlockOrientation() } catch (err) {}
  } else if (typeof s.mozUnlockOrientation === 'function') {
    try { s.mozUnlockOrientation() } catch (err) {}
  } else if (typeof s.msUnlockOrientation === 'function') {
    try { s.msUnlockOrientation() } catch (err) {}
  }
}
// Tenta no boot
unlockOrientation()
// Retenta no primeiro gesto (alguns browsers exigem user gesture rigoroso)
const handleGesture = () => {
  unlockOrientation()
  window.removeEventListener('click', handleGesture)
  window.removeEventListener('touchstart', handleGesture)
}
window.addEventListener('click', handleGesture, { once: true })
window.addEventListener('touchstart', handleGesture, { once: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
