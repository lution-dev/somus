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
      if (localState.isOnboarded) {
        // No Firestore doc but local says onboarded → doc was deleted (reset).
        // Nuke ALL local state so Zustand persist doesn't rehydrate old data.
        localStorage.removeItem(MIGRATION_KEY)
        localStorage.removeItem('somus-state')  // Zustand persist storage key
        return getResetState()
      }
      // Genuinely first-time user — push initial local state to Firestore
      await saveStateToFirestore(uid, localState)
      localStorage.setItem(MIGRATION_KEY, uid)
      return localState
    }

    if (!alreadySynced) {
      localStorage.setItem(MIGRATION_KEY, uid)
      return remoteState
    }

    // Already synced → Firestore is ALWAYS source of truth.
    // Never push local data back — that overwrites changes from other devices.
    return remoteState
  } catch {
    return localState
  }
}

/** Minimal reset state — triggers onboarding flow */
function getResetState(): AppState {
  return {
    isOnboarded: false,
    currentUser: null,
    partner: null,
    viewContext: 'personal',
    incomeSources: [],
    entradas: [],
    caixinhas: [],
    saidasFixas: [],
    saidasVariaveis: [],
    objetivos: [],
  }
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
  // NEVER save to Firestore if user hasn't completed onboarding.
  // This prevents re-creating a deleted Firestore doc with empty/reset state.
  if (!state.isOnboarded) return

  if (saveTimeout) clearTimeout(saveTimeout)

  saveTimeout = setTimeout(async () => {
    try {
      await saveStateToFirestore(uid, state)
    } catch (err) {
      console.warn('[Somus] Failed to sync to Firestore:', err)
    }
  }, delayMs)
}
