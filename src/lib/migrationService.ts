import { saveStateToFirestore, loadStateFromFirestore } from './firestoreService'
import type { AppState } from '../types'

const MIGRATION_KEY = 'somus-firebase-migrated'

// Debug logging helper
const log = (...args: unknown[]) => console.log('[Somus:Sync]', ...args)

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
    log('Migration start for uid:', uid)
    log('Local state — onboarded:', localState.isOnboarded, 'entradas:', localState.entradas?.length ?? 0, 'caixinhas:', localState.caixinhas?.length ?? 0)

    const remoteState = await loadStateFromFirestore(uid)
    const alreadySynced = localStorage.getItem(MIGRATION_KEY) === uid

    log('Remote state exists:', !!remoteState, 'alreadySynced:', alreadySynced)
    if (remoteState) {
      log('Remote state — onboarded:', remoteState.isOnboarded, 'entradas:', remoteState.entradas?.length ?? 0, 'caixinhas:', remoteState.caixinhas?.length ?? 0)
    }

    if (!remoteState) {
      if (localState.isOnboarded) {
        // No Firestore doc but local says onboarded → doc was deleted (reset).
        // Nuke ALL local state so Zustand persist doesn't rehydrate old data.
        log('No remote doc but local onboarded → RESET')
        localStorage.removeItem(MIGRATION_KEY)
        localStorage.removeItem('somus-state')  // Zustand persist storage key
        return getResetState()
      }
      // Genuinely first-time user — push initial local state to Firestore
      log('First-time user → push local to Firestore')
      await saveStateToFirestore(uid, localState)
      localStorage.setItem(MIGRATION_KEY, uid)
      return localState
    }

    if (!alreadySynced) {
      log('Not yet synced → adopting remote state')
      localStorage.setItem(MIGRATION_KEY, uid)
      return remoteState
    }

    // Already synced → Firestore is ALWAYS source of truth.
    // Never push local data back — that overwrites changes from other devices.
    log('Already synced → using remote state (source of truth)')
    return remoteState
  } catch (err) {
    log('Migration ERROR:', err)
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
let pendingSave: { uid: string; state: AppState } | null = null

export function debouncedSaveToFirestore(
  uid: string,
  state: AppState,
  delayMs = 3000
): void {
  // NEVER save to Firestore if user hasn't completed onboarding.
  // This prevents re-creating a deleted Firestore doc with empty/reset state.
  if (!state.isOnboarded) return

  // Store pending save so flushPendingSave can fire it immediately
  pendingSave = { uid, state }

  if (saveTimeout) clearTimeout(saveTimeout)

  saveTimeout = setTimeout(async () => {
    pendingSave = null
    try {
      log('Debounced save → writing to Firestore', 'entradas:', state.entradas?.length ?? 0)
      await saveStateToFirestore(uid, state)
      log('Debounced save → SUCCESS')
    } catch (err) {
      console.warn('[Somus] Failed to sync to Firestore:', err)
    }
  }, delayMs)
}

/**
 * Immediately flush any pending debounced save.
 * Called on visibilitychange (hidden) to ensure data persists
 * before the mobile browser suspends JavaScript execution.
 */
export function flushPendingSave(): void {
  if (!pendingSave) return
  const { uid, state } = pendingSave
  pendingSave = null
  if (saveTimeout) {
    clearTimeout(saveTimeout)
    saveTimeout = null
  }
  log('FLUSH: immediate save before page hide', 'entradas:', state.entradas?.length ?? 0)
  // Use fire-and-forget — we can't await in visibilitychange
  saveStateToFirestore(uid, state).then(
    () => log('FLUSH: SUCCESS'),
    (err) => console.warn('[Somus] FLUSH failed:', err)
  )
}
