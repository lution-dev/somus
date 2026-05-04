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
      if (alreadySynced && localState.isOnboarded) {
        // Doc was deleted (intentional reset) — wipe local state and restart onboarding
        localStorage.removeItem(MIGRATION_KEY)
        return getResetState()
      }
      // No doc yet, first time — push local state to Firestore
      await saveStateToFirestore(uid, localState)
      localStorage.setItem(MIGRATION_KEY, uid)
      return localState
    }

    if (!alreadySynced) {
      localStorage.setItem(MIGRATION_KEY, uid)
      return remoteState
    }

    // Firestore is source of truth — load it on every open
    return stateHasData(remoteState) ? remoteState
      : stateHasData(localState)    ? (await saveStateToFirestore(uid, localState), localState)
      : localState
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
