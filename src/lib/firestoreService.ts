import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { AppState } from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Firestore rejects `undefined` values. This recursively converts
 * all `undefined` to `null` throughout the object tree.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return obj
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore)

  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    clean[key] = sanitizeForFirestore(value)
  }
  return clean
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** Keys from AppState that we persist to Firestore */
type PersistableState = Omit<AppState, 'currentUser' | 'partner'> & {
  currentUser: AppState['currentUser']
  partner: AppState['partner']
  lastModified: unknown // serverTimestamp
}

// ─── Document References ──────────────────────────────────────────────────────

const getUserDocRef = (uid: string) => doc(db, 'users', uid)

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Save entire app state to Firestore.
 * Uses merge: true so partial updates don't wipe existing data.
 */
export async function saveStateToFirestore(
  uid: string,
  state: AppState
): Promise<void> {
  const raw = {
    isOnboarded: state.isOnboarded,
    currentUser: state.currentUser,
    partner: state.partner,
    viewContext: state.viewContext,
    incomeSources: state.incomeSources,
    entradas: state.entradas,
    divisoes: state.divisoes,
    saidasFixas: state.saidasFixas,
    saidasVariaveis: state.saidasVariaveis,
    objetivos: state.objetivos,
    lastModified: serverTimestamp(),
  }

  // Sanitize: convert all `undefined` → `null` (Firestore rejects undefined)
  const data = sanitizeForFirestore(raw) as PersistableState
  // Restore serverTimestamp (sanitizer would turn it into a plain object)
  data.lastModified = serverTimestamp()

  await setDoc(getUserDocRef(uid), data, { merge: true })
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Load app state from Firestore (one-time read).
 * Returns null if no document exists for this user.
 */
export async function loadStateFromFirestore(
  uid: string
): Promise<AppState | null> {
  const snap = await getDoc(getUserDocRef(uid))
  if (!snap.exists()) return null

  const data = snap.data() as PersistableState
  return {
    isOnboarded: data.isOnboarded ?? false,
    currentUser: data.currentUser ?? null,
    partner: data.partner ?? null,
    viewContext: data.viewContext ?? 'personal',
    incomeSources: data.incomeSources ?? [],
    entradas: data.entradas ?? [],
    divisoes: data.divisoes ?? [],
    saidasFixas: data.saidasFixas ?? [],
    saidasVariaveis: data.saidasVariaveis ?? [],
    objetivos: data.objetivos ?? [],
  }
}

// ─── Real-time Listener ───────────────────────────────────────────────────────

/**
 * Subscribe to real-time changes from Firestore.
 * Returns an unsubscribe function.
 *
 * Uses snapshot metadata to distinguish between:
 * - Our own writes echoing back (hasPendingWrites transitions)
 * - Genuine remote changes from another device
 */
export function subscribeToState(
  uid: string,
  callback: (state: AppState) => void
): Unsubscribe {
  return onSnapshot(
    getUserDocRef(uid),
    { includeMetadataChanges: false },
    (snap) => {
      if (!snap.exists()) return

      // Skip snapshots from our own pending writes.
      // When WE write to Firestore, onSnapshot fires twice:
      //   1. Immediately with hasPendingWrites=true (local cache)
      //   2. After server confirmation with hasPendingWrites=false
      // We only care about server-confirmed writes from OTHER devices.
      if (snap.metadata.hasPendingWrites) return

      const data = snap.data() as PersistableState
      callback({
        isOnboarded: data.isOnboarded ?? false,
        currentUser: data.currentUser ?? null,
        partner: data.partner ?? null,
        viewContext: data.viewContext ?? 'personal',
        incomeSources: data.incomeSources ?? [],
        entradas: data.entradas ?? [],
        divisoes: data.divisoes ?? [],
        saidasFixas: data.saidasFixas ?? [],
        saidasVariaveis: data.saidasVariaveis ?? [],
        objetivos: data.objetivos ?? [],
      })
    },
    (error) => {
      console.warn('[Somus] Firestore listener error:', error)
    }
  )
}
