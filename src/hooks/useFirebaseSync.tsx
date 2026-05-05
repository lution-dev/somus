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

    // Listen for remote changes. The first snapshot fires immediately with
    // the current Firestore state — this is INTENTIONAL. It ensures that
    // data written from another device (e.g., mobile) is applied on this
    // device (e.g., PC) even if no new writes happen after we connect.
    //
    // Echo prevention: our own writes go through debouncedSaveToFirestore,
    // which is gated by isRemoteUpdate.current — so when we write to
    // Firestore and onSnapshot fires back, we compare state to avoid
    // unnecessary updates.
    let migrationState: AppState | null = useAppStore.getState() as AppState

    unsubRef.current = subscribeToState(uid, (remoteState) => {
      // Skip if the snapshot is identical to what migration just loaded
      // (prevents a redundant setState on the same tick)
      if (migrationState) {
        const same = JSON.stringify(remoteState) === JSON.stringify(migrationState)
        migrationState = null // only compare once
        if (same) return
      }

      // Apply remote state
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
