import { useState, useEffect, useCallback } from 'react'
import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const ANON_OPTED_KEY = 'somus-anon-opted'

interface AuthState {
  uid: string | null
  user: FirebaseUser | null
  isLoading: boolean
  /** True only when user intentionally signed in (Google or explicit anon) */
  isAuthenticated: boolean
  isAnonymous: boolean
  displayName: string | null
  photoURL: string | null
  email: string | null
  error: string | null
}

const googleProvider = new GoogleAuthProvider()

/**
 * Firebase Auth hook.
 * Google Sign-In is the primary method.
 * Anonymous is available as a "skip" option.
 *
 * Important: A stale anonymous session (from auto-signin) does NOT
 * count as authenticated. The user must explicitly choose to log in
 * or tap "Continuar sem login".
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    uid: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isAnonymous: false,
    displayName: null,
    photoURL: null,
    email: null,
    error: null,
  })

  // Sign in with Google (primary)
  const signInWithGoogle = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      await signInWithPopup(auth, googleProvider)
      // onAuthStateChanged will handle the state update
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed'
      setState((prev) => ({
        ...prev,
        error: message,
        isLoading: false,
      }))
    }
  }, [])

  // Sign in anonymously (explicit opt-in via "Continuar sem login")
  const signInAnon = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      // Mark that the user explicitly opted into anonymous
      localStorage.setItem(ANON_OPTED_KEY, 'true')
      await signInAnonymously(auth)
    } catch (err) {
      localStorage.removeItem(ANON_OPTED_KEY)
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Auth failed',
        isLoading: false,
      }))
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(ANON_OPTED_KEY)
      await firebaseSignOut(auth)
    } catch (err) {
      console.warn('Sign out error:', err)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // For anonymous users: only treat as authenticated if they
        // explicitly opted in (clicked "Continuar sem login")
        const anonOpted = localStorage.getItem(ANON_OPTED_KEY) === 'true'
        const isIntentional = !user.isAnonymous || anonOpted

        setState({
          uid: user.uid,
          user,
          isLoading: false,
          isAuthenticated: isIntentional,
          isAnonymous: user.isAnonymous,
          displayName: user.displayName,
          photoURL: user.photoURL,
          email: user.email,
          error: null,
        })
      } else {
        setState({
          uid: null,
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isAnonymous: false,
          displayName: null,
          photoURL: null,
          email: null,
          error: null,
        })
      }
    })

    return unsubscribe
  }, [])

  return { ...state, signInAnon, signInWithGoogle, signOut }
}
