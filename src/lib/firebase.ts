import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// Firebase client keys are public by design — security is enforced via
// Firebase Security Rules, not key secrecy. Fallback values ensure the app
// works on Vercel even if env vars aren't configured in the dashboard.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDn93l6V6T_dAFdC0Ho-pewg7EVnKgiJeE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'somus-3df33.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'somus-3df33',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'somus-3df33.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '463898313113',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:463898313113:web:7dace9eefe22973d6bb168',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Emulator support (dev only)
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099')
  connectFirestoreEmulator(db, 'localhost', 8080)
}

export default app
