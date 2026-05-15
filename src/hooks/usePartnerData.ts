import { useState, useEffect, useRef } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAppStore } from '../stores/useAppStore'
import type { Divisao, Entrada } from '../types'

// ─── Firestore → local type adapters ─────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDivisao(raw: any): Divisao {
  return {
    id:          raw.id ?? '',
    name:        raw.name ?? '',
    percentage:  raw.percentage ?? 0,
    balance:     raw.balance ?? 0,
    order:       raw.order ?? 0,
    color:       raw.color ?? '#888',
    emoji:       raw.emoji ?? '',
    isDefault:   raw.isDefault ?? false,
    userId:      raw.userId ?? '',
    movements:   Array.isArray(raw.movements) ? raw.movements : [],
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toEntrada(raw: any): Entrada {
  return {
    id:           raw.id ?? '',
    userId:       raw.userId ?? '',
    sourceId:     raw.sourceId ?? '',
    sourceName:   raw.sourceName ?? '',
    amount:       raw.amount ?? 0,
    date:         raw.date ?? '',
    note:         raw.note,
    distribution: Array.isArray(raw.distribution) ? raw.distribution : [],
    status:       raw.status,
  }
}

// ─── Legacy naming migration (caixinhas → divisoes) ──────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractDivisoes(data: any): Divisao[] {
  const raw = data.divisoes ?? data.caixinhas ?? []
  return Array.isArray(raw) ? raw.map(toDivisao) : []
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractEntradas(data: any): Entrada[] {
  const raw = data.entradas ?? []
  return Array.isArray(raw) ? raw.map(toEntrada) : []
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface PartnerData {
  divisoes: Divisao[]
  entradas: Entrada[]
  balance: number
  entradasCount: number
  loading: boolean
}

const EMPTY: PartnerData = {
  divisoes: [],
  entradas: [],
  balance: 0,
  entradasCount: 0,
  loading: false,
}

/**
 * Real-time listener for the partner's Firestore document.
 * Returns their divisoes, entradas, aggregated balance, and entry count.
 *
 * Also handles avatar backfill if the partner's avatar was missing at link time.
 */
export function usePartnerData(): PartnerData {
  const partner    = useAppStore(s => s.partner)
  const setPartner = useAppStore(s => s.setPartner)
  const avatarBackfilled = useRef(false)

  const [data, setData] = useState<PartnerData>(EMPTY)

  useEffect(() => {
    if (!partner?.id) {
      setData(EMPTY)
      return
    }

    setData(prev => ({ ...prev, loading: true }))
    avatarBackfilled.current = false

    const partnerDocRef = doc(db, 'users', partner.id)

    const unsubscribe = onSnapshot(partnerDocRef, (snap) => {
      const raw = snap.data()
      if (!raw) {
        setData({ ...EMPTY, loading: false })
        return
      }

      // Backfill avatar once per mount
      if (!avatarBackfilled.current && !partner.avatar) {
        const avatar = raw.currentUser?.avatar ?? raw.currentUser?.photoURL ?? null
        if (avatar) {
          setPartner({
            id: partner.id,
            name: partner.name,
            partnerCode: partner.partnerCode ?? '',
            avatar,
          })
        }
        avatarBackfilled.current = true
      }

      const rawDivisoes = extractDivisoes(raw)
      const entradas = extractEntradas(raw)

      // Recalculate balance from movements to ensure consistency.
      // The stored `balance` field may drift from reality if any operation
      // modified it without a matching movement entry.
      const divisoes = rawDivisoes.map(cx => {
        const movementBalance = cx.movements.reduce((s, mv) => s + mv.amount, 0)
        return { ...cx, balance: movementBalance }
      })
      const balance = divisoes.reduce((s, cx) => s + cx.balance, 0)

      setData({
        divisoes,
        entradas,
        balance,
        entradasCount: entradas.length,
        loading: false,
      })
    }, (err) => {
      console.warn('[Somus:usePartnerData] Error listening to partner doc:', err)
      setData(prev => ({ ...prev, loading: false }))
    })

    return () => unsubscribe()
  }, [partner?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return data
}
