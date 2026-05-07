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

// ─── Migration: caixinhas → divisoes ──────────────────────────────────────────

/**
 * Migrates legacy Firestore data that still uses the old "caixinhas" naming.
 * Handles:
 * - Top-level field: caixinhas → divisoes
 * - SaidaFixa items: caixinhaId → divisaoId
 * - Entrada distribution: caixinhaId/caixinhaName → divisaoId/divisaoName
 * - Objetivo: caixinhaId → divisaoId
 * - SaidaVariavel: caixinhaId → divisaoId
 * - viewContext: 'lucas'|'mirian' → 'personal'
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateFirestoreData(raw: Record<string, any>): AppState {
  // Divisoes: prefer new name, fall back to old
  const divisoes = raw.divisoes ?? raw.caixinhas ?? []

  // SaidasFixas: map caixinhaId → divisaoId
  const saidasFixas = (raw.saidasFixas ?? []).map((sf: Record<string, unknown>) => {
    const migrated = { ...sf }
    if ('caixinhaId' in migrated && !('divisaoId' in migrated)) {
      migrated.divisaoId = migrated.caixinhaId
      delete migrated.caixinhaId
    }
    return migrated
  })

  // Entradas: map distribution items
  const entradas = (raw.entradas ?? []).map((e: Record<string, unknown>) => {
    const dist = (e.distribution as Record<string, unknown>[] | undefined) ?? []
    return {
      ...e,
      distribution: dist.map(d => {
        const md = { ...d }
        if ('caixinhaId' in md && !('divisaoId' in md)) {
          md.divisaoId = md.caixinhaId
          delete md.caixinhaId
        }
        if ('caixinhaName' in md && !('divisaoName' in md)) {
          md.divisaoName = md.caixinhaName
          delete md.caixinhaName
        }
        return md
      }),
    }
  })

  // SaidasVariaveis: map caixinhaId → divisaoId
  const saidasVariaveis = (raw.saidasVariaveis ?? []).map((sv: Record<string, unknown>) => {
    const migrated = { ...sv }
    if ('caixinhaId' in migrated && !('divisaoId' in migrated)) {
      migrated.divisaoId = migrated.caixinhaId
      delete migrated.caixinhaId
    }
    return migrated
  })

  // Objetivos: map caixinhaId → divisaoId
  const objetivos = (raw.objetivos ?? []).map((obj: Record<string, unknown>) => {
    const migrated = { ...obj }
    if ('caixinhaId' in migrated && !('divisaoId' in migrated)) {
      migrated.divisaoId = migrated.caixinhaId
      delete migrated.caixinhaId
    }
    return migrated
  })

  // viewContext: migrate old 'lucas'/'mirian' to 'personal'
  let viewContext = raw.viewContext ?? 'personal'
  if (viewContext !== 'personal' && viewContext !== 'couple') {
    viewContext = 'personal'
  }

  return {
    isOnboarded: raw.isOnboarded ?? false,
    currentUser: raw.currentUser ?? null,
    partner: raw.partner ?? null,
    viewContext,
    incomeSources: raw.incomeSources ?? [],
    entradas,
    divisoes,
    saidasFixas,
    saidasVariaveis,
    objetivos,
  }
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

  // Migrate legacy field names (caixinhas → divisoes, caixinhaId → divisaoId)
  return migrateFirestoreData(snap.data())
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

      // Migrate legacy field names (caixinhas → divisoes, caixinhaId → divisaoId)
      callback(migrateFirestoreData(snap.data()))
    },
    (error) => {
      console.warn('[Somus] Firestore listener error:', error)
    }
  )
}
