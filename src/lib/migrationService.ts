import { saveStateToFirestore, loadStateFromFirestore } from './firestoreService'
import type { AppState } from '../types'

const MIGRATION_KEY = 'somus-firebase-migrated'

// Debug logging helper
const log = (...args: unknown[]) => console.log('[Somus:Sync]', ...args)

/**
 * Count how much meaningful data exists in a state.
 * Used to determine which state (local vs remote) has more data.
 */
function stateWeight(state: AppState): number {
  return (
    (state.entradas?.length ?? 0) +
    (state.caixinhas?.reduce((sum, cx) => sum + cx.movements.length, 0) ?? 0) +
    (state.saidasFixas?.length ?? 0) +
    (state.saidasVariaveis?.length ?? 0) +
    (state.objetivos?.length ?? 0) +
    (state.incomeSources?.length ?? 0)
  )
}

/**
 * On app open: resolve which state to use (local vs Firestore).
 *
 * Strategy:
 * - If Firestore doc doesn't exist → push local state (first-time user).
 * - If both exist → pick the one with MORE data. This prevents the bug
 *   where a failed debounced write leaves Firestore empty and on next
 *   app open the empty Firestore state overwrites rich local state.
 * - After resolving, always push the winner to Firestore to keep it
 *   up to date.
 */
export async function migrateToFirestore(
  uid: string,
  localState: AppState
): Promise<AppState> {
  try {
    const localWeight = stateWeight(localState)
    log('Migration start for uid:', uid)
    log('Local state — onboarded:', localState.isOnboarded,
      'entradas:', localState.entradas?.length ?? 0,
      'caixinhas:', localState.caixinhas?.length ?? 0,
      'weight:', localWeight)

    const remoteState = await loadStateFromFirestore(uid)
    const alreadySynced = localStorage.getItem(MIGRATION_KEY) === uid

    log('Remote state exists:', !!remoteState, 'alreadySynced:', alreadySynced)

    // ── Case 1: No Firestore doc ──────────────────────────────────────────
    if (!remoteState) {
      if (localState.isOnboarded) {
        // No Firestore doc but local says onboarded → doc was deleted (reset).
        // Nuke ALL local state so Zustand persist doesn't rehydrate old data.
        log('No remote doc but local onboarded → RESET')
        localStorage.removeItem(MIGRATION_KEY)
        localStorage.removeItem('somus-state')
        return getResetState()
      }
      // Genuinely first-time user — push initial local state to Firestore
      log('First-time user → push local to Firestore')
      await saveStateToFirestore(uid, localState)
      localStorage.setItem(MIGRATION_KEY, uid)
      return localState
    }

    // ── Case 2: Both exist — pick the richer one ─────────────────────────
    const remoteWeight = stateWeight(remoteState)
    log('Remote state — onboarded:', remoteState.isOnboarded,
      'entradas:', remoteState.entradas?.length ?? 0,
      'caixinhas:', remoteState.caixinhas?.length ?? 0,
      'weight:', remoteWeight)

    localStorage.setItem(MIGRATION_KEY, uid)

    // If local has more data than remote, local wins and we push it up.
    // This handles the case where writes never reached Firestore.
    if (localState.isOnboarded && localWeight > remoteWeight) {
      log('LOCAL wins (weight', localWeight, '>', remoteWeight, ') → pushing to Firestore')
      await saveStateToFirestore(uid, localState)
      return localState
    }

    // Remote has same or more data → trust Firestore (cross-device sync).
    log('REMOTE wins (weight', remoteWeight, '>=', localWeight, ') → adopting remote')
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
 * Delay reduced from 3s to 1.5s for faster persistence.
 */
let saveTimeout: ReturnType<typeof setTimeout> | null = null
let pendingSave: { uid: string; state: AppState } | null = null

export function debouncedSaveToFirestore(
  uid: string,
  state: AppState,
  delayMs = 1500
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
