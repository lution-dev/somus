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
  const data: PersistableState = {
    isOnboarded: state.isOnboarded,
    currentUser: state.currentUser,
    partner: state.partner,
    viewContext: state.viewContext,
    incomeSources: state.incomeSources,
    entradas: state.entradas,
    caixinhas: state.caixinhas,
    saidasFixas: state.saidasFixas,
    saidasVariaveis: state.saidasVariaveis,
    objetivos: state.objetivos,
    lastModified: serverTimestamp(),
  }

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
    caixinhas: data.caixinhas ?? [],
    saidasFixas: data.saidasFixas ?? [],
    saidasVariaveis: data.saidasVariaveis ?? [],
    objetivos: data.objetivos ?? [],
  }
}

// ─── Real-time Listener ───────────────────────────────────────────────────────

/**
 * Subscribe to real-time changes from Firestore.
 * Returns an unsubscribe function.
 */
export function subscribeToState(
  uid: string,
  callback: (state: AppState) => void
): Unsubscribe {
  return onSnapshot(getUserDocRef(uid), (snap) => {
    if (!snap.exists()) return

    const data = snap.data() as PersistableState
    callback({
      isOnboarded: data.isOnboarded ?? false,
      currentUser: data.currentUser ?? null,
      partner: data.partner ?? null,
      viewContext: data.viewContext ?? 'personal',
      incomeSources: data.incomeSources ?? [],
      entradas: data.entradas ?? [],
      caixinhas: data.caixinhas ?? [],
      saidasFixas: data.saidasFixas ?? [],
      saidasVariaveis: data.saidasVariaveis ?? [],
      objetivos: data.objetivos ?? [],
    })
  })
}
