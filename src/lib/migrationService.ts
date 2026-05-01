import { saveStateToFirestore, loadStateFromFirestore } from './firestoreService'
import type { AppState } from '../types'

const MIGRATION_KEY = 'somus-firebase-migrated'
const LAST_MODIFIED_KEY = 'somus-last-modified'

/**
 * Handles the one-time migration from localStorage-only to Firestore.
 *
 * Flow:
 * 1. App opens → localStorage loads instantly (as always)
 * 2. Anonymous auth resolves → uid available
 * 3. Check if migration already happened
 * 4. If not: compare local vs Firestore, sync whichever is newer
 */
export async function migrateToFirestore(
  uid: string,
  localState: AppState
): Promise<AppState> {
  const alreadyMigrated = localStorage.getItem(MIGRATION_KEY)

  if (alreadyMigrated === uid) {
    // Already migrated for this uid — just do a normal sync
    return syncWithFirestore(uid, localState)
  }

  // First time with Firebase for this uid
  const remoteState = await loadStateFromFirestore(uid)

  if (!remoteState) {
    // No remote data — push local to Firestore
    await saveStateToFirestore(uid, localState)
    localStorage.setItem(MIGRATION_KEY, uid)
    localStorage.setItem(LAST_MODIFIED_KEY, Date.now().toString())
    return localState
  }

  // Remote exists — use remote as source of truth (it might have data from another device)
  localStorage.setItem(MIGRATION_KEY, uid)
  localStorage.setItem(LAST_MODIFIED_KEY, Date.now().toString())
  return remoteState
}

/**
 * Normal sync: compare local/remote timestamps and resolve.
 * For the Somus use case (1-2 users), we use a simple "last writer wins" strategy.
 */
async function syncWithFirestore(
  uid: string,
  localState: AppState
): Promise<AppState> {
  try {
    const remoteState = await loadStateFromFirestore(uid)

    if (!remoteState) {
      // Remote was deleted somehow — re-push local
      await saveStateToFirestore(uid, localState)
      return localState
    }

    // For now, always prefer local state on app startup
    // (because the user just opened the app with their local data)
    // The debounced sync will keep Firestore updated going forward
    return localState
  } catch {
    // Offline or error — just use local state
    return localState
  }
}

/**
 * Debounced save to Firestore.
 * Groups rapid state changes into a single write.
 */
let saveTimeout: ReturnType<typeof setTimeout> | null = null

export function debouncedSaveToFirestore(
  uid: string,
  state: AppState,
  delayMs = 2000
): void {
  if (saveTimeout) clearTimeout(saveTimeout)

  saveTimeout = setTimeout(async () => {
    try {
      await saveStateToFirestore(uid, state)
      localStorage.setItem(LAST_MODIFIED_KEY, Date.now().toString())
    } catch (err) {
      console.warn('[Somus] Failed to sync to Firestore:', err)
      // Silently fail — localStorage still has the data
    }
  }, delayMs)
}
