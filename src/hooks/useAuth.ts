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
 * Uses signInWithPopup on all platforms. The redirect flow is broken in
 * production because modern browsers block third-party cookies needed for
 * the cross-origin redirect (firebaseapp.com → somus.vercel.app).
 * Popup works fine on mobile when triggered by a user gesture.
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

  // Sign in with Google — popup on all platforms
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

  // Sign out — MUST clear all local state to prevent data leakage to next user
  const signOut = useCallback(async () => {
    try {
      // Clear Zustand persisted state BEFORE signing out of Firebase.
      // This prevents the next user from seeing the previous user's data.
      localStorage.removeItem('somus-state')
      localStorage.removeItem('somus-firebase-migrated')

      await firebaseSignOut(auth)

      // Force a full page reload to ensure Zustand rehydrates from scratch
      // with empty state. Without this, the in-memory Zustand store still
      // holds the previous user's data until the page reloads.
      window.location.reload()
    } catch (err) {
      console.warn('Sign out error:', err)
    }
  }, [])

  useEffect(() => {
    // Listen for auth state changes
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
