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

interface AuthState {
  uid: string | null
  user: FirebaseUser | null
  isLoading: boolean
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
 * Supports both anonymous and Google sign-in.
 * The user's data persists across both methods (same UID if linked).
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

  // Sign in anonymously (for first-time users who skip login)
  const signInAnon = useCallback(async () => {
    try {
      await signInAnonymously(auth)
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Auth failed',
        isLoading: false,
      }))
    }
  }, [])

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google login failed'
      setState((prev) => ({
        ...prev,
        error: message,
        isLoading: false,
      }))
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth)
    } catch (err) {
      console.warn('Sign out error:', err)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setState({
          uid: user.uid,
          user,
          isLoading: false,
          isAuthenticated: true,
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
