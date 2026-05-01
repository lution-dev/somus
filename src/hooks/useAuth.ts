import { useState, useEffect, useCallback } from 'react'
import {
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
  displayName: string | null
  photoURL: string | null
  email: string | null
  error: string | null
}

const googleProvider = new GoogleAuthProvider()

/**
 * Firebase Auth hook — Google Sign-In only.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    uid: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
    displayName: null,
    photoURL: null,
    email: null,
    error: null,
  })

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
      if (user && !user.isAnonymous) {
        setState({
          uid: user.uid,
          user,
          isLoading: false,
          isAuthenticated: true,
          displayName: user.displayName,
          photoURL: user.photoURL,
          email: user.email,
          error: null,
        })
      } else {
        // Not authenticated (or stale anonymous session — ignore it)
        setState({
          uid: null,
          user: null,
          isLoading: false,
          isAuthenticated: false,
          displayName: null,
          photoURL: null,
          email: null,
          error: null,
        })
      }
    })

    return unsubscribe
  }, [])

  return { ...state, signInWithGoogle, signOut }
}
