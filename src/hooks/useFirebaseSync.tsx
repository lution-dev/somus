import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from './useAuth'
import { useAppStore } from '../stores/useAppStore'
import { migrateToFirestore, debouncedSaveToFirestore, flushPendingSave } from '../lib/migrationService'
import { subscribeToState } from '../lib/firestoreService'
import type { AppState } from '../types'

const log = (...args: unknown[]) => console.log('[Somus:Sync]', ...args)

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
        log('Running migration for uid:', uid)
        const localState = useAppStore.getState() as AppState
        const resolvedState = await migrateToFirestore(uid, localState)

        if (cancelled) return

        // If remote state was different, update Zustand
        if (resolvedState !== localState) {
          log('Remote state differs from local → updating Zustand')
          isRemoteUpdate.current = true
          useAppStore.setState(resolvedState)
          isRemoteUpdate.current = false
        } else {
          log('Resolved state === local state (no update needed)')
          // Even if states are "same reference", ensure Firestore has the data.
          // This handles the case where Zustand has data but Firestore doesn't.
          if (localState.isOnboarded) {
            log('Ensuring Firestore has current state...')
            const { saveStateToFirestore } = await import('../lib/firestoreService')
            await saveStateToFirestore(uid, localState)
            log('Ensured Firestore is up to date')
          }
        }
      } catch (err) {
        console.warn('[Somus] Migration error (using local state):', err)
      }

      if (!cancelled) {
        log('Sync ready!')
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

    log('Subscribing to Zustand store changes → Firestore')

    const unsubscribeStore = useAppStore.subscribe((state) => {
      // Don't write back changes that came FROM Firestore
      if (isRemoteUpdate.current) {
        log('Skipping write (isRemoteUpdate)')
        return
      }

      log('Local change detected → scheduling debounced save')
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
        if (same) {
          log('Listener: first snapshot matches migration state → skip')
          return
        }
      }

      // Apply remote state
      log('Listener: remote change detected → updating Zustand', 'entradas:', remoteState.entradas?.length ?? 0)
      isRemoteUpdate.current = true
      useAppStore.setState(remoteState)
      isRemoteUpdate.current = false
    })

    return () => {
      unsubRef.current?.()
    }
  }, [syncReady, uid])

  // ── Step 4: Flush pending writes when page is hidden (mobile) ──────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        log('Page hidden → flushing pending save')
        flushPendingSave()
      }
    }

    // Also flush on beforeunload (desktop tab close)
    const handleBeforeUnload = () => {
      log('beforeunload → flushing pending save')
      flushPendingSave()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Render children immediately — localStorage already has the data
  return <>{children}</>
}
