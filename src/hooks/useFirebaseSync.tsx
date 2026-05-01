import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from './useAuth'
import { useAppStore } from '../stores/useAppStore'
import { migrateToFirestore, debouncedSaveToFirestore } from '../lib/migrationService'
import { subscribeToState } from '../lib/firestoreService'
import type { AppState } from '../types'

interface FirebaseSyncProviderProps {
  children: ReactNode
}

/**
 * Wraps the app to provide Firebase sync.
 *
 * Responsibilities:
 * 1. Wait for auth to resolve (already done by App.tsx gate)
 * 2. Run one-time migration (localStorage → Firestore)
 * 3. Subscribe to Zustand changes → debounced write to Firestore
 * 4. Listen for Firestore changes → update Zustand (multi-device sync)
 */
export function FirebaseSyncProvider({ children }: FirebaseSyncProviderProps) {
  const { uid, isAuthenticated } = useAuth()
  const [syncReady, setSyncReady] = useState(false)
  const unsubRef = useRef<(() => void) | null>(null)
  const isRemoteUpdate = useRef(false)

  // ── Step 1: Migration on auth ──────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !uid) return

    let cancelled = false

    const runMigration = async () => {
      try {
        const localState = useAppStore.getState() as AppState
        const resolvedState = await migrateToFirestore(uid, localState)

        if (cancelled) return

        // If remote state was different, update Zustand
        if (resolvedState !== localState) {
          isRemoteUpdate.current = true
          useAppStore.setState(resolvedState)
          isRemoteUpdate.current = false
        }
      } catch (err) {
        console.warn('[Somus] Migration error (using local state):', err)
      }

      if (!cancelled) {
        setSyncReady(true)
      }
    }

    runMigration()

    return () => {
      cancelled = true
    }
  }, [uid, isAuthenticated])

  // ── Step 2: Zustand → Firestore (debounced writes) ─────────────────────────
  useEffect(() => {
    if (!syncReady || !uid) return

    const unsubscribeStore = useAppStore.subscribe((state) => {
      // Don't write back changes that came FROM Firestore
      if (isRemoteUpdate.current) return

      debouncedSaveToFirestore(uid, state as AppState)
    })

    return unsubscribeStore
  }, [syncReady, uid])

  // ── Step 3: Firestore → Zustand (real-time listener for multi-device) ──────
  useEffect(() => {
    if (!syncReady || !uid) return

    // Skip the first snapshot — it's the same data we just wrote/read during migration.
    // Without this, onSnapshot fires immediately and overwrites Zustand state,
    // causing a blank screen because it resets isOnboarded, caixinhas, etc.
    let isFirstSnapshot = true

    unsubRef.current = subscribeToState(uid, (remoteState) => {
      if (isFirstSnapshot) {
        isFirstSnapshot = false
        return
      }
      // Prevent echo: don't apply our own writes back
      isRemoteUpdate.current = true
      useAppStore.setState(remoteState)
      isRemoteUpdate.current = false
    })

    return () => {
      unsubRef.current?.()
    }
  }, [syncReady, uid])

  // Render children immediately — localStorage already has the data
  return <>{children}</>
}
