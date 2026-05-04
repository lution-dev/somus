import { saveStateToFirestore, loadStateFromFirestore } from './firestoreService'
import type { AppState } from '../types'

const MIGRATION_KEY = 'somus-firebase-migrated'

/**
 * On app open: load state from Firestore if it has data,
 * otherwise push local state to Firestore.
 * 
 * Firestore is ALWAYS the source of truth after first sync.
 */
export async function migrateToFirestore(
  uid: string,
  localState: AppState
): Promise<AppState> {
  try {
    const remoteState = await loadStateFromFirestore(uid)
    const alreadySynced = localStorage.getItem(MIGRATION_KEY) === uid

    if (!remoteState) {
      // No Firestore doc yet — push local state and mark as synced
      await saveStateToFirestore(uid, localState)
      localStorage.setItem(MIGRATION_KEY, uid)
      return localState
    }

    if (!alreadySynced) {
      // First time syncing this device with this uid
      // Remote exists → it has authoritative data from another device/session
      localStorage.setItem(MIGRATION_KEY, uid)
      return remoteState
    }

    // Already synced before — Firestore is source of truth
    // Always load from Firestore on app open so cross-device changes appear
    const remoteHasData = stateHasData(remoteState)
    const localHasData  = stateHasData(localState)

    if (remoteHasData) {
      // Remote has data → trust it (covers new device, PWA install, browser context)
      return remoteState
    }

    if (localHasData) {
      // Remote is empty but local has data → re-push local (remote was wiped)
      await saveStateToFirestore(uid, localState)
      return localState
    }

    // Both empty — keep local (preserves isOnboarded, currentUser etc.)
    return localState
  } catch {
    // Offline or Firestore error — use local state silently
    return localState
  }
}

/**
 * Returns true if the state has any meaningful user data.
 * Checks incomeSources too — a user with only a salary configured
 * but no transactions yet is still considered to have data.
 */
function stateHasData(state: AppState): boolean {
  return (
    state.entradas.length > 0 ||
    state.incomeSources.length > 0 ||
    state.saidasFixas.length > 0 ||
    state.objetivos.length > 0 ||
    state.caixinhas.some(cx => cx.balance > 0)
  )
}

/**
 * Debounced save to Firestore.
 * Groups rapid state changes into a single write.
 * Uses a longer delay (3s) to avoid cancelling writes mid-interaction.
 */
let saveTimeout: ReturnType<typeof setTimeout> | null = null

export function debouncedSaveToFirestore(
  uid: string,
  state: AppState,
  delayMs = 3000
): void {
  if (saveTimeout) clearTimeout(saveTimeout)

  saveTimeout = setTimeout(async () => {
    try {
      await saveStateToFirestore(uid, state)
    } catch (err) {
      console.warn('[Somus] Failed to sync to Firestore:', err)
    }
  }, delayMs)
}
