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
 * Normal sync: resolve local vs remote state.
 * 
 * Strategy:
 * - If local has real data (entradas or caixinhas with balance) → keep local, push to remote
 * - If local is empty/default but remote has data → use remote
 * - If both have data → prefer remote (Firestore is source of truth)
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

    const localHasData = localState.entradas.length > 0 ||
      localState.caixinhas.some(cx => cx.balance > 0)
    const remoteHasData = remoteState.entradas.length > 0 ||
      remoteState.caixinhas.some(cx => cx.balance > 0)

    if (remoteHasData && !localHasData) {
      // Local is empty, remote has data → use remote (new device / fresh install)
      return remoteState
    }

    if (localHasData && !remoteHasData) {
      // Local has data, remote is empty → push local
      await saveStateToFirestore(uid, localState)
      return localState
    }

    // Both have data → prefer remote (Firestore is source of truth for multi-device)
    if (remoteHasData) {
      return remoteState
    }

    // Both empty — keep local (preserves onboarding state etc.)
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
